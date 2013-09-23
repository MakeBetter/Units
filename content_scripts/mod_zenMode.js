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
        _isStoppedByUser = false, // true if mode is explicitly stopped by user
        _isSupportedOnCurrentPage = false ,// Is evaluated by checking the currently present DOM elements on page. Value is
        // updated on DOM change.

        class_visible = CONSTS.class_zenModeVisible,
        class_hidden = CONSTS.class_zenModeHidden,
        class_excluded = CONSTS.class_zenModeExcluded,
        class_zenModeActive = CONSTS.class_zenModeActive,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,

        expandedUrlData,

        zenModeAutoOn,
        mainContentSelector,
        mainContentSelector_exclude,
        $visibles,
        $style_paddingTop,

        $document,
        $body;

    var $zenModeIndicator,
        id_zenModeIndicator = 'UnitsProj-zen-mode-indicator',
        $topLevelContainer = _u.$topLevelContainer;


    var timeout_updateZenMode = false;

    /*-- Module implementation --*/
    function reset() {
        stop();
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
            return;     // don't setup this module if no elements are specified to be shown in this mode.
        }

        // Cached global variables
        $body = $("body");
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
     * Set up UI for indicating that zen mode is supported on a particular page.
     */
    function setupIndicatorUI() {

        $zenModeIndicator = $("<div><span>Z</span></div>");

        $zenModeIndicator
            .attr('id', id_zenModeIndicator)
            .addClass(class_addedByUnitsProj)
            .appendTo($topLevelContainer)
            .hide();

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

        $body && $body.removeClass(class_zenModeActive);
        $("." + class_visible).removeClass(class_visible);
        $("." + class_hidden).removeClass(class_hidden);
        $("." + class_excluded).removeClass(class_excluded);
        $style_paddingTop && $style_paddingTop.remove();
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
        var hasNodesAdded = function (element) {
            return element.addedNodes.length;
        };
        var filteredMutations = mutations.filter(hasNodesAdded);

        if (!filteredMutations.length) {
            return;
        }

//        compare explicitly with false, which is how we reset it
        if (timeout_updateZenMode === false) {
            timeout_updateZenMode = setTimeout(_onDomMutations, 500);
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

    function applyPaddingTopIfRequired() {
        var firstVisibleElement = $visibles[0], // assuming that the first element in document order is visually the
        // top-most element. For most pages, the assumption should hold.
            topPositionOfFirstElement = mod_commonHelper.getOffsetPosition(firstVisibleElement).top,
            requiredDistanceFromTop = 40,
            paddingTop = (topPositionOfFirstElement < requiredDistanceFromTop) &&  requiredDistanceFromTop - topPositionOfFirstElement, // padding
            // applied is the difference of

            class_paddingTop = 'UnitsProj-zen-mode-padding-top',
            paddingStyle = "." + class_paddingTop + "{padding-top:" +  paddingTop + "px !important;}";

        // Insert style for class_paddingTop into the page.
        $style_paddingTop = $('<style>' + paddingStyle + '</style>');
        $('html > head').append($style_paddingTop);

        $body.addClass(class_paddingTop); // NOTE: We can apply styles to an element in the page only using classes and
        // not inline. This is because applying the style inline would overwrite an existing inline style on the element
        // (and we wouldn't be able to restore the original style).
        // We need to make sure that we don't tamper with the original HTML/CSS of the page.
    }

    return thisModule;

})(jQuery, _u.mod_CUsMgr, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_globals, _u.CONSTS);    // pass as input external modules that this modules depends on
