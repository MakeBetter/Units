/* NOTES
1)  A lot of modern web pages are comprised of a set of units that we refer to as the "main units" (MUs) of the page.
    E.g. on google search results page the MUs would be the set of results. The each individual MU is a logical unit of 
    attention/navigation/access. Each MU can consist of one or more DOM elements.

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

- on quora etc, clicking an a MU scrolls suddenly

- exclude images from rect if affecting both dimensions (including single child ancestors)
- on stackoverflow / questions page: clicking a MU, messes with
 text selection etc in some weird way. doesn't happen every time.

- add padding to the overlay(s) (see wikipedia pages for why)

- handle url changes
- margin near the bottom after scrolling
- override scroll animation when cycling from last to first or first to last
- quora: click doesnt focus
- stackoverflow: clicking doesn't focus main element/etc
- exclude display:none when populating $MUs

- implement exclude

- animate hovering/unhovering and selection/unselection

check where all deselectMU() is being called, and if that needs any modifying/placing a check around the call

remove prevALL etc if not using

*/

var currentUrl = window.location.href,
    urlData,    // Data that identifies elements and  MU and specifies shortcuts and other information for the
                        // current url. This is updated whenever the current url changes.

    $MUsArray = [], /* An array of jQuery sets. The array represents the *sequence* of MUs on the current page.
    Each constituent element (which is a jQuery set) represents the set of DOM elements that constitute a single
    MU for the current page.
    Most web pages will allow writing simple selectors such that each MU can be represented as a jQuery set
    consisting of a single DOM element.(Because these web pages group related logical entities in a single container,
    for which the selector can be specified.)
    However, some web pages (like news.ycombinator.com, wikipedia.org, etc) require writing selectors such each MU
    has to be represented as a jQuery set comprising of multiple DOM elements.
    (For more details, see the documentation on how to specify selectors for webpages.)

    Note: If the search feature has been invoked, this contains only the filtered MUs that are visible on the page.
    This helps keep things simple.
    */

    selectedMUIndex  = -1, // Index of the selected MU in $MUsArray
    hoveredMUIndex  = -1, // Index of the hovered MU in $MUsArray

    /* This class should be applied to all elements added by this extension. This is used to distinguish DOM mutation
    events caused by them from the those of the page's own elements. This is also a "responsible" thing since it marks
    out clearly elements added by this code to the DOM (for anyone looking at DOM, page source etc) */
    class_addedByUnitsProjExtn = 'added-by-UnitsProj',

    /* This is used as a container for all elements created by this program that we add to the DOM (technically, this 
    applies only to elements that are outside the render flow of the page. As of 31 Dec 2012 these include all elements
    added by this extension).
    This allows keeping modifications to the DOM localized inside a single element. */
    $topLevelContainer = $('<div></div>').addClass(class_addedByUnitsProjExtn),

    class_overlay = "MU-overlay",                     // class applied to all MU overlays
    class_overlaySelected = "MU-overlay-selected",    // class applied to overlay on a selected MU
    class_overlayHovered = "MU-overlay-hovered",      // class applied to overlay on a hovered MU
    $unusedOverlaysArray = [],   // to enable reusing existing unused overlays

    // boolean, holds a value indicating where the css specifies a transition style for overlays
    overlayCssHasTransition,

    $document = $(document), // cached jQuery object

    elementToScroll,
    
    rtMouseBtnDown,         // boolean holding the state of the right mouse button
    ltMouseBtnDown,         // boolean holding the state of the left mouse button
    scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

    class_scrollingMarker = 'MU-scrolling-marker',
    $scrollingMarker,

    $searchContainer,
    $helpContainer,
    timeout_search,

    $lastSelectedMU = null,   // to store a reference to the last selected MU

    // If a MU is currently selected, this stores the time it was selected, else this stores the time the last
    // selected MU was deselected.
    lastSelectedMUTime,

    // number of milliseconds since its last selection/deselection after which a MU is no longer deemed to be
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

        selectMUOnLoad: true, // whether the first MU should be selected when the page loads
        animatedMUScroll: true,
        animatedMUScroll_Speed: 2, // pixels per millisecond
        animatedMUScroll_MaxDuration: 300, // milliseconds

        increaseFontInSelectedMU: false,

        // determines if while scrolling a MU should always be centered (whenever possitble) or only if it lies
        // outside the view port
        tryCenteringMUOnEachScroll: false,

        // if true, scrollNext() and scrollPrev() will scroll more of the current MU, if it is not in view
        sameMUScroll: true,

        pageScrollDelta: 100 // pixels to scroll on each key press

    },

    addEventListener_eventHandlers = [],
    jQueryOn_eventHandlers = [];




// returns a jQuery set composed of all focusable DOM elements contained in the
// jQuery set ($MU) passed
var $getContainedFocusables = function($MU) {

    var $allElements = $MU.find('*').addBack();
    var $containedFocusables = $allElements.filter(focusablesSelector);
    return $containedFocusables;

};

/**
 * Returns the "main" element in the specified MU, which is determined as follows:
 * 1) Return the first "focusable" element within $MU which matches the selector specified in any of these
 * properties in the urlData.MUs object (checked in order): 'main', 'buildMUAround', 'first'
 * 2) If no such element is found, return the first focusable element contained in $MU, if one can be found
 *
 * @param $MU
 * @return {DOM element} Returns the "main" element, if one was found, else null.
 */
var getMainElement = function($MU) {

    if (!$MU || !$MU.length) {
        return null;
    }

    var $containedFocusables = $getContainedFocusables($MU),
        MUSpecifier = urlData.MUs.specifier;

    if (!$containedFocusables.length) {
        return null;
    }

    var mainSelector,
        $filteredFocusables,
    // we look for these keys in MUsData, in order
        focusableSelectorKeys = ['main', 'buildMUAround', 'first'];

    for (var i = 0, focusableSelectorKey; i < focusableSelectorKeys.length; ++i) {
        focusableSelectorKey = focusableSelectorKeys[i];
        if ((mainSelector = MUSpecifier[focusableSelectorKey]) &&
            ($filteredFocusables = $containedFocusables.filter(mainSelector)) &&
            $filteredFocusables.length) {

            return $filteredFocusables[0];

        }
    }

    // if not returned yet,
    return $containedFocusables[0];
};

// Focuses the "main" focusable element in a MU, if one can be found.
// See function "getMainElement" for more details.
function focusMainElement($MU) {
    var mainEl = getMainElement($MU);
    if (mainEl) {
//        $(mainEl).data('enclosingMUJustSelected', true);
        mainEl.focus();
    }
}

/**
 * Invokes a click on the active element (see getMainElement()) of the selected MU. Passing true for
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

//    var $MU = $MUsArray[selectedMUIndex];
//    if ($MU) {
//        var element = getMainElement($MU)
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
 * Selects the MU specified.
 * @param {number|DOMElement (or jQuery wrapper)} MUOrItsIndex Specifies the MU.
 * Can be an integer that specifies the index in $MUsArray or a jQuery object representing the MU.
 * (While performance isn't a major concern here,) passing the index is preferable if it is already known,
 * otherwise the function will determine it itself (in order to set the selectedMUIndex variable).
 * @param {boolean} setFocus If true, the "main" element for this MU, if one is found, is
 * focused.
 * @param {boolean|undefined} adjustScrolling If true, document's scrolling is adjusted so that
 * all (or such much as is possible) of the selected MU is in the viewport. Defaults to false.
 * This parameter is currently passed as true only from selectPrev() and selectNext()
 * @param {object} options
 */
var selectMU = function(MUOrItsIndex, setFocus, adjustScrolling, options) {
    console.log('selectMU() called');
    var $MU,
        indexOf$MU; // index in $MUsArray

    if (typeof MUOrItsIndex === "number" || MUOrItsIndex instanceof Number) {
        indexOf$MU = MUOrItsIndex;
        $MU = $MUsArray[indexOf$MU];
    }
    else {
        $MU = $(MUOrItsIndex);
        indexOf$MU = findIndex_In_$MUsArray($MU);
    }

    if (!$MU || !$MU.length || indexOf$MU < 0) {
        return;
    }

    options = $.extend(true, {}, globalSettings, options);

    deselectMU(options); // before proceeding, deselect currently selected MU, if any

    selectedMUIndex = indexOf$MU;
    var $overlaySelected = showOverlay($MU, 'selected');

    if (!$overlaySelected) {
        console.warn('UnitsProj: no $overlay returned by showOverlay');
    }

    if (!options || !options.onDomChangeOrWindowResize) {
        selectMU.invokedYet = true; // to indicate that now this function (selectMU) has been invoked at least once

        $lastSelectedMU = $MU;
        lastSelectedMUTime = new Date();

        if (adjustScrolling) {
            scrollIntoView($overlaySelected, options);
        }

        if (setFocus) {
            focusMainElement($MU);
        }

        if (options.increaseFontInSelectedMU && !$MU.data('fontIncreasedOnSelection')) {
            mutationObserver.disconnect();
            increaseFont($MU);
            mutationObserver.observe(document, mutationObserverConfig);
            $MU.data('fontIncreasedOnSelection', true);
        }

        var fn_onMUSelection;
        if (urlData.actions && urlData.actions.std_onMUSelection && (fn_onMUSelection = urlData.actions.std_onMUSelection.fn)) {
            mutationObserver.disconnect();
            fn_onMUSelection($MU, document);
            mutationObserver.observe(document, mutationObserverConfig);
        }
    }
};

/**
 * Deselects the currently selected MU, if there is one
 */
var deselectMU = function (options) {

    var $MU = $MUsArray[selectedMUIndex];
    if ($MU) {

        // console.log('deselecting MU...');
        removeOverlay($MU, 'selected');

        if (!options || !options.onDomChangeOrWindowResize) {
            lastSelectedMUTime = new Date();

            if ($MU.data('fontIncreasedOnSelection')) {
                mutationObserver.disconnect();
                decreaseFont($MU);
                mutationObserver.observe(document, mutationObserverConfig);
                $MU.data('fontIncreasedOnSelection', false);
            }

            var fn_onMUDeselection;
            if (urlData.actions && urlData.actions.std_onMUDeselection && (fn_onMUDeselection = urlData.actions.std_onMUDeselection.fn)) {
                mutationObserver.disconnect();
                fn_onMUDeselection($MU, document);
                mutationObserver.observe(document, mutationObserverConfig);
            }
        }

    }
    selectedMUIndex = -1;
};

/**
 * Removes the 'selected' or 'hovered' css class from the MU, as specified by 'type'
 * @param $MU
 * @param {string} type Can be 'selected' or 'hovered'
 * @return {*} Returns $overlay (the jQuery wrapper overlay element)
 */
function removeOverlay ($MU, type) {
    if (!$MU || !$MU.length) {
        return null;
    }

    var $overlay = $MU.data('$overlay');

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
 * @param $MU
 * @param {string} type Can be 'selected' or 'hovered'
 * @return {*} Displays and returns $overlay (i.e. a jQuery wrapped overlay element)
 */
var showOverlay = function($MU, type) {
    if (!$MU || !$MU.length) {
        return null;
    }

    var $overlay = $MU.data('$overlay');

    if (!$overlay || !$overlay.length) {
        if ($unusedOverlaysArray.length) {
            $overlay = $unusedOverlaysArray.shift();
        }
        else {
            $overlay = $('<div></div>').addClass(class_overlay).addClass(class_addedByUnitsProjExtn);
        }
    }

    var MUsData = urlData.MUs,
        MUStyleData = MUsData.style,
        overlayPadding;

    $overlay.data('$MU', $MU);
    $MU.data('$overlay', $overlay);

    // position the overlay above the MU, and ensure that its visible
    $overlay.css(getBoundingRectangle($MU)).show();

    if (MUStyleData && (overlayPadding = MUStyleData.overlayPadding)) {
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
 * Shows as hovered the MU specified.
 * @param {number|DOMElement (or jQuery wrapper)} MUOrItsIndex Specifies the MU.
 * Can be an integer that specifies the index in $MUsArray or a jQuery object representing the MU.
 * (While performance isn't a major concern,) passing the index is preferable if it is already known.
 */
var hoverMU = function(MUOrItsIndex) {

    var $MU,
        indexOf$MU; // index in $MUsArray

    if (typeof MUOrItsIndex === "number" || MUOrItsIndex instanceof Number) {
        indexOf$MU = MUOrItsIndex;
        $MU = $MUsArray[indexOf$MU];
    }
    else {
        $MU = $(MUOrItsIndex);
        indexOf$MU = findIndex_In_$MUsArray($MU);
    }

    if (!$MU || !$MU.length || indexOf$MU < 0) {
        return;
    }

    dehoverMU(); // before proceeding, dehover currently hovered-over MU, if any

    hoveredMUIndex = indexOf$MU;
    showOverlay($MU, 'hovered');

};

/**
 * Dehovers the currently hovered (over) MU, if there is one
 */
var dehoverMU = function () {
    var $MU = $MUsArray[hoveredMUIndex];
    if ($MU) {
        removeOverlay($MU, 'hovered');
    }
    hoveredMUIndex = -1;
};

var showScrollingMarker = function(x, y, height) {

    clearTimeout($scrollingMarker.timeoutId); // clear a previously set timeout out, if one exists...

    $scrollingMarker.timeoutId = setTimeout(function() { // ... before setting a new one
        $scrollingMarker.hide();
    }, 3000);

    $scrollingMarker.css({top: y, left: x-$scrollingMarker.width()-5, height: height}).show();

};

/**
 * Scrolls more of the currently selected MU into view if required (i.e. if the MU is too large),
 * in the direction specified.
 * @param {string} direction Can be either 'up' or 'down'
 * @param {object} options
 * @return {Boolean} value indicating whether scroll took place
 */
function scrollSelectedMUIfRequired (direction, options) {

    options = $.extend(true, {}, globalSettings, options);

    var $MU = $MUsArray[selectedMUIndex];

    var pageHeaderHeight = getEffectiveHeaderHeight();

    var // for the window:
        winTop = $document.scrollTop(),
        winHeight = $(window).height(),
        winBottom = winTop + winHeight,

    // for the MU:
        MUTop = $MU.offset().top,
        MUHeight = $MU.height(),
        MUBottom = MUTop + MUHeight;

    var newWinTop, // new value of scrollTop
        sameMUScrollOverlap = 40,
        margin = 30;

    direction = direction.toLowerCase();
    if ( (direction === 'up' && MUTop < winTop + pageHeaderHeight) ||
        (direction === 'down' && MUBottom > winBottom) ) {
        if (direction === 'up' ) { // implies MUTop < winTop + pageHeaderHeight
            newWinTop = winTop - winHeight + sameMUScrollOverlap;

            // if newWinTop calculated would scroll the MU more than required for it to get completely in the view,
            // increase it to the max value required to show the entire MU with some margin left.
            if (newWinTop + pageHeaderHeight < MUTop) {
                newWinTop = MUTop - pageHeaderHeight - margin;
            }

            if (newWinTop < 0) {
                newWinTop = 0;
            }
        }

        else  { //direction === 'down' && MUBottom > winBottom
            
            newWinTop = winBottom - sameMUScrollOverlap;

            // if newWinTop calculated would scroll the MU more than required for it to get completely in the view,
            // reduce it to the min value required to show the entire MU with some margin left.
            if (newWinTop + winHeight > MUBottom) {
                newWinTop = MUBottom - winHeight + margin;
            }

            // ensure value is not more then the max possible
            if (newWinTop > $document.height() - winHeight) {
                newWinTop = $document.height() - winHeight;
            }

            showScrollingMarker($MU.offset().left, winBottom - sameMUScrollOverlap, sameMUScrollOverlap);
        }

        if (options.animatedMUScroll) {

            console.log('animated SAME MU scroll');

            var animationDuration = Math.min(options.animatedMUScroll_MaxDuration,
                Math.abs(newWinTop-winTop) / options.animatedMUScroll_Speed);

            animatedScroll(newWinTop, animationDuration);

//            $('html, body').animate({scrollTop: newWinTop}, animatedScroll);
        }
        else {
            console.log('NON animated SAME MU scroll');
            $document.scrollTop(newWinTop);
        }

        return true;
    }

    return false;
}

/**
 * Selects the previous MU to the currently selected one.
 */
var selectPrev = function() {

    if (!$MUsArray || !$MUsArray.length || $MUsArray.length == 1) {
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

    if (selectedMUIndex >=0 && (isMUInViewport($MUsArray[selectedMUIndex]) ||
        new Date() - lastSelectedMUTime < selectionTimeoutPeriod)) {
        if (options.sameMUScroll) {
             var scrolled = scrollSelectedMUIfRequired('up', options);
            if (scrolled) {
                return;
            }
            else if (selectedMUIndex === 0) { // special case for first MU
                scrollUp();
            }
        }

        newIndex = selectedMUIndex - 1;
        if (newIndex >= 0) {
            selectMU(newIndex, true, true, options);
        }
        // else do nothing

    }
    else {
        selectMostSensibleMU(true, true);
    }


};

/**
 * Selects the next MU to the currently selected one.
 */
var selectNext = function() {

    if (!$MUsArray || !$MUsArray.length || $MUsArray.length == 1) {
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

    if (selectedMUIndex >=0 && (isMUInViewport($MUsArray[selectedMUIndex]) ||
        new Date() - lastSelectedMUTime < selectionTimeoutPeriod)) {

        if (options.sameMUScroll) {
            var scrolled = scrollSelectedMUIfRequired('down', options);
            if (scrolled) {
                return;
            }
            else  if (selectedMUIndex === $MUsArray.length-1) { // special case for last MU
                scrollDown();
            }
        }

        newIndex = selectedMUIndex + 1;
        if (newIndex < $MUsArray.length) {
            selectMU(newIndex, true, true);
        }
        // else do nothing

    }
    else {
        selectMostSensibleMU(true, true);
    }
};

/**
 * Called typically when there is no currently selected MU, and we need to select the MU that makes most sense
 * to select in this situation.
 */
function selectMostSensibleMU(setFocus, adjustScrolling) {

    var lastSelectedMUIndex;

    // if a MU is already selected AND (is present in the viewport OR was selected only recently)...
    if (selectedMUIndex >= 0 &&
        (isMUInViewport($MUsArray[selectedMUIndex]) ||
        new Date() - lastSelectedMUTime < selectionTimeoutPeriod)) {


        //...call selectMU() on it again passing on the provided parameters
        selectMU(selectedMUIndex, setFocus, adjustScrolling);
        return;
    }
    // if last selected MU exists AND (is present in the viewport OR was deselected only recently)...
    else if( (lastSelectedMUIndex = findIndex_In_$MUsArray($lastSelectedMU)) >=0 &&
        (isMUInViewport($lastSelectedMU) ||
        new Date() - lastSelectedMUTime < selectionTimeoutPeriod)) {

        selectMU(lastSelectedMUIndex, setFocus, adjustScrolling);
       
    }
  
    else {
        // Selects first MU in the viewport; if none is found, this selects the first MU on the page
        selectFirstMUInViewport(setFocus, adjustScrolling);
    }
}

/**
 * Selects first (topmost) MU in the visible part of the page. If none is found, selects the first MU on the page
 * @param {boolean} setFocus
 * @param {boolean} adjustScrolling
 */

function selectFirstMUInViewport (setFocus, adjustScrolling) {

    if ($MUsArray && $MUsArray.length) {
        var winTop = $document.scrollTop(),
            MUsArrLen = $MUsArray.length;

        for (var i = 0; i < MUsArrLen; ++i) {
            var $MU = $MUsArray[i];
            var offset = $MU.offset();
            if (offset.top > winTop) {
                break;
            }
        }

        if (i < MUsArrLen) {
            selectMU(i, setFocus, adjustScrolling);
        }
        else {
            selectMU(0, setFocus, adjustScrolling);
        }

    }

}

/**
 * If the specified element exists within a MU, the index of that MU in $MUsArray is 
 * returned, else -1 is returned.
 * @param {DOM element|jQuery wrapper} element
 * @return {number} If containing MU was found, its index, else -1
 */
var getEnclosingMUIndex = function(element) {
    var $element = $(element),
        MUsArrLen = $MUsArray.length;

    for (var i = 0; i < MUsArrLen; ++i) {
        if ($MUsArray[i].is($element) || $MUsArray[i].find($element).length) {
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


// this will find index of the passed jQuery set ($MU) in the $MUsArray. However, unlike JavaScript's
// Array#indexOf() method, a match will be found even if the passed jQuery set is "equivalent" (i.e has the same
// contents as a member of $MUsArray, even if they are not the *same* object.
// Returns -1 if not found.
var findIndex_In_$MUsArray = function($MU)  {

    var MUsArrLen;

    if ($MUsArray && (MUsArrLen = $MUsArray.length)) {

        for (var i = 0; i < MUsArrLen; ++i) {
            if (areMUsSame($MU, $MUsArray[i])) {
                return i;
            }
        }
    }

    return -1;
};

// returns a boolean indicating if the passed MUs (jQuery sets) have the same contents in the same order (for
// instances where we use this function, the order of elements is always the document order)
/**
 * returns a boolean indicating if the passed MUs (jQuery sets) have the same contents in the same order (for
 * instances where we use this function, the order of elements is always the document order)
 * @param $1 A MU
 * @param $2 Another MU to compare with the first one.
 * @return {Boolean}
 */
var areMUsSame = function($1, $2) {

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

// returns a bounding rectangle for $MU
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
var getBoundingRectangle = function($MU) {

    if (!$MU || !$MU.length)
        return;

    var MUsData = urlData.MUs,
        MUStyleData = MUsData.style,
        elements = [];

    if (MUStyleData && MUStyleData.useInnerElementsToGetOverlaySize) {
        var $innermostDescendants = $MU.find('*').filter(function() {
            if (!($(this).children().length)) {
                return true;
            }
        });
        elements = $innermostDescendants.get();
    }
    else {
        elements = $MU.get();
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
        intervalPeriod = Math.min(100, globalSettings.animatedMUScroll_MaxDuration/4),

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
 * image gallery, might have MUs laid out horizontally)
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

    if ( (elTop > winTop + pageHeaderHeight + margin && elBottom < winBottom - margin) && // MU is fully in viewport
        !scrollIntoView.tryCenteringMUOnEachScroll) {

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

    if (options.animatedMUScroll) {

        console.log('animated MU scroll');

        var animationDuration = Math.min(options.animatedMUScroll_MaxDuration,
            Math.abs(newWinTop-winTop) / options.animatedMUScroll_Speed);

        animatedScroll(newWinTop, animationDuration);

//        $('html, body').animate({scrollTop: newWinTop}, animatedScroll);

    }
    else {
        console.log('NON animated MU scroll');
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
// getMUsArray() call, as long each pair of successive events in this set is separated by less than
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
        updateMUsAndRelatedState();
    }
}

function onUrlChange() {
    initializeExtension(); // resets the extension
}

// Sets/updates the global variable $MUsArray and other state associated with it
function updateMUsAndRelatedState() {

    // Save the currently selected MU, to reselect it, if it is still present in the $MUsArray after the array is
    // updated. This needs to be done before calling deselectMU() and modifying the current $MUsArray
    var $prevSelectedMU = $MUsArray && $MUsArray[selectedMUIndex];
    dehoverMU(); // to prevent a "ghost" hover overlay
    deselectMU({onDomChangeOrWindowResize: true});
    $MUsArray = getMUsArray();

    if ($MUsArray && $MUsArray.length) {
        if (parseInt($searchContainer.css('top'), 10) >= 0) { // if search box is visible
//    if ($searchContainer.offset().top >= 0) { // if search box is visible
            filterMUsArray($MUsArray);
        }

        if (globalSettings.selectMUOnLoad && !selectMU.invokedYet) {
            // this is done at DOM ready as well in case by then the page's JS has set focus elsewhere.
            selectFirstMUInViewport(true, false);
        }

        // The following block ensures that a previously selected MU continues to remain selected
        else if ($prevSelectedMU) {

            var newSelectedMUIndex = findIndex_In_$MUsArray($prevSelectedMU);

            if (newSelectedMUIndex >= 0) {
                // pass false to not change focus (because it is almost certainly is already where it should be,
                // and we don't want to inadvertently change it)
                selectMU(newSelectedMUIndex, false, false, {onDomChangeOrWindowResize: true});
            }
        }
    }
}

// Populates the MUs array based on the current contents of the DOM and returns it.
// If search box is visibile, the returned MUs array is filtered accordingly.
var getMUsArray = function() {

    if (!urlData || !urlData.MUs) {
        // returning an empty array instead of null means accessing $MUsArray[selectedMUIndex] (which
        // is done a lot) doesn't need to be prepended with a check against null in each case.
        return [];
    }

    var $MUsArr,   // this will be hold the array to return
        MUsData = urlData.MUs,
        selector,
        MUsSpecifier = MUsData.specifier;

    if (typeof (selector = MUsData) === "string" ||
        typeof (selector = MUsData.specifier) === "string" ||
        typeof (selector = MUsData.specifier.selector) === "string" ) {
        $MUsArr = $.map($(selector).get(), function(item, i) {
            return $(item);
        });
    }

    else if (typeof MUsSpecifier.first === "string" && typeof MUsSpecifier.last === "string" ) {
        $MUsArr = [];
        var $firstsArray = $.map($(MUsSpecifier.first).get(), function(item, i) {
            return $(item);
        });

        // TODO: add a comment somewhere explaining how "first" and "last" work "smartly" (i.e. find the respective
        // ancestors first_ancestor and last_ancestor that are siblings and use those)
        // selecting logically valid entities.)
        if ($firstsArray.length) {
            var // these will correspond to MUsSpecifier.first and MUsSpecifier.last
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
                $_last = $_first.nextALL(MUsSpecifier.last).first();

                $closestCommonAncestor = $_first.parents().has($_last).first();

                $first = $closestCommonAncestor.children().filter(filterFirst);
                $last = $closestCommonAncestor.children().filter(filterLast);
                $MUsArr[i] = $first.add($first.nextUntil($last)).add($last);
            }
        }
    }

    else if (typeof MUsSpecifier.buildMUAround === "string"){

        $MUsArr = [];
        var currentGroupingIndex = 0;

        var $container = closestCommonAncestor($(MUsSpecifier.buildMUAround));
        // TODO: move the function below to a more apt place
        /**
         *
         * @param {DOM Node|JQuery Wrapper} $container
         */

        var buildMUsAroundCentralElement = function ($container) {
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

            var centralElementselector = MUsSpecifier.buildMUAround;
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
                        $MUsArr[currentGroupingIndex] = $currentSibling.add($MUsArr[currentGroupingIndex]);
                    }
                    else if ((num_centralElementsInCurrentSibling = $currentSibling.find(centralElementselector).length)) {
                        if (num_centralElementsInCurrentSibling === 1) {
                            if (!firstCentralElementFound) {
                                firstCentralElementFound = true;
                            }
                            else {
                                ++currentGroupingIndex;
                            }
                            $MUsArr[currentGroupingIndex] = $currentSibling.add($MUsArr[currentGroupingIndex]);
                        }
                        else { // >= 2
                            if (!firstCentralElementFound) {
                                firstCentralElementFound = true;
                            }
                            else {
                                ++currentGroupingIndex;
                            }

                            buildMUsAroundCentralElement($currentSibling);
                        }
                    }
                    else {
                        $MUsArr[currentGroupingIndex] = $currentSibling.add($MUsArr[currentGroupingIndex]);
                    }
                }
            }
        }; // end of function definition

        buildMUsAroundCentralElement($container);
    }

    processMUsArray($MUsArr);

//    if (parseInt($searchContainer.css('top')) >= 0) { // if search box is visible
//    ////if ($searchContainer.offset().top >= 0) { // if search box is visible
//        filterMUsArray($MUsArr);
//    }
    
//    if (!$MUsArr || !$MUsArr.length) {
//        console.warn("UnitsProj: No MUs were found based on the selector provided for this URL")
//        return;
//    }

    return $MUsArr;
};

/* Returns true if all constituent elements of $MU1 are contained within (the constituents) of $MU2, false
otherwise. (An element is considered to 'contain' itself and all its descendants)
*/
var MUContainedInAnother = function($MU1, $MU2) {

    var MU1Len = $MU1.length,
        MU2Len = $MU2.length;

    for (var i = 0; i < MU1Len; ++i) {

        var isThisConstituentContained = false; // assume

        for (var j = 0; j < MU2Len; ++j) {
            if ($MU2[j].contains($MU1[i])) {
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
 * process all MUs in $MUsArr does the following
1) remove any MU that is not visible in the DOM
2) remove any MU that is fully contained within another
 */
var processMUsArray = function($MUsArr) {

    if (!$MUsArr || !$MUsArr.length) {
        return;
    }

    var MUsArrLen = $MUsArr.length;

    for (var i = 0; i < MUsArrLen; ++i) {
        var $MU = $MUsArr[i];
        if ( (!$MU.is(':visible') && !$MU.hasClass('hiddenByMUsExtn')) || isMUInvisible($MU)) {
            $MUsArr.splice(i, 1);
            --MUsArrLen;
            --i;
            continue;
        }

        for (var j = 0; j < MUsArrLen; ++j) {
            if (i === j) {
                continue;
            }

            if (MUContainedInAnother($MU, $MUsArr[j])) {
                $MUsArr.splice(i, 1);
                --MUsArrLen;
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

    var headerData = urlData && urlData.page_miscUnits && urlData.page_miscUnits.std_header;
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
    updateMUsAndRelatedState();
    $searchContainer.$searchBox.blur();

    $searchContainer.css({top: -$searchContainer.outerHeight(true) + "px"});

}

// filters $MUsArr based on the text in the search box
function filterMUsArray($MUsArr) {

    if (!$MUsArr || !$MUsArr.length) {
        return;
    }

    // ** --------- PRE FILTERING --------- **
    var MUsNodes = [],
        MUsArrLen = $MUsArr.length;

    for (var i = 0; i < MUsArrLen; ++i) {
        var $MU = $MUsArr[i];
        MUsNodes = MUsNodes.concat($MU.get());
    }

    var $closestAncestor = $(closestCommonAncestor(MUsNodes));

    mutationObserver.disconnect(); // ** stop monitoring mutations **
    $closestAncestor.hide();
    removeHighlighting($closestAncestor);

    // ** --------- FILTERING --------- **
    var searchTextLowerCase = $searchContainer.$searchBox.val().toLowerCase();

    if (!searchTextLowerCase) {
        var $MUsHiddenByPriorFiltering = $closestAncestor.find('.hiddenByMUsExtn');
        $MUsHiddenByPriorFiltering.removeClass('hiddenByMUsExtn').show();

    }
    else {

        console.log('filtering invoked...');

        for (var i = 0, $MU; i < MUsArrLen; ++i) {
            $MU = $MUsArr[i];
            // if ($MU.text().toLowerCase().indexOf(searchTextLowerCase) >= 0) {
            if (highlightInMU($MU, searchTextLowerCase)) {

                //if ($MU.hasClass('hiddenByMUsExtn')) {

                $MU.show().removeClass('hiddenByMUsExtn');
                //}
            }
            else {
                //if ($MU.is(':visible')) {
                $MU.hide().addClass('hiddenByMUsExtn');
                $MUsArr.splice(i, 1);
                --MUsArrLen;
                --i;

                //}
            }
        }
    }

    // ** --------- POST FILTERING --------- **
    $closestAncestor.show();
    mutationObserver.observe(document, mutationObserverConfig); // ** start monitoring mutations **

}

// filters $MUsArr based on the text in the search box\
/*
function filterMUsArray($MUsArr) {

    if (!$MUsArr || !$MUsArr.length) {
        return;
    }

    // ** --------- PRE FILTERING --------- **
    var MUsNodes = [],
        MUsArrLen = $MUsArr.length;

    for (var i = 0; i < MUsArrLen; ++i) {
        var $MU = $MUsArr[i];
        MUsNodes = MUsNodes.concat($MU.get());
    }

    var $closestAncestor = $(closestCommonAncestor(MUsNodes));

    mutationObserver.disconnect(); // ** stop monitoring mutations **


    // ** --------- FILTERING --------- **
    var searchTextLowerCase = $searchContainer.$searchBox.val().toLowerCase();

    if (!searchTextLowerCase) {
//        var $MUsHiddenByPriorFiltering = $closestAncestor.find('.hiddenByMUsExtn');
//        $MUsHiddenByPriorFiltering.removeClass('hiddenByMUsExtn').show();

        $closestAncestor.hide();  // for efficiency: remove from the render tree first

        for (var i = 0; i < MUsArrLen; ++i) {
            var $MU = $MUsArr[i];
            if ($MU.data('hiddenByMUsExtn')) {
                $MU.show().data('hiddenByMUsExtn', false);
            }
        }

        removeHighlighting($closestAncestor);

        $closestAncestor.show();
    }

    else {

        console.log('filtering invoked...');

        for (var i = 0, $MU; i < MUsArrLen; ++i) {
            $MU = $MUsArr[i];
//            if ($MU.text().toLowerCase().indexOf(searchTextLowerCase) >= 0) {
            if (highlightInMU($MU, searchTextLowerCase)) {

                //if ($MU.hasClass('hiddenByMUsExtn')) {

//                $MU.removeClass('hiddenByMUsExtn');
                $MU.data('hiddenByMUsExtn', false);
                //}
            }
            else {
                //if ($MU.is(':visible')) {
//                $MU.addClass('hiddenByMUsExtn');
                $MU.data('hiddenByMUsExtn', true);


                //}
            }
        }
    }

    $closestAncestor.hide();  // for efficiency: remove from the render tree first
    for (var i = 0, $MU; i < MUsArrLen; ++i) {
        $MU = $MUsArr[i];
        if ($MU.data('hiddenByMUsExtn')) {
            $MU.hide();
            $MUsArr.splice(i, 1);
            --MUsArrLen;
            --i;
        }
        else {
            $MU.show();
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
    nextMU: ['j', '`', 'down'],
    prevMU: ['k', 'shift+`', 'up'],
    search: ['/', 'ctrl+shift+f', 'command+shift+f'],
    firstMU: ['^', 'alt+1'], // TODO: check if ding sound on alt can be zfixed
    lastMU: ['$', 'alt+9', 'alt+0'],
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
// selecting next/prev MU, etc.
function _setupGeneralShortcuts() {

    // true is redundant here; used only to illustrate this form of the function call
    bind(generalShortcuts.nextMU, selectNext, true);

    bind(generalShortcuts.prevMU, selectPrev);

    bind(generalShortcuts.search, showSearchBox);

    bind(generalShortcuts.firstMU, function(e) {
        selectMU(0, true);
    });

    bind(generalShortcuts.lastMU, function(e) {
        selectMU($MUsArray.length - 1, true);
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
* Sets up the shortcuts specified. Can be used to setup either page-specific or MU-specific shortcuts depending on
* whether the 'scope' passed is "page" or "MU".
    * @param scope
*/
function _setupUrlDataShortcuts(scope) {
    _setupMiscUnitsShortcuts(scope);
    _setupActionShortcuts(scope);
}

function _setupMiscUnitsShortcuts(scope) {
    var miscUnits;
    if (scope === "MU") {
        miscUnits = urlData.MUs.MU_miscUnits;
    }
    else {
        miscUnits = urlData.page_miscUnits;
    }
    if (miscUnits) {
        for (var key in miscUnits) {
            var miscUnit = miscUnits[key],
                kbdShortcuts = miscUnit.kbdShortcuts,
                selectors = miscUnit.specifier;

            if (selectors && kbdShortcuts) {
                bind(kbdShortcuts, _accessMiscUnit.bind(null, selectors, scope));
            }
        }
    }
}

function _setupActionShortcuts(scope) {
    var actions;
    if (scope === "MU") {
        actions = urlData.MUs.actions;
    }
    else {
        actions = urlData.actions;
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
    var $selectedMU = $MUsArray[selectedMUIndex];
    if (scope === "MU" && !$selectedMU) {
        return;
    }
    fn($selectedMU, document);
}

/**
 *
 * @param selectors
 * @param {string} scope Can be either "page" or "MU"
 */
function _accessMiscUnit(selectors, scope) {
    var $scope;

    if (scope === 'MU') {
        $scope =  $MUsArray[selectedMUIndex];
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

/**
 * Sets up the keyboard shortcuts.
 * Note: Because of the order in which shortcuts are set up, their priorities in case of a conflict are:
 * <browser-action-shortcuts> override <general-shortcuts> override <page-specific-shortcuts> override <MU-specific-shortcuts>
 * This order has been chosen since it favors consistency and hence minimizes confusion.
 */
function setupShortcuts() {
    // since setupShortcuts() is invoked every time URL changes, first reset shortcuts and any state associated with
    // "chrome alt hack"
    Mousetrap.reset();

    if (chromeAltHackNeeded) {
        chromeAltHack_accesskeysRemoved = [];
        altShortcutKeys = [];
        $topLevelContainer.find('.' + class_usedForChromeAltHack).remove();
    }

    if (urlData) {
        urlData.MUs && _setupUrlDataShortcuts("MU"); // MU shortcuts
        _setupUrlDataShortcuts("page"); // page shortcuts
    }
    _setupGeneralShortcuts();   // general shortcuts
    _setupBrowserActionShortcuts(); // browser action shortcuts
}

var onKeydown = function (e) {
    var code = e.which || e.keyCode,
        hasNonShiftModifier = e.altKey || e.ctrlKey|| e.metaKey,
        hasModifier = hasNonShiftModifier || e.shiftKey,
        $selectedMU = $MUsArray[selectedMUIndex],
        activeEl = document.activeElement || document.body;

    // On pressing TAB (or shift-tab): 
    // If a MU is selected, and no element of the page has focus, focus the 'main' element of the MU.
    if (code === 9 && !hasNonShiftModifier) { // TAB        
        if ($selectedMU && (activeEl === document.body))  {
            focusMainElement($selectedMU);
            suppressEvent(e);
        }
    }
    
    /* On pressing ESC:
     - When no MU is selected, blur the active element and select the "most sensible" MU
     - When a MU is selected
        - if an editable element is active (and hence single key shortcuts can't be used), blur the active element
        - else deselect the MU. (meaning that a selected MU will be deselected on at most a second 'Esc', if not
        the first)
    */
    else if (code === 27 && !hasModifier) { // ESC
        if (!$selectedMU) {
            activeEl.blur();
            var index = getEnclosingMUIndex(activeEl);
            if (index >= 0) {
                selectMU(index, true, true);
            }
            else {
                selectMostSensibleMU(true, true);
            }
        }
        else if (isElementEditable(activeEl)) {
            activeEl.blur();
        }
        else {
            deselectMU();
            dehoverMU();
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
//    if ( ($el = $(el)).data('enclosingMUJustSelected') ) {
//        $el.data('enclosingMUJustSelected', false);
//    }
//    else {
        var enclosingMUIndex = getEnclosingMUIndex(el);
        if (enclosingMUIndex >= 0 && enclosingMUIndex !== selectedMUIndex) {
            selectMU(enclosingMUIndex, false);
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
        $selectedMU = $MUsArray[selectedMUIndex],
        $overlaySelected = $selectedMU && $selectedMU.data('$overlay'),
        $hoveredMU = $MUsArray[hoveredMUIndex],
        $overlayHovered = $hoveredMU && $hoveredMU.data('$overlay'),
        indexToSelect;

    if ($overlaySelected && elementContainsPoint($overlaySelected, point)) {
        return;  // do nothing
    }
    else  if ($overlayHovered && elementContainsPoint($overlayHovered, point)) {
        indexToSelect = hoveredMUIndex;
    }
    else {
        indexToSelect = getEnclosingMUIndex(e.target);
    }

    if (indexToSelect >= 0) {
        selectMU(indexToSelect, false, false);
        var activeEl = document.activeElement,
            indexOf_MUContainingActiveEl = getEnclosingMUIndex(activeEl);

        if (indexOf_MUContainingActiveEl !== selectedMUIndex) {
            activeEl.blur();
        }
    }
    else {
        deselectMU(); // since the user clicked at a point not lying inside any MU, deselect any selected MU
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
    if ($MUsArray[hoveredMUIndex] &&
        ($overlayHovered = $MUsArray[hoveredMUIndex].data('$overlay')) &&
        (elementContainsPoint($overlayHovered, point))) {

        return ; // MU already has hovered overlay; don't need to do anything

    }

    var MUIndex = getEnclosingMUIndex(e.target);

    if (MUIndex >= 0) {

        hoverMU(MUIndex);
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
    if ($MUsArray[hoveredMUIndex] &&
        ($overlayHovered = $MUsArray[hoveredMUIndex].data('$overlay')) &&
        (!elementContainsPoint($overlayHovered, {x: e.pageX, y: e.pageY}))) {

        dehoverMU();

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

    dehoverMU();

    if (selectedMUIndex >= 0) {
        selectMU(selectedMUIndex, false, false, {onDomChangeOrWindowResize: true}); // to redraw the overlay
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
        var $MU = $overlay.data('$MU');

        if ($MU) {
            $MU.data('$overlay', null);
        }
        else {
            console.warn("UnitsProj: Unexpected - overlay's associated MU NOT found!");
        }

        $overlay.data('$MU', null);

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
            updateMUsAndRelatedState();
            return false;
        }
        else if (code === 9) { // Tab
            if ($MUsArray.length) {
                selectMU(0, true, true);
            }
            else {
                var $focusables = $document.find(focusablesSelector);
                if ($focusables.length) {
                    $focusables[0].focus();
                }
            }
            e.stopImmediatePropagation(); // otherwise the 'tab' is invoked on the MU, focusing the next element
            return false;
        }
    }

    // setting the time out below, in conjunction with the clearTimeout() earlier, allows search-as-you-type, while
    // not executing the search related code multiple times while the user is typing the search string.
    timeout_search = setTimeout (function() {

        updateMUsAndRelatedState();

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

    if ( globalSettings.selectMUOnLoad) {

        selectMostSensibleMU(true, false);
    }
}

function disableExtension() {

    dehoverMU();
    deselectMU();
    $MUsArray = [];
    $topLevelContainer.empty().remove();
    $lastSelectedMU = null;

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
            // the following line should remain outside the if condition so that the change from a url with MUs
            // to one without any is correctly handled
            updateMUsAndRelatedState();
            setupShortcuts();
            setupHelpUIAndEvents();

            if ( globalSettings.selectMUOnLoad) {
                selectMostSensibleMU(true, false);
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


