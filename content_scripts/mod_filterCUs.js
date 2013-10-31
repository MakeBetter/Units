_u.mod_filterCUs = (function($, mod_mutationObserver, mod_contentHelper, mod_domEvents, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        isActive: isActive,
        applyFiltering: applyFiltering,
    });

    // *Events Raised*
    // "filter-text-change", "tab-on-filter-UI"

    var $UIContainer,
        $searchBox,
        class_unitsProjElem = CONSTS.class_unitsProjElem,
        timeout_typing,
        suppressEvent = mod_contentHelper.suppressEvent,
        $document = $(document),
        lastFilterText_lowerCase;
    
    // reset state
    function reset() {
        // the following two lines are conditional because otherwise they won't be valid till setup() is called once
        $searchBox && closeUI(); // to deactivate filtering if it was active
        $UIContainer && $UIContainer.remove();
        timeout_typing = null;
        lastFilterText_lowerCase = "";
    }

    function setup(settings) {
        if (! (settings.expandedUrlData && settings.expandedUrlData.CUs_specifier)) {
            return;     // this module is not setup if there is no CUs_specifier in the urlData
        }
        
        reset();
        $searchBox = $('<input id = "UnitsProj-filterUI-searchBox" type = "text">')
            .addClass("UnitsProj-reset-text-input")
            .addClass(class_unitsProjElem)
            .attr('tabindex', -1);

        var $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
            .addClass("UnitsProj-close-button")
            .addClass(class_unitsProjElem);

        var $message = $("<span id=filter-message>Press 'tab' to go to filtered units</span>");

        $UIContainer = $('<div id = "UnitsProj-filterUI-container">')
            .addClass(class_unitsProjElem)
            .append($searchBox)
            .append($closeButton)
            .append($message)
            .hide()     // to prevent the filtering UI from appearing when the page loads
            .appendTo(_u.$topLevelContainer);

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $searchBox[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown, true);

        $searchBox.on('input', onInput);
        $closeButton.on('click', closeUI);
        mod_keyboardLib.bind(settings.CUsShortcuts.filterCUs.kbdShortcuts, showUI, {pageHasCUsSpecifier: true});
    }

    function isActive() {
        return $UIContainer && $UIContainer.is(':visible') && getFilterText_lowerCase();
    }

    /**
     * Applies filtering to the CUs within the the passed array. Specifically, it applies the class
     * 'UnitsProj-HiddenByFiltering'  to CUs which do no match the text in the filtering search box.
     * Returns an array containing only the filtered CUs.
     * @param CUs_all
     * @param userInvoked Pass true to indicate that the user invoked the filtering (as opposed to dom-change etc).
     *
     * @returns {Array} Array of filtered CUs. If filtering was required, this this is a new array, which has a
     * subset of elements of `CUs_all`. Else, if no filtering if required (`CUs_all` is empty or the filtering text
     * is an empty string), it returns the same array `CUs_all`. (As per the assumption in mod_CUsMgr that when
     * no filtering is active it's variables `CUs_main` and `_CUs_all` point to the same array)
     */
    function applyFiltering(CUs_all, userInvoked) {
        var filterText_lowerCase = getFilterText_lowerCase();

        // if no filtering required
        if (!CUs_all.length || !filterText_lowerCase) {
            undoPrevFiltering();
            return CUs_all;
        }

        // ** --------- PRE FILTERING --------- **

        var disabledByMe = mod_mutationObserver.disable();
        var savedScrollPos;
        if (!userInvoked) {
            // save this because the call to .hide() below will change the scrollTop value, in mose cases making it zero
            savedScrollPos = window.pageYOffset;
        }
        else {
            savedScrollPos = 0;
        }
        $document.hide();


        // ** --------- FILTERING --------- **

        var CUs_filtered = [];
        var reuseLastFiltering = filterText_lowerCase.indexOf(lastFilterText_lowerCase) !== -1;
        lastFilterText_lowerCase = filterText_lowerCase;

        if (!reuseLastFiltering) {
            // undo all effects of the previous filtering
            undoPrevFiltering();
        }
        else {
            // remove highlighting (but don't undo other actions of previous filtering)
            removePrevHighlighting(); //TODO: this is need at the moment. can we avoid this?
        }

//      console.log('actual filtering taking place...');
        var CUsArrLen = CUs_all.length;
        for (var i = 0; i < CUsArrLen; ++i) {
            var $CU = CUs_all[i];
            if (reuseLastFiltering && $CU.hasClass('UnitsProj-HiddenByFiltering')) {
                continue;
            }
            if (highlightInCU($CU, filterText_lowerCase)) {
                $CU.removeClass('UnitsProj-HiddenByFiltering');
                CUs_filtered.push($CU);
            }
            else {
                $CU.addClass('UnitsProj-HiddenByFiltering');
            }
        }

        // ** --------- POST FILTERING --------- **
        $document.show();
        window.scroll(window.pageXOffset, savedScrollPos);
        disabledByMe && mod_mutationObserver.enable();

        return CUs_filtered;
    }

    function undoPrevFiltering() {
        removePrevHighlighting();
        $document.find('.UnitsProj-HiddenByFiltering').removeClass('UnitsProj-HiddenByFiltering');
    }

    // based on http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
    /* Main changes:
     1) Use of JS keyword 'with' (deprecated) was removed, and modifications made in accordance
     2) toLowercase() being instead of toUppercase, and also being calculated only once at the beginning.
     3) converted from jQuery plugin to a regular function; main since we want num of highlights made to be
     returned
     4) <removed> Only searches within visible elements. Since numHighlights is required by the calling function to
     detect if a CU should be counted as a match or not. Also helps with efficiency.
     5) Other minor optimizations
     6) Added comments
     */
    function highlightInCU($CU, pattern) {

        var numHighlighted = 0, // count of how many items were highlighted
            patternLowerCase = pattern && pattern.toLowerCase();

        /*
         Called recursively. Each time this function is called on a text node, it highlights the first instance of
         'pattern' found. Upon finding 'pattern', it returns after creating 3 nodes in place of the original text node --
         a span node for the highlighted pattern and two text nodes surrounding it.
         Returns true or false to indicate if highlight took place
         */
        var innerHighlight = function (node) {

            var highlighted = false;

            if (node.nodeType == 3) { // nodeType 3 - text node

                var pos = node.data.toLowerCase().indexOf(patternLowerCase);
                if (pos >= 0) {
                    var spannode = document.createElement('span');
                    spannode.className = 'UnitsProj-highlight';
                    var middlebit = node.splitText(pos);
                    // this line is required, even though the variable assigned to is unused
                    /*var endbit =*/ middlebit.splitText(patternLowerCase.length);
                    var middleclone = middlebit.cloneNode(true);
                    spannode.appendChild(middleclone);
                    middlebit.parentNode.replaceChild(spannode, middlebit);
                    highlighted = true;
                    ++numHighlighted;
                }
            }
            // nodeType 1 - element node
            else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {

                // var $node = $(node); // node is an element
                // if (!$node.is(':visible') || $node.css('visibility') === 'hidden') {
                //     return;
                // }

                for (var i = 0; i < node.childNodes.length; ++i) {
                    if (innerHighlight(node.childNodes[i])) {
                        ++i; // to move past the new span node created
                    }
                }
            }
            return highlighted;
        };

        if ($CU.length && patternLowerCase && patternLowerCase.length) {
            $CU.each(function() {
                innerHighlight(this);
            });
        }

        return numHighlighted;
    }

    function removePrevHighlighting () {
            var $set = $document.find(".UnitsProj-highlight");
            var len = $set.length;
            for (var i = 0; i < len; i++) {
                var el = $set[i];
                var parentNode = el.parentNode;

                parentNode.replaceChild(el.firstChild, el);
                parentNode.normalize();

            }
    }

    function onKeydown(e) {
        var code = e.which;
        if (code === 27) { // Esc
            closeUI();
            if (e.target === $searchBox[0]) {
                mod_contentHelper.suppressEvent(e);
            }
        }
        else if (e.target === $searchBox[0] && !(e.shiftKey || e.ctrlKey || e.altKey || e.metaKey)) {
            if (code === 13) { // Enter
                suppressEvent(e);
                triggerFilteringIfRequired();
            }
            else if (code === 9) { // Tab
                suppressEvent(e);
                triggerFilteringIfRequired();
                thisModule.trigger('tab-on-filter-UI');
            }
        }
    }

    function onInput() {
        // to allow search-as-you-type, while not executing the filtering related code till there is a brief pause in the typing
        clearTimeout(timeout_typing); // clears timeout if it is set
        timeout_typing = setTimeout (triggerFilteringIfRequired, 400);
    }

    function triggerFilteringIfRequired() {
        clearTimeout(timeout_typing); // clears timeout if it is set
        if (lastFilterText_lowerCase !== getFilterText_lowerCase()) {
            thisModule.trigger('filter-text-change');
        }
    }

    function getFilterText_lowerCase() {
        return $searchBox.val().toLowerCase();
    }

    function showUI() {
        var disabledByMe = mod_mutationObserver.disable();
        if(!$UIContainer.is(':visible')) {
            $searchBox.val('');
            $UIContainer.show();
            $searchBox.focus();
        }
        else {
            $searchBox.focus();
        }
        disabledByMe && mod_mutationObserver.enable();
    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_typing); // clears timeout if it is set
        $searchBox.val('').blur();
        $UIContainer.hide();
        undoPrevFiltering();
        lastFilterText_lowerCase = ""; // reset
        thisModule.trigger('filter-UI-close');
        disabledByMe && mod_mutationObserver.enable();
    }

    return thisModule;

})(jQuery, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_domEvents, _u.mod_keyboardLib, _u.CONSTS);
