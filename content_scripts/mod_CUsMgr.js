// See _readme_module_template.js for module conventions


_u.mod_CUsMgr = (function($, mod_basicPageUtils, mod_domEvents, mod_keyboardLib, mod_mutationObserver, mod_filterCUs,
                          mod_help, mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_context,
                          mod_smoothScroll, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        $getSelectedCU: $getSelectedCU,
        updateCUsAndRelatedState: updateCUsAndRelatedState,
        selectNext: selectNext,
        selectPrev: selectPrev,
        selectFirst: selectFirst,
        selectLast: selectLast,
        getAllCUs: getAllCUs
    });

    /*-- Module implementation --*/

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

    var
        CUs_filtered = [], /* An array of jQuery sets. The array represents the *sequence* of CUs on the current page.
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

        // the set of *all* CUs. NOTE: In most (but not all) cases, you would want to use `CUs_filtered` instead, so
        // please be careful.
        CUs_all = [],

        selectedCUIndex  = -1, // Index of the selected CU in CUs_filtered
        hoveredCUIndex  = -1, // Index of the hovered CU in CUs_filtered

        //container for elements created by this program that we add to the page's DOM.
        $topLevelContainer = _u.$topLevelContainer,

        // This class should be applied to all elements added by this extension.
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,

        class_CUOverlay = CONSTS.class_CUOverlay,                     // class applied to all CU overlays
        class_CUSelectedOverlay = CONSTS.class_CUSelectedOverlay,    // class applied to overlay on a selected CU
        class_CUHoveredOverlay = CONSTS.class_CUHoveredOverlay,      // class applied to overlay on a hovered CU

    // to enable reusing existing unused overlays. this is used only to prevent leaking memory by creating new overlays
    // without properly discarding the ones no longer in use. TODO: dispose of unused ones properly, so that this is not needed
        $unusedOverlaysArray = [],

    // boolean, holds a value indicating where the css specifies a transition style for overlays
        overlayCssHasTransition,

        $document = $(document),    // cached jQuery object
        body,
        $body,                      // cached jQuery object

        rtMouseBtnDown,         // boolean holding the state of the right mouse button
//        ltMouseBtnDown,         // boolean holding the state of the left mouse button
        scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

        $lastSelectedCU = null,   // to store a reference to the last selected CU

    // last invoked time ("lit") for selectCU or deselectCU. If a CU is currently selected, this stores the time it was 
    // selected, else this stores the time the last selected CU was deselected.
        lit_CUSelectOrDeselect,

    // number of milliseconds since its last selection/deselection after which a CU is no longer deemed to be
    // selected/last-selected, IF it is not in the viewport
        selectionTimeoutPeriod = 60000,

        interval_updateCUsTillDomReady,
        CUsFoundOnce,

//        $commonCUsAncestor, // closest common ancestor of the CUs

        lit_updateCUsEtc, // last invoked time ("lit") of updateCUsEtc_onMuts()
        timeout_updateCUs,
        
        // to enable "grouped" handing of mutations deemed non-essential (in heavy sites, a lot of dom mutations
        // are generated; handling all of them instantly slows down performance on heavy sites like facebook, esp.
        // when invoking filtering which often leads to the page fetching new content from the server continuously)  
        maxDelay_nonImportantMuts = 333,

        // This is checked for height changes on DOM mutations since that's a good indication that the CUs on the page 
        // have changed. We take this to be the element with the highest scrollHeight. Usually this is the body.
        mainContainer,
        mainContainer_prevScrollHeight,
        mainContainer_prevScrollWidth,

    // the following are set during setup(); most are sub-objects of expandedUrlData but we store global references
        // to avoid having to read them each time there a DOM change and things need to be redrawn etc.
        miscSettings,
        expandedUrlData,
        CUsSpecifier,
        CUsSelector,    // holds a value if CUs are specified directly using a selector
        mainElementSelector, // selector for main element of a CU, if specified
        headerSelector,
        CUStyleData,
        CUsShortcuts,

        lit_selectCU,    // last invoked time ("lit") for _selectCU()
        minInterval_selectCU = 70,

        smoothScroll = mod_smoothScroll.smoothScroll,

        timeout_applyHoveredOverlay,
        // these are used to check against inadvertent mouse over events that fire simply due to the page scroll
        last_mouseScreenX,
        last_mouseScreenY;

    function reset() {
        dehoverCU();
        deselectCU();
        CUs_filtered = CUs_all = [];   // these can point to the same array at this point
        mod_context.setCUSelectedState(false);
        mod_context.setCUsCount(0);

        lit_updateCUsEtc = lit_selectCU = lit_CUSelectOrDeselect = 0;
        timeout_updateCUs = false;
        CUsFoundOnce = false;
        thisModule.stopListening();
    }

    function setup(settings) {
        if (! (settings.expandedUrlData && settings.expandedUrlData.CUs_specifier)) {
            return;     // this module is not setup if there is no CUs_specifier in the urlData
        }

        // we need the body to exist before we can set overlayCssHasTransition
        if (!document.body) {
            setTimeout(setup.bind(null, settings), 100);
            return;
        }

        reset();

        // This is required before we call setupEvents();
        overlayCssHasTransition = checkOverlayCssHasTransition();
        body = document.body;
        $body = $(body);

        mainContainer = document.body;  // assume this to be the body for now

        var tmp;
        // assign from `settings` to global variables
        miscSettings = settings.miscSettings;
        expandedUrlData = settings.expandedUrlData;
        CUsSpecifier = expandedUrlData.CUs_specifier;
        CUsSelector = CUsSpecifier.selector;
        mainElementSelector = (tmp = expandedUrlData.CUs_SUs) && (tmp = tmp.std_mainEl) && tmp.selector;
        headerSelector = (tmp = expandedUrlData) && (tmp = tmp.page_SUs) && (tmp = tmp.std_header) && tmp.selector;
        CUStyleData = expandedUrlData.CUs_style;
        CUsShortcuts = settings.CUsShortcuts;

        setupEvents();
        
        if (mod_filterCUs) {
            thisModule.listenTo(mod_filterCUs, 'filter-text-change', onFilterTextChange);
            thisModule.listenTo(mod_filterCUs, 'tab-on-filter-search-box', onTabOnFilterSearchBox);
            thisModule.listenTo(mod_filterCUs, 'filter-UI-close', onFilterUIClose);
        }
        
        // Before dom-ready there are continuous dom-changes. If we updateCUs in response to each
        // of them, there is a flickering in the selected overlay. So we use a spaced polling
        // to update CUs initally, setting up handlers for dom mutations only once dom is ready.
        // selected overlay if we process all those dom changes, which in turn  
        interval_updateCUsTillDomReady = setInterval(updateCUsAndRelatedState, 100);
        $(onDomReady);
    }

    function bindMutationEvents() {

        // NOTE: *Important* Keep in mind that the first mutation handler to execute that calls mod_mutationObserver.disable()
        // will prevent any queued mutation observer event in any other mutation observer from triggering.
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onMutations_fallback);
        
        // this event signifies mutations ONLY on the "top level" CU element(s). Since these aren't going
        // to occur too often, but might include the CU top level element being "hidden" etc, we handle 
        // them immediately.
        // Note: Since what we consider a CU (based on the selector etc), and what the actual "CU" for the 
        // page is might be slightly different (since one might be enclosed inside the other etc),
        // we can't rely too much on the distinction between 'selectedCUTopLevelMuts', 'selectedCUDescendantMuts' 
        // and 'CUsAncestorsMuts'. Hence as a fallback, they should all update the CUs state within a short period.
        // At the same time, we can treat slightly  differently with the hope that on most websites they
        // will indeed be distinct in the way we hope, thereby giving us a slight performance boost.
        thisModule.listenTo(mod_mutationObserver, 'selectedCUTopLevelMuts', onSelectedCUTopLevelMuts);
        thisModule.listenTo(mod_mutationObserver, 'CUsAncestorsMuts', handleBasedOnLastCUPosition);
        thisModule.listenTo(mod_mutationObserver, 'selectedCUDescendantsMuts', updateOverlays_and_delayedUpdateCUs);

    }

    function onDomReady() {
        clearInterval(interval_updateCUsTillDomReady);
        bindMutationEvents();
        mainContainer  = getMainContainer();
    }

    function getMainContainer() {
        var _mainContainer;
        if (CUs_all.length) {
            var $CU = CUs_all[Math.floor(CUs_all.length/2)]; // use the middle CU
            var ancestors = $CU.parents().get(),
                max = -1,
                length = ancestors.length;

            for (var i = 0; i < length; i++) {
                var current = ancestors[i];
                if (current.scrollHeight > max) {
                    max = current.scrollHeight;
                    _mainContainer = current;
                }
            }
        }
        return _mainContainer || document.body;
    }

    function $getSelectedCU() {
        return CUs_filtered[selectedCUIndex];
    }

    /**
     * Selects the CU specified.
     * @param {number|jQuery} CUOrItsIndex Specifies the CU. Should either be the JQuery object representing the CU
     * or its index in CUs_filtered
     * Can be an integer that specifies the index in CUs_filtered or a jQuery object representing the CU.
     * (While performance isn't a major concern here,) passing the index is preferable if it is already known,
     * otherwise the function will determine it itself (in order to set the selectedCUIndex variable).
     * @param {boolean} setFocus If true, the "main" element for this CU, if one is found, is
     * focused.
     * @param {boolean} [adjustScrolling] If true, document's scrolling is adjusted so that
     * all (or such much as is possible) of the selected CU is in the viewport. Defaults to false.
     */
    function selectCU(CUOrItsIndex, setFocus, adjustScrolling) {
        var now = Date.now();
        if (now - lit_selectCU > minInterval_selectCU) {
            lit_selectCU = now;
            var disabledByMe = mod_mutationObserver.disable();
            _selectCU(CUOrItsIndex, setFocus, adjustScrolling);
            disabledByMe && mod_mutationObserver.enable();
        }
    }

    // only meant to be called from within selectCU()
    function _selectCU(CUOrItsIndex, setFocus, adjustScrolling) {

//        console.log('selectCU() called. CUOrItsIndex: ', CUOrItsIndex);
        var $CU,
            indexOf$CU; // index in CUs_filtered

        if (typeof CUOrItsIndex === "number") {
            indexOf$CU = CUOrItsIndex;
            $CU = CUs_filtered[indexOf$CU];
        }
        else {
            $CU = CUOrItsIndex;
            indexOf$CU = findCUInArray($CU, CUs_filtered);
        }

        if (!$CU) {
            return;
        }

        deselectCU(); // before proceeding, deselect currently selected CU, if any
        selectedCUIndex = indexOf$CU;
        var $overlaySelected = showOverlay($CU, 'selected');
        dehoverCU(); // since the hover overlay is only an aid to select CUs, it can be removed now

        if (!$overlaySelected) {
            console.warn('UnitsProj: no $overlay returned by showOverlay');
        }

        mod_context.setCUSelectedState(true);


        mod_mutationObserver.enableFor_selectedCUAndDescendants($CU);

        $lastSelectedCU = $CU;
        lit_CUSelectOrDeselect = Date.now();

        if (adjustScrolling) {
            scrollCUIntoView($overlaySelected);
        }

        if (setFocus) {
            focusMainElement($CU);
        }

        if (miscSettings.increaseFontInSelectedCU && !$CU.data('fontIncreasedOnSelection')) {
            increaseFont($CU);
            $CU.data('fontIncreasedOnSelection', true);
        }

        var fn_onCUSelection, temp;
        if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUSelection) && (fn_onCUSelection = temp.fn)) {
            fn_onCUSelection($CU, document, $.extend(true, {}, expandedUrlData));
        }
    }

    /**
     * Deselects the currently selected CU, if no CU is specified, else deselects the specified one. Is normally meant
     * to be called *WITHOUT* supplying any argument. (however as a special case, updateCUsAndRelatedState() needs to call
     * it passing the CU.
     * @param [$CU]
     */
    function deselectCU($CU) {
        var disabledByMe = mod_mutationObserver.disable();
        _deselectCU($CU);
        disabledByMe && mod_mutationObserver.enable();
    }

    // only meant to be called from within deselectCU()
    function _deselectCU(_$CU) {

        var $CU = _$CU || CUs_filtered[selectedCUIndex];
        if ($CU) {

            // console.log('deselecting CU...');
            removeOverlay($CU, 'selected');

            lit_CUSelectOrDeselect = Date.now();

            if ($CU.data('fontIncreasedOnSelection')) {
                decreaseFont($CU);
                $CU.data('fontIncreasedOnSelection', false);
            }

            var fn_onCUDeselection, temp;
            if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUDeselection) && (fn_onCUDeselection = temp.fn)) {
                fn_onCUDeselection($CU, document, $.extend(true, {}, expandedUrlData));
            }
        }
        selectedCUIndex = -1;
        mod_context.setCUSelectedState(false);
    }

    // returns a jQuery set composed of all focusable DOM elements contained in the
    // jQuery set ($CU) passed
    function $getContainedFocusables($CU) {
        var $allElements = $CU.find('*').addBack();
        return $allElements.filter(CONSTS.focusablesSelector);
    }

    /**
     * Returns the "main" element in the specified $CU. This is determined using the "std_mainEl" SU specified in the expandedUrlData.
     * If no std_mainEl is specified, this function simply returns the first focusable element in the $CU
     *
     * @param $CU
     * @return {HtmlElement} Returns the "main" element, if one was found, else null.
     */
    function getMainElement($CU) {

        var $containedFocusables = $getContainedFocusables($CU);

        if (!$containedFocusables.length) {
            return null;
        }

        var $filteredFocusables;

        if (mainElementSelector && ($filteredFocusables = $containedFocusables.filter(mainElementSelector)) &&
            $filteredFocusables.length) {

            return $filteredFocusables[0];
        }
        else {
            return $containedFocusables[0];
        }
    }

    // Focuses the "main" focusable element in a CU, if one can be found.
    // See function "getMainElement" for more details.
    function focusMainElement($CU) {
        var mainEl = getMainElement($CU);
        if (mainEl) {
//        $(mainEl).data('enclosingCUJustSelected', true);
            mainEl.focus();
        }
        else {
            document.activeElement.blur();
        }
    }

    /**
     * Removes the 'selected' or 'hovered' css class from the CU's overlay, as specified by 'type'. If both classes
     * have been removed, recycles the overlay.
     * @param $CU
     * @param {string} type Can be 'selected' or 'hovered'
     */
    function removeOverlay($CU, type) {
        var disabledByMe = mod_mutationObserver.disable();
        _removeOverlay($CU, type);
        disabledByMe && mod_mutationObserver.enable();
    }

    // meant to be called only by removeOverlay()
    function _removeOverlay ($CU, type) {
        var $overlay = $CU.data('$overlay');

        if ($overlay) {
            $overlay.removeClass(type === 'selected'? class_CUSelectedOverlay: class_CUHoveredOverlay);

            if (!overlayCssHasTransition) { // else it is handled in onTransitionEnd()
                tryRecycleOverlay($overlay);
            }
        }
        else {
            console.warn('UnitsProj: no $overlay found');
        }
    }

    /**
     * Displays the specified type of overlay (selected/hovered) for the CU specified and returns it (as a jQuery
     * wrapped object)
     * @param $CU
     * @param {string} type Can be 'selected' or 'hovered'
     * @return {*} the jQuery wrapper of the overlay element
     */
    function showOverlay($CU, type) {
        var disabledByMe = mod_mutationObserver.disable();
        var $overlay = _showOverlay($CU, type);
        disabledByMe && mod_mutationObserver.enable();
        return $overlay;
    }

    // meant to be called only by showOverlay()
    function _showOverlay($CU, type) {
        var $overlay = $CU.data('$overlay');
        if (!$overlay || !$overlay.length) {
            if ($unusedOverlaysArray.length) {
                $overlay = $unusedOverlaysArray.shift();
            }
            else {
                $overlay = $('<div></div>').addClass(class_CUOverlay).addClass(class_addedByUnitsProj);
            }
        }

        var overlayPadding;
        $overlay.data('$CU', $CU);
        $CU.data('$overlay', $overlay);

        // position the overlay above the CU, and ensure that its visible
        $overlay.css(getBoundingRectangle($CU)).show();

        if (CUStyleData && (overlayPadding = CUStyleData.overlayPadding)) {
            /*
             * Steps:
             * 1. Apply the specified padding to the overlay.
             * 2. Re-adjust the position (top, left) of the overlay taking into account the set top and left padding.
             * 3. Get the dimensions of the element including the padding. Lets call these values totalHeight and totalWidth.
             * 4. Set the padding of the overlay to 0.
             * 5. Set the height and width of the overlay to totalHeight and totalWidth.
            */

            /* Reason for this strangeness:
             * 1. We want to let users specify the overlay padding as is normally done in CSS.
             * 2. At the same time, we don't want the overlay to * actually * have any padding. For the triangle markers
             * (that we insert inside the overlay) to stick to the corners of the overlay, it is best if the overlay does
             * not have any padding.
             */
            $overlay.css("padding", overlayPadding);

            $overlay.css("top", parseFloat($overlay.css("top")) -
                parseFloat($overlay.css("padding-top")));

            $overlay.css("left", parseFloat($overlay.css("left")) -
                parseFloat($overlay.css("padding-left")));

            var overlayFinalHeight = $overlay[0].clientHeight,
                overlayFinalWidth = $overlay[0].clientWidth;

            $overlay.css("padding", 0);
            $overlay.height(overlayFinalHeight);
            $overlay.width(overlayFinalWidth);
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
    }

    /**
     * Shows as hovered the CU specified.
     * @param {number|jQuery} CUOrItsIndex Specifies the CU.
     * Can be an integer that specifies the index in CUs_filtered or a jQuery object representing the CU.
     * (While performance isn't a major concern,) passing the index is preferable if it is already known.
     */
    function hoverCU(CUOrItsIndex) {
        var $CU,
            indexOf$CU; // index in CUs_filtered

        if (typeof CUOrItsIndex === "number") {
            indexOf$CU = CUOrItsIndex;
            $CU = CUs_filtered[indexOf$CU];
        }
        else {
            $CU = $(CUOrItsIndex);
            indexOf$CU = findCUInArray($CU, CUs_filtered);
        }

        if (!$CU) {
            return;
        }

        dehoverCU(); // before proceeding, dehover currently hovered-over CU, if any
        hoveredCUIndex = indexOf$CU;
        showOverlay($CU, 'hovered');
    }

    /**
     * Dehovers the currently hovered (over) CU, if there is one
     */
    function dehoverCU() {
        var $CU = CUs_filtered[hoveredCUIndex];
        if ($CU) {
            removeOverlay($CU, 'hovered');
        }
        hoveredCUIndex = -1;
    }

    /**
     * Scrolls more of the specified CU into view if required (i.e. if the CU is too large),
     * in the direction specified.
     * @param {jQuery} $CU
     * @param {string} direction Can be either 'up' or 'down'
     * @return {Boolean} value indicating whether scroll took place
     */
    function scrollCUIfRequired ($CU, direction) {

        var pageHeaderHeight,
        // for the window:
            winTop = body.scrollTop,
            winBottom,
        // for the CU
            boundingRect = getBoundingRectangle($CU),
            CUTop = boundingRect.top,
            CUBottom;

        if (direction === 'up') {
            pageHeaderHeight = getEffectiveHeaderHeight();
            if (CUTop < winTop + pageHeaderHeight) {
                mod_basicPageUtils.scroll('up', body);
                return true;
            }
        }
        else { // direction === 'down'
            winBottom = winTop + window.innerHeight;
            CUBottom = CUTop + boundingRect.height;
            if (CUBottom > winBottom) {
                mod_basicPageUtils.scroll('down', body);
                return true;
            }
        }
        return false;
    }

    /**
     * Selects the previous CU to the currently selected one.
     */
    function selectPrev () {
        var disabledByMe = mod_mutationObserver.disable();
        _selectPrev();
        disabledByMe && mod_mutationObserver.enable();
    }
    function _selectPrev () {
        if (!CUs_filtered.length) {
            mod_basicPageUtils.scroll("up", body);
        }
        else if (CUs_filtered.length === 1) {
            if (selectedCUIndex === -1) {
                _selectCU(0, true, true);
            }
            else {
                mod_basicPageUtils.scroll("up", body);
            }
        }
        else { // >= 2 CUs
            var $selectedCU = CUs_filtered[selectedCUIndex];
            if ($selectedCU) {
                if (isAnyPartOfCUinViewport($selectedCU)) {
                    if (miscSettings.sameCUScroll && scrollCUIfRequired($selectedCU, 'up')) {
                        return;
                    }
                    else {
//                        for (var i = selectedCUIndex-1; i >= 0; i--) {
//                            if (!isCUInvisible(CUs_filtered[i])) {
//                                selectCU(i, true, true);
//                                return;
//                            }
//                        }
                        var newIndex = selectedCUIndex - 1;
                        if (newIndex >= 0) {
                            selectCU(newIndex, true, true);
                        }
                        else {
                            mod_basicPageUtils.scroll("up", body);
                        }
                    }
                }
                else if (Date.now() - lit_CUSelectOrDeselect < selectionTimeoutPeriod) {
                    scrollCUIntoView($selectedCU.data('$overlay'));
                }
                else {
                    selectFirstCUInViewport(true, true);
                }
            }
            else {
                selectMostSensibleCU(true, true);
            }
        }
    }

    /**
     * Selects the next CU to the currently selected one.
     */
    function selectNext() {
        var disabledByMe = mod_mutationObserver.disable();
        _selectNext();
        disabledByMe && mod_mutationObserver.enable();
    }
    function _selectNext() {
        if (!CUs_filtered.length) {
            mod_basicPageUtils.scroll("down", body);
        }
        else if (CUs_filtered.length === 1) {
            if (selectedCUIndex === -1) {
                _selectCU(0, true, true);
            }
            else {
                mod_basicPageUtils.scroll("down", body);
            }
        }
        else { // >= 2 CUs
            var $selectedCU = CUs_filtered[selectedCUIndex];
            if ($selectedCU) {
                if (isAnyPartOfCUinViewport($selectedCU)) {
                    if (miscSettings.sameCUScroll && scrollCUIfRequired($selectedCU, 'down')) {
                        return;
                    }
                    else {
//                        var len = CUs_filtered.length;
//                        for (var i = selectedCUIndex+1; i < len; i++) {
//                            if (!isCUInvisible(CUs_filtered[i])) {
//                                selectCU(i, true, true);
//                                return;
//                            }
//                        }
                        var newIndex = selectedCUIndex + 1;
                        if (newIndex < CUs_filtered.length) {
                            selectCU(newIndex, true, true);
                        }
                        else {
                            mod_basicPageUtils.scroll("down", body);
                        }
                    }
                }
                else if (Date.now() - lit_CUSelectOrDeselect < selectionTimeoutPeriod) {
                    scrollCUIntoView($selectedCU.data('$overlay'));
                }
                else {
                    selectFirstCUInViewport(true, true);
                }
            }
            else {
                selectMostSensibleCU(true, true);
            }
        }
    }

    function selectFirst(setFocus, adjustScrolling) {
//        var len = CUs_filtered.length;
//        for (var i = 0; i < len; i++) {
//            if (!isCUInvisible(CUs_filtered[i])) {
//                selectCU(i, setFocus, adjustScrolling);
//                return;
//            }
//        }
        selectCU(0, setFocus, adjustScrolling);
    }
    function selectLast(setFocus, adjustScrolling) {
//        for (var i = CUs_filtered.length - 1; i >= 0; i--) {
//            if (!isCUInvisible(CUs_filtered[i])) {
//                selectCU(i, setFocus, adjustScrolling);
//                return;
//            }
//        }
        selectCU(CUs_filtered.length - 1, setFocus, adjustScrolling);
    }

    /**
     * Selects the most "sensible" CU depending on various parameters...
     */
    function selectMostSensibleCU(setFocus, adjustScrolling) {

        var lastSelectedCUIndex;

        // if a CU is already selected AND (is present in the viewport OR was selected only recently)...
        if (selectedCUIndex >= 0 &&
            (isAnyPartOfCUinViewport(CUs_filtered[selectedCUIndex]) ||
                Date.now() - lit_CUSelectOrDeselect < selectionTimeoutPeriod)) {


            //...call selectCU() on it again passing on the provided parameters
            selectCU(selectedCUIndex, setFocus, adjustScrolling);
        }
        // if last selected CU exists AND (is present in the viewport OR was deselected only recently)...
        else if ( (lastSelectedCUIndex = findCUInArray($lastSelectedCU, CUs_filtered)) >=0 &&
            (isAnyPartOfCUinViewport($lastSelectedCU) ||
                Date.now() - lit_CUSelectOrDeselect < selectionTimeoutPeriod) ) {

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

        if (CUs_filtered && CUs_filtered.length) {
            var winTop = body.scrollTop,
                CUsArrLen = CUs_filtered.length;

            for (var i = 0; i < CUsArrLen; ++i) {
                if (isAnyPartOfCUinViewport(CUs_filtered[i])) {
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
     * If the specified element exists within a CU, the index of that CU in CUs_filtered is
     * returned, else -1 is returned.
     * @param {HtmlElement|jQuery} element DOM element or its jQuery wrapper
     * @return {number} If containing CU was found, its index, else -1
     */
    function getEnclosingCUIndex(element) {
        var $element = $(element),
            CUsArrLen = CUs_filtered.length;

        for (var i = 0; i < CUsArrLen; ++i) {
            if (CUs_filtered[i].is($element) || CUs_filtered[i].find($element).length) {
                return i;
            }
        }

        return -1;
    }

    function onTabOnFilterSearchBox() {
        if (CUs_filtered.length) {
            selectFirst(true, true);
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

    /**
     * This will find and return the index of the passed jQuery set ($CU) in the CUs_filtered. However, unlike JavaScript's
     * Array#indexOf() method, a match will be found even if the passed jQuery set is "equivalent" (i.e has the same
     * contents) to a member of the CUs array, even if they are not the *same* object.
     * Returns -1 if not found.
     * @param {jQuery} $CU
     * @param {Array} CUs
     * @param {number} [suggestedIndex] If provided, we match against this first (for better performance)
     * @returns {number} The index of $CU in CUs if found, else -1
     */
    function findCUInArray($CU, CUs, suggestedIndex)  {

        if (suggestedIndex && areCUsSame($CU, CUs[suggestedIndex])) {
            return suggestedIndex;
        }

        var len;

        if (CUs && (len = CUs.length)) {

            for (var i = 0; i < len; ++i) {
                if (areCUsSame($CU, CUs[i])) {
                    return i;
                }
            }
        }

        return -1;
    }

// returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
// instances where we use this function, the order of elements is always the document order)
    /**
     * returns a boolean indicating if the passed CUs (jQuery sets) have the same contents in the same order (for
     * instances where we use this function, the order of elements is always the document order)
     * @param $1 A CU
     * @param $2 Another CU to compare with the first one.
     * @return {Boolean}
     */
    function areCUsSame($1, $2) {

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
    }

// returns a bounding rectangle for $CU
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    function getBoundingRectangle($CU) {

        var elements = [];

        if (CUStyleData && CUStyleData.useInnerElementsToGetOverlaySize) {
            var allDescendants = $CU.find('*');

            if (allDescendants.length) {
                var $innermostDescendants = allDescendants.filter(function() {
                    if (!($(this).children().length)) {
                        return true;
                    }
                });
                elements = $innermostDescendants.get();
            }
            else {
                elements = $CU.get();
            }
        }

        else {
            elements = $CU.get();
        }
        return getBoundingRectangleForElements(elements);
    }

    function isElementVisible(el) {

//        var $el = $(el);
//        return $el.is(':visible') && $el.css('visibility') !== "hidden";

        //NOTE: ussing the jquery eqivalent especially .is(':visible') was found to be comparatively slower
        return el.offsetHeight && el.offsetWidth &&
            document.defaultView.getComputedStyle(el).getPropertyValue("visibility") !== "hidden";

    }

// returns a bounding rectangle for the set (array) of DOM elements specified
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    function getBoundingRectangleForElements(elements) {

        if (!elements || !elements.length)
            return;

        var el, $el, offset;
        if (elements.length === 1) {
            el = elements[0];
            $el = $(el);
            offset = $el.offset();
            return {
                top: offset.top,
                left: offset.left,
                width: el.offsetWidth,
                height: el.offsetHeight,
            };
        }

        // x1, y1 => top-left. x2, y2 => bottom-right.
        // for the bounding rectangle:
        var x1 = Infinity,
            y1 = Infinity,
            x2 = -Infinity,
            y2 = -Infinity;

        var len = elements.length;
        for (var i = 0; i < len; i++) {
            el = elements[i];
            $el = $(el);
            var elPosition = el.style.position;

            // ignore elements that are out of normal flow or hidden/invisible
            if (elPosition === "fixed" || elPosition === "absolute" || /*|| elPosition === "relative"*/
                !isElementVisible(el)) {
                continue;
            }

            offset = $el.offset();

            // for the current element:
            var _x1, _y1, _x2, _y2;

            _x1 = offset.left;
            _y1 = offset.top;
            _x2 = _x1 + el.offsetWidth;
            _y2 = _y1 + el.offsetHeight;

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
    }

    /**
     * Scrolls the window such the specified element lies fully in the viewport (or as much as is
     * possible if the element is too large).
     * //TODO3: consider if horizontal scrolling should be adjusted as well (some sites sites, like an image gallery,
     * might have CUs laid out horizontally)
     * @param {jQuery} $CUOverlay
     */
    function scrollCUIntoView($CUOverlay) {

        if (!$CUOverlay || !$CUOverlay.length) {
            return;
        }

        var // for the window:
            winTop = body.scrollTop,
        // winHeight = $(window).height(), // this doesn't seem to work correctly on news.ycombinator.com
            winHeight = window.innerHeight,
            winBottom = winTop + winHeight,

        // for the element:
            elTop = $CUOverlay.offset().top,
            elHeight = $CUOverlay.height(),
            elBottom = elTop + elHeight;

        var newWinTop, // once determined, we will scroll the window top to this value
            margin = 10;

        var pageHeaderHeight = getEffectiveHeaderHeight();

        if (!miscSettings.keepSelectedCUCentered &&
            (elTop > winTop + pageHeaderHeight + margin && elBottom < winBottom - margin)) { // CU is fully in viewport

            return false;
        }
        else {
            // center the element based on this equation equating the space left in the (visible part of the) viewport above
            // the element to the space left below it:
            // elTop - (newWinTop + pageHeaderHeight) = newWinBottom - elBottom = newWinTop + winHeight - elBottom
            // (substituting (newWinTop + winHeight) for newWinBottom)
            newWinTop = (elTop + elBottom - winHeight +  - pageHeaderHeight)/2;

            newWinTop += 50; // now shift shightly upwwards to make it closer to the top than bottom; looks nicer

            if (elTop < newWinTop + pageHeaderHeight + margin ) {
                newWinTop = elTop - pageHeaderHeight - margin;
            }
        }

        if (miscSettings.animatedCUScroll) {
            var animationDuration = Math.min(miscSettings.animatedCUScroll_MaxDuration,
                Math.abs(newWinTop-winTop) / miscSettings.animatedCUScroll_Speed);

            smoothScroll(body, newWinTop, animationDuration);
        }
        else {
            body.scrollTop = newWinTop;
        }
    }

    function getJQueryWrapper(x) {
        return $(x);
    }
   
    function onUpdatingCUs() {

        if (!document.contains(mainContainer)) {
            mainContainer  = getMainContainer();
        }
        mainContainer_prevScrollHeight = mainContainer.scrollHeight;
        mainContainer_prevScrollWidth = mainContainer.scrollWidth;

        if (CUs_all.length) {
            // Use the selected CU. If there isn't one, use the middle CU (it's okay if we miss out some ancestors, since
            // we have a fallback mutation observer as well)
            var $CU = CUs_filtered[selectedCUIndex] || CUs_all[Math.floor(CUs_all.length/2)];
            mod_mutationObserver.enableFor_CUsAncestors($CU.parents());
        }
    }

    // updates the overlays of selected and hovered overlays
    function updateCUOverlays() {
        var disabledByMe = mod_mutationObserver.disable();
        _updateCUOverlays();
        disabledByMe && mod_mutationObserver.enable();
    }

    // (meant to be called only be updateCUOverlays)
    function _updateCUOverlays() {
        var $CU = CUs_filtered[selectedCUIndex];
        $CU &&  showOverlay($CU, "selected");

        $CU = CUs_filtered[hoveredCUIndex];
        $CU &&  showOverlay($CU, "hovered");
    }

    function onFilterTextChange() {
        dehoverCU();
        deselectCU();
        CUs_filtered = mod_filterCUs.applyFiltering(CUs_all, true);
        miscSettings.selectCUOnLoad && selectFirst(false, false);
    }

    function onFilterUIClose() {
        var $CUToSelect = CUs_filtered[selectedCUIndex];
        dehoverCU();
        deselectCU();
        CUs_filtered = CUs_all;

        if ($CUToSelect) {
            var index = findCUInArray($CUToSelect, CUs_filtered);
            if (index >= 0) {
                // if filtering search box has been closed, focus should be set on the CU
                selectCU(index, true, true);
            }
        }
        else if (miscSettings.selectCUOnLoad){
            selectFirst(true, true);
        }
    }

    /**
     * Sets/updates the global variables CUs_filtered and CUs_all and other related state. Called once on dom-ready,
     * thereafter whenever the CUs need to be updated based on DOM changes
     */
    function updateCUsAndRelatedState() {
        var disabledByMe = mod_mutationObserver.disable();
        _updateCUsAndRelatedState();
        onUpdatingCUs();
        disabledByMe && mod_mutationObserver.enable();
    }

    // meant to be called by updateCUsAndRelatedState()
    function _updateCUsAndRelatedState() {
        // Save the currently selected CU, to reselect it, if it is still present in the CUs_filtered after the array is
        // updated. This needs to be done before calling deselectCU() and modifying the current CUs_filtered
        var $prevSelectedCU = CUs_filtered[selectedCUIndex],
            prevSelectedIndex = selectedCUIndex;

        // we don't call deselectCU() instead because we want to reserve that for actual CU deselections, instead
        // of calling it every time DOM changes. 
        selectedCUIndex = -1;

        // useful to prevent a "ghost" hover overlay (plus it is okay if hovered overlay goes away occasionally as long 
        // as it comes back when the user moves the mouse to over to a new element)
        dehoverCU();

        CUs_filtered = CUs_all = getValidCUs();
        thisModule.trigger("CUs-all-change");

        if (mod_filterCUs.isActive()) {
            CUs_filtered = mod_filterCUs.applyFiltering(CUs_all, false);
        }

        mod_context.setCUsCount(CUs_filtered.length);   // do this after filtering is applied

        // if this is the first time CUs were found...
        if (!CUsFoundOnce && CUs_filtered.length) {
            CUsFoundOnce = true;
            if ( miscSettings.selectCUOnLoad) {
                selectMostSensibleCU(true, false);
            }
            mainContainer  = getMainContainer();
        }

        // on updating the CUs after a dom-change:
        // if a CU was previously selected
        //  - if it still exists the CUs_filtered, it should remain selected
        //  - if it no longer exists in CUs_filtered
        //      - deselect it
        //      - if the option `selectCUOnLoad` is true, select a sensible CU,
        // if no CU was selected (perhaps the user pressed `Esc` earlier), don't select any CU, i.e. nothing needs to be done
        else if ($prevSelectedCU) {
            if (CUs_filtered && CUs_filtered.length) {
                var newSelectedCUIndex;

                    if ((newSelectedCUIndex = findCUInArray($prevSelectedCU, CUs_filtered, prevSelectedIndex)) >= 0) {
                        // we don't call selectCU() instead because we want to reserve that for actual CU selections,
                        // instead of calling it on (almost) every DOM change.
                        CUs_filtered[newSelectedCUIndex] = $prevSelectedCU;
                        selectedCUIndex = newSelectedCUIndex;
                        showOverlay($prevSelectedCU, "selected");    // to update the overlay in case of resize etc
                    }
                    else {
                        deselectCU($prevSelectedCU);
                        selectedCUIndex = -1;
                        if (miscSettings.selectCUOnLoad) {
                            selectMostSensibleCU(false, false);
                        }
                    }

            }
            else {
                deselectCU($prevSelectedCU);
            }
        }
    }

    function getValidCUs() {
        var CUsArr = _getAllCUs();

        var class_zenModeHidden = CONSTS.class_zenModeHidden,
            bodyInvisibleDueToZenMode = body.classList.contains(class_zenModeHidden);
        // Zen mode sets visibility: hidden to the body using class_zenModeHidden. This interferes with processing of CUs
        // (since we disregard invisible CUs). So, remove the class before processing CUs and then add it back afterward.
        bodyInvisibleDueToZenMode && body.classList.remove(class_zenModeHidden);
        processCUs(CUsArr);
        bodyInvisibleDueToZenMode && body.classList.add(class_zenModeHidden);

        return CUsArr;
    }

    // Finds the set of all the CUs on the current page, and returns it as an array
    // NOTE: This is meant to be called only from within getValidCUs()
    function _getAllCUs() {

        var CUsArr,   // this will be hold the array to return
            firstSelector,
            lastSelector,
            centralElementSelector;

        if (CUsSelector) {
            CUsArr = $.map($(CUsSelector).get(), getJQueryWrapper);
        }
        else if ((centralElementSelector = CUsSpecifier.buildCUAround)){
            var  $container = $(mod_contentHelper.closestCommonAncestor($(centralElementSelector)));
            CUsArr = [];
            CUsArr.currentGroupingIndex = 0;
            buildCUsAroundCentralElement(centralElementSelector, $container, CUsArr);
        }
        else if ((firstSelector = CUsSpecifier.first) && (lastSelector = CUsSpecifier.last)) {

            CUsArr = [];
            var $firstsArray = $.map($(firstSelector).get(), getJQueryWrapper());

            // TODO: add a comment somewhere explaining how "first" and "last" work "smartly" (i.e. find the respective
            // ancestors first_ancestor and last_ancestor that are siblings and use those, selecting logically valid
            // entities.)
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
                    CUsArr[i] = $first.add($first.nextUntil($last)).add($last);
                }
            }
        }

        // returning an empty array instead of undefined means accessing CUs_filtered[selectedCUIndex] (which
        // is done a lot) doesn't need to be prepended with a check against null in each case.
        return CUsArr || [];
    }

    // returns an array of CUs built around a "central element selector" (`buildCUAround` in urlDataMap)
    function buildCUsAroundCentralElement (centralElementSelector, $container, CUsArr) {

        //TODO: 1) rename child to sibling etc
        // 2) can `currentGroupingIndex` be named better?
        // 3) make more readable in general

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
                if ($currentSibling.is(centralElementSelector)) {
                    if (!firstCentralElementFound) {
                        firstCentralElementFound = true;
                    }
                    else {
                        ++CUsArr.currentGroupingIndex;
                    }
                    CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                }
                else if ((num_centralElementsInCurrentSibling = $currentSibling.find(centralElementSelector).length)) {
                    if (num_centralElementsInCurrentSibling === 1) {
                        if (!firstCentralElementFound) {
                            firstCentralElementFound = true;
                        }
                        else {
                            ++CUsArr.currentGroupingIndex;
                        }
                        CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                    }
                    else { // >= 2
                        if (!firstCentralElementFound) {
                            firstCentralElementFound = true;
                        }
                        else {
                            ++CUsArr.currentGroupingIndex;
                        }

                        buildCUsAroundCentralElement(centralElementSelector, $currentSibling, CUsArr);
                    }
                }
                else {
                    CUsArr[CUsArr.currentGroupingIndex] = $currentSibling.add(CUsArr[CUsArr.currentGroupingIndex]);
                }
            }
        }
        return CUsArr;
    }

    /* Returns true if all constituent elements of $CU1 are contained within (the constituents of) $CU2, false
     otherwise. (An element is considered to 'contain' itself and all its descendants)
     */
    function isCUContainedInAnother($CU1, $CU2) {

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
    }

    /**
     * Returns true if $CU is not visible. It considers both
     * 1) whether it consumes any space in the layout
     * 2) the CSS 'visibility' property)
     * @param $CU
     * @returns {boolean|*}
     */
    function isCUInvisible($CU) {
        for (var i = 0; i < $CU.length; ++i) {
            var el = $CU.get(i);
            if (isElementVisible(el)) {
                return false;
            }
        }
        return true;
    }
//    function isCUInvisible($CU) {
//
//        // Returns true if all (top level) constituents of $CU have css 'visibility' style equal to "hidden"
//        var _isCUVisibilityHidden = function($CU) {
//            for (var i = 0; i < $CU.length; ++i) {
//                if ($CU.eq(i).css('visibility') !== "hidden") {
//                    return false;
//                }
//            }
//            return true;
//        };
//
//        return (!doesCUConsumeSpace($CU) && !$CU.hasClass('UnitsProj-HiddenByFiltering')) ||
//            _isCUVisibilityHidden($CU);
//    }
//
//    /***
//     * Returns true if $CU and all its children have height or width that is zero.
//     * Returns false if $CU or any of its children have a valid height/width (i.e. is(:visible)).
//     *
//     * Sometimes there are cases when $CU has no height or width, but its children do. For excluding a
//     * $CU, we make sure all its children are not visible.
//     * @param $CU
//     * @return {boolean}
//     */
//    function doesCUConsumeSpace($CU) {
//        if ($CU.is(':visible')) {
//            return true;    // if any (top level) element constituting the $CU is ':visible'
//        }
//
//        var allDescendants = $CU.find("*");
//
//        for (var i = 0; i < allDescendants.length; i++) {
//            var $element = allDescendants.eq(i);
//            if ($element.is(':visible')) {
//                return true;
//            }
//        }
//
//        return false;
//    }

    /**
     * process all CUs in CUsArr does the following
     1) remove any CU that is not visible in the DOM
     2) remove any CU that is fully contained within another
     */
    function processCUs(CUsArr) {

        if (!CUsArr || !CUsArr.length) {
            return;
        }

        var CUsArrLen = CUsArr.length,
            i;
        
        var removeCurrentCU = function() {
            CUsArr.splice(i, 1);
            --CUsArrLen;
            --i; 
        };

        for (i = 0; i < CUsArrLen; ++i) {
            var $CU = CUsArr[i];
            if (!$CU.hasClass('UnitsProj-HiddenByFiltering') && isCUInvisible($CU)) {
                removeCurrentCU();
                continue;
            }

            // reuse previously determined value if available (since CUs are re-determined on each DOM change)
            // (we don't do this for the visibility since that is something that might change. OTOH, a potential CU
            // found to be contained within another (and hence not deemed a CU) is something that isn't expected to change.
            var isContained = $CU.data('isContainedInAnother');
            if (isContained) {
                removeCurrentCU();
            }
            else if (isContained === false) {
                // nothing needs to be done if found to have been explicitly set to false
            }
            else {
                for (var j = 0; j < CUsArrLen; ++j) {

                    if (i === j) {
                        continue;
                    }

                    if (isCUContainedInAnother($CU, CUsArr[j])) {
                        removeCurrentCU();
                        $CU.data('isContainedInAnother', true);
                        break;
                    }
                    else {
                        $CU.data('isContainedInAnother', false);
                    }
                }
            }
        }
    }

// Based on the header selector provided, this returns the "effective" height of the header (i.e. unusable space) at the
// top of the current view.
// Only the part of the header below the view's top is considered, and its size returned. If there is more than one
// header element, we do the same thing, but for the bottommost one.
    function getEffectiveHeaderHeight() {
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
            return Math.max(0, maxHeaderBottom - body.scrollTop);
        }
        else {
            return 0;
        }
    }

    // handler for the mutation events triggered by the "fallback" mutation observer (defined in mod_mutationObserver.js)
    function onMutations_fallback() {

        if (mainContainer.scrollHeight !== mainContainer_prevScrollHeight ||
            mainContainer.scrollWidth !== mainContainer_prevScrollWidth) {

            mainContainer_prevScrollHeight = mainContainer.scrollHeight;
            mainContainer_prevScrollWidth = mainContainer.scrollWidth;

            handleBasedOnLastCUPosition();
        }

        else {
//            mod_contentHelper.filterOutUnneededMutations(mutations);
//        if (mutations.length) {
            delayed_updateCUsEtc_onMuts();
//        }
        }
    }

    function onSelectedCUTopLevelMuts() {
        // if selected CU has become invisible due to the mutations
        if (selectedCUIndex >= 0 && isCUInvisible(CUs_filtered[selectedCUIndex]) ) {
            updateCUsEtc_onMuts();
        }
        else {
            delayed_updateCUsEtc_onMuts();
        }
    }

    function updateOverlays_and_delayedUpdateCUs() {
        updateCUOverlays();
        delayed_updateCUsEtc_onMuts();
    }

    function handleBasedOnLastCUPosition() {
        if (isLastCUFullyInViewport()) {
            updateCUsEtc_onMuts(); // update CUs immediately in this case
        }
        else {
            updateOverlays_and_delayedUpdateCUs();
        }
    }

    // Calls `updateCUsEtc_onMuts` with a maximum delay of `maxDelay_nonImportantMuts`
    function delayed_updateCUsEtc_onMuts() {
        if (timeout_updateCUs === false) { // compare explicitly with false, which is how we reset it
            // if timeout period is 0 or negative, will execute immediately (at the first opportunity)
            timeout_updateCUs = setTimeout(updateCUsEtc_onMuts, maxDelay_nonImportantMuts -
                (Date.now() - lit_updateCUsEtc));
        }
    }

    // updates CUs etc in response to a dom mutations
    function updateCUsEtc_onMuts() {
        if (timeout_updateCUs) {
            clearTimeout(timeout_updateCUs);
            timeout_updateCUs = false;    // reset
        }
        lit_updateCUsEtc = Date.now();
        updateCUsAndRelatedState();
    }

//    function setCommonCUsAncestor () {
//        if (!CUs_all || !CUs_all.length) {
//            $commonCUsAncestor = $body;  // body is chosen being a "safe" choice
//            return;
//        }
//        var topLevelCUElements = [],    // a collection of the top level elements of all CUs
//            CUsArrLen = CUs_all.length,
//            $CU;
//
//        for (var i = 0; i < CUsArrLen; ++i) {
//            $CU = CUs_all[i];
//            topLevelCUElements = topLevelCUElements.concat($CU.get());
//        }
//        $commonCUsAncestor = $(mod_contentHelper.closestCommonAncestor(topLevelCUElements));
//    }

    /**
     * Special handler for the escape key
     * On pressing ESC:
     * - When no CU is selected, blur the active element and select the "most sensible" CU
     * - When a CU is selected
     *    - if an element which does not allow single key shortcuts is active, blur it
     *    - else deselect the CU. (meaning that a selected CU will be deselected on at most a second 'Esc', if not
     *    the first)
     */
    function onKeydown_Esc(e) {
        var code = e.which || e.keyCode,
            hasModifier = e.altKey || e.ctrlKey|| e.metaKey || e.shiftKey;

        if (code === 27 && !hasModifier) { // ESC
            var $selectedCU = CUs_filtered[selectedCUIndex],
                activeEl = document.activeElement || document.body;
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
            else if (!mod_contentHelper.elementAllowsSingleKeyShortcut(activeEl)) {
                activeEl.blur();
            }
            else {
                deselectCU();
                dehoverCU();
            }
        }
    }

// handler for whenever an element on the page receives focus
// (and thereby a handler for focus-change events)
    function onFocus(e) {
        var enclosingCUIndex = getEnclosingCUIndex(e.target);
        if (enclosingCUIndex >= 0 && enclosingCUIndex !== selectedCUIndex) {
            selectCU(enclosingCUIndex, false);
        }
    }

//    function onMouseWheel (e) {
//        // don't do this on macs for now. can make two finger scrolling problematic if the setting "tap to click"
//        // is on. (because then, then a two finger tap becomes right click.)
//        if (!isMac) {
//            if (rtMouseBtnDown) {
//                var wheelDirection = e.wheelDelta || e.wheelDeltaY || (-e.detail); // -ve will indicate down, +ve up
//                if (wheelDirection) {
//
//                    e.preventDefault();
//                    scrolledWithRtMouseBtn = true;
//
//                    if (wheelDirection < 0) {
//                        selectNext();
//                    }
//                    else  {
//                        selectPrev();
//                    }
//                }
//            }
//        }
//    }

    /* If the active element is already inside the selected CU, then do nothing.
     Else focus the main element of the selected CU.
     (This exists so that when a CU is selected using a mouse click, we can select its main element,
     if the mouse click itself did not lead to an element within the CU getting selected (like an input box)
     */
    function focusMainElelementInSelectedCU_ifRequired() {
        var activeEl = document.activeElement,
            indexOf_CUContainingActiveEl = getEnclosingCUIndex(activeEl);

        if (indexOf_CUContainingActiveEl !== selectedCUIndex) {
            var savedScrollPos = body.scrollTop;
            focusMainElement(CUs_filtered[selectedCUIndex]);
            body.scrollTop = savedScrollPos;
        }
    }

    function onLtMouseBtnDown(e) {
        // first update the following global variables
//        ltMouseBtnDown = true;

        // if clicked element is not part of UnitsProj's UI (i.e. we can assume it is part of the page),
        // select its enclosing CU (or deselect the selected CU if no enclosing CU is found).
        // This check is especially required to ensure selected CU does not get deselected when
        // closing the filtering UI using a mouse click.
        if (!mod_contentHelper.isUnitsProjNode(e.target)) {
            var point = {x: e.pageX, y: e.pageY},
                $selectedCU = CUs_filtered[selectedCUIndex],
                $overlaySelected = $selectedCU && $selectedCU.data('$overlay'),
                $hoveredCU = CUs_filtered[hoveredCUIndex],
                $overlayHovered = $hoveredCU && $hoveredCU.data('$overlay'),
                indexToSelect;

            if ($overlaySelected && mod_contentHelper.elementContainsPoint($overlaySelected, point)) {
                return;  // do nothing
            }
            else  if ($overlayHovered && mod_contentHelper.elementContainsPoint($overlayHovered, point)) {
                indexToSelect = hoveredCUIndex;
            }
            else {
                indexToSelect = getEnclosingCUIndex(e.target);
            }

            if (indexToSelect >= 0) {
                selectCU(indexToSelect, false, false);

                // delay = 0 to yield execution, so that this executes after the click event is processed.
                // We need the clicked-on element to get focus first executing this.
                setTimeout(focusMainElelementInSelectedCU_ifRequired, 0);
            }
            else {
                deselectCU(); // since the user clicked at a point not lying inside any CU, deselect any selected CU
            }
        }
    }

    function onRtMouseBtnDown() {
        rtMouseBtnDown = true;
    }

    // TODO: describe this in documentation if the feature is deemed useful
    function onContextMenu(e) {

        if (scrolledWithRtMouseBtn) {
            e.preventDefault();
        }
    }

    function onMouseDown (e) {

        if (mod_contentHelper.isRtMouseButton(e)) {
            return onRtMouseBtnDown();
        }
        else {
            return onLtMouseBtnDown(e);
        }
    }

    function onMouseUp(e) {

        if (mod_contentHelper.isRtMouseButton(e)) {

            rtMouseBtnDown = false;

            setTimeout(function() {
                // use a small timeout so that we don't change value before onContextMenu runs
                scrolledWithRtMouseBtn = false;
            },100);
        }
//        else {
//            ltMouseBtnDown = false;
//        }
    }

    // function to be called once the user "intends" to hover over an element
    function onMouseOverIntent(e) {

        var point = {x: e.pageX, y: e.pageY};

        var $overlayHovered;
        if (CUs_filtered[hoveredCUIndex] &&
            ($overlayHovered = CUs_filtered[hoveredCUIndex].data('$overlay')) &&
            (mod_contentHelper.elementContainsPoint($overlayHovered, point))) {

            return ; // CU already has hovered overlay; don't need to do anything
        }

        var CUIndex = getEnclosingCUIndex(e.target);

        if (CUIndex >= 0) {

            hoverCU(CUIndex);
        }
    }

    function onMouseOver(e) {
        if (e.screenX !== last_mouseScreenX || e.screenY !== last_mouseScreenY) {
            last_mouseScreenX = e.screenX;
            last_mouseScreenY = e.screenY;
            clearTimeout(timeout_applyHoveredOverlay);
            timeout_applyHoveredOverlay = setTimeout(onMouseOverIntent.bind(null, e), 100);
        }
    }

    function onMouseOut(e) {
        clearTimeout(timeout_applyHoveredOverlay);

        // upon any mouseout event, if a hovered overlay exists and the mouse pointer is found not be
        // contained within it, dehover it (set it as dehovered).
        var $overlayHovered;
        if (CUs_filtered[hoveredCUIndex] &&
            ($overlayHovered = CUs_filtered[hoveredCUIndex].data('$overlay')) &&
            (!mod_contentHelper.elementContainsPoint($overlayHovered, {x: e.pageX, y: e.pageY}))) {

            dehoverCU();
        }
    }

    function onTransitionEnd (e) {
        var $overlay = $(e.target);
        tryRecycleOverlay($overlay);
    }

    /**
     * Checks if the overlay element specified (as jQuery wrapper) is no longer in
     * use, and if so, marks it as available for future reuse.
     * @param $overlay
     */
    function tryRecycleOverlay($overlay) {

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
    }

    // Sets up binding for the tab key such that if a CU is selected, and there is no focused (active) element on
    // the page, the "main" element of the selected CU should get focused.
    function bindTabKey() {

        var isContextApplicable = function() {
            var activeEl = document.activeElement || document.body;
            return CUs_filtered[selectedCUIndex] && (activeEl === document.body);
        };

        mod_keyboardLib.bind(['tab', 'shift+tab'], function() {focusMainElement(CUs_filtered[selectedCUIndex]);},
            isContextApplicable);
    }

    function setupEvents() {
        bindTabKey();

        // To update CUs shortly after a 'click' (activation) event, to handle any possible dom changes etc.
        // NOTE: The 'click' event is triggered whenever in response to invoking 'enter' or 'space' on a
        // an "activatable" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', function () {setTimeout(updateCUsAndRelatedState, 200);}, true);
        
        mod_domEvents.addEventListener(document, 'mousedown', onMouseDown, true);
        mod_domEvents.addEventListener(document, 'mouseup', onMouseUp, true);
        mod_domEvents.addEventListener(document, 'mouseover', onMouseOver, true);
        mod_domEvents.addEventListener(document, 'mouseout', onMouseOut, true);
        mod_domEvents.addEventListener(document, 'contextmenu', onContextMenu, true);

        // event handlers for scroll commented out for now. not that useful + might be a bad idea performance-wise
//        mod_domEvents.addEventListener(document, 'DOMMouseScroll', onMouseWheel, false); // for gecko
//        mod_domEvents.addEventListener(document, 'mousewheel', onMouseWheel, false);   // for webkit

        // Need to specify 'true' below (for capturing phase) for google search (boo!)
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_Esc, true);


        $(window).on('resize', updateCUOverlays);

        // Specifying 'focus' as the event name below doesn't work if a filtering selector is not specified
        // However, 'focusin' behaves as expected in either case.
        $document.on('focusin', CONSTS.focusablesSelector, onFocus);

        if (overlayCssHasTransition) {
            $document.on('transitionend transitionEnd webkittransitionend webkitTransitionEnd otransitionend oTransitionEnd',
                '.' + class_CUOverlay, onTransitionEnd);
        }

        setupShortcuts();
    }

    function setupShortcuts() {
        // the "if" condition below is redundant since this check is made when the CUsMgr module is being setup, but
        // it's being left here since it would be useful this code was moved out of this module
        if (expandedUrlData && expandedUrlData.CUs_specifier) {
            mod_keyboardLib.bind(CUsShortcuts.nextCU.kbdShortcuts, selectNext, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.prevCU.kbdShortcuts, selectPrev, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.firstCU.kbdShortcuts, function() {
                selectFirst(true, true);
            }, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.lastCU.kbdShortcuts, function() {
                selectLast(true, true);
            }, {pageHasCUs: true});
        }
    }

    function isLastCUFullyInViewport() {
        return ( CUs_filtered.length === 0) || isCUFullyInViewport(CUs_filtered[CUs_filtered.length-1]);
    }


    // returns true if any part of $CU is in the viewport, false otherwise
    function isAnyPartOfCUinViewport($CU) {

        // for the CU
        var boundingRect = getBoundingRectangle($CU),
            CUTop = boundingRect.top,
            CUBottom = CUTop + boundingRect.height;

        var // for the window:
            winTop = body.scrollTop,
            winBottom = winTop + window.innerHeight;

        return CUTop < winBottom && CUBottom > winTop;
    }

    // returns true if the specified CU is completely in the viewport, false otherwise
    function isCUFullyInViewport($CU) {

        // for the CU
        var boundingRect = getBoundingRectangle($CU),
            CUTop = boundingRect.top,
            CUBottom = CUTop + boundingRect.height;

        var // for the window:
            winTop = body.scrollTop,
            winBottom = winTop + window.innerHeight;

        return (CUTop > winTop && CUBottom < winBottom);
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
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            transitionDuration = $tempOverlay.css(property);
            if (transitionDuration !== null) {
                break;
            }
        }

        $tempOverlay.remove();

        transitionDuration = parseFloat(transitionDuration); // to get 0.3 from 0.3s etc

        // check if transitionDuration exists and has a non-zero value, while tolerating
        // precision errors with float (which should not occur for 0, but just in case)
        return (transitionDuration && transitionDuration > 0.00000001)? true: false;
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

    function getAllCUs() {
        return CUs_all;
    }

    return thisModule;

})(jQuery, _u.mod_basicPageUtils, _u.mod_domEvents, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.mod_filterCUs,
        _u.mod_help, _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_context,
        _u.mod_smoothScroll, _u.CONSTS);



