_u.mod_filterCUs = (function($, mod_mutationObserver, mod_contentHelper, mod_domEvents, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        isActive: isActive,
        applyFiltering: applyFiltering,
        showSearchBox: showSearchBox
    });

    // *Events Raised*
    // "filtering-state-change", "tab-on-filter-search-box"

    var $filterCUsContainer,
        $searchBox,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
//        isVisible = false,
        timeout_typing,
        suppressEvent = mod_contentHelper.suppressEvent,
        $document = $(document),
        lastFilterText_lowerCase;

    // reset state
    function reset() {
        // the following two lines are conditional because otherwise they won't be valid till setup() is called once
        $searchBox && closeSearchBox(); // to call triggerFilteringIfRequired()
        $filterCUsContainer && $filterCUsContainer.remove();
        timeout_typing = null;
        lastFilterText_lowerCase = "";
    }

    function setup(settings) {
        reset();
        $searchBox = $('<input id = "UnitsProj-search-box" class = "UnitsProj-reset-text-input" type = "text">')
            .addClass(class_addedByUnitsProj);

        var $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
            .attr("id", "UnitsProj-search-close-icon")
            .addClass(class_addedByUnitsProj);

        var $message = $("<span id=filter-message>Press 'tab' to go to filtered units</span>");

        $filterCUsContainer = $('<div id = "UnitsProj-search-container">')
            .addClass(class_addedByUnitsProj)
            .append($searchBox)
            .append($closeButton)
            .append($message)
            .hide()     // to prevent the search box from appearing when the page loads
            .appendTo(_u.$topLevelContainer);
        // Use a timeout to call .show(), otherwise the search box might appear briefly at the top of the page as
        // it loads
//            setTimeout(function() {$filterCUsContainer.show();}, 500);

//            $filterCUsContainer.css({top: -$filterCUsContainer.outerHeight(true) + "px"}); // seems to work only after it's in DOM

        $searchBox.on('paste input', onSearchBoxInput);
        // Instead of specifying 'keydown' as part of the on() call above, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $searchBox[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onSearchBoxInput, true);
        $closeButton.on('click', closeSearchBox);

        mod_keyboardLib.bind(settings.CUsShortcuts.search.kbdShortcuts, showSearchBox, {pageHasCUsSpecifier: true});
    }

    function isActive() {
        return $filterCUsContainer.is(':visible') && getSearchBoxText_lowerCase();
    }

    /**
     * Applies filtering to the CUs within the the passed array. Specifically, it applies the class
     * 'UnitsProj-HiddenByFiltering'  to CUs which do no match the text in the filtering search box.
     * Returns an array containing only the filtered CUs.
     * @param CUs_all
     * @param $scope - jQuery set of dom elements which between themselves should contain all of the CUs in $CUsArr
     * @param userInvoked Pass true to indicate that the user invoked the filtering (as opposed to dom-change etc).
     *
     * @returns An array with the filtered CUs. If filtering was required, this this is a new array, which has a
     * subset of elements of `CUs_all`. Else, if no filtering if required (`CUs_all` is empty or the filtering text
     * is an empty string), it returns the same array `CUs_all`. (As per the assumption in mod_CUsMgr that when
     * no filtering is active it's variables `CUs_main` and `_CUs_all` point to the same array)
     */
    function applyFiltering(CUs_all, $scope, userInvoked) {
        var filterText_lowerCase = getSearchBoxText_lowerCase();

        // if no filtering required
        if (!CUs_all.length || !filterText_lowerCase) {
            undoPreviousFiltering($scope);
            return CUs_all;
        }

        // ** --------- PRE FILTERING --------- **

        var disabledByMe = mod_mutationObserver.disable();
        var savedScrollPos;
        if (!userInvoked) {
            // save this because the call to .hide() below will change the scrollTop value, in mose cases making it zero
            savedScrollPos = $document.scrollTop();
        }
        else {
            savedScrollPos = 0;
        }
        $scope.hide();


        // ** --------- FILTERING --------- **

        var CUs_filtered = [];
        var reuseLastFiltering = filterText_lowerCase.indexOf(lastFilterText_lowerCase) !== -1;
        lastFilterText_lowerCase = filterText_lowerCase;

        if (!reuseLastFiltering) {
            undoPreviousFiltering($scope);
        }
        else {
            removeHighlighting($scope); //TODO: this is need at the moment. can we avoid this?
        }

//            console.log('actual filtering taking place...');
            var CUsArrLen = CUs_all.length;
            for (var i = 0; i < CUsArrLen; ++i) {
                var $CU = CUs_all[i];
                // if ($CU.text().toLowerCase().indexOf(filterText_lowerCase) >= 0) {
                if (reuseLastFiltering && $CU.hasClass('UnitsProj-HiddenByFiltering')) {
                    continue;
                }
                if (highlightInCU($CU, filterText_lowerCase)) {

                    //if ($CU.hasClass('UnitsProj-HiddenByFiltering')) {

                    $CU.removeClass('UnitsProj-HiddenByFiltering');
                    CUs_filtered.push($CU);
                    //}
                }
                else {
                    //if ($CU.is(':visible')) {
                    $CU.addClass('UnitsProj-HiddenByFiltering');
//                    $CUsArr.splice(i, 1);
//                    --CUsArrLen;
//                    --i;

                    //}
                }
            }


        // ** --------- POST FILTERING --------- **
        $scope.show();
        $document.scrollTop(savedScrollPos);
        disabledByMe && mod_mutationObserver.enable();

        return CUs_filtered;

    }

    function undoPreviousFiltering($scope) {
        removeHighlighting($scope);
        var $hiddenByPriorFiltering = $scope.find('.UnitsProj-HiddenByFiltering');
        $hiddenByPriorFiltering.removeClass('UnitsProj-HiddenByFiltering');
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

// container - dom node or jQuery set within which highlighting should be removed
    function removeHighlighting (container) {
        var $container = $(container);

        var $set = $container.find(".UnitsProj-highlight");
        var len = $set.length;
        for (var i = 0; i < len; i++) {
            var el = $set[i];
            var parentNode =  el.parentNode;

            parentNode.replaceChild(el.firstChild, el);
            parentNode.normalize();

        }
    }

    function onSearchBoxInput(e) {
        clearTimeout(timeout_typing); // clears timeout if it is set

        if (e.target === $searchBox[0] && e.type === 'keydown') {

            var code = e.which || e.keyCode;

            if (code === 27) { // ESc
                suppressEvent(e);
                closeSearchBox();
            }
            else  if (code === 13) { // Enter
                suppressEvent(e);
                triggerFilteringIfRequired();
            }
            else if (code === 9) { // Tab
                suppressEvent(e);
                thisModule.trigger('tab-on-filter-search-box');
            }
        }

        // setting the time out below, in conjunction with the clearTimeout() earlier, allows search-as-you-type, while
        // not executing the filtering related code till there is a brief pause in the typing
        timeout_typing = setTimeout (triggerFilteringIfRequired, 400);
    }

    function triggerFilteringIfRequired() {
        var filterText_lowerCase = getSearchBoxText_lowerCase();
        if (lastFilterText_lowerCase !== filterText_lowerCase) {
            thisModule.trigger('filtering-state-change');
        }
    }

    function getSearchBoxText_lowerCase() {
        return $searchBox.val().toLowerCase();
    }

    function showSearchBox() {
//        if (!isVisible) {
        if(!$filterCUsContainer.is(':visible')) {
            $searchBox.val('');
//            $filterCUsContainer.css({top: "0px"});
//            var savedScrollPos = $document.scrollTop();
            $filterCUsContainer.show();
            $searchBox.focus();
            // Setting the focus to the search box scrolls the page up slightly because the searchbox lies above the visible
            // part of the page (i.e. till its 'sliding' effect due to css transition completes). This is undesirable.
            // Hence we restore the scroll position:
//            $document.scrollTop(savedScrollPos);
        }
        else {
            $searchBox.focus();
        }
//        isVisible = true;
    }

    function closeSearchBox() {
        $searchBox.val('');
        $searchBox.blur();
//        $filterCUsContainer.css({top: -$filterCUsContainer.outerHeight(true) + "px"});
//        isVisible = false;
        $filterCUsContainer.hide();
        triggerFilteringIfRequired();
    }

    return thisModule;

})(jQuery, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_domEvents, _u.mod_keyboardLib, _u.CONSTS);
