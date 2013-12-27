// See _readme_module_template.js for module conventions


_u.mod_CUsMgr = (function($, mod_basicPageUtils, mod_domEvents, mod_keyboardLib, mod_mutationObserver, mod_filterCUs,
                          mod_help, mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_globals,
                          mod_directionalNav, mod_smoothScroll, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        $getSelectedCU: $getSelectedCU,
        updateCUsAndRelatedState: updateCUsAndRelatedState,
        getAllCUs: getAllCUs,
        updateCUOverlays: updateCUOverlays,
        selectNextCUOrScroll: selectNextCUOrScroll
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

        //container for elements created by this program that we add to the page's DOM.
        $topLevelContainer = _u.$topLevelContainer,

        class_unitsProjElem = CONSTS.class_unitsProjElem,  //class applied to all elements created by UnitsProj
        class_CUOverlay = CONSTS.class_CUOverlay,                    // class applied to CU overlays
        class_CUSelectedOverlay = CONSTS.class_CUSelectedOverlay,    // class applied to overlay on a selected CU
        class_CUHoveredOverlay = CONSTS.class_CUHoveredOverlay,      // class applied to overlay on a hovered-over CU
        // class applied to each of the 4 overlays covering the non-selected-CU part of the page
        class_nonCUPageOverlay = CONSTS.class_nonCUPageOverlay,

        selectedCUIndex  = -1, // Index of the selected CU in CUs_filtered
        hoveredCUIndex  = -1, // Index of the hovered CU in CUs_filtered

        // overlay for the selected CU
        $selectedCUOverlay,

        // overlay for the hovered-over CU.
        // **Note on the hovered-over CU overlay**:
        // This overlay is nice to have to help users select a CU using the mouse. However,
        // having this overlay visible at the same time as the selected CU overlay (even
        // though this one looks different) can be slightly confusing or distracting.
        // For this reason, we make this overlay disappear (i.e. call dehoverCU()) each time
        // a CU is selected. But, the overlay is shown again whenever the user moves the
        // mouse, which is exactly the point of it.
        $hoveredCUOverlay,

        // holds 4 overlays used to cover the non-selected-CU part of the page.
        // by convention: these overlays exist in order as [top, bottom, left, right]
        nonCUPageOverlays = [],

        // spotlight opacity value set by the user (or the default value for this setting if the user hasn't changed it)
        userSetDimmingOpacity,
        // spotlight opacity currently in effect (Note: this would be 0 for when the user scrolls the selected CU out
        // of the view)
        currentDimmingOpacity,

        body,               // will hold reference to document.body (once that is available within setup())

        // cached jQuery objects
        $body, // will refer to $(body)
        $document = $(document),
        $window = $(window),

        rtMouseBtnDown,         // boolean holding the state of the right mouse button
//        ltMouseBtnDown,         // boolean holding the state of the left mouse button
        scrolledWithRtMouseBtn, // boolean indicating if right mouse button was used to modify scrolling

        $lastSelectedCU = null,   // to store a reference to the last selected CU

        interval_updateCUsTillDomReady,
        CUsBeenFoundOnce,

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
        // NOTE: Make sure to reset these during reset()
        miscSettings,
        expandedUrlData,
        CUsSpecifier,
        CUsSelector,    // holds a value if CUs are specified directly using a selector
        mainElementSelector, // selector for main element of a CU, if specified
        headerSelector,
        CUStyleData,
        CUsShortcuts,
        animatedScroll, animatedScroll_Speed, animatedScroll_MaxDuration,

        lit_selectCU,    // last invoked time ("lit") for _selectCU()
        minInterval_selectCU = 70,

        timeout_onMouseMovePause,
        timeout_highlightCU,
        timeout_viewportChange,

        /* these are updated when the mouse moves */
        elemUnderMouse,
        mouseX, mouseY,             // relative to the *page*
        mouseScreenX, mouseScreenY, // relative to the *screen*

        // holds the bounding rect calculated for the last selected CU using getBoundingRect()
        // (does not include padding etc applied to the actual overlay drawn on the CU)
        lastSelectedCUBoundingRect,

        unusableHeaderSpace_lastCalculated,
        unusableHeaderSpace_lastCalculatedTime = 0;

    function reset() {
        // this condition ensures execution of the contained code doesn't happen the first time
        // reset() is called, at which point the various overlays won't exist
        if ($selectedCUOverlay) {
            $selectedCUOverlay.remove();
            $hoveredCUOverlay.remove();

            deselectCU();
            dehoverCU();

            $('.' + class_nonCUPageOverlay).remove();
            nonCUPageOverlays = [];
        }

        // reset these references that are initialized during setup()
        miscSettings = expandedUrlData = CUsSpecifier = CUsSelector = mainElementSelector = headerSelector =
            CUStyleData = CUsShortcuts = null;

        CUs_filtered = CUs_all = [];   // these can point to the same array at this point
        mod_globals.isCUSelected = false;
        mod_globals.numCUs_all = mod_globals.numCUs_filtered = 0;

        lit_updateCUsEtc = lit_selectCU = 0;
        timeout_updateCUs = false;
        CUsBeenFoundOnce = false;
        lastSelectedCUBoundingRect = null;
        thisModule.stopListening();
        clearInterval(interval_updateCUsTillDomReady);
        resetScrollEventHandler();
    }

    function setup(settings) {
        if (! (settings.expandedUrlData && settings.expandedUrlData.CUs_specifier)) {
            return;     // this module is not setup if there is no CUs_specifier in the urlData
        }

        // wait for document.body to exist before proceeding further
        if (!document.body) {
            setTimeout(setup.bind(null, settings), 100);
            return;
        }

        reset();

        body = document.body;
        $body = $(body);
        mainContainer = document.body;  // assume this to be the body for

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
        animatedScroll = miscSettings.animatedScroll;
        animatedScroll_Speed = animatedScroll? miscSettings.animatedScroll_Speed: Infinity;
        animatedScroll_MaxDuration = miscSettings.animatedScroll_MaxDuration;

        // assume this is the default value to start off
        userSetDimmingOpacity = miscSettings.defaultSpotlightDimmingOpacity;

        $selectedCUOverlay = $createOverlay('selected');
        $hoveredCUOverlay = $createOverlay('hovered');

        // by convention: these 4 overlays exist in order as [top, bottom, left, right]
        for (var i = 0; i < 4; i++)
            nonCUPageOverlays[i] = $createOverlay('nonCUPageOverlay');

        setNonCUPageOverlaysOpacity(0); // reset `currentDimmingOpacity`

        setupEvents();
        
        if (mod_filterCUs) {
            thisModule.listenTo(mod_filterCUs, 'filter-text-change', onFilterTextChange);
            thisModule.listenTo(mod_filterCUs, 'tab-on-filter-UI', onTabOnFilterSearchBox);
            thisModule.listenTo(mod_filterCUs, 'filter-UI-close', onFilterUIClose);
        }
        
        // Before dom-ready there will be several dom-changes. If we updateCUs in response to
        // each of them, there is a flickering in the selected overlay. So we space calls to
        // update CUs initially, setting up handlers for dom mutations only once dom is ready.
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
        updateCUsAndRelatedState();
        mainContainer  = getMainContainer();
    }

    // To be called during module initialization, to initialize global variables variables
    // that refer to the various overlays.
    // `type` should be one of  'selected', 'hovered', 'nonCUPageOverlay'
    function $createOverlay(type) {
        var $overlay = $('<div></div>').
            addClass(class_unitsProjElem).
            hide();

        if (type === 'selected' || type === 'hovered') {
            $overlay.addClass(class_CUOverlay).
                addClass(type === 'selected'? class_CUSelectedOverlay: class_CUHoveredOverlay);
        }
        else {
            $overlay.addClass(class_nonCUPageOverlay);
        }

        if (CUStyleData && CUStyleData.setOverlayZIndexHigh || type === 'nonCUPageOverlay') {
            // set it slightly less than than the highest z-index possible (2147483647),
            // so that it is less than the z-index of the help page etc
            $overlay.css('z-index', 2147483647-4);
        }
        return $overlay.appendTo($topLevelContainer);
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

    function highlightSelectedCUBriefly_ifRequired() {
        if (CUStyleData && CUStyleData.highlightCUOnSelection) {
            highlightSelectedCUBriefly();
        }
    }

    function highlightSelectedCUBriefly() {
        clearTimeout(timeout_highlightCU);
        $selectedCUOverlay.addClass('highlighted-CU-overlay');
        timeout_highlightCU = setTimeout(function() {
            $selectedCUOverlay.removeClass('highlighted-CU-overlay');
        }, 500);
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
     * @param {string} [direction] The direction of movement specified by the user, if relevant.
     */
    function selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction) {
        var now = Date.now();
        if (now - lit_selectCU > minInterval_selectCU) {
            lit_selectCU = now;
            var disabledByMe = mod_mutationObserver.disable();
            _selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction);
            disabledByMe && mod_mutationObserver.enable();
        }
    }

    // only meant to be called from within selectCU()
    function _selectCU(CUOrItsIndex, setFocus, adjustScrolling, direction) {
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

        deselectCU(); // before proceeding, deselect currently selected CU, if any
        dehoverCU(); // in keeping with the Note titled **Note on the hovered-over CU overlay**
        selectedCUIndex = indexOf$CU;
        mod_globals.isCUSelected = true;

        showSelectedOverlay($CU, true, true);
        highlightSelectedCUBriefly_ifRequired();

        mod_mutationObserver.enableFor_selectedCUAndDescendants($CU);

        $lastSelectedCU = $CU;

        if (adjustScrolling) {
            scrollCUIntoView($selectedCUOverlay, direction);
        }

        if (setFocus) {
            var savedScrollPos = window.pageYOffset; // body.scrollTop is deprecated in strict mode;
            focusMainElement($CU);
            window.scroll(window.pageXOffset, savedScrollPos);
        }

        if (miscSettings.increaseFontInSelectedCU && !$CU.data('fontIncreasedOnSelection')) {
            increaseFont($CU);
            $CU.data('fontIncreasedOnSelection', true);
        }

        var fn_onCUSelection, temp;
        if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUSelection) && (fn_onCUSelection = temp.fn)) {
            fn_onCUSelection($CU, document, $.extend(true, {}, expandedUrlData));
        }

        mouseoverInSelectedCU_ifRequired($CU);
    }

    /**
     * Deselects the currently selected CU, if no CU is specified, else deselects the specified one. Is normally meant
     * to be called *WITHOUT* supplying any argument. (however as a special case, updateCUsAndRelatedState() needs to call
     * it passing the CU.
     * @param [$CU]
     */
    function deselectCU($CU) {
        var disabledHere = mod_mutationObserver.disable();
        _deselectCU($CU);
        disabledHere && mod_mutationObserver.enable();
    }

    // only meant to be called from within deselectCU()
    function _deselectCU(_$CU) {
        var $CU = _$CU || CUs_filtered[selectedCUIndex];
        if (!$CU) {  // will be true the first time this is called from reset()
            return;
        }

        $selectedCUOverlay.hide();
        for (var i = 0; i < 4; i++)
            nonCUPageOverlays[i].hide();

        lastSelectedCUBoundingRect = null;
        selectedCUIndex = -1;
        mod_globals.isCUSelected = false;

        if ($CU.data('fontIncreasedOnSelection')) {
            decreaseFont($CU);
            $CU.data('fontIncreasedOnSelection', false);
        }

        var fn_onCUDeselection, temp;
        if ((temp = expandedUrlData.page_actions) && (temp = temp.std_onCUDeselection) && (fn_onCUDeselection = temp.fn)) {
            fn_onCUDeselection($CU, document, $.extend(true, {}, expandedUrlData));
        }
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
        var $mainElement;

        if (mainElementSelector) {

            // If the mainElementSelector is an array, then check the selectors in order till a mainElement is found.
            if (Array.isArray(mainElementSelector)) {
                var i = 0;

                while (!($mainElement && $mainElement.length) && i <= mainElementSelector.length) {
                    $mainElement = $CU.find(mainElementSelector[i]);
                    i++;
                }
            }
            else {
                $mainElement = $CU.find(mainElementSelector);
            }

            if ($mainElement && $mainElement.length) {
                return $mainElement[0];
            }

        }

//        mainElementSelector && ($mainElement = $CU.find(mainElementSelector));
//        if ($mainElement && $mainElement.length) {
//            return $mainElement[0];
//        }

        // If main element not specified or found, then return the first focusable in the CU.
        var $containedFocusables = $getContainedFocusables($CU).filter(function() {
            return mod_contentHelper.elemAllowsSingleKeyShortcut(this);
        });
        if ($containedFocusables && $containedFocusables.length) {
            return $containedFocusables[0];
        }

        // NOTE: As a fix for #176, we don't explicitly check whether element found by $CU.find(mainElementSelector) is visible or not.
        // In the case where no mainElement was specified or found, we return the first 'visible' focusable, as returned
        // by $getContainedFocusables().

        return null;
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

    // Shows (and updates) the selected CU overlay
    // `enforceRedraw` - optional; is passed as true when the page height/width changes
    // to enforce redrawing of the non-CU page overlays
    // `invokedOnCUSelection` optional - true indicates this call happened due to a CU-selection
    function showSelectedOverlay($CU, enforceRedraw, invokedOnCUSelection) {
        var boundingRect = getBoundingRect($CU);

        if (enforceRedraw ||
            // When `enforceRedraw` isn't true (as is usually the case), the following
            // check helps performance since _showOverlay() takes orders of magnitude
            // more time than getBoundingRect().
            // (This check isn't required for showHoveredOverlay()  because the
            // needless redrawing of the same selected overlay happens only due
            // to showSelectedOverlay() getting repeatedly called on dom mutations.
            // On the other hand, showHoveredOverlay() doesn't get invoked nearly
            // as frequently since the hovered overlay is usually not present, as
            // it gets removed on every selectCU() etc)
            !(lastSelectedCUBoundingRect &&
                boundingRect.top === lastSelectedCUBoundingRect.top &&
                boundingRect.left === lastSelectedCUBoundingRect.left &&
                boundingRect.width === lastSelectedCUBoundingRect.width &&
                boundingRect.height === lastSelectedCUBoundingRect.height)) {

            lastSelectedCUBoundingRect = boundingRect;
            _showOverlay('selected', boundingRect, invokedOnCUSelection);
        }
//        else {
//            console.log('call to _showOverlay() not needed');
//        }
    }

    // (`boundingRect` is optional; is passed by those functions where it has already
    // been determined there)
    function showHoveredOverlay($CU, boundingRect) {
        _showOverlay('hovered', boundingRect || getBoundingRect($CU));
    }

    //TODO: the `showOverlay()` and `_showOverlay()` functions should perhaps be renamed
    // to something more apt now that `_showNonCUPageOverlays()` from within

    /**
     * Code for showing selected/hovered overlays. Only meant to be
     * called from within showSelectedOverlay() or showHoveredOverlay()
     * @param type - 'selected' or 'hovered'
     * @param boundingRect bounding rectangle for the CU (not including padding/
     * style based on the urlData for the current page)
     * @param {boolean} [invokedOnCUSelection] optional - true indicates this call happened due to a CU-selection
     */
    function _showOverlay(type, boundingRect, invokedOnCUSelection) {
        var $overlay = (type === 'selected'? $selectedCUOverlay: $hoveredCUOverlay);

        var disabledHere = mod_mutationObserver.disable();
        $overlay.
            hide().
            css(boundingRect);  // position the overlay above the CU

        applyPaddingToCUOverlay($overlay);
        $overlay.show();
        if (type === 'selected') {
            _showNonCUPageOverlays(invokedOnCUSelection);
        }
        disabledHere && mod_mutationObserver.enable();
    }

    // Applies padding to the selected/hovered overlay based on CUs_style.overlayPadding,
    // if it is specified in the urlData for the current page
    function applyPaddingToCUOverlay($overlay) {
        var overlayPadding;

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
             * 2. At the same time, we don't want the overlay to * actually * have any padding. For the corner markers
             * (that we insert inside the overlay) to stick to the corners of the overlay, it is best if the overlay does
             * not have any padding.
             */
            $overlay.css("padding", overlayPadding);

            $overlay.css("top", parseFloat($overlay.css("top")) -
                parseFloat($overlay.css("padding-top")));

            $overlay.css("left", parseFloat($overlay.css("left")) -
                parseFloat($overlay.css("padding-left")));

            // clientHeight/clientWidth seems to not work consistently unless the
            // element is in the DOM and visible (i.e NOT 'display: none')
            var overlayFinalHeight = $overlay.innerHeight(), //$overlay[0].clientHeight,
                overlayFinalWidth = $overlay.innerWidth(); //$overlay[0].clientWidth;

            $overlay.css("padding", 0);
            $overlay.height(overlayFinalHeight);
            $overlay.width(overlayFinalWidth);
        }
    }

    /**
     * Shows as hovered the CU specified using CUIndex
     * @param {number} CUIndex Specifies the index of the CU in the array CUs_filtered
     */
    function hoverCU(CUIndex) {
        var $CU = CUs_filtered[CUIndex];

        dehoverCU(); // first dehover currently hovered-over CU, if any
        hoveredCUIndex = CUIndex;
        showHoveredOverlay($CU);
    }

    /**
     * Dehovers the currently hovered (over) CU, if there is one
     */
    function dehoverCU() {
        var disabledHere = mod_mutationObserver.disable();
        $hoveredCUOverlay.hide();
        disabledHere && mod_mutationObserver.enable();
        hoveredCUIndex = -1;
    }

    function smartScrollUp() {
        selectNextCUOrScroll('up');
    }
    function smartScrollDown() {
        selectNextCUOrScroll('down');
    }
    function smartScrollRight() {
        selectNextCUOrScroll('right');
    }
    function smartScrollLeft() {
        selectNextCUOrScroll('left');
    }

    function selectCUUp() {
        selectNextCU('up');
    }
    function selectCUDown() {
        selectNextCU('down');
    }
    function selectCURight() {
        selectNextCU('right');
    }

    function selectCULeft() {
        selectNextCU('left');
    }

    /**
     * selects the next CU in the specified direction - 'up', 'down', 'left' or 'right' OR scrolls
     * the page in the specified direction, as appropriate
     */
    function selectNextCUOrScroll (direction) {
        _selectNextCUOrScroll(direction);
        highlightSelectedCUBriefly_ifRequired();
    }

    function _selectNextCUOrScroll(direction) {
        if (!CUs_filtered.length) {
            mod_basicPageUtils.scroll(direction);
            return;
        }

        var $selectedCU = CUs_filtered[selectedCUIndex];
        if ($selectedCU) {
            var nextIndex = mod_directionalNav.getClosest($selectedCU, CUs_filtered, direction,
                    getBoundingRect, areCUsSame),
                $nextCU = CUs_filtered[nextIndex];

            if ($nextCU && isAnyPartOfCUinViewport($nextCU)) {
                // NOTE: On a page with CUs, this is the HAPPY PATH, that the code branch
                // that would execute in in most cases
                selectCU(nextIndex, true, true, direction);
            }
            else if (isAnyPartOfCUinViewport($selectedCU)) {
                mod_basicPageUtils.scroll(direction);
            }
            // if the page has been scrolled to a position away from the selected CU...
            else {
                nextIndex = findFirstSensibleCUInViewport();
                $nextCU = CUs_filtered[nextIndex];

                // The following code is more complex than would seem necessary. But this is required in order to
                // handle well pages with grid/2-D type CU layout (including cases where there are gaps between
                // CUs on the page, meaning the CUs are not all stacked adjacent to each other)
                if ($nextCU) {
                    var perpOverlap = mod_directionalNav.getPerpOverlap(getBoundingRect($selectedCU),
                        getBoundingRect($nextCU), direction);

                    if (perpOverlap > 0) {
                        // we first check if the CU found by `findFirstSensibleCUInViewport` has a positive
                        // perp overlap rather than looking for the CU with the highest perpOverlap, because
                        // that works better, especially on sites with linear CUs like google search results page
                        selectCU(nextIndex, true, false, direction);
                    }
                    else {
                        // find CU in viewport with maximum "perpendicular overlap"
                        var highestPerpOverlap = -Infinity,
                            indexWithHighestPerpOverlap = -1;     // index in CUs_filtered
                        for (var i = 0; i < CUs_filtered.length; i++) {
                            var $CU = CUs_filtered[i];

                            // TODO: the following can be optimized for performance since we are
                            // checking for CUs in the viewport again instead of making use of the
                            // same check that had happened earlier. However, since this is not a
                            // commonly executing code path, it's not a priority
                            if (isAnyPartOfCUinViewport($CU)) {
                                perpOverlap = mod_directionalNav.getPerpOverlap(getBoundingRect($selectedCU),
                                    getBoundingRect($CU), direction);
                                if (perpOverlap > highestPerpOverlap) {
                                    highestPerpOverlap = perpOverlap;
                                    indexWithHighestPerpOverlap = i;
                                }
                            }
                        }
                        // the outer enclosing if-block [if ($nextCU) {}] ensures that `indexWithHighestPerpOverlap`
                        // will have a non-negative value
                        selectCU(indexWithHighestPerpOverlap, true, true, direction);
                        if (highestPerpOverlap < 0) {
                            highlightSelectedCUBriefly();
                        }
                    }
                }
                else {
                    mod_basicPageUtils.scroll(direction);
                }
            }
        }
        else {
            selectMostSensibleCU_withoutScrollingPage(true) || mod_basicPageUtils.scroll(direction);
        }
    }

    // selects the next CU in the direction specified (NOTE: in most cases, calling `selectNextCUOrScroll()`
    // might be better than calling this)
    function selectNextCU(direction) {
        var $selectedCU = CUs_filtered[selectedCUIndex],
            nextIndex;
        if ($selectedCU && (nextIndex = mod_directionalNav.getClosest($selectedCU, CUs_filtered, direction,
            getBoundingRect, areCUsSame)) > -1) {

            selectCU(nextIndex, true, true, direction);
        }
        else {
            selectMostSensibleCU_withoutScrollingPage(true);
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
        CUs_filtered.length && selectCU(0, setFocus, adjustScrolling);
    }
    function selectLast(setFocus, adjustScrolling) {
//        for (var i = CUs_filtered.length - 1; i >= 0; i--) {
//            if (!isCUInvisible(CUs_filtered[i])) {
//                selectCU(i, setFocus, adjustScrolling);
//                return;
//            }
//        }
        CUs_filtered.length && selectCU(CUs_filtered.length - 1, setFocus, adjustScrolling);
    }

    /**
     * Selects the most "sensible" CU, not based on directional user input. Returns true if one is
     * found, else false.
     * NOTE: this is called when there is applicable directional input, but we want to find a
     * "sensible" CU. For that reason  ensure that there is NO change in the change the scrolling
     * of the page due to a call to this.
     */
    function selectMostSensibleCU_withoutScrollingPage(setFocus) {
        var savedScrollPos = window.pageYOffset,
            returnVal;

        var lastSelectedCUIndex;
        if ( (lastSelectedCUIndex = findCUInArray($lastSelectedCU, CUs_filtered)) >=0 &&
            isAnyPartOfCUinViewport($lastSelectedCU)) {

            selectCU(lastSelectedCUIndex, setFocus, false);
            returnVal = true;
        }
        else {
            var i = findFirstSensibleCUInViewport();
            if (i > -1) {
                selectCU(i, setFocus, false);
                returnVal = true;
            }
            else {
                returnVal = false;
            }
        }

        // make sure the scroll position doesn't change due to the main element getting focus
        window.scroll(window.pageXOffset, savedScrollPos);
        return returnVal;
    }

    /**
     * Returns index (in CUs_filtered) of the first CU (looking in DOM order, for now) that
     * is contained *fully* in the viewport. If no such CU exists, returns the index of the
     * CU with the *largest area* in the viewport. Returns -1 if no CU is found in the viewport.
     * @returns {number}
     */
    function findFirstSensibleCUInViewport() {
        if (CUs_filtered && CUs_filtered.length) {
            var CUsArrLen = CUs_filtered.length,
                CUIndexWithMaxAreaInViewport = -1,
                maxArea = 0;

            for (var i = 0; i < CUsArrLen; ++i) {
                var $CU = CUs_filtered[i],
                    CUBoundingRect = getBoundingRect($CU);
                if (isCUFullyInViewport($CU, CUBoundingRect)) {
                    return i;
                }
                var area = getCUAreaInViewport($CU, CUBoundingRect);
                if (area > maxArea) {
                    maxArea = area;
                    CUIndexWithMaxAreaInViewport = i;
                }
            }
            // if not returned yet
            return CUIndexWithMaxAreaInViewport;
        }
    }

    // Returns the area of the part of the CU in the viewport (and 0 if no part of the
    // CU is in the viewport)
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function getCUAreaInViewport($CU, CUBoundingRect) {
        var boundingRect = CUBoundingRect || getBoundingRect($CU);

        if (isAnyPartOfCUinViewport($CU, boundingRect)) {
            var CUTop = boundingRect.top,
                CUBottom = CUTop + boundingRect.height,
                CULeft = boundingRect.left,
                CURight = CULeft + boundingRect.width,

                winTop = window.pageYOffset, //window.scrollY, //body.scrollTop,
                winBottom = winTop + window.innerHeight,
                winLeft = window.pageXOffset, // window.scrollX,
                winRight = winLeft + window.innerWidth;

            return ( (Math.min(winRight, CURight) - Math.max(winLeft, CULeft)) *
                (Math.min(winBottom, CUBottom) - Math.max(winTop, CUTop)) );
        }
        else
            return 0;
    }

    // Show overlays to cover the non-CU part of the page.
    // NOTE: This is only meant to be called from within
    // (the code flow of) showSelectedOverlay()
    function _showNonCUPageOverlays(invokedOnCUSelection) {
        // if invoked on CU selection, set opacity (if it needs to be changed) to the right value
        invokedOnCUSelection && setNonCUPageOverlaysOpacity(userSetDimmingOpacity);

        var CUOffset = $selectedCUOverlay.offset(),
            CUOverlay = $selectedCUOverlay[0],

            bodyScrollHeight = body.scrollHeight,
            bodyScrollWidth = body.scrollWidth,

            CUOverlayTop = CUOffset.top,
            CUOverlayLeft = CUOffset.left,
            CUOverlayRight = CUOverlayLeft + CUOverlay.offsetWidth,
            CUOverlayHeight = CUOverlay.offsetHeight,

            // margins from the edges of the body
            CUOverlayBottomMargin = bodyScrollHeight - (CUOverlayTop + CUOverlayHeight),
            CUOverlayRightMargin = bodyScrollWidth - CUOverlayRight;


        //NOTE: we set top, left, width, height in each case below because that seems to work more reliably
        // than setting bottom (and perhaps right) which would have made calculations easier

        nonCUPageOverlays[0].css({
            top: "0",
            left: "0",
            width: bodyScrollWidth + "px",
            height: CUOverlayTop + "px",
        }).show();

        // bottom
        nonCUPageOverlays[1].css({
            top: CUOverlayTop + CUOverlayHeight + "px",
            left: "0",
            width: bodyScrollWidth + "px",
            height: CUOverlayBottomMargin + "px"
        }).show();

        // left
        nonCUPageOverlays[2].css({
            top: CUOverlayTop + "px",
            left: "0",
            width: CUOverlayLeft + "px",
            height: CUOverlayHeight + "px"
        }).show();

        // right
        nonCUPageOverlays[3].css({
            top: CUOverlayTop + "px",
            left: CUOverlayRight + "px",
            width: CUOverlayRightMargin + "px",
            height: CUOverlayHeight + "px"
        }).show();
    }

    // To increase/decrease "spotlight" on the selected CU
    // `how` should be one of 'increase', 'decrease', 'default'
    function changeSpotlightOnSelecteCU(how) {
        var delta = 0.05;

        if (how === 'increase')
            userSetDimmingOpacity += delta;
        else if (how === 'decrease')
            userSetDimmingOpacity -= delta;
        else
            userSetDimmingOpacity = miscSettings.defaultSpotlightDimmingOpacity;

        if (userSetDimmingOpacity < 0)
            userSetDimmingOpacity = 0;
        if (userSetDimmingOpacity > 1)
            userSetDimmingOpacity = 1;

        for (var i = 0; i < nonCUPageOverlays.length; i++)
            nonCUPageOverlays[i].addClass('fast-opacity-change');

        setNonCUPageOverlaysOpacity(userSetDimmingOpacity);

        if (selectedCUIndex === -1)
            selectMostSensibleCU_withoutScrollingPage();
    }

    function setNonCUPageOverlaysOpacity(opacity) {
        if (opacity !== currentDimmingOpacity) {
            for (var i = 0; i < nonCUPageOverlays.length; i++)
                nonCUPageOverlays[i].css('opacity', opacity);

            currentDimmingOpacity = opacity;
        }
    }

    function onWindowScroll() {
        clearTimeout(timeout_viewportChange);
        timeout_viewportChange = setTimeout(_onWindowScrollPause, 100);
    }

    // called when there is a pause in the window's scrolling
    function _onWindowScrollPause() {
        var $selectedCU = CUs_filtered[selectedCUIndex];

        for (var i = 0; i < nonCUPageOverlays.length; i++)
            nonCUPageOverlays[i].removeClass('fast-opacity-change');

        if ($selectedCU && isAnyPartOfCUinViewport($selectedCU)) {
            setNonCUPageOverlaysOpacity(userSetDimmingOpacity);
        }
        else {
            setNonCUPageOverlaysOpacity(0);
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
        if ( ($1 === $2) ||
            // if both are empty or nonexistent, their "contents" are "same".
            (!$1 && (!$2 || !$2.length)) ||
            (!$2 && (!$1 || !$1.length)) ) {

            return true;
        }

        // we reach here if at least one of them exists and is non-empty, so...
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
// NOTE: the values for top and left are relative to the document
    function getBoundingRect($CU) {
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
        return getBoundingRectForElements(elements);
    }

    function isElementVisible(el) {
//        var $el = $(el);
//        return $el.is(':visible') && $el.css('visibility') !== "hidden";
        // NOTE: using the jquery equivalent especially .is(':visible') was found to be much slower,
        return el.offsetHeight && el.offsetWidth &&
            document.defaultView.getComputedStyle(el).getPropertyValue("visibility") !== "hidden";
    }

// returns a bounding rectangle for the set (array) of DOM elements specified
// the returned rectangle object has the keys: top, left, width, height, (such
// that the rectangle object can be directly passed to jQuery's css() function).
    function getBoundingRectForElements(elements) {
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

    function smoothScroll(elementToScroll, scrollProperty, value, duration) {
        resetScrollEventHandler(); // to prevent continuous firing of handler during smooth scroll animation
        mod_smoothScroll.smoothScroll(elementToScroll, scrollProperty, value, duration, setupScrollEventHandler);
    }

    /**
     * Scrolls the  page to center the specified CU on it. Uses `direction` to decide how to
     * position an element that doesn't fit in the viewport, and to ensure that we don't scroll
     * opposite to the `direction` of movement specified by the user.
     * possible if the element is too large).
     * @param {jQuery} $CUOverlay
     * @param {string} [direction] The direction of movement specified by the user, if relevant.
     * *NOTE* If the `direction` is specified, it performs two important functions:
     * 1) We ensure that we do NOT scroll the page in the *opposite* to the specified direction.
     * For example if 'j' (down direction) is pressed, and centering the specified CU required
     * the page to be scrolled up, the scrolling won't take place.
     * 2) We use `direction` to decide which side of a large CU (that doesn't fit within the
     * viewport) should be aligned with the (corresponding side of) the viewport. For example,
     * scrolling downward into a new large CU, we would align it's top to the top of the page,
     * but had the scrolling been upward, we would align its bottom to the bottom of the page
     * -- and similarly for left/right movement.
     */
    function scrollCUIntoView($CUOverlay, direction) {

        var // for the window:
            winTop = window.pageYOffset,// body.scrollTop,
        // winHeight =$window.height(), // this doesn't seem to work correctly on news.ycombinator.com
            winHeight = window.innerHeight,
            winBottom = winTop + winHeight,
            winLeft = window.pageXOffset, // body.scrollLeft,
            winWidth = window.innerWidth,
            winRight = winLeft + winWidth,

        // for the element:
            elOffset = $CUOverlay.offset(),
            elTop = elOffset.top,
            elHeight = $CUOverlay.height(),
            elBottom = elTop + elHeight,
            elLeft = elOffset.left,
            elWidth = $CUOverlay.width(),
            elRight = elLeft + elWidth;

        var newWinTop, newWinLeft, // we will scroll the window to these values if required
            margin = 10,
            animationDuration;

        // adjust horizontally, if not fully within the viewport horizontally
        if (!(elLeft > winLeft && elRight < winRight)) {
            // based on equating the space to the element's left and right in the new window position
            newWinLeft = (elLeft + elRight - winWidth)/2;
            if (direction === 'right' && elLeft < newWinLeft + margin) {
                    newWinLeft = elLeft - margin;
            }
            // newWinLeft + winWidth = "newWinRight"
            else if (direction === 'left' && elRight > (newWinLeft + winWidth) - margin) {
                newWinLeft = elRight - winWidth + margin;
            }

            // ensure we scroll only if it's not opposite to `direction` (if specified)
            if (!direction || 
                (direction === 'right' && newWinLeft > winLeft) ||
                (direction === 'left' && newWinLeft < winLeft) ) {

                animationDuration = Math.min( animatedScroll_MaxDuration,
                    Math.abs(newWinLeft-winLeft)/animatedScroll_Speed );

                // TODO: if the animation for vertical scroll is required (see below), this
                // animation will be terminated instantly. Instead, ideally, a diagonal, animation
                // should take place. Low priority, given the rarity of horizontal scroll
                smoothScroll(window, 'pageXOffset', newWinLeft, animationDuration);
            }
        }

        var pageHeaderHeight = getUnusableSpaceAtTopDueToHeader();

        // if `verticallyCenterSelectedCU` is true, and direction isn't explicitly 'left' or 'right
        if ((miscSettings.verticallyCenterSelectedCU && direction !== 'left' && direction !== 'right') ||
        // OR if CU isn't fully contained in viewport *vertically*
            !(elTop > winTop + pageHeaderHeight + margin && elBottom < winBottom - margin)) {

            // *vertically* center the element based on this equation equating the space left in the (visible part of
            // the) viewport above the element to the space left below it:
            // elTop - (newWinTop + pageHeaderHeight) = newWinBottom - elBottom = newWinTop + winHeight - elBottom
            // (substituting (newWinTop + winHeight) for newWinBottom)
            newWinTop = (elTop + elBottom - winHeight - pageHeaderHeight)/2;

            newWinTop += 10; // now shift slightly upward to make it closer to the top than bottom; looks nicer

            if (direction === 'down' && elTop < newWinTop + pageHeaderHeight + margin ) {
                newWinTop = elTop - pageHeaderHeight - margin;
            }
            // newWinTop + winHeight = "newWinBottom"
            else if (direction === 'up' && elBottom > (newWinTop + winHeight) - margin) {
                newWinTop = elBottom - winHeight + margin;
            }

            // ensure we scroll only if it's not opposite to `direction` (if specified)
            if (!direction ||
                (direction === 'down' && newWinTop > winTop) ||
                (direction === 'up' && newWinTop < winTop) ) {

                animationDuration = Math.min( animatedScroll_MaxDuration,
                    Math.abs(newWinTop-winTop)/animatedScroll_Speed );
                smoothScroll(window, 'pageYOffset', newWinTop, animationDuration);
            }
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

    // updates the selected and hovered-over CU overlays
    function updateCUOverlays() {
        updateSelectedOverlay();
        updateHoveredOverlay();
    }

    // If a selected CU exists, update the selected overlay
    function updateSelectedOverlay(enforceRedraw) {
        var $selectedCU = CUs_filtered[selectedCUIndex];
        $selectedCU && showSelectedOverlay($selectedCU, enforceRedraw);
    }

    // If a hovered-over CU exists
    // - if the  mouse pointer is still contained within the CU's current area, update the hovered-over overlay
    // - else dehoverCU()
    function updateHoveredOverlay() {
        var $hoveredCU = CUs_filtered[hoveredCUIndex];
        if ($hoveredCU) {
            var boundingRect = getBoundingRect($hoveredCU);
            if (mod_contentHelper.rectContainsPoint(boundingRect, mouseX, mouseY)) {
                showHoveredOverlay($hoveredCU, boundingRect); // update the overlay
            }
            else {
                dehoverCU();
            }
        }
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

        // remove zen mode class before calculating CUs because zen mode might hide
        // elements that would be CUs (this can especially happen just after the page loads)
        mod_globals.zenModeOn && $body.removeClass(CONSTS.class_zenModeActive);
        _updateCUsAndRelatedState();
        onUpdatingCUs();
        if (mod_globals.zenModeOn) {
            $body.addClass(CONSTS.class_zenModeActive);
            updateCUOverlays();
        }

        disabledByMe && mod_mutationObserver.enable();
    }

    // meant to be called by updateCUsAndRelatedState()
    function _updateCUsAndRelatedState() {
        // Save the currently selected CU, to reselect it, if it is still present in the CUs_filtered after the array is
        // updated. This needs to be done before calling deselectCU() and modifying CUs_filtered
        var $prevSelectedCU = CUs_filtered[selectedCUIndex],
            prevSelectedIndex = selectedCUIndex;

        // like above, for the hovered-over CU
        var $prevHoveredCU = CUs_filtered[hoveredCUIndex];

        // we don't call deselectCU() instead because we want to reserve that for actual CU deselections, instead
        // of calling it every time DOM changes. 
        selectedCUIndex = -1;

        CUs_filtered = CUs_all = getValidCUs();
        thisModule.trigger("CUs-all-change");

        if (mod_filterCUs.isActive()) {
            CUs_filtered = mod_filterCUs.applyFiltering(CUs_all, false);
        }

        mod_globals.numCUs_all = CUs_all.length;
        mod_globals.numCUs_filtered = CUs_filtered.length; // do this after filtering is applied

        // if this is the first time CUs were found...
        if (!CUsBeenFoundOnce && CUs_filtered.length) {
            CUsBeenFoundOnce = true;
            if ( miscSettings.selectCUOnLoad) {
                selectMostSensibleCU_withoutScrollingPage(true);
            }
            mainContainer  = getMainContainer();
        }

        // on updating the CUs after a dom-change:
        // if a CU was previously selected
        //  - if it still exists in CUs_filtered, it should remain selected
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
                        showSelectedOverlay($prevSelectedCU);    // to update the overlay in case of resize etc
                    }
                    else {
                        deselectCU($prevSelectedCU);
                        selectedCUIndex = -1;
                        if (miscSettings.selectCUOnLoad) {
                            selectMostSensibleCU_withoutScrollingPage(false);
                        }
                    }

            }
            else {
                deselectCU($prevSelectedCU);
            }
        }

        if ($prevHoveredCU) {
            var newHoveredCUIndex,
                boundingRect = getBoundingRect($prevHoveredCU);

            // if the previously hovered CU is still present in CUs_filtered AND the mouse pointer
            // is still contained within its bounding rect
            if (mod_contentHelper.rectContainsPoint(boundingRect, mouseX, mouseY) &&
                (newHoveredCUIndex = findCUInArray($prevHoveredCU, CUs_filtered, hoveredCUIndex)) >= 0) {

                // (to keep things consistent with the case of selected CU above,) we don't call
                // hoverCU() here, since we're just *updating* the hovered overlay, not responding
                // the user hovering over a *new* CU
                hoveredCUIndex = newHoveredCUIndex;
                showHoveredOverlay($prevHoveredCU, boundingRect);

            }
            else {
                dehoverCU();
            }
        }
    }

    function getValidCUs() {
        var CUsArr = _getAllCUs();
        processCUs(CUsArr);
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
            var $firstsArray = $.map($(firstSelector).get(), getJQueryWrapper);

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
                    return $el.is($_first) || $el.has($_first).length;
                };

                var filterLast = function(){
                    var $el = $(this);
                    return $el.is($_last) || $el.has($_last).length;
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
     1) remove any CU that is not visible in the DOM or is too small
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
            if (!$CU.hasClass('UnitsProj-HiddenByFiltering') && (isCUInvisible($CU) || isCUTooSmall($CU))) {
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

    // helps ignore CUs that are too small (these are found on nytimes.com and some other websites)
    function isCUTooSmall($CU) {
        var rect = getBoundingRect($CU);
        return rect.width < 10 || rect.height < 10 || rect.width * rect.height < 400;
    }

    // Based on the header selector provided, this return a non-negative value that indicates the height
    // (in pixels) of the *unusable space* at the top of the current view due to header type element(s).
    // This is required due to "position:fixed" header type elements.
    // Only the part of the header below the view's top is considered. If there is more than one header found
    // we account for all of them.
    // If no header is found etc, 0 is returned;
    function getUnusableSpaceAtTopDueToHeader() {
        if (!headerSelector) {
            return 0;
        }

        var now  = Date.now();
        // calculate only if the last calculation happened more than 100 ms before;
        // (for performance reasons when this is called for each CU in a loop, etc)
        if (now - unusableHeaderSpace_lastCalculatedTime > 100) {

            // ignore elements whose bottom is farther from the viewport top than this, because they are almost
            // certainly not header-like elements. This was done to check against the navigation pane that occurred
            // as a header on most tumblr blogs, but was placed as a footer on a certain blog. Refer issue #197.
            // In any case this is a sensible check to make on all pages
            var maxAllowedBottomFromTop = 300;

            var $headers = $(headerSelector).filter(':visible'),
                headersLen = $headers.length,
                max = 0; // NOTE: start at 0, so we don't consider anything above the viewport

            for (var i = 0; i < headersLen; ++i) {
                var rectBottomRelToViewport = $headers[i].getBoundingClientRect().bottom;
                if (rectBottomRelToViewport > max && rectBottomRelToViewport < maxAllowedBottomFromTop) {
                    max = rectBottomRelToViewport;
                }
            }
            unusableHeaderSpace_lastCalculated = max;
            unusableHeaderSpace_lastCalculatedTime = now;
        }
        return unusableHeaderSpace_lastCalculated;
    }

    // handler for the mutation events triggered by the "fallback" mutation observer (defined in mod_mutationObserver.js)
    function onMutations_fallback() {

        if (mainContainer.scrollHeight !== mainContainer_prevScrollHeight ||
            mainContainer.scrollWidth !== mainContainer_prevScrollWidth) {

            mainContainer_prevScrollHeight = mainContainer.scrollHeight;
            mainContainer_prevScrollWidth = mainContainer.scrollWidth;

            var $selectedCU = CUs_filtered[selectedCUIndex];
            $selectedCU && showSelectedOverlay($selectedCU, true); // pass true to enforce redraw of non-CU page overlays
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
        // compare explicitly with false, which is how we reset it
        if (timeout_updateCUs === false) {
            // In the following line, we restrict the minimum value of the timeout delay to
            // 0. This should not normally be required since negative delay is supposed to
            // have the same effect as a 0 delay. However, doing this fixes  #76 (Github).
            // This is mostly likely due to some quirk in Chrome.
            timeout_updateCUs = setTimeout(updateCUsEtc_onMuts, Math.max(0, maxDelay_nonImportantMuts -
                (Date.now() - lit_updateCUsEtc)));
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
     * On pressing Esc, deselect and dehover (without suppressing the event)
     */
    function onKeydown_Esc(e) {
        var code = e.which || e.keyCode,
            hasModifier = e.altKey || e.ctrlKey|| e.metaKey || e.shiftKey;

        if (code === 27 && !hasModifier) { // ESC
            deselectCU();
            dehoverCU();
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
            var savedScrollPosX = window.pageXOffset,
                savedScrollPosY = window.pageYOffset;

            focusMainElement(CUs_filtered[selectedCUIndex]);
            window.scroll(savedScrollPosX, savedScrollPosY);
        }
    }

    /**
     * Dispatch mouseover (if specified in urlData) on particular element in the selected CU. The element selector (to
     * mouseover on) is specified in urlData.
     * @param $CU
     */
    function mouseoverInSelectedCU_ifRequired($CU) {
        var mouseoverOnCUSelection, mouseoverEl;
        if (CUsSpecifier && (mouseoverOnCUSelection = CUsSpecifier.mouseoverOnCUSelection)) {

            // If mouseoverOnCUSelection is explicitly set to true, then mouseover on $CU[0]
            if (mouseoverOnCUSelection === true) {
                mouseoverEl = $CU[0];
            }
            // Else, use mouseoverOnCUSelection as selector for the element (inside CU) to mouseover on
            else {
                mouseoverEl = $CU.find(mouseoverOnCUSelection)[0];
            }

            mouseoverEl && mod_contentHelper.dispatchMouseOver(mouseoverEl);
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
            var indexToSelect;

            if (selectedCUIndex >= 0 && mod_contentHelper.elemContainsPoint($selectedCUOverlay, e.pageX, e.pageY)) {
                return;  // do nothing
            }
            else  if (hoveredCUIndex >= 0 && mod_contentHelper.elemContainsPoint($hoveredCUOverlay, e.pageX, e.pageY)) {
                indexToSelect = hoveredCUIndex;
            }
            else {
                indexToSelect = getEnclosingCUIndex(e.target);
            }

            if (indexToSelect >= 0) {
                selectCU(indexToSelect, false, false);

                // delay = 0 to yield execution, so that this executes after the click event is processed.
                // We need the clicked-on element to get focus before executing this.
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

    // function to be called once the user pauses mouse movement, and
    // hence likely actually *intends* to hover over an element
    function onMouseMovePause() {
        // Don't need to do anything if CU under the mouse already already has the hovered-over overlay
        // (OR if it has the selected overlay, in keeping with the Note titled **Note on the hovered-over
        // CU overlay**)
        if (hoveredCUIndex >= 0 && mod_contentHelper.elemContainsPoint($hoveredCUOverlay, mouseX, mouseY) ||
            selectedCUIndex >= 0 && mod_contentHelper.elemContainsPoint($selectedCUOverlay, mouseX, mouseY)) {
            return ;
        }

        var CUIndex = getEnclosingCUIndex(elemUnderMouse);
        if (CUIndex >= 0) {
            hoverCU(CUIndex);
        }
    }

    function onMouseMove(e) {
        mouseX = e.pageX;
        mouseY = e.pageY;
        elemUnderMouse = e.target;

        // to check against inadvertent events that fire simply due to the page scroll
        if (e.screenX !== mouseScreenX || e.screenY !== mouseScreenY) {
            mouseScreenX = e.screenX;
            mouseScreenY = e.screenY;
            clearTimeout(timeout_onMouseMovePause);
            timeout_onMouseMovePause = setTimeout(onMouseMovePause, 100);
        }
    }

    function onMouseOut(e) {
        // upon any mouseout event, if a hovered overlay exists and the mouse pointer is found not be
        // contained within it, call dehover()
        // (NOTE: since the hovered overlay has pointer-events: none, we are unable to receive a
        // mouseout event on the hovered overlay itself. TODO: "pointer-events: stroke"; didn't
        // seem to allow doing that either -- documentation says SVG only, what does that mean?)
        if (hoveredCUIndex >= 0 &&
            !mod_contentHelper.elemContainsPoint($hoveredCUOverlay, e.pageX, e.pageY)) {

            dehoverCU();
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

    function setupScrollEventHandler() {
       $window.on('scroll', onWindowScroll);
    }
    function resetScrollEventHandler() {
       $window.off('scroll', onWindowScroll);
    }

    function setupEvents() {
        bindTabKey();

        // To update CUs shortly after a 'click' (activation) event, to handle any possible dom changes etc.
        // This includes cases where we programmatically click a link (or action unit).
        // NOTE: Additionally, the 'click' event is triggered in response to invoking 'enter' or 'space' on a
        // an "activatable" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', function () {setTimeout(updateCUsAndRelatedState, 300);}, true);
        
        mod_domEvents.addEventListener(document, 'mousedown', onMouseDown, true);
        mod_domEvents.addEventListener(document, 'mouseup', onMouseUp, true);
        mod_domEvents.addEventListener(document, 'mousemove', onMouseMove, true);
        mod_domEvents.addEventListener(document, 'mouseout', onMouseOut, true);
        mod_domEvents.addEventListener(document, 'contextmenu', onContextMenu, true);

        // event handlers for scroll commented out for now. not that useful + might be a bad idea performance-wise
//        mod_domEvents.addEventListener(document, 'DOMMouseScroll', onMouseWheel, false); // for gecko
//        mod_domEvents.addEventListener(document, 'mousewheel', onMouseWheel, false);   // for webkit

        // Need to specify 'true' below (for capturing phase) for google search (boo!)
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_Esc, true);

       $window.on('resize', function() {
            updateSelectedOverlay(true);    // pass true to enforce redraw
            dehoverCU();
        });

        setupScrollEventHandler();

        // Specifying 'focus' as the event name below doesn't work if a filtering selector is not specified
        // However, 'focusin' behaves as expected in either case.
        $document.on('focusin', CONSTS.focusablesSelector, onFocus);

        setupShortcuts();
    }

    function setupShortcuts() {
        // the "if" condition below is redundant since this check is made when the CUsMgr module is being setup, but
        // it's being left here since it would be if useful this code was moved out of this module
        if (expandedUrlData && expandedUrlData.CUs_specifier) {
            mod_keyboardLib.bind(CUsShortcuts.smartScrollDown.kbdShortcuts, smartScrollDown, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollUp.kbdShortcuts, smartScrollUp, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollRight.kbdShortcuts, smartScrollRight, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.smartScrollLeft.kbdShortcuts, smartScrollLeft, {pageHasCUs: true});

            mod_keyboardLib.bind(CUsShortcuts.selectCUDown.kbdShortcuts, selectCUDown, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCUUp.kbdShortcuts, selectCUUp, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCURight.kbdShortcuts, selectCURight, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectCULeft.kbdShortcuts, selectCULeft, {pageHasCUs: true});

            mod_keyboardLib.bind(CUsShortcuts.selectFirstCU.kbdShortcuts, function() {
                selectFirst(true, true);
            }, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.selectLastCU.kbdShortcuts, function() {
                selectLast(true, true);
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['=', '+'], function() {
                changeSpotlightOnSelecteCU('increase');
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['-'], function() {
                changeSpotlightOnSelecteCU('decrease');
            }, {pageHasCUs: true});

            mod_keyboardLib.bind(['0'], function() {
                changeSpotlightOnSelecteCU('default');
            }, {pageHasCUs: true});

        }
    }

    function isLastCUFullyInViewport() {
        return ( CUs_filtered.length === 0) || isCUFullyInViewport(CUs_filtered[CUs_filtered.length-1]);
    }

    // returns true if any part of $CU is in the viewport, false otherwise.
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function isAnyPartOfCUinViewport($CU, CUBoundingRect) {
       return isCUInViewport($CU, false, CUBoundingRect);
    }

    // returns true if the specified CU is completely in the viewport, false otherwise
    // `CUBoundingRect` is optional; should be passed if already determined by caller
    function isCUFullyInViewport($CU, CUBoundingRect) {
        return isCUInViewport($CU, true, CUBoundingRect);
    }

    function isCUInViewport($CU, mustBeFullyInViewport, CUBoundingRect) {
        var boundingRect = CUBoundingRect || getBoundingRect($CU),
            CUTop = boundingRect.top,
            CUBottom = CUTop + boundingRect.height,
            CULeft = boundingRect.left,
            CURight = CULeft + boundingRect.width,

            winTop = window.pageYOffset, //window.scrollY, //body.scrollTop,
            winBottom = winTop + window.innerHeight,
            winLeft = window.pageXOffset, // window.scrollX,
            winRight = winLeft + window.innerWidth;

        return mustBeFullyInViewport?
            (CUTop >= winTop + getUnusableSpaceAtTopDueToHeader() && CUBottom <= winBottom &&
                CULeft >= winLeft && CURight <= winRight):
            (CUTop <= winBottom && CUBottom >= winTop + getUnusableSpaceAtTopDueToHeader() &&
                CULeft <= winRight && CURight >= winLeft);
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
        _u.mod_help, _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_globals,
        _u.mod_directionalNav, _u.mod_smoothScroll, _u.CONSTS);



