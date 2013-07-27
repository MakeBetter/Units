/**
 * Implements the zen mode. Hide everything on the page except CUs, zenMode whitelisted elements and UnitsProj elements when
 * invoked. Restore the page when mode is switched off.
 */
_u.mod_zenMode = (function($, mod_CUsMgr, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset, // reset the module (and disable it if applicable/required)
        setup: setup,   // (re) initialize the module
        toggle: toggle,
        start: start
    });

    var _isActive = false,
        $style_whiteList,
        class_hidden = CONSTS.class_zenModeHidden,
        class_visible = CONSTS.class_zenModeVisible,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        expandedUrlData,
        isModuleSetup = false; // true if the module has been set up

    /*-- Module implementation --*/
    function reset() {

    }
    function setup(settings) {
        reset();

        expandedUrlData = settings.expandedUrlData;
        if (!(expandedUrlData && (expandedUrlData.CUs_specifier || expandedUrlData.zenModeWhiteList))) {
            return;     // don't setup this module if no elements are specified to be shown in this mode.
        }

        var miscShortcuts = settings.miscShortcuts;
        mod_keyboardLib.bind(miscShortcuts.toggleZenMode.kbdShortcuts, toggle);

        thisModule.listenTo(mod_CUsMgr, 'CUs-all-change', function() {
            if (_isActive) {
                updateCUsState(); // Update the zen mode state for any added CUs (for sites where CUs get dynamically added
                // due to infinite scroll)
            }
        });

        isModuleSetup = true;
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
        if (!isModuleSetup) {
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

    return thisModule;

})(jQuery, _u.mod_CUsMgr, _u.mod_keyboardLib, _u.CONSTS);    // pass as input external modules that this modules depends on
