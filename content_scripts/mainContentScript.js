/* NOTES
1)  A 'Container Unit' is set of DOM elements that together consitute an logical unit of attention/navigation/access. 
    The set of all the important container units on the page is called CUs. Each CU consists of one or more DOM elements.

2)  Elements that can receive focus on the current page are called the "focusables"

3)  In the comments, including JSDoc snippets, the term "JQuery *set*" is used to mean a JQuery
    object that can contain *one or more* DOM elements; the term "JQuery *wrapper*" is used to
    denote one which is expected be a JQuery wrapper on a *single* DOM node.

4) jquery dependencies (for if jquery needs replacing/removing)
 1. event handlers
 2. e.which
 3. selectors
 4. offset(), outerWidth(),  etc
 5. prev(), next()
 6. find(), filter(), is()
 7. data()
 8. isArray()
 9. slideDown/Up
 10. extend()
 11. animate()
 12. Line in url-data-map.js: "Anywhere a selector is specified, the extended set of jQuery selectors can be used as
  well.". This feature is probably used pin google last year shortcut.

 */

/* TODOs:

- on quora etc, clicking an a CU scrolls suddenly

- exclude images from rect if affecting both dimensions (including single child ancestors)
- on stackoverflow / questions page: clicking a CU, messes with
 text selection etc in some weird way. doesn't happen every time.

- add padding to the overlay(s) (see wikipedia pages for why)

- handle url changes
- margin near the bottom after scrolling
- override scroll animation when cycling from last to first or first to last
- quora: click doesnt focus
- stackoverflow: clicking doesn't focus main element/etc
- exclude display:none when populating $CUs

- implement exclude

- animate hovering/unhovering and selection/unselection

check where all deselectCU() is being called, and if that needs any modifying/placing a check around the call

remove prevALL etc if not using

*/

var currentUrl = window.location.href,
    urlData,    // Data that identifies elements and  CU and specifies shortcuts and other information for the
                        // current url. This is updated whenever the current url changes.

    $CUsArray = [], /* An array of jQuery sets. The array represents the *sequence* of CUs on the current page.
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

    /* This class should be applied to all elements added by this extension. This is used to distinguish DOM mutation
    events caused by them from the those of the page's own elements. This is also a "responsible" thing since it marks
    out clearly elements added by this code to the DOM (for anyone looking at DOM, page source etc) */
    class_addedByUnitsProjExtn = 'added-by-UnitsProj',

    /* This is used as a container for all elements created by this program that we add to the DOM (technically, this 
    applies only to elements that are outside the render flow of the page. As of 31 Dec 2012 these include all elements
    added by this extension).
    This allows keeping modifications to the DOM localized inside a single element. */
    $topLevelContainer = $('<div></div>').addClass(class_addedByUnitsProjExtn),

    class_overlay = "CU-overlay",                     // class applied to all CU overlays
    class_overlaySelected = "CU-overlay-selected",    // class applied to overlay on a selected CU
    class_overlayHovered = "CU-overlay-hovered",      // class applied to overlay on a hovered CU
    $unusedOverlaysArray = [],   // to enable reusing existing unused overlays

    // boolean, holds a value indicating where the css specifies a transition style for overlays
    overlayCssHasTransition,

    $document = $(document), // cached jQuery object

    elementToScroll,
    
    rtMouseBtnDown,         // boolean holding the state of the right mouse button
    ltMouseBtnDown,         // boolean holding the state of the left mouse button
    scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

    class_scrollingMarker = 'CU-scrolling-marker',
    $scrollingMarker,

    $searchContainer,
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

    // A selector for all elements that can receive the keyboard focus. Based on http://stackoverflow.com/a/7668761,
    // with the addition that a :visible has been added in each selector, instead of using a .filter(':visible')
    focusablesSelector = 'a[href]:visible, area[href]:visible, input:not([disabled]):visible, select:not([disabled]):visible, textarea:not([disabled]):visible, button:not([disabled]):visible, iframe:visible, object:visible, embed:visible, *[tabindex]:visible, *[contenteditable]',

    // this is used to check if the "chrome alt hack" needs to be applied (refer: chromeAltHack.js)
    chromeAltHackNeeded = navigator.userAgent.toLowerCase().indexOf('chrome') > -1,

    isMac = navigator.appVersion.indexOf("Mac")!=-1, // since macs have different key layouts/behaviors

    mutationObserver,
    // TODO2: tweak further to prevent triggering mutation changes for unneeded dom changes when possible
    mutationObserverConfig = {
        childList: true,
        subtree: true,
        attributes:true,
        attributeFilter: chromeAltHackNeeded? ['style', 'accesskey']: ['style'], // 'accesskey' used for "chrome alt hack"
        attributeOldValue: true
    },

    // Specifies options used by the program. Functions that use this object might also accept a 'options' object as
    // argument. In addition to providing additional options for the function, the 'options' argument can also be
    // to override any properties of the 'globalSettings' object (for that specific invocation) by providing different
    // values for those properties.
    globalSettings = {

        selectCUOnLoad: true, // whether the first CU should be selected when the page loads
        animatedCUScroll: true,
        animatedCUScroll_Speed: 2, // pixels per millisecond
        animatedCUScroll_MaxDuration: 300, // milliseconds

        increaseFontInSelectedCU: false,

        // determines if while scrolling a CU should always be centered (whenever possitble) or only if it lies
        // outside the view port
        tryCenteringCUOnEachScroll: false,

        // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
        sameCUScroll: true,

        pageScrollDelta: 100 // pixels to scroll on each key press

    },

    addEventListener_eventHandlers = [],
    jQueryOn_eventHandlers = [];




// returns a jQuery set composed of all focusable DOM elements contained in the
// jQuery set ($CU) passed
var $getContainedFocusables = function($CU) {

    var $allElements = $CU.find('*').addBack();
    var $containedFocusables = $allElements.filter(focusablesSelector);
    return $containedFocusables;

};

/**
 * Returns the "main" element in the specified CU, which is determined as follows:
 * 1) Return the first "focusable" element within $CU which matches the selector specified in any of these
 * properties in the urlData.CUs object (checked in order): 'main', 'buildCUAround', 'first'
 * 2) If no such element is found, return the first focusable element contained in $CU, if one can be found
 *
 * @param $CU
 * @return {DOM element} Returns the "main" element, if one was found, else null.
 */
var getMainElement = function($CU) {

    if (!$CU || !$CU.length) {
        return null;
    }

    var $containedFocusables = $getContainedFocusables($CU),
        CUSpecifier = urlData.CUs.specifier;

    if (!$containedFocusables.length) {
        return null;
    }

    var mainSelector,
        $filteredFocusables,
    // we look for these keys in CUsData, in order
        focusableSelectorKeys = ['main', 'buildCUAround', 'first'];

    for (var i = 0, focusableSelectorKey; i < focusableSelectorKeys.length; ++i) {
        focusableSelectorKey = focusableSelectorKeys[i];
        if ((mainSelector = CUSpecifier[focusableSelectorKey]) &&
            ($filteredFocusables = $containedFocusables.filter(mainSelector)) &&
            $filteredFocusables.length) {

            return $filteredFocusables[0];

        }
    }

    // if not returned yet,
    return $containedFocusables[0];
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
 * @param {object} options
 */
var selectCU = function(CUOrItsIndex, setFocus, adjustScrolling, options) {
    console.log('selectCU() called');
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

    options = $.extend(true, {}, globalSettings, options);

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
            mutationObserver.disconnect();
            increaseFont($CU);
            mutationObserver.observe(document, mutationObserverConfig);
            $CU.data('fontIncreasedOnSelection', true);
        }

        if (urlData.fn_onCUSelection) {
            mutationObserver.disconnect();
            urlData.fn_onCUSelection($CUsArray[selectedCUIndex], document);
            mutationObserver.observe(document, mutationObserverConfig);

        }
    }
};

/**
 * Deselects the currently selected CU, if there is one
 */
var deselectCU = function (options) {

    var $CU;
    if (!!($CU = $CUsArray[selectedCUIndex])) {

        // console.log('deselecting CU...');
        removeOverlay($CU, 'selected');

        if (!options || !options.onDomChangeOrWindowResize) {
            lastSelectedCUTime = new Date();

            if ($CU.data('fontIncreasedOnSelection')) {
                mutationObserver.disconnect();
                decreaseFont($CU);
                mutationObserver.observe(document, mutationObserverConfig);
                $CU.data('fontIncreasedOnSelection', false);
            }

            if (urlData.fn_onCUDeselection) {
                mutationObserver.disconnect();
                urlData.fn_onCUDeselection($CU, document);
                mutationObserver.observe(document, mutationObserverConfig);
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
        $overlay.removeClass(type === 'selected'? class_overlaySelected: class_overlayHovered);

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
            $overlay = $('<div></div>').addClass(class_overlay).addClass(class_addedByUnitsProjExtn);
        }
    }

    var CUsData = urlData.CUs,
        CUStyleData = CUsData.style,
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
        $overlay.addClass(class_overlaySelected);
//        $overlay.css('box-shadow', '2px 2px 20px 0px #999');

    }
    else { // 'hovered'
        $overlay.addClass(class_overlayHovered);
//        $overlay.css('box-shadow', '1px 1px 10px 0px #bbb');
    }

    $overlay.appendTo($topLevelContainer);

    return $overlay;

};


// Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
function ensureTopLevelContainerIsInDom() {
    if (!document.body.contains($topLevelContainer[0])) {
//        console.log('appending $topLevelContainer to body');
        $topLevelContainer.appendTo(document.body);

    }
}

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
 * @param {object} options
 * @return {Boolean} value indicating whether scroll took place
 */
function scrollSelectedCUIfRequired (direction, options) {

    options = $.extend(true, {}, globalSettings, options);

    var $CU = $CUsArray[selectedCUIndex];

    var pageHeaderHeight = getEffectiveHeaderHeight();

    var // for the window:
        winTop = $document.scrollTop(),
        winHeight = $(window).height(),
        winBottom = winTop + winHeight,

    // for the CU:
        CUTop = $CU.offset().top,
        CUHeight = $CU.height(),
        CUBottom = CUTop + CUHeight;

    var newWinTop, // new value of scrollTop
        sameCUScrollOverlap = 40,
        margin = 30;

    direction = direction.toLowerCase();
    if ( (direction === 'up' && CUTop < winTop + pageHeaderHeight) ||
        (direction === 'down' && CUBottom > winBottom) ) {
        if (direction === 'up' ) { // implies CUTop < winTop + pageHeaderHeight
            newWinTop = winTop - winHeight + sameCUScrollOverlap;

            // if newWinTop calculated would scroll the CU more than required for it to get completely in the view,
            // increase it to the max value required to show the entire CU with some margin left.
            if (newWinTop + pageHeaderHeight < CUTop) {
                newWinTop = CUTop - pageHeaderHeight - margin;
            }

            if (newWinTop < 0) {
                newWinTop = 0;
            }
        }

        else  { //direction === 'down' && CUBottom > winBottom
            
            newWinTop = winBottom - sameCUScrollOverlap;

            // if newWinTop calculated would scroll the CU more than required for it to get completely in the view,
            // reduce it to the min value required to show the entire CU with some margin left.
            if (newWinTop + winHeight > CUBottom) {
                newWinTop = CUBottom - winHeight + margin;
            }

            // ensure value is not more then the max possible
            if (newWinTop > $document.height() - winHeight) {
                newWinTop = $document.height() - winHeight;
            }

            showScrollingMarker($CU.offset().left, winBottom - sameCUScrollOverlap, sameCUScrollOverlap);
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

    var options;

    // to handle quick repeated invocations...
    if (animationInProgress) {
        stopExistingScrollAnimation = true;
        return;
    }
    else {
        stopExistingScrollAnimation = false;
    }
   
    options = $.extend(true, {}, globalSettings, options);

    $scrollingMarker.hide();

    var newIndex;

    if (selectedCUIndex >=0 && (isCUInViewport($CUsArray[selectedCUIndex]) ||
        new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {
        if (options.sameCUScroll) {
             var scrolled = scrollSelectedCUIfRequired('up', options);
            if (scrolled) {
                return;
            }
            else if (selectedCUIndex === 0) { // special case for first CU
                scrollUp();
            }
        }

        newIndex = selectedCUIndex - 1;
        if (newIndex >= 0) {
            selectCU(newIndex, true, true, options);
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

    var options;

    // to handle quick repeated invocations...
    if (animationInProgress) {
        stopExistingScrollAnimation = true;
        return;
    }
    else {
        stopExistingScrollAnimation = false;
    }

    options = $.extend(true, {}, globalSettings, options);

    $scrollingMarker.hide();

    var newIndex;

    if (selectedCUIndex >=0 && (isCUInViewport($CUsArray[selectedCUIndex]) ||
        new Date() - lastSelectedCUTime < selectionTimeoutPeriod)) {

        if (options.sameCUScroll) {
            var scrolled = scrollSelectedCUIfRequired('down', options);
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

    var CUsData = urlData.CUs,
        CUStyleData = CUsData.style,
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
            $el = $(el);    
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
        intervalPeriod = Math.min(100, globalSettings.animatedCUScroll_MaxDuration/4),

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
 * @param {object} options
 */
function scrollIntoView($element, options) {

    $element = $($element);
    if (!$element || !$element.length) {
        return;
    }

    options = $.extend(true, {}, globalSettings, options);

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

var timeout_domChanges,
    groupingInterval_for_DomMutations = 200; // millisecs
// this function ensures that a set of closely spaced DOM mutation events triggers only one (slightly expensive)
// getCUsArray() call, as long each pair of successive events in this set is separated by less than
// 'groupingInterval_for_DomMutations' millisecs.
var onDomChange = function(mutations) {

    clearTimeout(timeout_domChanges);
    timeout_domChanges = setTimeout(_onDomChange, groupingInterval_for_DomMutations);

    // This is invoked on each DOM change because in principle the JS code can replace the body element with a new one
    // at run time, and so the current body may no longer contain $topLevelContainer even if it was inserted into the
    // body earlier.
    ensureTopLevelContainerIsInDom(); // inexpensive, hence can be invoked here instead of within _onDomChange

    if (chromeAltHackNeeded) {
        var mutationsLen = mutations.length,
            mutationRecord,
            addedNodes;
        for (var i = 0; i < mutationsLen; ++i) {
            mutationRecord = mutations[i];

            if ((addedNodes = mutationRecord.addedNodes)) {

                var addedNodesLen = addedNodes.length,
                    node;
                for (var j = 0; j < addedNodesLen; ++j) {
                    node = addedNodes[j];
                    if (node.nodeType === document.ELEMENT_NODE) {
                        removeConflictingAccessKeys(node);
                    }
                }
            }

            if (mutationRecord.attributeName && mutationRecord.attributeName.toLowerCase() === 'accesskey') {
                removeConflictingAccessKeys(mutationRecord.target);
            }
        }
    }
};

function _onDomChange() {

    //TODO: check if url changed here, and call onUrlChange()
    var newUrl = window.location.href;
    if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        // We need this because the URL might change without the page (and this extension) being reloaded in
        // a single page app or similar.
        onUrlChange();
    }
    else {
        updateCUsAndRelatedState();
    }
}

function onUrlChange() {
    initializeExtension(); // resets the extension
}

// Sets/updates the global variable $CUsArray and other state associated with it
function updateCUsAndRelatedState() {

    // Save the currently selected CU, to reselect it, if it is still present in the $CUsArray after the array is
    // updated. This needs to be done before calling deselectCU() and modifying the current $CUsArray
    var $prevSelectedCU = $CUsArray && $CUsArray[selectedCUIndex];
    dehoverCU(); // to prevent a "ghost" hover overlay
    deselectCU({onDomChangeOrWindowResize: true});
    $CUsArray = getCUsArray();

    if ($CUsArray && $CUsArray.length) {
        if (parseInt($searchContainer.css('top'), 10) >= 0) { // if search box is visible
//    if ($searchContainer.offset().top >= 0) { // if search box is visible
            filterCUsArray($CUsArray);
        }

        if (globalSettings.selectCUOnLoad && !selectCU.invokedYet) {
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

// Populates the CUs array based on the current contents of the DOM and returns it.
// If search box is visibile, the returned CUs array is filtered accordingly.
var getCUsArray = function() {

    if (!urlData || !urlData.CUs) {
        // returning an empty array instead of null means accessing $CUsArray[selectedCUIndex] (which
        // is done a lot) doesn't need to be prepended with a check against null in each case.
        return [];
    }

    var $CUsArr,   // this will be hold the array to return
        CUsData = urlData.CUs,
        selector,
        CUsSpecifier = CUsData.specifier;

    if (typeof (selector = CUsData) === "string" ||
        typeof (selector = CUsData.specifier) === "string" ||
        typeof (selector = CUsData.specifier.selector) === "string" ) {
        $CUsArr = $.map($(selector).get(), function(item, i) {
            return $(item);
        });
    }

    else if (typeof CUsSpecifier.first === "string" && typeof CUsSpecifier.last === "string" ) {
        $CUsArr = [];
        var $firstsArray = $.map($(CUsSpecifier.first).get(), function(item, i) {
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
                $_last = $_first.nextALL(CUsSpecifier.last).first();

                $closestCommonAncestor = $_first.parents().has($_last).first();

                $first = $closestCommonAncestor.children().filter(filterFirst);
                $last = $closestCommonAncestor.children().filter(filterLast);
                $CUsArr[i] = $first.add($first.nextUntil($last)).add($last);
            }
        }
    }

    else if (typeof CUsSpecifier.buildCUAround === "string"){

        $CUsArr = [];
        var currentGroupingIndex = 0;

        var $container = closestCommonAncestor($(CUsSpecifier.buildCUAround));
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

            var centralElementselector = CUsSpecifier.buildCUAround;
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
        if ( (!$CU.is(':visible') && !$CU.hasClass('hiddenByCUsExtn')) || isCUInvisible($CU)) {
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
 * returns an array containing ancestor elements in document order
 * @param element
 * @return {Array of DOM elements}
 */
var ancestorElements = function(element, blah) {
    var ancestors = [];
    for (; element; element = element.parentElement) {
        ancestors.unshift(element);
    }
    return ancestors;
};

/** returns that DOM element which is the closest common ancestor of the elements specified,
 * or null if no common ancestor exists.
 * @param {Array of DOM Elements | jQuery wrapper} elements
 * @return {DOM Element}
 */
var closestCommonAncestor = function(elements) {

    if(!elements || !elements.length) {
        return null;
    }

    if (elements.length ===1) {
        return elements[0];
    }

    // each element of this array will be an array containing the ancestors (in document order, i.e. topmost first) of
    // the element at the corresponding index in 'elements'
    var ancestorsArray = [],
        elementsLen = elements.length,
        ancestorsArrLen;

    for (var i = 0; i < elementsLen; ++i ) {
        ancestorsArray[i] = ancestorElements(elements[i]);
    }
    
    var isAncestorAtSpecifiedIndexCommon = function(index) {

        var referenceAncestor = ancestorsArray[0][index];

        ancestorsArrLen = ancestorsArray.length;
        for (var i = 1; i < ancestorsArrLen; ++i ) {
            if (ancestorsArray[i][index] !== referenceAncestor) {
                return false;
            }

        }
        return true;
    };

    // check if all share the same topmost ancestor
    if (!isAncestorAtSpecifiedIndexCommon(0)) {
        return null;  // no common ancestor
    }

    // This will hold the index of the element in 'elements' with the smallest number of ancestors (in other words,  the element
    // that is highest in the DOM)
    var highestElementIndex = 0;
        
        
    ancestorsArrLen = ancestorsArray.length;
    
    for (i = 0; i < ancestorsArrLen; ++i) {
        if (ancestorsArray[i].length < ancestorsArray[highestElementIndex].length) {
            highestElementIndex = i;
        }
    }

    var ancestorArrayWithFewestElements = ancestorsArray[highestElementIndex]; // use this as the reference array
    var closestCommonAnstr = null,
        arrLen = ancestorArrayWithFewestElements.length;
    for (var i = 0; i < arrLen; ++i) {
        if (isAncestorAtSpecifiedIndexCommon(i)) {
            closestCommonAnstr = ancestorArrayWithFewestElements[i];
        }
        else {
            break;
        }
    }

    return closestCommonAnstr;
};

// returns boolean
var canIgnoreMutation = function(mutationRecord) {
    if (mutationRecord.type === "attributes" && mutationRecord.target.classList.contains(class_addedByUnitsProjExtn)) {
        return true;
    }

    if (mutationRecord.type === "childList") {

        // returns boolean
        var canIgnoreAllNodes = function(nodes) {

            var canIgnore = true; // assume true to start off

            if (nodes && nodes.length) {
                for (var i = 0; i < nodes.length; ++i) {
                    var node = nodes[i];
                    if(!  ((node.classList && node.classList.contains(class_addedByUnitsProjExtn)) ||
                        node.nodeType === document.TEXT_NODE)  ) {
                        canIgnore = false;
                        break;
                    }
                }
            }

            return canIgnore;
        };

        if (canIgnoreAllNodes(mutationRecord.addedNodes) && canIgnoreAllNodes(mutationRecord.removedNodes)) {
            return true;
        }
        else {
            return false;
        }

    }

    return false; // if not returned yet

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

// Based on the header selector provided, this returns the "effective" height of the header (i.e. unusable space) at the
// top of the current view.
// Only the part of the header below the view's top is considered, and its size returned. If there is more than one
// header element, we do the same thing, but for the bottommost one.
var getEffectiveHeaderHeight = function() {

    var headerData = urlData && urlData.page_miniUnits && urlData.page_miniUnits.std_header;
    if (!headerData) {
        return 0;
    }

    var headerSelector;

    if (typeof (headerSelector = headerData) === "string" || typeof (headerSelector = headerData.specifier) === "string") {
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
    }
    return 0;
};

var isRtMouseButton = function(e) {
    // following right code mostly taken from http://www.quirksmode.org/js/events_properties.html
    var isRtButton;
//    if (!e) var e = window.event;
    if (e.which) isRtButton = (e.which == 3);
    else if (e.button) isRtButton = (e.button == 2);

    return isRtButton;
};

function showSearchBox() {

    if (!$searchContainer.is(':visible')) {
        $searchContainer.show();
    }

    if (parseInt($searchContainer.css('top'), 10) < 0) {

        $searchContainer.$searchBox.val('');

        $searchContainer.css({top: "0px"});

        var savedScrollPos = $document.scrollTop();

        $searchContainer.$searchBox.focus();

        // Setting the focus to the searchbox scrolls the page up slightly because the searchbox lies above the visible
        // part of the page (till its css animation completes). This is undesirable. Hence we restore the scroll
        // position:
        $document.scrollTop(savedScrollPos);

    }
    else {
        $searchContainer.$searchBox.focus();
    }

}

function closeSearchBox() {
    $searchContainer.$searchBox.val('');

    // This function should be called before the search box is hidden, so that the call to filter() function is made
    // within it
    updateCUsAndRelatedState();
    $searchContainer.$searchBox.blur();

    $searchContainer.css({top: -$searchContainer.outerHeight(true) + "px"});

}

// filters $CUsArr based on the text in the search box
function filterCUsArray($CUsArr) {

    if (!$CUsArr || !$CUsArr.length) {
        return;
    }

    // ** --------- PRE FILTERING --------- **
    var CUsNodes = [],
        CUsArrLen = $CUsArr.length;

    for (var i = 0; i < CUsArrLen; ++i) {
        var $CU = $CUsArr[i];
        CUsNodes = CUsNodes.concat($CU.get());
    }

    var $closestAncestor = $(closestCommonAncestor(CUsNodes));

    mutationObserver.disconnect(); // ** stop monitoring mutations **
    $closestAncestor.hide();
    removeHighlighting($closestAncestor);

    // ** --------- FILTERING --------- **
    var searchTextLowerCase = $searchContainer.$searchBox.val().toLowerCase();

    if (!searchTextLowerCase) {
        var $CUsHiddenByPriorFiltering = $closestAncestor.find('.hiddenByCUsExtn');
        $CUsHiddenByPriorFiltering.removeClass('hiddenByCUsExtn').show();

    }
    else {

        console.log('filtering invoked...');

        for (var i = 0, $CU; i < CUsArrLen; ++i) {
            $CU = $CUsArr[i];
            // if ($CU.text().toLowerCase().indexOf(searchTextLowerCase) >= 0) {
            if (highlightInCU($CU, searchTextLowerCase)) {

                //if ($CU.hasClass('hiddenByCUsExtn')) {

                $CU.show().removeClass('hiddenByCUsExtn');
                //}
            }
            else {
                //if ($CU.is(':visible')) {
                $CU.hide().addClass('hiddenByCUsExtn');
                $CUsArr.splice(i, 1);
                --CUsArrLen;
                --i;

                //}
            }
        }
    }

    // ** --------- POST FILTERING --------- **
    $closestAncestor.show();
    mutationObserver.observe(document, mutationObserverConfig); // ** start monitoring mutations **

}

// filters $CUsArr based on the text in the search box\
/*
function filterCUsArray($CUsArr) {

    if (!$CUsArr || !$CUsArr.length) {
        return;
    }

    // ** --------- PRE FILTERING --------- **
    var CUsNodes = [],
        CUsArrLen = $CUsArr.length;

    for (var i = 0; i < CUsArrLen; ++i) {
        var $CU = $CUsArr[i];
        CUsNodes = CUsNodes.concat($CU.get());
    }

    var $closestAncestor = $(closestCommonAncestor(CUsNodes));

    mutationObserver.disconnect(); // ** stop monitoring mutations **


    // ** --------- FILTERING --------- **
    var searchTextLowerCase = $searchContainer.$searchBox.val().toLowerCase();

    if (!searchTextLowerCase) {
//        var $CUsHiddenByPriorFiltering = $closestAncestor.find('.hiddenByCUsExtn');
//        $CUsHiddenByPriorFiltering.removeClass('hiddenByCUsExtn').show();

        $closestAncestor.hide();  // for efficiency: remove from the render tree first

        for (var i = 0; i < CUsArrLen; ++i) {
            var $CU = $CUsArr[i];
            if ($CU.data('hiddenByCUsExtn')) {
                $CU.show().data('hiddenByCUsExtn', false);
            }
        }

        removeHighlighting($closestAncestor);

        $closestAncestor.show();
    }

    else {

        console.log('filtering invoked...');

        for (var i = 0, $CU; i < CUsArrLen; ++i) {
            $CU = $CUsArr[i];
//            if ($CU.text().toLowerCase().indexOf(searchTextLowerCase) >= 0) {
            if (highlightInCU($CU, searchTextLowerCase)) {

                //if ($CU.hasClass('hiddenByCUsExtn')) {

//                $CU.removeClass('hiddenByCUsExtn');
                $CU.data('hiddenByCUsExtn', false);
                //}
            }
            else {
                //if ($CU.is(':visible')) {
//                $CU.addClass('hiddenByCUsExtn');
                $CU.data('hiddenByCUsExtn', true);


                //}
            }
        }
    }

    $closestAncestor.hide();  // for efficiency: remove from the render tree first
    for (var i = 0, $CU; i < CUsArrLen; ++i) {
        $CU = $CUsArr[i];
        if ($CU.data('hiddenByCUsExtn')) {
            $CU.hide();
            $CUsArr.splice(i, 1);
            --CUsArrLen;
            --i;
        }
        else {
            $CU.show();
        }
    }

    // ** --------- POST FILTERING --------- **
    $closestAncestor.show();
    mutationObserver.observe(document, mutationObserverConfig); // ** start monitoring mutations **

}
*/

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
   scroll(globalSettings.pageScrollDelta);
}

function scrollUp() {
    scroll(-globalSettings.pageScrollDelta);
}

function closeTab() {
    chrome.extension.sendMessage({message: "closeTab"});
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

    Mousetrap.reset();

    mutationObserver.disconnect();

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
 [This is done in addition to modifying the Mousetrap library to attach events in the capturing phase.]

 In the future, if required, we could consider doing these only for google search pages/sites where it is required.
 */
function bind(shortcuts, handler, suppressPropagation) {

    // defaults to true unless explicitly specified as false (i.e. undefined is true as well)
    if (suppressPropagation !== false) {
        suppressPropagation = true;
    }

    if (suppressPropagation) {

        Mousetrap.bind(shortcuts, suppressEvent, 'keypress');
        Mousetrap.bind(shortcuts, suppressEvent, 'keyup');
    }

    Mousetrap.bind(shortcuts, function(e) {

        handler();

        if (suppressPropagation) {
            suppressEvent(e);
        }

    }, 'keydown');

    if (chromeAltHackNeeded) {
        applyChromeAltHackIfNeeded(shortcuts);
    }
}

/* In the two objects specified below, each action is mapped to an array of keyboard shortcuts that will trigger it 
 (allowing multiple shortcuts for the same action).
 In addition to the usual modifier keys, 'space' can be used (and will only work) as a modifier key. This was done
 by modifying the MouseTrap library.
 */
var browserActionShortcuts = {
    scrollDown: ['alt+j'],
    scrollUp: ['alt+k'],
    closeTab: ['alt+x'],

    // Special shortcut. Is made part of "browser action" shortcuts since it should be available even when
    // extension is only partially enabled.
    toggleExtension: ['ctrl+`']
};

/* Sets up "browser action" shortcuts. That is ones that (generally) correspond to browser actions. This extension can
 be run in special mode  in which only this category of shortcuts is enabled (and this can be configured
 on a per website/webpage basis). This is helpful for pages like gmail, github, etc which often have good shortcuts
 implemented out of the box. Yet completely disabling the extension on such sites would lead to breaking of the user's
 "flow" when, for example, invoking sequentially invoking "left tab" to move through a bunch of tabs one of which had
 UnitsProj completely  disabled.
 As a general recommendation, single letter keys are not used for this category of shortcuts, because that seems to be
 the most common type of shortcuts implemented on web apps, and so would result in a higher possibility of conflict.
*/
function _setupBrowserActionShortcuts() {

    // true is redundant here; used only to illustrate this form of the function call
    bind(browserActionShortcuts.scrollDown, scrollDown, true);
    bind(browserActionShortcuts.scrollUp, scrollUp);
    bind(browserActionShortcuts.closeTab, closeTab);

    bind(['alt+y'], function() {console.log(' alt y');}); // this shouldn't be printed because there is a conflicting global shortcut defined in manifest.json
    bind(['alt+q'], function() {console.log(' alt q');});
    bind(['alt+4'], function() {console.log(' alt 4');});
    bind(['alt+space+g'], function() {console.log(' alt space g');});
    bind(['shift+q'], function() {console.log('shift q');});
//    bind(['q'], function() {console.log('q')});

    // we bind the handler for re-enabling elsewhere, because disableExtension() will invoke Mousetrap.reset()
    bind(browserActionShortcuts.toggleExtension, disableExtension);
}

var generalShortcuts = {
    // NOTE: since space is allowed as a modifier, it can only be used here in that capacity.
    // i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
    nextCU: ['j', '`', 'down'],
    prevCU: ['k', 'shift+`', 'up'],
    search: ['/', 'ctrl+shift+f', 'command+shift+f'],
    firstCU: ['^', 'alt+1'], // TODO: check if ding sound on alt can be zfixed
    lastCU: ['$', 'alt+9', 'alt+0'],
    showHelp: ['alt+h', 'alt+?'],
    open: ['shift+o', 'alt+o'],  // alt+o allows invoking only with one hand (at least in windows)
    openInNewTab: ['o'],
    focusFirstTextInput: ['g i', 'alt+i'],   // TODO: on google search results page, invoking 'g i' results in g getting typed into the search box
    focusNextTextInput: ['alt+o'],
    focusPrevTextInput: ['alt+shift+o']
    /*
     <Note>:
     Esc is defined in the escapeHandler(), and is used for two actions. Should shortcuts for those be made
     changeable. Possibly we won't allow Esc to be removed but allow adding alternatives for them?
     */

};

// Sets up the general shortcuts, that is ones that don't depend on the current webpage. E.g: shortcuts for
// selecting next/prev CU, etc.
function _setupGeneralShortcuts() {

    // true is redundant here; used only to illustrate this form of the function call
    bind(generalShortcuts.nextCU, selectNext, true);

    bind(generalShortcuts.prevCU, selectPrev);

    bind(generalShortcuts.search, showSearchBox);

    bind(generalShortcuts.firstCU, function(e) {
        selectCU(0, true);
    });

    bind(generalShortcuts.lastCU, function(e) {
        selectCU($CUsArray.length - 1, true);
    });

    bind(generalShortcuts.showHelp, showHelp);

    bind (generalShortcuts.open, openActiveElement);

    bind (generalShortcuts.openInNewTab, function() {
        openActiveElement(true); // open in new tab
    });
    bind (generalShortcuts.focusFirstTextInput, focusFirstTextInput);
    bind (generalShortcuts.focusNextTextInput, focusNextTextInput);
    bind (generalShortcuts.focusPrevTextInput, focusPrevTextInput);

}

/**
* Sets up the shortcuts specified. Can be used to setup either page-specific or CU-specific shortcuts depending on
* whether the 'type' passed is "page" or "CU".
    * @param type
*/
function _setupUrlDataShortcuts(type) {

    var shortcuts;
    if (type === "CU") {
        shortcuts = urlData && urlData.CU_shortcuts;
    }
    else {
        shortcuts = urlData && urlData.page_shortcuts;
    }

    if (shortcuts) {

        for (var key in shortcuts) {
            var shortcut = shortcuts[key];

            bind(shortcut.keys, invokeShortcut.bind(null, shortcut, type));

        }
    }
}

/**
 *
 * @param shortcut
 * @param {string} scope Can be either "page" or "CU"
 */
function invokeShortcut(shortcut, scope) {
    var fn =  shortcut.fn,
        selectors,
        $selectedCU = $CUsArray[selectedCUIndex];

    // if shortcut has the 'fn' property specified, do the same thing whether scope is 'page' or 'CU'
    if (fn) {
        fn($selectedCU, document);
    }

    else if ((selectors = shortcut.selectors || shortcut.selector )) {
        var $scope;

        if (scope === 'CU') {
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
                    executeWhenConditionMet(

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
}

/**
 * Sets up the keyboard shortcuts.
 * Note: Because of the order in which shortcuts are set up, their priorities in case of a conflict are:
 * <browser action shortcuts> override <general shortcuts> override <page-specific shortcuts> override <CU-specific
 * shortcuts>
 * This order has been chosen since it favors consistency and hence minimizes confusion.
 */
function setupKbdShortcuts() {
    // since setupKbdShortcuts() is invoked every time URL changes, first reset shortcuts and any state associated with
    // "chrome alt hack"
    Mousetrap.reset();

    if (chromeAltHackNeeded) {
        chromeAltHack_accesskeysRemoved = [];
        altShortcutKeys = [];
        $topLevelContainer.find('.' + class_usedForChromeAltHack).remove();
    }

    _setupUrlDataShortcuts("CU"); // CU shortcuts
    _setupUrlDataShortcuts("page"); // page shortcuts
    _setupGeneralShortcuts();   // general shortcuts
    _setupBrowserActionShortcuts(); // browser action shortcuts
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
        else if (isElementEditable(activeEl)) {
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
    console.log('!!!!!on focus called');
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

var MutationObserver = MutationObserver? MutationObserver: WebKitMutationObserver;

mutationObserver = new MutationObserver (function(mutations) {
    var mutationsLen = mutations.length;
    for (var i = 0; i < mutationsLen; ++i) {

        if (canIgnoreMutation(mutations[i])) {
            mutations.splice(i, 1); // remove current mutation from the array
            --mutationsLen;
            --i;
        }

    }

    // if there are mutations left still
    if (mutations.length) {
//        console.log('dom changed. mutations: ', mutations);
        onDomChange(mutations);
    }

});

var onWindowResize = function() {

    dehoverCU();

    if (selectedCUIndex >= 0) {
        selectCU(selectedCUIndex, false, false, {onDomChangeOrWindowResize: true}); // to redraw the overlay
    }
};


var onTransitionEnd = function(e) {

    var $overlay = $(e.target);

//  console.log('overlay transition ended. total overlays = ', $('.' + class_overlay).length);
    tryRecycleOverlay($overlay);

};

/**
 * Checks if the overlay element specified (as jQuery wrapper) is no longer in
 * use, and if so, marks it as available for future reuse.
 * @param $overlay
 */
var tryRecycleOverlay = function($overlay) {

    if (!$overlay.hasClass(class_overlay)) {
        console.warn("UnitsProj: Unexpected - $overlay doesn't have class '" + class_overlay + "'");
    }

    // check if the overlay is both in deselected and dehovered states
    if (!$overlay.hasClass(class_overlayHovered) && !$overlay.hasClass(class_overlaySelected)) {

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
        .addClass(class_addedByUnitsProjExtn)
        .hide()
        .appendTo($topLevelContainer);

    setupSearch();
}
function setupSearch() {

    var $searchBox = $('<input id = "UnitsProj-search-box" class = "UnitsProj-reset-text-input" type = "text">')
            .addClass(class_addedByUnitsProjExtn),

        $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
            .attr("id", "UnitsProj-search-close-icon")
            .addClass(class_addedByUnitsProjExtn);

    $searchContainer = $('<div id = "UnitsProj-search-container">')
        .addClass(class_addedByUnitsProjExtn)
        .append($searchBox)
        .append($closeButton)
        .hide()
        .appendTo($topLevelContainer);

    $searchContainer.css({top: -$searchContainer.outerHeight(true) + "px"}); // seems to work only after it's in DOM

    // attach reference to the global variable for easy access in the rest of the code
    $searchContainer.$searchBox = $searchBox;

    $searchBox.on('keydown paste input', onSearchBoxKeydown);
    $closeButton.click(closeSearchBox);

}

function onSearchBoxKeydown(e) {

    clearTimeout(timeout_search); // clears timeout if it is set

    if (e.type === 'keydown' || e.type === 'keypress') {

        var code = e.which || e.keyCode;

        if (code === 27) { // ESc

            closeSearchBox();
            e.stopImmediatePropagation();
            return false;
        }
        else  if (code === 13) { // Enter
            updateCUsAndRelatedState();
            return false;
        }
        else if (code === 9) { // Tab
            if ($CUsArray.length) {
                selectCU(0, true, true);
            }
            else {
                var $focusables = $document.find(focusablesSelector);
                if ($focusables.length) {
                    $focusables[0].focus();
                }
            }
            e.stopImmediatePropagation(); // otherwise the 'tab' is invoked on the CU, focusing the next element
            return false;
        }
    }

    // setting the time out below, in conjunction with the clearTimeout() earlier, allows search-as-you-type, while
    // not executing the search related code multiple times while the user is typing the search string.
    timeout_search = setTimeout (function() {

        updateCUsAndRelatedState();

    }, 400);
}

function setupExternalSearchEvents() {

    var keyHandler = function(e) {
        var selection;

        // If a kew is pressed while the left-mouse button is pressed down and some text is selected
        if (ltMouseBtnDown && (selection = document.getSelection().toString())) {

            if (e.type === 'keydown') {
                var code = e.which || e.keyCode;

                // the background script will determine which site to search on based
                chrome.extension.sendMessage({message: "searchExternalSite", selection: selection, keyCode: code});
            }

            suppressEvent(e); // for all types - keypress, keydown, keyup
        }
    };

    addEventListener2(document, 'keydown', keyHandler, true);
    addEventListener2(document, 'keypress', keyHandler, true);
    addEventListener2(document, 'keyup', keyHandler, true);

}

function onDomReady() {

    if ( globalSettings.selectCUOnLoad) {

        selectMostSensibleCU(true, false);
    }
}

function disableExtension() {

    dehoverCU();
    deselectCU();
    $CUsArray = [];
    $topLevelContainer.empty().remove();
    $lastSelectedCU = null;

    removeAllEventListeners();

    if (chromeAltHackNeeded) {

        var len = chromeAltHack_accesskeysRemoved.length,
            data;
        for (var i = 0; i < len; i++) {
            data = chromeAltHack_accesskeysRemoved[i];
            $(data.element).attr('accesskey', data.accessKey); // reinstate the removed accesskeys
        }

        chromeAltHack_accesskeysRemoved = [];
        altShortcutKeys = [];
        $topLevelContainer.find('.' + class_usedForChromeAltHack).remove();
    }
    bind(browserActionShortcuts.toggleExtension, initializeExtension);
}

// call this to (re)initialize/reset the extension. first disables and then re-enables the extn.
function initializeExtension() {

    disableExtension();

    setupBasicUIComponents(); // also set up their associated event handlers

    // this should be done  before binding any keydown/keypress/keyup events (including Mousetrap binds)
    // so that these event handlers get preference ([left-button+<key>] should get preference over <key>)
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
    $document.on('focusin', focusablesSelector, onFocus);
    $(window).on('resize', onWindowResize);

    if (overlayCssHasTransition) {
        $document.on('transitionend transitionEnd webkittransitionend webkitTransitionEnd otransitionend oTransitionEnd',
            '.' + class_overlay, onTransitionEnd);
    }

    mutationObserver.observe(document, mutationObserverConfig);
    initializeForCurrentUrl();
}

function initializeForCurrentUrl() {
    chrome.extension.sendMessage({
            message: "getUrlData",
            locationObj: window.location

        },
        function(response) {
            urlData = response;
            if (urlData) {
                destringifyFunctions(urlData);
            }
            // the following line should remain outside the if condition so that the change from a url with CUs
            // to one without any is correctly handled
            updateCUsAndRelatedState();
            setupKbdShortcuts();
            setupHelpUIAndEvents();

            if ( globalSettings.selectCUOnLoad) {
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


