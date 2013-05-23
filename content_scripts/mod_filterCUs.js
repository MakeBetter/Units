_u.mod_filterCUs = (function($, mod_mutationObserver, mod_contentHelper, mod_domEvents, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        filterCUsArray: filterCUsArray,
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

    /**
     * Filters the passed array $CUsArr based on the text in the search box. Returns the filtered array.
     * @param $CUsArr
     * @param userInvoked Pass true to indicate that the user invoked the filtering (as opposed to dom-change etc).
     */
    function filterCUsArray($CUsArr, userInvoked) {

        if (!$CUsArr || !$CUsArr.length) {
            return $CUsArr; // no filtering required
        }

        // ** --------- PRE FILTERING --------- **
        var CUsNodes = [],
            CUsArrLen = $CUsArr.length,
            $CU;

        for (var i = 0; i < CUsArrLen; ++i) {
            $CU = $CUsArr[i];
            CUsNodes = CUsNodes.concat($CU.get());
        }

        var $closestAncestor = $(mod_contentHelper.closestCommonAncestor(CUsNodes));

        mod_mutationObserver.stop(); // ** stop monitoring mutations **
        var filterText_lowerCase = getSearchBoxText().toLowerCase();
        var savedScrollPos;
        if (!userInvoked) {
            // save this because the call to .hide() below will change the scrollTop value, in mose cases making it zero
            savedScrollPos = $document.scrollTop();
        }
        else {
            savedScrollPos = 0;
        }
        $closestAncestor.hide();
        removeHighlighting($closestAncestor);

        // ** --------- FILTERING --------- **
//        if (!filterText_lowerCase || !isVisible) {
        if (!filterText_lowerCase || !$filterCUsContainer.is(':visible')) {
            var $hiddenByPriorFiltering = $closestAncestor.find('.hiddenByUnitsProj');
            $hiddenByPriorFiltering.removeClass('hiddenByUnitsProj').show();
        }
        else {
//            console.log('actual filtering taking place...');
            for (i = 0, $CU; i < CUsArrLen; ++i) {
                $CU = $CUsArr[i];
                // if ($CU.text().toLowerCase().indexOf(filterText_lowerCase) >= 0) {
                if (highlightInCU($CU, filterText_lowerCase)) {

                    //if ($CU.hasClass('hiddenByUnitsProj')) {

                    $CU.show().removeClass('hiddenByUnitsProj');
                    //}
                }
                else {
                    //if ($CU.is(':visible')) {
                    $CU.hide().addClass('hiddenByUnitsProj');
                    $CUsArr.splice(i, 1);
                    --CUsArrLen;
                    --i;

                    //}
                }
            }
        }

        // ** --------- POST FILTERING --------- **
        $closestAncestor.show();
        $document.scrollTop(savedScrollPos);
        mod_mutationObserver.start(); // ** start monitoring mutations **

        return $CUsArr;

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

        $container.find(".UnitsProj-highlight").each(function() {
            var parentNode = this.parentNode;

            parentNode.replaceChild(this.firstChild, this);
            parentNode.normalize();

        });
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
        var filterText_lowerCase = getSearchBoxText().toLowerCase();
        if (lastFilterText_lowerCase !== filterText_lowerCase) {
            lastFilterText_lowerCase = filterText_lowerCase;
            thisModule.trigger('filtering-state-change');
        }
    }

    function getSearchBoxText() {
        return $searchBox.val();
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
