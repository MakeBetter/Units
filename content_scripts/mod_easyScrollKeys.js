// Allows downward scroll using space key, and upward scroll using the "thumb-modifier" key,
// i.e. the cmd key in Mac and alt key elsewhere.
// Scroll happens by CU if the page has CUs, else normally
// Cmd/Alt is a modifier key and Space is treated as a special modifier elsewhere in this
// extension. For this reason, we can use them for scrolling action only on *keyup*, if they
// were *not* used as modifiers.
// However, as a way to enable quick repeated scrolling, the thumb-modifier/space key can be
// tapped twice in quick succession, without releasing it after pressing it down the second
// time.
_u.mod_easyScrollKeys = (function(mod_CUsMgr, mod_basicPageUtils, mod_keyboardLib, mod_domEvents) {

    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        isThumbModifierDown,
        wasThumbModifierUsedAsModifier,
        interval_repeatedScroll,
        lastSpaceUpTime,
        lastThumbModifierUpTime,
        doubleTapPeriod = 400;

    function setup() {
        lastSpaceUpTime = lastThumbModifierUpTime = 0;
        mod_domEvents.addEventListener(document, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;
            // check if this is the "thumb" modifier key (93 - right cmd, 18 - alt)
            if (isMac? (keyCode === 93): (keyCode === 18)) {
                isThumbModifierDown = true;
                wasThumbModifierUsedAsModifier = false; // reset

                if (interval_repeatedScroll === false && Date.now() - lastThumbModifierUpTime < doubleTapPeriod) {
                    startRepeatedScroll('up');
                }
            }
            // some other key pressed while thumb modifier is down
            else if (isThumbModifierDown) {
                wasThumbModifierUsedAsModifier = true;
                endRepeatedScroll();
            }
        }, true);

        mod_domEvents.addEventListener(document, 'keyup', function(e) {
            endRepeatedScroll();    // end any on-going repeated scroll
            var keyCode = e.which || e.keyCode;
            if (keyCode === 32) { // 32 - space
                lastSpaceUpTime = Date.now();
                if (mod_keyboardLib.canIgnoreSpaceOnElement(e.target) && !mod_keyboardLib.wasSpaceUsedAsModifier()) {
                    // select downward CU or scroll down if no CUs
                    mod_CUsMgr.selectNextCU('down');
                }
            }
            // check if this is the "thumb" modifier key (93 - right cmd, 18 - alt)
            if (isMac? (keyCode === 93): (keyCode === 18)) {
                lastThumbModifierUpTime = Date.now();
                isThumbModifierDown = false;
                if (!wasThumbModifierUsedAsModifier) {
                    // select upward CU or scroll up if no CUs
                    mod_CUsMgr.selectNextCU('up');
                }
            }
        }, true);

        thisModule.listenTo(mod_keyboardLib, 'space-down-ignored', function() {
            if (interval_repeatedScroll === false && Date.now() - lastSpaceUpTime < doubleTapPeriod) {
                startRepeatedScroll('down');
            }
        });

        thisModule.listenTo(mod_keyboardLib, 'space-used-as-modifier', endRepeatedScroll);
    }

    // starts a repeated scroll in the specified direction
    function startRepeatedScroll(direction) {
        endRepeatedScroll();
        interval_repeatedScroll = setInterval(function(){
            mod_CUsMgr.selectNextCU(direction);
        }, 100);
    }

    // end any on-going repeated scroll started by startRepeatedScroll()
    function endRepeatedScroll() {
        clearInterval(interval_repeatedScroll);
        interval_repeatedScroll = false;
    }

    return thisModule;

})(_u.mod_CUsMgr, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_domEvents);

