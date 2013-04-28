// See _readme_module_template.js for module conventions


_u.mod_CUsMgr = (function($, mod_core, mod_mutationObserver, mod_keyboardLib, mod_filterCUs, mod_chromeAltHack, helper, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        $selectedCU: null,
//        selectNext: selectNext,
//        selectPrev: selectPrev,
    });

    /*-- Event bindings --*/
    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);
    thisModule.listenTo(mod_mutationObserver, 'dom-mutations-grouped', updateCUsAndRelatedState);
    // if mod_filterCUs is not defined, rest of the extension still works fine
    if (mod_filterCUs) {
        thisModule.listenTo(mod_filterCUs, 'filtering-state-change', updateCUsAndRelatedState);
        thisModule.listenTo(mod_filterCUs, 'tab-on-filter-search-box', onTabOnFilterSearchBox);
    }

    /*-- Module implementation --*/
    //////////////////////////////////

    /* NOTES
     1) Often the most important content of a webpage (i.e the actual *content* excluding the header, footer, side bars,
     adverts) is composed of a set of repeating units. We call such a unit a Content Unit (CU). E.g. on the Google Search
     results page, each search result is a CU. Each CU is a logical unit of content, attention and navigation/access.

     Often a CU corresponds to single DOM element, like a <div> (and its contents). But this isn't always the case, and
     a CU might consist of multiple top level DOM elements (e.g: pages on Hacker News, Urban Dictionary, etc). To cater
     to the most general case, this program represents a CU as a jQuery set consisting of one or more DOM elements.

     2) DOM elements that can receive focus are called the "focusables"

     3) In the comments, including JSDoc ones, the term "JQuery *set*" is used to mean a JQuery object that can contain
     *one or more* DOM elements; the term "JQuery *wrapper*" is used to denote one which is expected be a JQuery wrapper
     on a *single* DOM node.

     */

    var $CUsArray = [], /* An array of jQuery sets. The array represents the *sequence* of CUs on the current page.
     Each constituent element (which is a jQuery set) represents the set of DOM elements that constitute a single
     CU for the current page.
     Most web pages will allow writing simple selectors such that each CU can be represented as a jQuery set
     consisting of a single DOM element.(Because these web pages group related logical entities in a single container,
     for which the selector can be specified.)
     However, some web pages (like news.ycombinator.com, wikipedia.org, etc) require writing selectors such each CU
     has to be represented as a jQuery set comprising of multiple DOM elements.
     (For more details, see the documentation on how to specify selectors for webpages.)

     Note: If the search feature has been invoked, this contains only the filtered CUs that are visible on the page.
     This helps keep things simple.
     */

        selectedCUIndex  = -1, // Index of the selected CU in $CUsArray
        hoveredCUIndex  = -1, // Index of the hovered CU in $CUsArray

        //container for elements created by this program that we add to the page's DOM.
        $topLevelContainer = mod_core.$topLevelContainer,

        // This class should be applied to all elements added by this extension.
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,

        class_CUOverlay = CONSTS.class_CUOverlay,                     // class applied to all CU overlays
        class_CUSelectedOverlay = CONSTS.class_CUSelectedOverlay,    // class applied to overlay on a selected CU
        class_CUHoveredOverlay = CONSTS.class_CUHoveredOverlay,      // class applied to overlay on a hovered CU
        $unusedOverlaysArray = [],   // to enable reusing existing unused overlays

    // boolean, holds a value indicating where the css specifies a transition style for overlays
        overlayCssHasTransition,

        $document = $(document), // cached jQuery object

    // tracks the element on which scrolling should be attempted first, when the user invokes scrolllDown/scrollUp
        elementToScroll,

        rtMouseBtnDown,         // boolean holding the state of the right mouse button
        ltMouseBtnDown,         // boolean holding the state of the left mouse button
        scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

        class_scrollingMarker = 'CU-scrolling-marker',
        $scrollingMarker,


        $helpContainer,
        timeout_search,

        $lastSelectedCU = null,   // to store a reference to the last selected CU

    // If a CU is currently selected, this stores the time it was selected, else this stores the time the last
    // selected CU was deselected.
        lastSelectedCUTime,

    // number of milliseconds since its last selection/deselection after which a CU is no longer deemed to be
    // selected/last-selected, IF it is not in the viewport
        selectionTimeoutPeriod = 60000,

// TODO: one of the following two is not needed
        stopExistingScrollAnimation,
        animationInProgress,

    
        isMac = navigator.appVersion.indexOf("Mac")!=-1, // since macs have different key layouts/behaviors

        // the following objects are retrieved from the background script
        miscGlobalSettings,
        browserShortcuts,
        generalShortcuts,
        expandedUrlData,

        addEventListener_eventHandlers = [],
        jQueryOn_eventHandlers = [],
        suppressEvent = helper.suppressEvent;

    // re-initialize the extension when background script informs of change in settings
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if (request.message === 'settingsChanged') {
                initializeExtension();
            }
        }
    );

// returns a jQuery set composed of all focusable DOM elements contained in the
// jQuery set ($CU) passed
    var $getContainedFocusables = function($CU) {

        var $allElements = $CU.find('*').addBack();
        var $containedFocusables = $allElements.filter(CONSTS.focusablesSelector);
        return $containedFocusables;

    };

    /**
     * Returns the "main" element in the specified $CU. This is determined using the "std_mainEl" MU specified in the expandedUrlData.
     * If no std_mainEl is specified, this function simply returns the first focusable element in the $CU
     *
     * @param $CU
     * @return {DOM element} Returns the "main" element, if one was found, else null.
     */
    var getMainElement = function($CU) {

        if (!$CU || !$CU.length) {
            return null;
        }

        var $containedFocusables = $getContainedFocusables($CU);

        if (!$containedFocusables.length) {
            return null;
        }

        var selector = expandedUrlData.CUs_MUs && expandedUrlData.CUs_MUs.std_mainEl && expandedUrlData.CUs_MUs.std_mainEl.selector,
            $filteredFocusables;

        if (selector && ($filteredFocusables = $containedFocusables.filter(selector)) && $filteredFocusables.length) {

            return $filteredFocusables[0];
        }
        else {
            return $containedFocusables[0];
        }
    };

// Focuses the "main" focusable element in a CU, if one can be found.
// See function "getMainElement" for more details.
    function focusMainElement($CU) {
        var mainEl = getMainElement($CU);
        if (mainEl) {
//        $(mainEl).data('enclosingCUJustSelected', true);
            mainEl.focus();
        }
    }

    /**
     * Invokes a click on the active element (see getMainElement()) of the selected CU. Passing true for
     * 'newTab' invokes "ctrl+click", which has the effect of opening the link in a new tab (if the "main" element is
     * a link)
     * @param {boolean} newTab {Determines whether to invoke ctrl+click or simply a click)
 */
    function openActiveElement(newTab) {

        if (newTab) {
            var ctrlClickEvent = document.createEvent("MouseEvents");

            // detecting OS detection based on:
            // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
            if (isMac) {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, false, false, false, true, 0, null); // cmd key set to true for mac
            }
            else {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, true, false, false, false, 0, null); // ctrl key set to true for non-macs
            }

            document.activeElement.dispatchEvent(ctrlClickEvent);
        }
        else {
            document.activeElement.click();
        }

//    var $CU = $CUsArray[selectedCUIndex];
//    if ($CU) {
//        var element = getMainElement($CU)
//        if (element) {
//            if (newTab) {
//                var ctrlClickEvent = document.createEvent("MouseEvents");
//                ctrlClickEvent.initMouseEvent("click", true, true, null,
//                    0, 0, 0, 0, 0, true, false, false, false, 0, null);
//
//                element.dispatchEvent(ctrlClickEvent);
//            }
//            else {
//                element.click();
//            }
//        }
//
//    }
    }

    /**
     * Selects the CU specified.
     * @param {number|DOMElement (or jQuery wrapper)} CUOrItsIndex Specifies the CU.
     * Can be an integer that specifies the index in $CUsArray or a jQuery object representing the CU.
     * (While performance isn't a major concern here,) passing the index is preferable if it is already known,
     * otherwise the function will determine it itself (in order to set the selectedCUIndex variable).
     * @param {boolean} setFocus If true, the "main" element for this CU, if one is found, is
     * focused.
     * @param {boolean|undefined} adjustScrolling If true, document's scrolling is adjusted so that
     * all (or such much as is possible) of the selected CU is in the viewport. Defaults to false.
     * This parameter is currently passed as true only from selectPrev() and selectNext()
     * @param {object} [options] Misc options. Can also be used to override miscGlobalSettings
     */
    var selectCU = function(CUOrItsIndex, setFocus, adjustScrolling, options) {
//        console.log('selectCU() called');
        var $CU,
            indexOf$CU; // index in $CUsArray

        if (typeof CUOrItsIndex === "number" || CUOrItsIndex instanceof Number) {
            indexOf$CU = CUOrItsIndex;
            $CU = $CUsArray[indexOf$CU];
        }
        else {
            $CU = $(CUOrItsIndex);
            indexOf$CU = findIndex_In_$CUsArray($CU);
        }

        if (!$CU || !$CU.length || indexOf$CU < 0) {
            return;
        }

        options = $.extend(true, {}, miscGlobalSettings, options);

        deselectCU(options); // before proceeding, deselect currently selected CU, if any

        selectedCUIndex = indexOf$CU;
        var $overlaySelected = showOverlay($CU, 'selected');

        if (!$overlaySelected) {
            console.warn('UnitsProj: no $overlay returned by showOverlay');
        }

        if (!options || !options.onDomChangeOrWindowResize) {
            selectCU.invokedYet = true; // to indicate that now this function (selectCU) has been invoked at least once

            $lastSelectedCU = $CU;
            lastSelectedCUTime = new Date();

            if (adjustScrolling) {
                scrollIntoView($overlaySelected, options);
            }

            if (setFocus) {
                focusMainElement($CU);
            }

            if (options.increaseFontInSelectedCU && !$CU.data('fontIncreasedOnSelection')) {
                mod_mutationObserver.stop();
                increaseFont($CU);
                mod_mutationObserver.start();
                $CU.data('fontIncreasedOnSelection', true);
            }

            var fn_onCUSelection, temp;
            if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUSelection) && (fn_onCUSelection = temp.fn)) {
                mod_mutationObserver.stop();
                fn_onCUSelection($CU, document, $.extend(true, {}, expandedUrlData));
            }
        }
    };

    /**
     * Deselects the currently selected CU, if there is one
     */
    var deselectCU = function (options) {

        var $CU = $CUsArray[selectedCUIndex];
        if ($CU) {

            // console.log('deselecting CU...');
            removeOverlay($CU, 'selected');

            if (!options || !options.onDomChangeOrWindowResize) {
                lastSelectedCUTime = new Date();

                if ($CU.data('fontIncreasedOnSelection')) {
                    mod_mutationObserver.stop();
                    decreaseFont($CU);
                    mod_mutationObserver.start();
                    $CU.data('fontIncreasedOnSelection', false);
                }

                var fn_onCUDeselection, temp;
                if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUDeselection) && (fn_onCUDeselection = temp.fn)) {
                    mod_mutationObserver.stop();
                    fn_onCUDeselection($CU, document, $.extend(true, {}, expandedUrlData));
                    mod_mutationObserver.start();
                }
            }
        }
        selectedCUIndex = -1;
    };

    /**
     * Removes the 'selected' or 'hovered' css class from the CU, as specified by 'type'
     * @param $CU
     * @param {string} type Can be 'selected' or 'hovered'
     * @return {*} Returns $overlay (the jQuery wrapper overlay element)
     */
    function removeOverlay ($CU, type) {
        if (!$CU || !$CU.length) {
            return null;
        }

        var $overlay = $CU.data('$overlay');

        if ($overlay) {
            $overlay.removeClass(type === 'selected'? class_CUSelectedOverlay: class_CUHoveredOverlay);

            if (!overlayCssHasTransition) {
                tryRecycleOverlay($overlay);
            }
        }
        else {
            console.warn('UnitsProj: no $overlay found');
        }

    }

    /**
     *
     * @param $CU
     * @param {string} type Can be 'selected' or 'hovered'
     * @return {*} Displays and returns $overlay (i.e. a jQuery wrapped overlay element)
     */
    var showOverlay = function($CU, type) {
        if (!$CU || !$CU.length) {
            return null;
        }

        var $overlay = $CU.data('$overlay');

        if (!$overlay || !$overlay.length) {
            if ($unusedOverlaysArray.length) {
                $overlay = $unusedOverlaysArray.shift();
            }
            else {
                $overlay = $('<div></div>').addClass(class_CUOverlay).addClass(class_addedByUnitsProj);
            }
        }

        var CUStyleData = expandedUrlData.CUs_style,
            overlayPadding;

        $overlay.data('$CU', $CU);
        $CU.data('$overlay', $overlay);

        // position the overlay above the CU, and ensure that its visible
        $overlay.css(getBoundingRectangle($CU)).show();

        if (CUStyleData && (overlayPadding = CUStyleData.overlayPadding)) {
            $overlay.css("padding", overlayPadding);
            $overlay.css("top", parseFloat($overlay.css("top")) -
                parseFloat($overlay.css("padding-top")));

            $overlay.css("left", parseFloat($overlay.css("left")) -
                parseFloat($overlay.css("padding-left")));
        }

        if (type === 'selected') {
            $overlay.addClass(class_CUSelectedOverlay);
//        $overlay.css('box-shadow', '2px 2px 20px 0px #999');

        }
        else { // 'hovered'
            $overlay.addClass(class_CUHoveredOverlay);
//        $overlay.css('box-shadow', '1px 1px 10px 0px #bbb');
        }

        $overlay.appendTo($topLevelContainer);

        return $overlay;

    };

    /**
     * Shows as hovered the CU specified.
     * @param {number|DOMElement (or jQuery wrapper)} CUOrItsIndex Specifies the CU.
     * Can be an integer that specifies the index in $CUsArray or a jQuery object representing the CU.
     * (While performance isn't a major concern,) passing the index is preferable if it is already known.
     */
    var hoverCU = function(CUOrItsIndex) {

        var $CU,
            indexOf$CU; // index in $CUsArray

        if (typeof CUOrItsIndex === "number" || CUOrItsIndex instanceof Number) {
            indexOf$CU = CUOrItsIndex;
            $CU = $CUsArray[indexOf$CU];
        }
        else {
            $CU = $(CUOrItsIndex);
            indexOf$CU = findIndex_In_$CUsArray($CU);
        }

        if (!$CU || !$CU.length || indexOf$CU < 0) {
            return;
        }

        dehoverCU(); // before proceeding, dehover currently hovered-over CU, if any

        hoveredCUIndex = indexOf$CU;
        showOverlay($CU, 'hovered');

    };

    /**
     * Dehovers the currently hovered (over) CU, if there is one
     */
    var dehoverCU = function () {
        var $CU = $CUsArray[hoveredCUIndex];
        if ($CU) {
            removeOverlay($CU, 'hovered');
        }
        hoveredCUIndex = -1;
    };

    var showScrollingMarker = function(x, y, height) {

        clearTimeout($scrollingMarker.timeoutId); // clear a previously set timeout out, if one exists...

        $scrollingMarker.timeoutId = setTimeout(function() { // ... before setting a new one
            $scrollingMarker.hide();
        }, 3000);

        $scrollingMarker.css({top: y, left: x-$scrollingMarker.width()-5, height: height}).show();
    };

    /**
     * Scrolls more of the currently selected CU into view if required (i.e. if the CU is too large),
     * in the direction specified.
     * @param {string} direction Can be either 'up' or 'down'
     * @param {object} [options] Misc options. Can also be used to override miscGlobalSettings
     * @return {Boolean} value indicating whether scroll took place
     */
    function scrollSelectedCUIfRequired (direction, options) {

        options = $.extend(true, {}, miscGlobalSettings, options);

        var $CU = $CUsArray[selectedCUIndex];

        var pageHeaderHeight = getEffectiveHeaderHeight();

        var // for the window:
            winTop = $document.scrollTop(),
            winHeight = $(window).height(),
            winBottom = winTop + winHeight;

        // for the CU
        var boundingRect = getBoundingRectangle($CU),
            CUTop = boundingRect.top,
            CUHeight = boundingRect.height,
            CUBottom = CUTop + CUHeight;

        var newWinTop, // new value of scrollTop
            overlapAfterScroll = 40,
            margin = 30;

        direction = direction.toLowerCase();
        if ( (direction === 'up' && CUTop < winTop + pageHeaderHeight) ||
            (direction === 'down' && CUBottom > winBottom) ) {
            if (direction === 'up' ) { // implies CUTop < winTop + pageHeaderHeight
                newWinTop = winTop - (winHeight - pageHeaderHeight) + overlapAfterScroll; //TODO: verify the math

                // if newWinTop calculated would scroll the CU more than required for it to get completely in the view,
                // increase it to the max value required to show the entire CU with some margin left.
                if (newWinTop + pageHeaderHeight < CUTop) {
                    newWinTop = CUTop - pageHeaderHeight - margin;
                }

                if (newWinTop < 0) {
                    newWinTop = 0;
                }
                showScrollingMarker(boundingRect.left, winTop+pageHeaderHeight, overlapAfterScroll);
            }

            else  { //direction === 'down' && CUBottom > winBottom

                newWinTop = winBottom - overlapAfterScroll - pageHeaderHeight;

                // if newWinTop calculated would scroll the CU more than required for it to get completely in the view,
                // reduce it to the min value required to show the entire CU with some margin left.
                if (newWinTop + winHeight > CUBottom) {
                    newWinTop = CUBottom - winHeight + margin;
                }

                // ensure value is not more then the max possible
                if (newWinTop > $document.height() - winHeight) {
                    newWinTop = $document.height() - winHeight;
                }

                showScrollingMarker(boundingRect.left, winBottom - overlapAfterScroll, overlapAfterScroll);
            }

            if (options.animatedCUScroll) {

                console.log('animated SAME CU scroll');

                var animationDuration = Math.min(options.animatedCUScroll_MaxDuration,
                    Math.abs(newWinTop-winTop) / options.animatedCUScroll_Speed);

                animatedScroll(newWinTop, animationDuration);

//            $('html, body').animate({scrollTop: newWinTop}, animatedScroll);
            }
            else {
                console.log('NON animated SAME CU scroll');
                $document.scrollTop(newWinTop);
            }

            return true;
        }

        return false;
    }

    /**
     * Selects the previous CU to the currently selected one.
     */
    var selectPrev = function() {

        if (!$CUsArray || !$CUsArray.length || $CUsArray.length == 1) {
            scrollUp();
            return;
        }

        // to handle quick repeated invocations...
        if (animationInProgress) {
            stopExistingScrollAnimation = true;
            return;
        }
        else {
            stopExistingScrollAnimation = false;
        }

        $scrollingMarker.hide();

        var newIndex;

        if (selectedCUIndex >=0 && (isCUInViewport($CUsArray[selectedCUIndex]) ||
            new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {
            if (miscGlobalSettings.sameCUScroll) {
                var scrolled = scrollSelectedCUIfRequired('up');
                if (scrolled) {
                    return;
                }
                else if (selectedCUIndex === 0) { // special case for first CU
                    scrollUp();
                }
            }

            newIndex = selectedCUIndex - 1;
            if (newIndex >= 0) {
                selectCU(newIndex, true, true);
            }
            // else do nothing
        }
        else {
            selectMostSensibleCU(true, true);
        }


    };

    /**
     * Selects the next CU to the currently selected one.
     */
    var selectNext = function() {

        if (!$CUsArray || !$CUsArray.length || $CUsArray.length == 1) {
            scrollDown();
            return;
        }

        // to handle quick repeated invocations...
        if (animationInProgress) {
            stopExistingScrollAnimation = true;
            return;
        }
        else {
            stopExistingScrollAnimation = false;
        }

        $scrollingMarker.hide();

        var newIndex;

        if (selectedCUIndex >=0 && (isCUInViewport($CUsArray[selectedCUIndex]) ||
            new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {

            if (miscGlobalSettings.sameCUScroll) {
                var scrolled = scrollSelectedCUIfRequired('down');
                if (scrolled) {
                    return;
                }
                else  if (selectedCUIndex === $CUsArray.length-1) { // special case for last CU
                    scrollDown();
                }
            }

            newIndex = selectedCUIndex + 1;
            if (newIndex < $CUsArray.length) {
                selectCU(newIndex, true, true);
            }
            // else do nothing

        }
        else {
            selectMostSensibleCU(true, true);
        }
    };

    /**
     * Called typically when there is no currently selected CU, and we need to select the CU that makes most sense
     * to select in this situation.
     */
    function selectMostSensibleCU(setFocus, adjustScrolling) {

        var lastSelectedCUIndex;

        // if a CU is already selected AND (is present in the viewport OR was selected only recently)...
        if (selectedCUIndex >= 0 &&
            (isCUInViewport($CUsArray[selectedCUIndex]) ||
                new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {


            //...call selectCU() on it again passing on the provided parameters
            selectCU(selectedCUIndex, setFocus, adjustScrolling);
            return;
        }
        // if last selected CU exists AND (is present in the viewport OR was deselected only recently)...
        else if( (lastSelectedCUIndex = findIndex_In_$CUsArray($lastSelectedCU)) >=0 &&
            (isCUInViewport($lastSelectedCU) ||
                new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {

            selectCU(lastSelectedCUIndex, setFocus, adjustScrolling);

        }

        else {
            // Selects first CU in the viewport; if none is found, this selects the first CU on the page
            selectFirstCUInViewport(setFocus, adjustScrolling);
        }
    }

    /**
     * Selects first (topmost) CU in the visible part of the page. If none is found, selects the first CU on the page
     * @param {boolean} setFocus
     * @param {boolean} adjustScrolling
     */

    function selectFirstCUInViewport (setFocus, adjustScrolling) {

        if ($CUsArray && $CUsArray.length) {
            var winTop = $document.scrollTop(),
                CUsArrLen = $CUsArray.length;

            for (var i = 0; i < CUsArrLen; ++i) {
                var $CU = $CUsArray[i];
                var offset = $CU.offset();
                if (offset.top > winTop) {
                    break;
                }
            }

            if (i < CUsArrLen) {
                selectCU(i, setFocus, adjustScrolling);
            }
            else {
                selectCU(0, setFocus, adjustScrolling);
            }

        }

    }

    /**
     * If the specified element exists within a CU, the index of that CU in $CUsArray is
     * returned, else -1 is returned.
     * @param {DOM element|jQuery wrapper} element
     * @return {number} If containing CU was found, its index, else -1
     */
    var getEnclosingCUIndex = function(element) {
        var $element = $(element),
            CUsArrLen = $CUsArray.length;

        for (var i = 0; i < CUsArrLen; ++i) {
            if ($CUsArray[i].is($element) || $CUsArray[i].find($element).length) {
                return i;
            }
        }

        return -1;

    };

    function onTabOnFilterSearchBox() {
        if ($CUsArray.length) {
            selectCU(0, true, true);
        }
        else {
            var $focusables = $document.find(CONSTS.focusablesSelector);
            if ($focusables.length) {
                $focusables[0].focus();
            }
        }
    }

// Returns ALL the elements after the current one in the DOM (as opposed to jQuery's built in nextAll which retults only
// the next siblings.
// Returned object contains elements in document order
// TODO2: check if this is needed. Of if needed only in the one instance where its being used current, could be replaced
// by nextALLUntil(selector), which might be more efficient
    $.fn.nextALL = function(filter) {
        var $all = $('*'); // equivalent to $document.find('*')
        $all = $all.slice($all.index(this) + 1);
        if (filter)  {
            $all = $all.filter(filter);
        }
        return $all;
    };


// this will find index of the passed jQuery set ($CU) in the $CUsArray. However, unlike JavaScript's
// Array#indexOf() method, a match will be found even if the passed jQuery set is "equivalent" (i.e has the same
// contents as a member of $CUsArray, even if they are not the *same* object.
// Returns -1 if not found.
    var findIndex_In_$CUsArray = function($CU)  {

        var CUsArrLen;

        if ($CUsArray && (CUsArrLen = $CUsArray.length)) {

            for (var i = 0; i < CUsArrLen; ++i) {
                if (areCUsSame($CU, $CUsArray[i])) {
                    return i;
                }
            }
        }

        return -1;
    };

// returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
// instances where we use this function, the order of elements is always the document order)
    /**
     * returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
     * instances where we use this function, the order of elements is always the document order)
     * @param $1 A CU
     * @param $2 Another CU to compare with the first one.
     * @return {Boolean}
     */
    var areCUsSame = function($1, $2) {

        // if each jQuery set is either empty or nonexistent, their "contents" are "same".
        if (!$1 && (!$2 || !$2.length)) {
            return true;
        }
        if (!$2 && (!$1 || !$1.length)) {
            return true;
        }

        // we reach here if atleast one of them exists and is non-empty, so...
        if ($1 && $1.length && $2 && $2.length ) {
            var length1 = $1.length,
                length2 = $2.length;

            if (length1 === length2) {

                for (var i = 0; i < length1; ++i) {
                    if ($1[i] !== $2[i]) { // if corresponding DOM elements are not the same
                        return false;
                    }
                }
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    };

// returns a bounding rectangle for $CU
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    var getBoundingRectangle = function($CU) {

        if (!$CU || !$CU.length)
            return;

        var CUStyleData = expandedUrlData.CUs_style,
            elements = [];

        if (CUStyleData && CUStyleData.useInnerElementsToGetOverlaySize) {
            var $innermostDescendants = $CU.find('*').filter(function() {
                if (!($(this).children().length)) {
                    return true;
                }
            });
            elements = $innermostDescendants.get();
        }
        else {
            elements = $CU.get();
        }
        return getBoundingRectangleForElements(elements);
    };

// returns a bounding rectangle for the set (array) of DOM elements specified
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    var getBoundingRectangleForElements = function(elements) {

        if (!elements || !elements.length)
            return;

        if (elements.length === 1) {
            var $el = $(elements[0]),
                offset = $el.offset();
            return {
                top: offset.top,
                left: offset.left,
                width: $el.innerWidth(),
                height: $el.innerHeight()
            };

        }

        // if function has still not returned...

        // x1, y1 => top-left. x2, y2 => bottom-right.
        // for the bounding rectangle:
        var x1 = Infinity,
            y1 = Infinity,
            x2 = -Infinity,
            y2 = -Infinity;


        for (var i = 0; i < elements.length; i++) {
            var el = elements[i],
            // Ignoring JSHint warning in the following line. Variable hoisting notwithstanding, I like having "logical/intended" variable scopes,
            // and "defining" variables as close to where they are required. Helps me when code chunks need to be moved around.
                $el = $(el),
                elPosition = $(el).css('position');

            // ignore elements out of normal flow to calculate rectangle + hidden/invisible elements
            if (elPosition === "fixed" || elPosition === "absolute" || /*|| elPosition === "relative"*/
                !$el.is(':visible') || $el.css('visibility') === "hidden" ||
                !$el.innerWidth() || !$el.innerHeight()) {
                continue;
            }

            var offset = $el.offset();  // Ingnoring JSHint warning, for the same reason as above

            // for the current element:
            var _x1, _y1, _x2, _y2;

            _x1 = offset.left;
            _y1 = offset.top;
            _x2 = _x1 + $el.innerWidth();
            _y2 = _y1 + $el.innerHeight();

            if (_x1 < x1)
                x1 = _x1;

            if (_y1 < y1)
                y1 = _y1;

            if (_x2 > x2)
                x2 = _x2;

            if (_y2 > y2)
                y2 = _y2;

        }

        // return an object with a format such that it can directly be passed to jQuery's css() function).
        return {
            top: y1,
            left:x1,
            width: x2-x1,
            height: y2-y1
        };
    };

// sets the document's scrollTop to the value specified, using gradual changes in the scrollTop value.
    var animatedScroll = function(scrollTop, duration) {

        var current = $document.scrollTop();
        var destination = scrollTop;

        // ensure that destination scrollTop position is within the possible range
        if (destination < 0) {
            destination = 0;
        }
        else if (destination > $document.height() - $(window).height()) {
            destination = $document.height() - $(window).height();
        }

        var scrollingDown;

        if (destination > current) {
            scrollingDown = true;
        }
        else if (destination < current) {
            scrollingDown = false;
        }
        else {
            return;
        }

        var totalDisplacement = destination - current,

            speed = totalDisplacement/duration, // pixels per millisec

        // millisecs (actually this is the *minimum* interval between any two consecutive invocations of
        // invokeIncrementalScroll, not necessarily the actual period between any two consecutive ones.
        // This is  handled by calculating the time diff. between invocations. See later.)
            intervalPeriod = Math.min(100, miscGlobalSettings.animatedCUScroll_MaxDuration/4),

            lastInvocationTime, // will contain the time of the last invocation (of invokeIncrementalScroll)

            body = document.body,

            intervalId;

        var invokeIncrementalScroll = function () {

            if (stopExistingScrollAnimation) {
                console.log('interval CLEARED.');
                clearInterval(intervalId);
                body.scrollTop = destination;
                animationInProgress = false;
                return;
            }

//        scrollingDown? (current += scrollDelta): (current -= scrollDelta);
            var now = new Date();
            current += (now - lastInvocationTime) * speed;
            lastInvocationTime = now;
            if (scrollingDown? (current >= destination): (current <= destination)) {
                body.scrollTop = destination;
                clearInterval(intervalId);
                animationInProgress = false;
            }
            else {
                body.scrollTop = current;
            }

        };

        animationInProgress = true;
        // in the following lines, we call  'invokeIncrementalScroll' once, after setting 'lastInvocationTime' to the
        // current time minus 'intervalPeriod'. This allows the first invocation of the function to take place immediately
        // rather than at the end of the 'intervalPeriod'.
        lastInvocationTime = new Date() - intervalPeriod;
        invokeIncrementalScroll();   // invoke once immediately, before setting setInterval.

        intervalId = setInterval (invokeIncrementalScroll , intervalPeriod);
    };


    /**
     * Scrolls the window such the specified element lies fully in the viewport (or as much as is
     * possible if the element is too large).
     * //TODO3: consider if horizontal scrolling should be adjusted as well (some, very few, sites sites might, like an
     * image gallery, might have CUs laid out horizontally)
     * @param {DOM element|JQuery wrapper} $element
     * @param {object} options Misc options. Can also be used to override miscGlobalSettings
     */
    function scrollIntoView($element, options) {

        $element = $($element);
        if (!$element || !$element.length) {
            return;
        }

        options = $.extend(true, {}, miscGlobalSettings, options);

        var // for the window:
            winTop = $document.scrollTop(),
        // winHeight = $(window).height(), // this doesn't seem to work correctly on news.ycombinator.com
            winHeight = window.innerHeight,
            winBottom = winTop + winHeight,

        // for the element:
            elTop = $element.offset().top,
            elHeight = $element.height(),
            elBottom = elTop + elHeight;

        var newWinTop, // once determined, we will scroll the window top to this value
            margin = 10;

        var pageHeaderHeight = getEffectiveHeaderHeight();

        /*
         if (elBottom >= winBottom) { // element is overflowing from the bottom

         newWinTop = elTop - Math.max(pageHeaderHeight, Math.min(winHeight - elHeight, winHeight/2));
         }
         else if (elTop <= winTop + pageHeaderHeight) { // element is overflowing from the top

         newWinTop = elTop - Math.max(pageHeaderHeight, winHeight/2 - elHeight);
         }
         */

        if ( (elTop > winTop + pageHeaderHeight + margin && elBottom < winBottom - margin) && // CU is fully in viewport
            !scrollIntoView.tryCenteringCUOnEachScroll) {

            return false;
        }

        else {

            // center the element based on this equation equating the space left in the (visible part of the) viewport above
            // the element to the space left below it:
            // elTop - (newWinTop + pageHeaderHeight) = newWinBottom - elBottom = newWinTop + winHeight - elBottom
            // (substituting (newWinTop + winHeight) for newWinBottom)
            newWinTop = (elTop + elBottom - winHeight +  - pageHeaderHeight)/2;

            if (elTop < newWinTop + pageHeaderHeight + margin ) {
                newWinTop = elTop - pageHeaderHeight - margin;
            }
        }

        if (options.animatedCUScroll) {
            console.log('animated CU scroll');
            var animationDuration = Math.min(options.animatedCUScroll_MaxDuration,
                Math.abs(newWinTop-winTop) / options.animatedCUScroll_Speed);
            animatedScroll(newWinTop, animationDuration);
//        $('html, body').animate({scrollTop: newWinTop}, animatedScroll);
        }
        else {
            console.log('NON animated CU scroll');
            $document.scrollTop(newWinTop);

        }

    }

    function $getVisibleTextInputElements() {
        var $textInput = $document.find('input[type=text], input:not([type]), textarea, [contenteditable=true]').filter(function() {
            var $this = $(this);
            if ($this.is(':visible') || $this.css('visiblity') === 'visible') {
                return true;
            }
        });

        return $textInput;
    }

    function focusFirstTextInput() {
        var $textInput = $getVisibleTextInputElements();
        $textInput.length && $textInput[0].focus();
    }
    function focusNextTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex++;
                if (targetIndex >= $textInput.length) {
                    targetIndex = 0;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }
    function focusPrevTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex--;
                if (targetIndex < 0) {
                    targetIndex = $textInput.length - 1;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }


    function _onUrlChange() {
        initializeExtension(); // resets the extension
    }

// Sets/updates the global variable $CUsArray and other state associated with it
    function updateCUsAndRelatedState() {

        // Save the currently selected CU, to reselect it, if it is still present in the $CUsArray after the array is
        // updated. This needs to be done before calling deselectCU() and modifying the current $CUsArray
        var $prevSelectedCU = $CUsArray && $CUsArray[selectedCUIndex];
        dehoverCU(); // to prevent a "ghost" hover overlay
        deselectCU({onDomChangeOrWindowResize: true});
        var $CUs = getAllCUsOnPage();
        mod_filterCUs && mod_filterCUs.filterCUsArray($CUs);
        $CUsArray = $CUs;

        if ($CUsArray && $CUsArray.length) {

            if (miscGlobalSettings.selectCUOnLoad && !selectCU.invokedYet) {
                // this is done at DOM ready as well in case by then the page's JS has set focus elsewhere.
                selectFirstCUInViewport(true, false);
            }

            // The following block ensures that a previously selected CU continues to remain selected
            else if ($prevSelectedCU) {

                var newSelectedCUIndex = findIndex_In_$CUsArray($prevSelectedCU);

                if (newSelectedCUIndex >= 0) {
                    // pass false to not change focus (because it is almost certainly is already where it should be,
                    // and we don't want to inadvertently change it)
                    selectCU(newSelectedCUIndex, false, false, {onDomChangeOrWindowResize: true});
                }
            }
        }
    }

// Finds the set of all the CUs on the current page, and returns it as an array
    var getAllCUsOnPage = function() {

        if (!expandedUrlData || !expandedUrlData.CUs_specifier) {
            // returning an empty array instead of null means accessing $CUsArray[selectedCUIndex] (which
            // is done a lot) doesn't need to be prepended with a check against null in each case.
            return [];
        }

        var $CUsArr,   // this will be hold the array to return
            CUsSpecifier = expandedUrlData.CUs_specifier,
            selector,
            firstSelector,
            lastSelector,
            centralElementselector;


        if (typeof (selector = CUsSpecifier.selector) === "string") {
            $CUsArr = $.map($(selector).get(), function(item, i) {
                return $(item);
            });
        }

        else if (typeof (firstSelector = CUsSpecifier.first) === "string" &&
            typeof (lastSelector = CUsSpecifier.last) === "string") {

            $CUsArr = [];
            var $firstsArray = $.map($(firstSelector).get(), function(item, i) {
                return $(item);
            });

            // TODO: add a comment somewhere explaining how "first" and "last" work "smartly" (i.e. find the respective
            // ancestors first_ancestor and last_ancestor that are siblings and use those)
            // selecting logically valid entities.)
            if ($firstsArray.length) {
                var // these will correspond to CUsSpecifier.first and CUsSpecifier.last
                    $_first, $_last,

                //these will be the closest ancestors (self included) of $_first and $_last respectively, which are
                // siblings
                    $first, $last,

                    $closestCommonAncestor,
                    firstsArrLen = $firstsArray.length;

                var filterFirst = function(){
                    var $el = $(this);
                    if ($el.is($_first) || $el.has($_first).length) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                var filterLast = function(){
                    var $el = $(this);
                    if ($el.is($_last) || $el.has($_last).length) {
                        return true;
                    }
                    else {
                        return false;
                    }
                };

                for (var i = 0; i < firstsArrLen; ++i) {
                    $_first = $firstsArray[i];
                    $_last = $_first.nextALL(lastSelector).first();

                    $closestCommonAncestor = $_first.parents().has($_last).first();

                    $first = $closestCommonAncestor.children().filter(filterFirst);
                    $last = $closestCommonAncestor.children().filter(filterLast);
                    $CUsArr[i] = $first.add($first.nextUntil($last)).add($last);
                }
            }
        }

        else if (typeof (centralElementselector = CUsSpecifier.buildCUAround) === "string"){

            $CUsArr = [];
            var currentGroupingIndex = 0;

            var $container = helper.closestCommonAncestor($(CUsSpecifier.buildCUAround));
            // TODO: move the function below to a more apt place
            /**
             *
             * @param {DOM Node|JQuery Wrapper} $container
             */

            var buildCUsAroundCentralElement = function ($container) {
//TODO: 1) rename child to sibling etc
//            2) call currentGroupingIndex currentGroupingIndex etc.
                $container = $($container);

                if (!$container || !$container.length) {
                    return null;
                }

                if ($container.length > 1) {
                    console.error("length of $container should not be more than 1");
                }

                var $siblings = $container.children();
                var siblingsLength = $siblings.length;

                if (siblingsLength) {

                    var $currentSibling,
                        firstCentralElementFound = false,
                        num_centralElementsInCurrentSibling;

                    for (var i = 0; i < siblingsLength; ++i) {
                        $currentSibling = $siblings.eq(i);
                        if ($currentSibling.is(centralElementselector)) {
                            if (!firstCentralElementFound) {
                                firstCentralElementFound = true;
                            }
                            else {
                                ++currentGroupingIndex;
                            }
                            $CUsArr[currentGroupingIndex] = $currentSibling.add($CUsArr[currentGroupingIndex]);
                        }
                        else if ((num_centralElementsInCurrentSibling = $currentSibling.find(centralElementselector).length)) {
                            if (num_centralElementsInCurrentSibling === 1) {
                                if (!firstCentralElementFound) {
                                    firstCentralElementFound = true;
                                }
                                else {
                                    ++currentGroupingIndex;
                                }
                                $CUsArr[currentGroupingIndex] = $currentSibling.add($CUsArr[currentGroupingIndex]);
                            }
                            else { // >= 2
                                if (!firstCentralElementFound) {
                                    firstCentralElementFound = true;
                                }
                                else {
                                    ++currentGroupingIndex;
                                }

                                buildCUsAroundCentralElement($currentSibling);
                            }
                        }
                        else {
                            $CUsArr[currentGroupingIndex] = $currentSibling.add($CUsArr[currentGroupingIndex]);
                        }
                    }
                }
            }; // end of function definition

            buildCUsAroundCentralElement($container);
        }

        processCUsArray($CUsArr);

//    if (parseInt($searchContainer.css('top')) >= 0) { // if search box is visible
//    ////if ($searchContainer.offset().top >= 0) { // if search box is visible
//        filterCUsArray($CUsArr);
//    }

//    if (!$CUsArr || !$CUsArr.length) {
//        console.warn("UnitsProj: No CUs were found based on the selector provided for this URL")
//        return;
//    }

        return $CUsArr;
    };

    /* Returns true if all constituent elements of $CU1 are contained within (the constituents) of $CU2, false
     otherwise. (An element is considered to 'contain' itself and all its descendants)
     */
    var CUContainedInAnother = function($CU1, $CU2) {

        var CU1Len = $CU1.length,
            CU2Len = $CU2.length;

        for (var i = 0; i < CU1Len; ++i) {

            var isThisConstituentContained = false; // assume

            for (var j = 0; j < CU2Len; ++j) {
                if ($CU2[j].contains($CU1[i])) {
                    isThisConstituentContained = true;
                    break;
                }
            }

            if (!isThisConstituentContained) {
                return false;
            }
        }
        return true;
    };

    /**
     * process all CUs in $CUsArr does the following
     1) remove any CU that is not visible in the DOM
     2) remove any CU that is fully contained within another
     */
    var processCUsArray = function($CUsArr) {

        if (!$CUsArr || !$CUsArr.length) {
            return;
        }

        var CUsArrLen = $CUsArr.length;

        for (var i = 0; i < CUsArrLen; ++i) {
            var $CU = $CUsArr[i];
            if ( (!$CU.is(':visible') && !$CU.hasClass('hiddenByUnitsProj')) || isCUInvisible($CU)) {
                $CUsArr.splice(i, 1);
                --CUsArrLen;
                --i;
                continue;
            }

            for (var j = 0; j < CUsArrLen; ++j) {
                if (i === j) {
                    continue;
                }

                if (CUContainedInAnother($CU, $CUsArr[j])) {
                    $CUsArr.splice(i, 1);
                    --CUsArrLen;
                    --i;
                    break;
                }
            }
        }
    };

    /**
     *
     * @param {DOM Element|JQuery wrapper} element
     * @param {object} point Should have the properties x and y.
     * @return {Boolean}
     */
    var elementContainsPoint = function(element, point) {

        var $element = $(element);
        if (!$element || !$element.length) {
            return false;
        }

        var x = point.x, y = point.y;

        var offset = $element.offset();
        var x1 = offset.left,
            x2 = x1 + $element.width(),
            y1 = offset.top,
            y2 = y1 + $element.height();

        if (x >= x1 && x <= x2 && y >= y1 && y <= y2 ) {
            return true;
        }
        else {
            return false;
        }
    };

    function checkOverlayCssHasTransition() {

        // create a short-lived element which is inserted into the DOM to allow determination of CSS transition property
        // on overlay elements, and then quickly removed.
        var $tempOverlay = $('<div></div>')
            .addClass(class_addedByUnitsProj)
            .addClass(class_CUOverlay)
            .hide()
            .appendTo(document.body);
        var properties = ['transition-duration', '-webkit-transition-duration', '-moz-transition-duration',
            '-o-transition-duration'];

        var transitionDuration;
        for (var property, i = 0; property = properties[i++]; ) {
            transitionDuration = $tempOverlay.css(property);
            if (transitionDuration !== null) {
                break;
            }
        }

        $tempOverlay.remove();

        transitionDuration = parseFloat(transitionDuration); // to get 0.3 from 0.3s etc

        // check if transitionDuration exists and has a non-zero value, while tolerating
        // precision errors with float (which should not occur for 0, but just in case)
        if (transitionDuration && transitionDuration > 0.00000001) {
            return true;
        }
        else {
            return false;
        }

    }

// Based on the header selector provided, this returns the "effective" height of the header (i.e. unusable space) at the
// top of the current view.
// Only the part of the header below the view's top is considered, and its size returned. If there is more than one
// header element, we do the same thing, but for the bottommost one.
    function getEffectiveHeaderHeight() {

        var tmp;
        var headerSelector = (tmp = expandedUrlData) && (tmp = tmp.CUs_MUs) && (tmp = tmp.std_header) && tmp.selector;
        if (!headerSelector) {
            return 0;
        }

        var $headers = $(headerSelector).filter(':visible'),
            headersLen;

        if ($headers && (headersLen = $headers.length)) {

            var maxHeaderBottom = 0;

            for (var i = 0; i < headersLen; ++i) {
                var $header = $headers.eq(i),
                    headerTop = $header.offset().top,
                    headerBottom = headerTop + $header.height();

                if (headerBottom > maxHeaderBottom) {
                    maxHeaderBottom = headerBottom;
                }

            }
            var  winTop = $document.scrollTop();
            return Math.max(0, maxHeaderBottom-winTop);
        }
        else {
            return 0;
        }
    }

    var isRtMouseButton = function(e) {
        // following right code mostly taken from http://www.quirksmode.org/js/events_properties.html
        var isRtButton;
//    if (!e) var e = window.event;
        if (e.which) isRtButton = (e.which == 3);
        else if (e.button) isRtButton = (e.button == 2);

        return isRtButton;
    };

// Positive value for 'delta' scrolls down, negative scrolls up
    function scroll(delta) {
        var scrollElement = elementToScroll || document.activeElement || document.body,
            oldScrollVal;

        while (scrollElement) {
            oldScrollVal = scrollElement.scrollTop;
            scrollElement.scrollTop += delta;

            if (oldScrollVal !== scrollElement.scrollTop) { // if scrolled
                return;
            }
            else {
                scrollElement = scrollElement.parentElement;
            }
        }
    }

    function scrollDown() {
        scroll(miscGlobalSettings.pageScrollDelta);
    }

    function scrollUp() {
        scroll(-miscGlobalSettings.pageScrollDelta);
    }

    function closeTab() {
        chrome.runtime.sendMessage({message: "closeTab"});
    }

// *----------code related to setting up and handling events follows---------------

// <NOTE> The lines below override jQuery's 'on' function by a wrapper which allows tracking of the event handlers
// set up by this extension, so that they can be removed if required.
    $.fn.on_original = $.fn.on;
    $.fn.on = function(/*args list intentionally left empty*/) {

        this.on_original.apply(this, arguments);
        jQueryOn_eventHandlers.push([this].concat(Array.prototype.slice.call(arguments)));

    };

    /**
     * <NOTE> This wrapper function should be used as an alternative to the DOM's native element.addEventListener
     * in order to track event handlers set up by this extension, so that they can be removed if required.
     * A technique similar to the overriding of jQuery's 'on' function cannot be used for this, because the DOM, including
     * its functions, are shared with current web page.
     * @param target
     * @param event
     * @param handler
     * @param useCapture
     */
    function addEventListener2(target, event, handler, useCapture) {

        target.addEventListener(event, handler, useCapture);
        addEventListener_eventHandlers.push(Array.prototype.slice.call(arguments));

    }

    function removeAllEventListeners() {

        var i, len, ehInfo, target;

        len = addEventListener_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = addEventListener_eventHandlers[i];
            target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.removeEventListener.apply(target, ehInfo);
        }
        addEventListener_eventHandlers = [];

        len = jQueryOn_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = jQueryOn_eventHandlers[i],
                target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.off.apply(target, ehInfo);
        }
        jQueryOn_eventHandlers = [];

        mod_keyboardLib.reset();

        mod_mutationObserver.stop();

//    console.log("UnitsProj: all event handlers removed");

    }

    /**
     * The bind function allows mapping of an array of keyboard shortcuts to a handler.
     * @param {Array} shortcuts
     * @param {Function} handler
     * @param {boolean|undefined} suppressPropagation Whether to prevent the event from causing any other action. This
     * defaults to true since it makes sense that if a shortcut has been invoked, nothing else should happen, given that
     * the shortcuts are configurable on a per-page basis). Note: Google results page (and similar pages; see below) need
     * this to be set to true in order to work correctly. In particular, a call to stopImmediatePropagation() is required
     * for google, even if preventDefault() are not called.
     *
     Additional Notes:
     Within the code for bind(), we specify 'keydown' for correct functioning in certain pages which otherwise consume
     keyboard input even when a "typable" element is not focused. The main example of this we encountered was the google
     search results page, which starts typing into the search box even when pressing keys when the search box doesn't
     have focus.
     [This is done in addition to having the keyboared library attach events in the capturing phase.]

     In the future, if required, we could consider doing these only for google search pages/sites where it is required.
     */
    function bind(shortcuts, handler, suppressPropagation) {

        // defaults to true unless explicitly specified as false (i.e. undefined is true as well)
        if (suppressPropagation !== false) {
            suppressPropagation = true;
        }

        if (suppressPropagation) {
            mod_keyboardLib.bind(shortcuts, suppressEvent, 'keypress');
            mod_keyboardLib.bind(shortcuts, suppressEvent, 'keyup');
        }

        mod_keyboardLib.bind(shortcuts, function(e) {
            handler();
            if (suppressPropagation) {
                suppressEvent(e);
            }
        }, 'keydown');

        if (mod_chromeAltHack) {
            mod_chromeAltHack.applyHack(shortcuts);
        }
    }

    /* Sets up "browser action" shortcuts. That is ones that (generally) correspond to browser actions. This extension can
     be run in special mode  in which only this category of shortcuts is enabled (and this can be configured
     on a per website/webpage basis). This is helpful for pages like gmail, github, etc which often have good shortcuts
     implemented out of the box. Yet completely disabling the extension on such sites would lead to breaking of the user's
     "flow" when, for example, invoking sequentially invoking "left tab" to move through a bunch of tabs one of which had
     UnitsProj completely  disabled.
     As a general recommendation, single letter keys are not used for this category of shortcuts, because that seems to be
     the most common type of shortcuts implemented on web apps, and so would result in a higher possibility of conflict.
     */
    function _setupBrowserShortcuts() {

        // true is redundant here; used only to illustrate this form of the function call
        bind(browserShortcuts.scrollDown, scrollDown, true);
        bind(browserShortcuts.scrollUp, scrollUp);
        bind(browserShortcuts.closeTab, closeTab);

//    bind(['alt+y'], function() {console.log(' alt y');}); // this shouldn't be printed because there is a conflicting global shortcut defined in manifest.json
//    bind(['alt+q'], function() {console.log(' alt q');});
//    bind(['alt+4'], function() {console.log(' alt 4');});
//    bind(['alt+space+g'], function() {console.log(' alt space g');});
//    bind(['shift+q'], function() {console.log('shift q');});
//    bind(['q'], function() {console.log('q')});

        // we bind the handler for re-enabling elsewhere, because disableExtension() will invoke mod_keyboardLib.reset()
        bind(browserShortcuts.toggleExtension, disableExtension);
    }

// Sets up the general shortcuts, that is ones that don't depend on the current webpage. E.g: shortcuts for
// selecting next/prev CU, etc.
    function _setupGeneralShortcuts() {

        // true is redundant here; used only to illustrate this form of the function call
        bind(generalShortcuts.nextCU.kbdShortcuts, selectNext, true);

        bind(generalShortcuts.prevCU.kbdShortcuts, selectPrev);

        mod_filterCUs && bind(generalShortcuts.search.kbdShortcuts, mod_filterCUs.showSearchBox);

        bind(generalShortcuts.firstCU.kbdShortcuts, function(e) {
            selectCU(0, true);
        });

        bind(generalShortcuts.lastCU.kbdShortcuts, function(e) {
            selectCU($CUsArray.length - 1, true);
        });

        bind(generalShortcuts.showHelp.kbdShortcuts, showHelp);

        bind(generalShortcuts.open.kbdShortcuts, openActiveElement);

        bind(generalShortcuts.openInNewTab.kbdShortcuts, function() {
            openActiveElement(true); // open in new tab
        });
        bind(generalShortcuts.focusFirstTextInput.kbdShortcuts, focusFirstTextInput);
        bind(generalShortcuts.focusNextTextInput.kbdShortcuts, focusNextTextInput);
        bind(generalShortcuts.focusPrevTextInput.kbdShortcuts, focusPrevTextInput);

    }

    /**
     * Sets up the shortcuts specified. Can be used to setup either page-specific or CU-specific shortcuts depending on
     * whether the 'scope' passed is "page" or 'CUs'.
     * @param scope
     */
    function _setupUrlDataShortcuts(scope) {
        _setupMUsShortcuts(scope);
        _setupActionShortcuts(scope);
    }

    function _setupMUsShortcuts(scope) {
        var MUs;
        if (scope === 'CUs') {
            MUs = expandedUrlData.CUs_MUs;
        }
        else {
            MUs = expandedUrlData.page_MUs;
        }
        if (MUs) {
            for (var key in MUs) {
                var MU = MUs[key],
                    selectors = MU.selector,
                    kbdShortcuts = MU.kbdShortcuts;

                if (selectors && kbdShortcuts) {
                    bind(kbdShortcuts, _accessMU.bind(null, selectors, scope));
                }
            }
        }
    }

    function _setupActionShortcuts(scope) {
        var actions;
        if (scope === 'CUs') {
            actions = expandedUrlData.CUs_actions;
        }
        else {
            actions = expandedUrlData.page_actions;
        }
        if (actions) {
            for (var key in actions) {
                var action = actions[key],
                    fn = action.fn,
                    kbdShortcuts = action.kbdShortcuts;
                if (typeof fn === "function" && kbdShortcuts) {
                    bind(kbdShortcuts, _invokeAction.bind(null, fn, scope));
                }

            }
        }
    }
    function _invokeAction (fn, scope) {
        var $selectedCU = $CUsArray[selectedCUIndex];
        if (scope === 'CUs' && !$selectedCU) {
            return;
        }
        var urlDataDeepCopy =  $.extend(true, {}, expandedUrlData);
        fn($selectedCU, document, urlDataDeepCopy);
    }

    /**
     *
     * @param selectors
     * @param {string} scope Can be either "page" or 'CUs'
     */
    function _accessMU(selectors, scope) {
        var $scope;

        if (scope === 'CUs') {
            $scope =  $CUsArray[selectedCUIndex];
        }
        else  {
            $scope = $document;
        }
        if ($scope) {
            if (typeof selectors === 'string' ) {
                selectors = [selectors];
            }
            (function invokeSequentialClicks (selectorsArr) {
                if (selectorsArr.length) {
                    helper.executeWhenConditionMet(
                        function() {
                            // for some reason DOM API's click() works well, but jQuery's doesn't seem to always
                            $scope.find(selectorsArr[0])[0].click();
                            selectorsArr.splice(0, 1);
                            invokeSequentialClicks(selectorsArr);
                        },
                        function() {
                            return $scope.find(selectorsArr[0]).length;
                        },
                        2000
                    );
                }
            })(selectors);
        }
    }

    /**
     * Sets up the keyboard shortcuts.
     * Note: Because of the order in which shortcuts are set up, their priorities in case of a conflict are:
     * <browser-shortcuts> override <general-shortcuts> override <page-specific-shortcuts> override <CU-specific-shortcuts>
     * This order has been chosen since it favors consistency and hence minimizes confusion.
     */
    function setupShortcuts() {

        if (expandedUrlData) {
            _setupUrlDataShortcuts('CUs'); // shortcuts for CUs
            _setupUrlDataShortcuts('page'); // shortcuts for the rest of the page
        }
        _setupGeneralShortcuts();   // general shortcuts
        _setupBrowserShortcuts(); // browser action shortcuts
    }

    var onKeydown = function (e) {
        var code = e.which || e.keyCode,
            hasNonShiftModifier = e.altKey || e.ctrlKey|| e.metaKey,
            hasModifier = hasNonShiftModifier || e.shiftKey,
            $selectedCU = $CUsArray[selectedCUIndex],
            activeEl = document.activeElement || document.body;

        // On pressing TAB (or shift-tab):
        // If a CU is selected, and no element of the page has focus, focus the 'main' element of the CU.
        if (code === 9 && !hasNonShiftModifier) { // TAB
            if ($selectedCU && (activeEl === document.body))  {
                focusMainElement($selectedCU);
                suppressEvent(e);
            }
        }

        /* On pressing ESC:
         - When no CU is selected, blur the active element and select the "most sensible" CU
         - When a CU is selected
         - if an editable element is active (and hence single key shortcuts can't be used), blur the active element
         - else deselect the CU. (meaning that a selected CU will be deselected on at most a second 'Esc', if not
         the first)
         */
        else if (code === 27 && !hasModifier) { // ESC
            if (!$selectedCU) {
                activeEl.blur();
                var index = getEnclosingCUIndex(activeEl);
                if (index >= 0) {
                    selectCU(index, true, true);
                }
                else {
                    selectMostSensibleCU(true, true);
                }
            }
            else if (helper.isElementEditable(activeEl)) {
                activeEl.blur();
            }
            else {
                deselectCU();
                dehoverCU();
            }
        }
    };

// handler for whenever an element on the page receives focus
// (and thereby a handler for focus-change events)
    var onFocus = function(e) {
        //console.log('on focus called');
        var el = e.target, $el;
        elementToScroll = el; // update global variable used by scrollDown()/scrollUp()
//
//    if ( ($el = $(el)).data('enclosingCUJustSelected') ) {
//        $el.data('enclosingCUJustSelected', false);
//    }
//    else {
        var enclosingCUIndex = getEnclosingCUIndex(el);
        if (enclosingCUIndex >= 0 && enclosingCUIndex !== selectedCUIndex) {
            selectCU(enclosingCUIndex, false);
        }
//    }
    };

    var onMouseWheel = function (e) {
        // don't do this on macs for now. can make two finger scrolling problematic if the setting "tap to click"
        // is on. (because then, then a two finger tap becomes right click.)
        if (!isMac) {
            if (rtMouseBtnDown) {
                var wheelDirection = e.wheelDelta || e.wheelDeltaY || (-e.detail); // -ve will indicate down, +ve up
                if (wheelDirection) {

                    e.preventDefault();
                    scrolledWithRtMouseBtn = true;

                    if (wheelDirection < 0) {
                        selectNext();
                    }
                    else  {
                        selectPrev();
                    }
                }
            }
        }
    };

    var onLtMouseBtnDown = function(e) {
        // first update the following global variables
        ltMouseBtnDown = true;
        elementToScroll = e.target;

        var point = {x: e.pageX, y: e.pageY},
            $selectedCU = $CUsArray[selectedCUIndex],
            $overlaySelected = $selectedCU && $selectedCU.data('$overlay'),
            $hoveredCU = $CUsArray[hoveredCUIndex],
            $overlayHovered = $hoveredCU && $hoveredCU.data('$overlay'),
            indexToSelect;

        if ($overlaySelected && elementContainsPoint($overlaySelected, point)) {
            return;  // do nothing
        }
        else  if ($overlayHovered && elementContainsPoint($overlayHovered, point)) {
            indexToSelect = hoveredCUIndex;
        }
        else {
            indexToSelect = getEnclosingCUIndex(e.target);
        }

        if (indexToSelect >= 0) {
            selectCU(indexToSelect, false, false);
            var activeEl = document.activeElement,
                indexOf_CUContainingActiveEl = getEnclosingCUIndex(activeEl);

            if (indexOf_CUContainingActiveEl !== selectedCUIndex) {
                activeEl.blur();
            }
        }
        else {
            deselectCU(); // since the user clicked at a point not lying inside any CU, deselect any selected CU
        }

    };

    function onRtMouseBtnDown(e) {
        rtMouseBtnDown = true;
    }

    function onContextMenu(e) {

        if (scrolledWithRtMouseBtn) {
            e.preventDefault();
        }
    }

    function onMouseDown (e) {

        if (isRtMouseButton(e)) {
            return onRtMouseBtnDown(e);
        }
        else {
            return onLtMouseBtnDown(e)
        }

    }

    function onMouseUp(e) {

        if (isRtMouseButton(e)) {

            rtMouseBtnDown = false;

            setTimeout(function() {
                // use a small timeout so that we don't change value before onContextMenu runs
                scrolledWithRtMouseBtn = false;
            },100);
        }
        else {
            ltMouseBtnDown = false;
        }

    }

// function to be called once the user "intends" to hover over an element
    var onMouseOverIntent = function(e) {

        var point = {x: e.pageX, y: e.pageY};

        var $overlayHovered;
        if ($CUsArray[hoveredCUIndex] &&
            ($overlayHovered = $CUsArray[hoveredCUIndex].data('$overlay')) &&
            (elementContainsPoint($overlayHovered, point))) {

            return ; // CU already has hovered overlay; don't need to do anything

        }

        var CUIndex = getEnclosingCUIndex(e.target);

        if (CUIndex >= 0) {

            hoverCU(CUIndex);
        }

    };

    var onMouseOver = function(e) {

        elementToScroll = e.target; // update global variable used by scrollDown()/scrollUp()
        var timeout_applyHoveredOverlay = setTimeout(onMouseOverIntent.bind(null, e), 150);
        $(e.target).data({timeout_applyHoveredOverlay: timeout_applyHoveredOverlay});
//    onMouseOverIntent(e);

    };

    var onMouseOut = function(e) {

        //clear any timeout set in onMouseOver
        var timeout_applyHoveredOverlay = $(e.target).data('timeout_applyHoveredOverlay');
        clearTimeout(timeout_applyHoveredOverlay);

        // upon any mouseout event, if a hovered overlay exists and the mouse pointer is found not be
        // contained within it, dehover it (set it as dehovered).
        var $overlayHovered;
        if ($CUsArray[hoveredCUIndex] &&
            ($overlayHovered = $CUsArray[hoveredCUIndex].data('$overlay')) &&
            (!elementContainsPoint($overlayHovered, {x: e.pageX, y: e.pageY}))) {

            dehoverCU();

        }

    };

    var onWindowResize = function() {

        dehoverCU();

        if (selectedCUIndex >= 0) {
            selectCU(selectedCUIndex, false, false, {onDomChangeOrWindowResize: true}); // to redraw the overlay
        }
    };


    var onTransitionEnd = function(e) {

        var $overlay = $(e.target);

//  console.log('overlay transition ended. total overlays = ', $('.' + class_CUOverlay).length);
        tryRecycleOverlay($overlay);

    };

    /**
     * Checks if the overlay element specified (as jQuery wrapper) is no longer in
     * use, and if so, marks it as available for future reuse.
     * @param $overlay
     */
    var tryRecycleOverlay = function($overlay) {

        if (!$overlay.hasClass(class_CUOverlay)) {
            console.warn("UnitsProj: Unexpected - $overlay doesn't have class '" + class_CUOverlay + "'");
        }

        // check if the overlay is both in deselected and dehovered states
        if (!$overlay.hasClass(class_CUHoveredOverlay) && !$overlay.hasClass(class_CUSelectedOverlay)) {

            $overlay.hide();
            var $CU = $overlay.data('$CU');

            if ($CU) {
                $CU.data('$overlay', null);
            }
            else {
                console.warn("UnitsProj: Unexpected - overlay's associated CU NOT found!");
            }

            $overlay.data('$CU', null);

            $unusedOverlaysArray.push($overlay);

        }
    };

    function setupBasicUIComponents() {
        $topLevelContainer.appendTo(document.body);

        $scrollingMarker = $('<div></div>')
            .addClass(class_scrollingMarker)
            .addClass(class_addedByUnitsProj)
            .hide()
            .appendTo($topLevelContainer);

        mod_filterCUs && mod_filterCUs.setup();
    }

    function setupExternalSearchEvents() {

        var keyHandler = function(e) {
            var selection;

            // If a kew is pressed while the left-mouse button is pressed down and some text is selected
            if (ltMouseBtnDown && (selection = document.getSelection().toString())) {

                if (e.type === 'keydown') {
                    var code = e.which || e.keyCode;

                    // the background script will determine which site to search on based
                    chrome.runtime.sendMessage({message: "searchExternalSite", selection: selection, keyCode: code});
                }

                suppressEvent(e); // for all types - keypress, keydown, keyup
            }
        };

        addEventListener2(document, 'keydown', keyHandler, true);
        addEventListener2(document, 'keypress', keyHandler, true);
        addEventListener2(document, 'keyup', keyHandler, true);

    }

    function onDomReady() {

        // if settings have been obtained from background script before dom ready takes place
        if (miscGlobalSettings && miscGlobalSettings.selectCUOnLoad) {

            selectMostSensibleCU(true, false);
        }
    }

    // reset state and disable the extension
    function disableExtension() {

        dehoverCU();
        deselectCU();
        $CUsArray = [];
        $topLevelContainer.empty().remove();
        $lastSelectedCU = null;

        removeAllEventListeners();

        if (mod_chromeAltHack) {
            mod_chromeAltHack.undoAndDisableHack();
        }

        if (browserShortcuts) {  // need this check since since the obj wouldn't be defined the first time
            bind(browserShortcuts.toggleExtension, initializeExtension);
        }

    }

// (reset and re-)initialize the extension.
    function initializeExtension() {

        console.log('UnitsProj initialized');
        disableExtension(); // resets the state

        chrome.runtime.sendMessage({
                message: "getSettings",
                locationObj: window.location
            },
            function(settings) {

                // assign references to module level variables
                miscGlobalSettings = settings.miscGlobalSettings;
                browserShortcuts = settings.browserShortcuts;
                generalShortcuts = settings.generalShortcuts;
                expandedUrlData = settings.expandedUrlData;

                if (settings.disabledStatus === "full") {
                    // TODO: separate this stuff from CUsMgr
                    thisModule.stopListening(mod_mutationObserver, 'dom-mutations-grouped'); // we continue to listen to the 'url-change' event

                    return;
                }
                else if (settings.disabledStatus === "partial") {
                    // TODO: separate this stuff from CUsMgr
                    thisModule.stopListening(mod_mutationObserver, 'dom-mutations-grouped'); // we continue to listen to the 'url-change' event
                    _setupBrowserShortcuts(); // check if it's okay to call this directly (since it starts with an "_")
                    return;
                }

                // has to be done before the the call to makeImmutable :)
                if (settings.expandedUrlData) {
                    helper.destringifyFunctions(settings.expandedUrlData);
                }

                helper.makeImmutable(settings);

                setupBasicUIComponents(); // also set up their associated event handlers

                // this should be done  before binding any keydown/keypress/keyup events so that these event handlers get
                // preference (i.e. [left-mouse-button+<key>] should get preference over <key>)
                setupExternalSearchEvents();

                addEventListener2(document, 'keydown', onKeydown, true);
                addEventListener2(document, 'mousedown', onMouseDown, true);
                addEventListener2(document, 'mouseup', onMouseUp, true);
                addEventListener2(document, 'mouseover', onMouseOver, true);
                addEventListener2(document, 'mouseout', onMouseOut, true);
                addEventListener2(document, 'contextmenu', onContextMenu, true);
                addEventListener2(document, 'DOMMouseScroll', onMouseWheel, false); // for gecko
                addEventListener2(document, 'mousewheel', onMouseWheel, false);   // for webkit

                // Specifying 'focus' as the event name below doesn't work if a filtering selector is not specified
                // However, 'focusin' behaves as expected in either case.
                $document.on('focusin', CONSTS.focusablesSelector, onFocus);
                $(window).on('resize', onWindowResize);

                if (overlayCssHasTransition) {
                    $document.on('transitionend transitionEnd webkittransitionend webkitTransitionEnd otransitionend oTransitionEnd',
                        '.' + class_CUOverlay, onTransitionEnd);
                }

                mod_mutationObserver.start();

                // the following line should remain outside the if condition so that the change from a url with CUs
                // to one without any is correctly handled
                updateCUsAndRelatedState();
                setupShortcuts();
                setupHelpUIAndEvents();

                if ( miscGlobalSettings.selectCUOnLoad) {
                    selectMostSensibleCU(true, false);
                }
            }
        );
    }

// don't need to wait till dom-ready. allows faster starting up of the extension's features
// (in certain sites at least. e.g. guardian.co.uk)
// this should not cause any issues since we are handling dom changes anyway.
    (function initializeStateAndSetupEvents (){

        // we need the body to exist before we can set overlayCssHasTransition
        if (!document.body) {
            setTimeout(initializeStateAndSetupEvents, 100);
            return;
        }

        $topLevelContainer.appendTo(document.body);

        // This is required to be initialized before setting up at least one of the event handlers subsequently set up
        overlayCssHasTransition = checkOverlayCssHasTransition();

        $(onDomReady);

        initializeExtension();

    })();


//////////////////////////////////////////
    //help.js


    function setupHelpUIAndEvents() {
        setupHelpUI();

        var onEscapeKeyDownOnHelp = function(e) {
            var code = e.which || e.keyCode;
            if (code === 27) { // ESc
                if ($helpContainer.is(':visible')) {
                    hideHelp();
                    suppressEvent(e);
                }
            }

        };

        document.addEventListener('keydown', onEscapeKeyDownOnHelp, true);

    }

    function setupHelpUI() {

        var $heading = $("<div id='heading'><span>UnitsProj Shortcuts</span></div>");

        var pageShortcuts = expandedUrlData && expandedUrlData.page_shortcuts;
        var CUShortcuts = expandedUrlData && expandedUrlData.CU_shortcuts;

        var $pageShortcutsSection = $("<div></div>");
        var $CUShortcutsSection = $("<div></div>");
        var $generalShortcutsSection = $("<div></div>");

        if (pageShortcuts) {
            var $pageShortcutsTable = $("<table></table>").appendTo($pageShortcutsSection);
            $.each(pageShortcuts, function(key, value) {
                $("<tr></tr>")
                    .appendTo($pageShortcutsTable)
                    .append($("<td></td>").text(value.keys.toString()))
                    .append($("<td></td>").text(key));

            });
        }

        if (CUShortcuts) {
            var $CUShortcutsTable = $("<table></table>").appendTo($CUShortcutsSection);
            $.each(CUShortcuts, function(key, value) {
                $("<tr></tr>")
                    .appendTo($CUShortcutsTable)
                    .append($("<td></td>").text(value.keys.toString().replace(",", ", ")))
                    .append($("<td></td>").text(key));

            });
        }
        if (generalShortcuts) {
            var $generalShortcutsTable = $("<table></table>").appendTo($generalShortcutsSection);
            $.each(generalShortcuts, function(key, value) {
                $("<tr></tr>")
                    .appendTo($generalShortcutsTable)
                    .append($("<td></td>").text(value.toString().replace(",", ",  ")))
                    .append($("<td></td>").text(key));
            });
        }

        $helpContainer = $('<div id = "UnitsProj-help-container">')
            .addClass(class_addedByUnitsProj)
            .hide()
            .appendTo($topLevelContainer)
            .append($heading)
            .append($pageShortcutsSection)
            .append($CUShortcutsSection)
            .append($generalShortcutsSection);

    }

    function showHelp() {
        $helpContainer.show();
    }

    function hideHelp() {
        $helpContainer.hide();

    }

///////////////////////////////////////////
//helper.js


    /**
     * Returns true if all (top most) constituents of $CU have css 'visibility' style equal to "hidden"
     * @param $CU
     * @return {Boolean}
     */
    function isCUInvisible($CU) {

        for (var i = 0; i < $CU.length; ++i) {
            if ($CU.eq(i).css('visibility') !== "hidden") {
                return false;
            }
        }
        return true;
    }

// returns true if any part of $CU is in the viewport, false otherwise
    function isCUInViewport($CU) {

        // for the CU
        var boundingRect = getBoundingRectangle($CU),
            CUTop = boundingRect.top,
            CUHeight = boundingRect.height,
            CUBottom = CUTop + CUHeight;

        var // for the window:
            winTop = $document.scrollTop(),
        // winHeight = $(window).height(), // this doesn't seem to work correctly on news.ycombinator.com
            winHeight = window.innerHeight,
            winBottom = winTop + winHeight;


        return ( (CUTop > winTop && CUTop < winBottom) ||
            (CUBottom > winTop && CUBottom < winBottom) );
    }

    function changeFontSize($jQuerySet, isBeingIncreased) {
        if (!$jQuerySet || !$jQuerySet.length) {
            return;
        }

        for (var i = 0; i < $jQuerySet.length; i++) {
            var $el = $jQuerySet.eq(i);
            var font = $el.css('font-size');
            var numericVal = parseFloat(font);
            var CU = font.substring(numericVal.toString().length);

            var newNumericVal = isBeingIncreased?(numericVal+2): (numericVal-2);
            $el.css('font-size', newNumericVal+CU);

        }
    }
    function increaseFont($jQuerySet) {
        changeFontSize($jQuerySet, true);
    }

    function decreaseFont($jQuerySet) {
        changeFontSize($jQuerySet, false);
    }


    function checkOverlayCssHasTransition() {

        // create a short-lived element which is inserted into the DOM to allow determination of CSS transition property
        // on overlay elements, and then quickly removed.
        var $tempOverlay = $('<div></div>')
            .addClass(class_addedByUnitsProj)
            .addClass(class_CUOverlay)
            .hide()
            .appendTo(document.body);
        var properties = ['transition-duration', '-webkit-transition-duration', '-moz-transition-duration',
            '-o-transition-duration'];

        var transitionDuration;
        for (var property, i = 0; property = properties[i++]; ) {
            transitionDuration = $tempOverlay.css(property);
            if (transitionDuration !== null) {
                break;
            }
        }

        $tempOverlay.remove();

        transitionDuration = parseFloat(transitionDuration); // to get 0.3 from 0.3s etc

        // check if transitionDuration exists and has a non-zero value, while tolerating
        // precision errors with float (which should not occur for 0, but just in case)
        if (transitionDuration && transitionDuration > 0.00000001) {
            return true;
        }
        else {
            return false;
        }

    }

    //////////////////////////////////////////////
    // selectFocusables.js

    document.addEventListener('keydown', onKeydown_selectFocusable, true);

// to be used in conjunction with space. currently.
    function onKeydown_selectFocusable (e) {

        var code = e.which || e.keycode;

        if (mod_keyboardLib.isSpaceDown() && code !== 32 && code !== 16) { // 32 is space, 16 shift

            if (code === 190) { // code for '.'
                selectFocusable(e.shiftKey? "prev": "next", null);
            }
            else {
                var key = String.fromCharCode(code).toLowerCase();
                selectFocusable(e.shiftKey? "prev": "next", key);
            }

            suppressEvent(e);
        }

    }

// Focuses next/prev focusable beginning with the specified char. If beginningChar is not specified/null, it selects
// the next/prev focusable WITHOUT any text (useful for cycling through non-textual links, buttons etc)
// If a CU is selected, this is applies only within it, else on the whole page
    function selectFocusable(nextOrPrev, beginningChar) {

        var $selectedCU = $CUsArray[selectedCUIndex];
        var $scope =  $selectedCU || $document;


        var elementMatches = function(element) {
            var text = $(element).text();
            if (!text && $(element).is('input[type = "button"]')) {
                text = element.value;
            }
            if (beginningChar) {
                if (text && text[0].toLowerCase() === beginningChar) {
                    return true;
                }
            }
            else {
                return !text;
            }
        };


        var $matchedFocusables = $scope.find(CONSTS.focusablesSelector).filter(function() {
            return elementMatches(this);
        });

        console.log('matched focusables: ', $matchedFocusables);

        if ($matchedFocusables && $matchedFocusables.length) {

            var focusedElementInScope, // will refer to currently focused element in $scope, if any

                activeEl = document.activeElement;

            //if scope is the currently selected CU and the active element lies within it
            if ( ($scope === $selectedCU && getEnclosingCUIndex(activeEl) === selectedCUIndex) ||
                ($scope === $document)) {

                focusedElementInScope = activeEl;
            }

            if (elementMatches (focusedElementInScope)) {

                var index = ((nextOrPrev === "prev")? -1: 1) + $matchedFocusables.index(focusedElementInScope);

                console.log("$matchedFocusables.index(focusedElementInScope): ", $matchedFocusables.index(focusedElementInScope));

                console.log("index: ", index);

                console.log("$matchedFocusables.length: ", $matchedFocusables.length);

                if (index >=  $matchedFocusables.length) {
                    index = 0;
                }
                else  if (index <  0) {
                    index = $matchedFocusables.length-1;
                }
                $matchedFocusables[index].focus();
            }
            else {
                $matchedFocusables[0].focus();
            }


        }


    }
/////////////////////////////////////////////////

    return thisModule;

})(jQuery, _u.mod_core, _u.mod_mutationObserver, _u.mod_keyboardLib, _u.mod_filterCUs,
        _u.mod_chromeAltHack, _u.helper, _u.CONSTS);


