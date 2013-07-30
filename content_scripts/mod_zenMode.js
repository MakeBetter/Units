/**
 * Implements the zen mode. Hide everything on the page except CUs, zenMode whitelisted elements and UnitsProj elements when
 * invoked. Restore the page when mode is switched off.
 */
_u.mod_zenMode = (function($, mod_CUsMgr, mod_keyboardLib, mod_mutationObserver, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset, // reset the module (and disable it if applicable/required)
        setup: setup,   // (re) initialize the module
        toggle: toggle,
        start: start
    });

    var _isActive = false, // true when zen mode is active/ started on a page
        _isZenModeApplicable = false,// true if zen mode is relevant for the current page's DOM. Is updated on DOM mutations.

        $style_whiteList,
        class_hidden = CONSTS.class_zenModeHidden,
        class_visible = CONSTS.class_zenModeVisible,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        expandedUrlData,
        isModuleSetup = false; // true if the module has been set up

    var $zenModeToggleButton,
        id_zenMode = 'UnitsProj-zen-mode-button',
        $topLevelContainer = _u.$topLevelContainer;


    var timeout_updateZenMode = false,
        lit_updateZenMode;

    /*-- Module implementation --*/
    function reset() {
        $zenModeToggleButton && $zenModeToggleButton.remove();
        thisModule.stopListening();
        isModuleSetup = false;
        timeout_updateZenMode = false;
    }
    function setup(settings) {
        reset();

        expandedUrlData = settings.expandedUrlData;

        var CUs_specifier = expandedUrlData && expandedUrlData.CUs_specifier,
            zenModeWhiteListSelector = expandedUrlData && expandedUrlData.zenModeWhiteList;
        if (!(CUs_specifier || zenModeWhiteListSelector)) {
            return;     // don't setup this module if no elements are specified to be shown in this mode.
        }

        setupZenModeUI();

        bindMutationEvents();

        var miscShortcuts = settings.miscShortcuts;
        mod_keyboardLib.bind(miscShortcuts.toggleZenMode.kbdShortcuts, toggle);

        thisModule.listenTo(mod_CUsMgr, 'CUs-all-change', function() {
            if (_isActive) {
                updateCUsState(); // Update the zen mode state for any added CUs (for sites where CUs get dynamically added
                // due to infinite scroll)
            }
        });

        onDomMutations_updateZenModeStatus();

        isModuleSetup = true;

    }

    function onDomMutations_updateZenModeStatus() {

        var $document = $(document),
            zenModeWhiteListSelector = expandedUrlData && expandedUrlData.zenModeWhiteList;

        if (!(( mod_CUsMgr.getAllCUs().length) || $document.find(zenModeWhiteListSelector).length)) {

            _isZenModeApplicable = false;
            $zenModeToggleButton.hide();

            return;
        }

        _isZenModeApplicable = true;
        $zenModeToggleButton.show();
    }

    function setupZenModeUI() {

        $zenModeToggleButton = $("<div><span>Z</span></div>");

        $zenModeToggleButton
            .attr('id', id_zenMode)
            .addClass(class_addedByUnitsProj)
            .appendTo($topLevelContainer)
            .hide();

        $zenModeToggleButton.click(toggle);
    }


    // public function
    function toggle() {
        if (_isActive) {
            stop();
        }
        else {
            start();
        }
    }

    function start() {
        // if the module was not set up initially, then do not start/stop the zen mode.
        if (!isModuleSetup || !_isZenModeApplicable) {
            return;
        }

        _isActive = true;

        $("body").addClass(class_hidden);
        $("." + class_addedByUnitsProj).addClass(class_visible);

        updateCUsState();

        $style_whiteList = $('<style>' + expandedUrlData.zenModeWhiteList + '{ visibility: visible }</style>');
        $('html > head').append($style_whiteList);

    }

    function stop() {
        if (!isModuleSetup) {
            return;
        }

        _isActive = false;

        $("body").removeClass(class_hidden);
        $("." + class_addedByUnitsProj).removeClass(class_visible);

        updateCUsState();

        $style_whiteList && $style_whiteList.remove();

    }

    function updateCUsState() {
        var CUs_all = mod_CUsMgr.getAllCUs(),
            $CU, $el;

        for (var i = 0; i < CUs_all.length; i++) {
            $CU = CUs_all[i];

            for (var j = 0; j < $CU.length; j++) {
                $el = $CU.eq(j);

                if (_isActive) {
                    $el.addClass(class_visible);
                }
                else {
                    $el.removeClass(class_visible);
                }
            }
        }
    }

    function bindMutationEvents() {
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onDomMutations);
    }

    function onDomMutations() {
        // compare explicitly with false, which is how we reset it
        if (timeout_updateZenMode === false) {

            // NOTE copied from mod_CUsMgr where this code is originally used.

//            // In the following line, we restrict the minimum value of the timeout delay to
//            // 0. This should not normally be required since negative delay is supposed to
//            // have the same effect as a 0 delay. However, doing this fixes  #76 (Github).
//            // This is mostly likely due to some quirk in Chrome.
            timeout_updateZenMode = setTimeout(_onDomMutations, Math.max(0, 1000 -
                (Date.now() - lit_updateZenMode)));
        }
    }

    function _onDomMutations() {
        if (timeout_updateZenMode) {
            clearTimeout(timeout_updateZenMode);
            timeout_updateZenMode = false;    // reset
        }
        lit_updateZenMode = Date.now();
        onDomMutations_updateZenModeStatus();
    }


    return thisModule;

})(jQuery, _u.mod_CUsMgr, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.CONSTS);    // pass as input external modules that this modules depends on
