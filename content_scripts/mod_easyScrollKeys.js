// Allows downward scroll using space key, and upward scroll using either shift+space or the "thumb-modifier" key,
// i.e. the cmd key in Mac and alt key elsewhere.
// Scrolling is done CU-by-CU if the page has CUs, else normally.
// Cmd/Alt is a modifier key and Space is treated as a special modifier elsewhere in this
// extension. For this reason, we can use them for scrolling action only on *keyup*, if they
// were *not* used as modifiers.
// However, for quick repeated scrolling, the thumb-modifier/space key can be
// tapped twice in quick succession, without releasing it after pressing it down the second
// time.
_u.mod_easyScrollKeys = (function(mod_CUsMgr, mod_basicPageUtils, mod_keyboardLib, mod_domEvents) {

    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        isSpaceDown,
        isThumbModifierDown,
        isShiftDown,
        wasThumbModifierUsedAsModifier,
        interval_repeatedScroll,
        lastSpaceUpTime,
        lastThumbModifierUpTime,
        lastSpaceDownTime,
        lastThumbModifierDownTime,
        doubleTapPeriod = 400,
        now,
        // scroll/select CU on key-up only if the thumb modifier or space is held down for less than this time
        // (to reduce accidental triggering)
        maxKeyDownTime = 400;

    function setup() {
        lastSpaceUpTime = lastThumbModifierUpTime = lastSpaceDownTime = lastThumbModifierDownTime = 0;
        mod_domEvents.addEventListener(document, 'keydown', function(e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode === 16) { // 16 - shift
                isShiftDown = true;
            }
//            // check if this is the "thumb" modifier key (93 - right cmd, 18 - alt)
//            else if (isMac? (keyCode === 93 || keyCode === 91): (keyCode === 18)) {
//                wasThumbModifierUsedAsModifier = false; // reset
//                isThumbModifierDown = true;
//                lastThumbModifierDownTime = now = Date.now();
//                if (interval_repeatedScroll === false && now - lastThumbModifierUpTime < doubleTapPeriod) {
//                    startRepeatedScroll('up');
//                }
//            }
//            // some other key pressed while thumb modifier is down
//            else if (isThumbModifierDown) {
//                wasThumbModifierUsedAsModifier = true;
//                endRepeatedScroll();
//            }
        }, true);

        mod_domEvents.addEventListener(document, 'keyup', function(e) {
            endRepeatedScroll();    // end any on-going repeated scroll
            var keyCode = e.which || e.keyCode;
            if (keyCode === 16) { // 16 - shift
                isShiftDown = false;
            }
            else if (keyCode === 32) { // 32 - space
                isSpaceDown = false;
                lastSpaceUpTime = now = Date.now();
                if (now - lastSpaceDownTime < maxKeyDownTime &&
                    mod_keyboardLib.canIgnoreSpaceOnElement(e.target) && !mod_keyboardLib.wasSpaceUsedAsModifier()) {

                    // select downward CU or scroll down if no CUs
                    mod_CUsMgr.selectNextCUOrScroll(isShiftDown? 'up': 'down');
                }
            }
            // check if this is the "thumb" modifier key (91, 93 - cmd, 18 - alt)
//            if (isMac? (keyCode === 93 || keyCode === 91): (keyCode === 18)) {
//                lastThumbModifierUpTime = now = Date.now();
//                isThumbModifierDown = false;
//                if (now - lastThumbModifierDownTime < maxKeyDownTime && !wasThumbModifierUsedAsModifier) {
//                    // select upward CU or scroll up if no CUs
//                    mod_CUsMgr.selectNextCUOrScroll('up');
//                }
//            }
        }, true);

        // we need to listen to this event since the space-keydown event is suppressed by the
        // keyboard library
        thisModule.listenTo(mod_keyboardLib, 'space-down-ignored', function() {
            if (!isSpaceDown) {
                isSpaceDown = true;
                lastSpaceDownTime =  now = Date.now();
                if (interval_repeatedScroll === false && now - lastSpaceUpTime < doubleTapPeriod) {
                    startRepeatedScroll(isShiftDown? 'up': 'down');
                }
            }
        });

        thisModule.listenTo(mod_keyboardLib, 'space-used-as-modifier', endRepeatedScroll);

        // the following is required to fix the issue of inadvertent scroll-ups ups on the thumb-modifier
        // key's keyup, when thumb modifier is involved in a keyboard shortcut (like cmd + <key>) to change
        // tabs
        chrome.runtime.onMessage.addListener(
            function(request, sender, sendResponse) {
                if (request.message === "tabActivated" || request.message === "tabDeactivated") {
                    wasThumbModifierUsedAsModifier = true;
                    endRepeatedScroll();
                }
            }
        );
    }

    // starts a repeated scroll in the specified direction
    function startRepeatedScroll(direction) {
        endRepeatedScroll();
        interval_repeatedScroll = setInterval(function(){
            mod_CUsMgr.selectNextCUOrScroll(direction);
        }, 100);
    }

    // end any on-going repeated scroll started by startRepeatedScroll()
    function endRepeatedScroll() {
        clearInterval(interval_repeatedScroll);
        interval_repeatedScroll = false;
    }

    return thisModule;

})(_u.mod_CUsMgr, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_domEvents);

