/**
 * Implements the zen mode. Hide everything on the page except CUs, zenMode whitelisted elements and UnitsProj elements when
 * invoked. Restore the page when mode is switched off.
 */
_u.mod_zenMode = (function($, mod_CUsMgr, mod_keyboardLib, mod_mutationObserver, mod_contentHelper, mod_commonHelper, mod_globals, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset, // reset the module (and disable it if applicable/required)
        setup: setup,   // (re) initialize the module
        toggle: toggle,
        start: start
    });

    var _isStarted, // true when zen mode is active/ started on a page
        _isStoppedByUser, // true if mode is explicitly stopped by user
        _isSupportedOnCurrentPage,// Is evaluated by checking the currently present DOM elements on page. Value is
        // updated on DOM change.

        class_visible = CONSTS.class_zenModeVisible,
        class_hidden = CONSTS.class_zenModeHidden,
        class_excluded = CONSTS.class_zenModeExcluded, // class for explicitly excluded elements inside whitelisted elements
        class_zenModeActive = CONSTS.class_zenModeActive, // class applied to body to indicate that zen mode is started
        class_unitsProjElem = CONSTS.class_unitsProjElem,

        expandedUrlData,

        zenModeAutoOn,
        mainContentSelector,
        mainContentSelector_exclude,
        $visibles, // jquery object containing list of elements that are made visible in zen mode
        $style_paddingTop, // style inserted into the page during zen mode to give a small padding-top in the body

        $document,
        $body;

    var $zenModeIndicator,// UI that indicates whether zen mode is available on a page, and if it is started
        id_zenModeIndicator = 'UnitsProj-zen-mode-indicator',
        $topLevelContainer = _u.$topLevelContainer,
        timeout_updateZenMode;

    /*-- Module implementation --*/
    function reset() {
        _isStarted && stop(); // Resets some global variables and removes any zen mode classes applied to page elements
        $zenModeIndicator && $zenModeIndicator.remove();
        thisModule.stopListening();

        zenModeAutoOn = false;

        _isStoppedByUser = false;
        _isSupportedOnCurrentPage = false;

        timeout_updateZenMode = false;
    }

    function setup(settings) {
        reset();

        expandedUrlData = settings.expandedUrlData;

        // Do not setup this module if there are no zen mode aware elements applicable for current URL
        var CUs_specifier = expandedUrlData && expandedUrlData.CUs_specifier,
            mainContentSpecifier = expandedUrlData && expandedUrlData.page_mainContent;


        if (!(CUs_specifier || mainContentSpecifier)) {
            return;     // don't setup this module if no zen mode aware elements are specified.
        }

        // Cached global variables
        $body = $('body');
        $document = $(document);
        zenModeAutoOn = settings.miscSettings && settings.miscSettings.zenModeAutoOn;

        if (mainContentSpecifier) {
            mainContentSelector = mainContentSpecifier.selector || mainContentSpecifier;
            mainContentSelector_exclude = mainContentSpecifier.exclude;
        }

        // Setup keyboard shortcut for this module
        var miscShortcuts = settings.miscShortcuts;
        mod_keyboardLib.bind(miscShortcuts.toggleZenMode.kbdShortcuts, toggle);

        // Setup indicator UI to be shown on the page when zen mode is supported.
        setupIndicatorUI();

        // On DOM mutation, update page for zen mode
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onDomMutations);

        // Update zen mode status the first time during setup.
        onDomMutations_updateZenModeStatus();

    }

    /**
     * Set up UI for indicating that zen mode is supported on a particular page. This UI also acts a button for toggling
     * zen mode.
     */
    function setupIndicatorUI() {

        $zenModeIndicator = $("<div><span>Z</span></div>");

        $zenModeIndicator
            .attr('id', id_zenModeIndicator)
            .addClass(class_unitsProjElem)
            .appendTo($topLevelContainer)
            .hide();

        // Handler for toggling zen mode on click
        $zenModeIndicator.click(toggle);
    }

    function start() {
        // if the module is not supported for this page, then do not start/stop the zen mode.
        if (!_isSupportedOnCurrentPage) {
            return;
        }

        // Start zen mode
        if (!_isStarted) {
            _isStarted = mod_globals.zenModeOn = true;
            _isStoppedByUser = false;

            applyZenMode();
            applyPaddingTopIfRequired();

        }
    }

    function stop(isStoppedByUser) {
        _isStarted = mod_globals.zenModeOn = false;
        _isStoppedByUser = isStoppedByUser;

        // This check exists because stop() gets called by reset() at setup when $body is not initialized yet.
        if ($body) {
            var disabledByMe = mod_mutationObserver.disable();

            var savedScrollPos = window.pageYOffset; // We lose the scroll position since we hide the body

            $body.hide(); // Hide the body before making a set of CSS changes together. It's much more efficient.

            // Make required CSS changes to stop zen mode.
            $body.removeClass(class_zenModeActive);
            $style_paddingTop && $style_paddingTop.remove();

            // NOTE: The following classes can be removed asynchronously if required for optimization (say with a timeout of 0).
            // Removing class_zenModeActive from body is enough to stop the zen mode visually (as perceived by the user).
            $("." + class_visible).removeClass(class_visible);
            $("." + class_hidden).removeClass(class_hidden);
            $("." + class_excluded).removeClass(class_excluded);

            $body.show();
            window.scroll(window.pageXOffset, savedScrollPos);

            disabledByMe && mod_mutationObserver.enable();

            mod_CUsMgr.updateCUOverlays();
        }

    }

    // public function
    function toggle() {
        if (_isStarted) {
            stop(true); // 'true' to indicate that zen mode was stopped explicitly by user.
        }
        else {
            start();
        }
    }

    /**
     * On DOM mutations, check if zen mode is still supported. Accordingly,
     * 1) Show/ hide the zen mode indicator UI on page
     * 2) Start/stop zen mode
     */
    function onDomMutations_updateZenModeStatus() {
        _isSupportedOnCurrentPage = mod_CUsMgr.getAllCUs().length || $document.find(mainContentSelector).length;

        if (!_isSupportedOnCurrentPage) {
            if ($zenModeIndicator[0].offsetHeight) {
                $zenModeIndicator.hide();
            }

            if (_isStarted) {
                stop();
            }

            return;
        }

        // Show if not currently present on page
        if (!$zenModeIndicator[0].offsetHeight) {
            $zenModeIndicator.show();
        }

        // Start zen mode automatically if zenModeAutoOn = true, and if zen mode was not explicitly stopped earlier
        // by the user.
        if (zenModeAutoOn && !_isStarted && !_isStoppedByUser) {
            start();
        }
    }

    function onDomMutations(mutations) {
        var groupingPeriod = _isStarted ? 500 : 2500; // Mutations grouping period varies depending on whether zen mode
        // is started or not.

        // If no new nodes were added to the page in these mutations, do nothing and return.
        var hasNodesAdded = function (mutation) {
            return mutation.addedNodes.length;
        };
        var filteredMutations = mutations.filter(hasNodesAdded);

        if (!filteredMutations.length) {
            return;
        }

        // compare explicitly with false, which is how we reset it
        if (timeout_updateZenMode === false) {
            timeout_updateZenMode = setTimeout(_onDomMutations, groupingPeriod);
        }
    }

    function _onDomMutations() {
        if (timeout_updateZenMode) {
            clearTimeout(timeout_updateZenMode);
            timeout_updateZenMode = false;    // reset
        }

        onDomMutations_updateZenModeStatus();

        if (_isStarted) {
            applyZenMode();
        }
    }

    function applyZenMode() {
        var disabledByMe = mod_mutationObserver.disable();
        _applyZenMode();
        disabledByMe && mod_mutationObserver.enable();

    }

    /***
     * Makes the required changes to the page to apply zen mode. 
     * 
     * $visibles: list of elements that need to be visible in zen mode.
     * 
     * 1) $visiblesAndAncestors: Create a list of all the $visibles and their ancestors. Apply class_visible to all
     * these elements.
     * 2) For all the siblings of all $visiblesAndAncestors, hide the sibling by applying class_hidden if they do not
     * have class_hidden set. Optimize this process.
     *
     * NOTE: TODO: Need to look into optimizing this method by selectively applying zen mode only on elements that were added
     * in the page. At the moment, we update the entire page for zen mode every time there is a mutation. We respond
     * to only those mutations where an element was added to the page, and these mutations are grouped by a certain time
     * interval (500 ms at the moment).
     *
     * @private
     */
    function _applyZenMode() {
        $("." + class_visible).removeClass(class_visible);
        $("." + class_excluded).removeClass(class_excluded);

        var $topLevelContainer = $(_u.$topLevelContainer),
            $mainContent = $(mainContentSelector),
            CUs_all = mod_CUsMgr.getAllCUs(),
            class_elementTraversed = "UnitsProj-element-traversed",
            $visiblesAndAncestors;

        // $visibles consists of CUs, zen mode whitelisted elements and elements added by UnitsProj.
        $visibles = $topLevelContainer.add($mainContent);
        CUs_all.forEach(function($CU) {
           $visibles = $visibles.add($CU);
        });

        $visiblesAndAncestors = $visibles.parents().andSelf();
        $visiblesAndAncestors.removeClass(class_hidden).addClass(class_visible);

        $.each($visiblesAndAncestors, function(index, parent) {
            var $parent = $(parent);

            $.each($parent.siblings(), function(index, sibling) {
                var $element = $(sibling);
                if ($element.hasClass(class_elementTraversed)) {
                    return;
                }

                $element.addClass(class_elementTraversed);

                if (!$element.hasClass(class_hidden) && !$element.hasClass(class_visible)) {
                      $element.addClass(class_hidden);
                }
            });
        });

        $("." + class_elementTraversed).removeClass(class_elementTraversed);
        $body.addClass(class_zenModeActive); // Note: In mod_CUsMgr, we add/remove this class from the body to hide/show
        // elements on page when updating CUs on DOM mutations.

        mainContentSelector_exclude && $visibles.find(mainContentSelector_exclude).addClass(class_excluded);

    }

    /**
     * Gives a small padding (for better readability) at the top of the page in zen mode.
     * Checks the offset top of the first element from the body and applies a padding-top to body appropriately.
     */
    function applyPaddingTopIfRequired() {
        var $firstVisibleElement = $visibles.eq(0), // assuming that the first element in document order is visually the
        // top-most element. For most pages, the assumption should hold.
            topPositionOfFirstElement = $firstVisibleElement.offset().top,
            requiredDistanceFromTop = 40,
            paddingTop = requiredDistanceFromTop - topPositionOfFirstElement;

        if (paddingTop > 0) {
            var class_paddingTop = 'UnitsProj-zen-mode-padding-top',
                paddingStyle = "." + class_paddingTop + "{padding-top:" +  paddingTop + "px !important;}";

            // Insert style for class_paddingTop into the page.
            $style_paddingTop = $('<style>' + paddingStyle + '</style>');
            $('html > head').append($style_paddingTop);

            $body.addClass(class_paddingTop); // NOTE: We only apply styles using classes (and not inline). This is because
            // applying the style inline would overwrite the existing inline style on the element (and we wouldn't then be
            // able to restore the original style easily).
        }
    }

    return thisModule;

})(jQuery, _u.mod_CUsMgr, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_commonHelper,
        _u.mod_globals, _u.CONSTS);
