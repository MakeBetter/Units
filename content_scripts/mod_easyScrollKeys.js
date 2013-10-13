_u.mod_easyScrollKeys = (function(mod_CUsMgr, mod_basicPageUtils, mod_keyboardLib, mod_domEvents) {

    var thisModule = {
        setup: setup
    };

    var isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        isThumbModifierKeyDown,
        wasThumbModifierKeyUsedAsModifier;

    function setup() {
        mod_domEvents.addEventListener(document, 'keyup', function(e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode === 32) { // 32 - space
                if (mod_keyboardLib.canIgnoreSpaceOnElement(e.target) && !mod_keyboardLib.wasSpaceUsedAsModifier()) {
                    // select downward CU or scroll down if no CUs
                    mod_CUsMgr.selectNextCU('down');
                }
            }
            // check if this is the "thumb" modifier key (91 - cmd, 18 - alt)
            else if (isMac? (keyCode === 91 || keyCode === 93): (keyCode === 18)) {
                isThumbModifierKeyDown = false;
                if (!wasThumbModifierKeyUsedAsModifier) {
                    // select upward CU or scroll up if no CUs
                    mod_CUsMgr.selectNextCU('up');
                }
            }
        }, true);

        mod_domEvents.addEventListener(document, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;
            // check if this is the "thumb" modifier key (91/93 - cmd, 18 - alt)
            if (isMac? (keyCode === 91 || keyCode === 93): (keyCode === 18)) {
                isThumbModifierKeyDown = true;
                wasThumbModifierKeyUsedAsModifier = false; // reset
            }
            else if (isThumbModifierKeyDown) {
                wasThumbModifierKeyUsedAsModifier = true;
            }
        }, true);
    }

    return thisModule;

})(_u.mod_CUsMgr, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_domEvents);

