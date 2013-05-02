/*
 mod_keyboardLib

 This module provides a wrapper around, and extension to, the MouseTrap library for the rest of the module. If the MouseTrap
 library can be replaced with something else, this is the only module that will have to be changed.

 The following extensions are made to the original Mousetrap library:
 1) Add code which enables the use of 'space' key as a modifier (working in conjunction with the mousetrap-modified.js
 code)
 2) Override Mousetrap.stopCallback according to our specific logic, which:
 i) allows shortcuts to be invoked even when on an text input element, as long as one of these keys is part of the
 shortcut: ctrl, alt, option, meta, and command
 ii) prevents shortcuts without one of the keys listed above from getting invoked ONLY within an text editable
 input element (see code for details), and NOT all input elements (which is mousetrap's default behavior)
 iii) Check that the shortcut being handled is not in `protectedWebpageShortcuts`
 3) Allowing alt+<key> type shortcuts to work well on Chrome+Windows (ref: mod_chromeAltHack)
 */

_u.mod_keyboardLib = (function(Mousetrap, mod_contentHelper, mod_chromeAltHack) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        bind: bind,
        reset:reset,
        isSpaceDown: isSpaceDown,
        setProtectedWebpageShortcuts: setProtectedWebpageShortcuts
    });


    Mousetrap.isSpaceDown = false;
    Mousetrap.spaceUsedAsModifier = false;
    var protectedWebpageShortcuts;
//    var protectedWebpageShortcuts_lowerCase;

    /**
     * The bind function maps an array of keyboard shortcuts to a handler. Binding is done for the capturing phase of
     * the event. Before the handler is triggered for a particular keyboard shortcut, and the event suppressed,
     * (the overridden) Mousetrap.stopCallback() is checked to determine if the event should be handled or not (which,
     * among other things, checks if the shortcut is not in `protectedWebpageShortcuts` before proceeding)
     * shortcuts specified in urlData.protectedWebpageShortcuts
     * @param {Array} shortcuts
     * @param {Function} handler

     Further Notes:
     1) When handling a shortcut, we suppress further propagation of the event. This seems reasonable since if a
     shortcut has been invoked, nothing else should happen. (If required in the future, this behavior can be changed
     with an optional parameter. One particular example where event suppression is required is the Google search
     results page, where otherwise pressing keys results in then  getting typed into the search box. (In addition,
     we change Mousetrap (mousetrap-modified.js) to bind events in the capturing phase for this to work)
     2) Currently, specifying a shortcut means, it gets invoked on 'keydown' (while the corresponding 'keypress' an
     'keyup' events are handled are simply supresed. This aids simplicity and consistency, but if found to be causing
     issues, can be re-thought.
     */
    function bind(shortcuts, handler) {

        Mousetrap.bind(shortcuts, mod_contentHelper.suppressEvent, 'keypress');
        Mousetrap.bind(shortcuts, mod_contentHelper.suppressEvent, 'keyup');

        Mousetrap.bind(shortcuts, function(e) {
            mod_contentHelper.suppressEvent(e);
            handler();
        }, 'keydown');

        if (mod_chromeAltHack) {
            mod_chromeAltHack.applyHack(shortcuts);
        }
    }

    function reset() {
        Mousetrap.reset.call(this);
    }
    function isSpaceDown() {
        return Mousetrap.isSpaceDown;
    }
    function setProtectedWebpageShortcuts(shortcuts) {
        if (!shortcuts || !shortcuts.length)
            return;
        protectedWebpageShortcuts = shortcuts;
//        protectedWebpageShortcuts_lowerCase = [];
//        if (protectedWebpageShortcuts) {
//            for (var i = 0; i < protectedWebpageShortcuts.length; i++) {
//                protectedWebpageShortcuts_lowerCase[i] = protectedWebpageShortcuts[i].toLowerCase();
//            }
//        }
    }

    /**
     * This function does the following:
     * 1) Maintains the state of the two global variables 'isSpaceDown' and 'spaceUsedAsModifier'. The modified mousetrap
     * library code uses 'isSpaceDown'. 'spaceUsedAsModifier' is used to enable the following point.
     * 2) On space keyup, if space was not used as modifier (i.e. no other key was pressed during space keydown), this
     * function invokes on the target element the effect that pressing space normally would have on it (i.e. if space was
     * not being used as a modifier). This ensures space can still be used to do things like toggling a checkbox, if not
     * used in conjunction with another key.
     *
     * @param e Event
     */
    function handlerToEnableSpaceAsModifier(e) {

        // ignore when target element supports keyboard data input
        if (mod_contentHelper.isElementEditable(e.target)) {
            return;
        }

        // else...

        var keycode = e.which || e.keycode;

        if (keycode === 32) { // space
            if (e.type === 'keydown') {
//            console.log('space down');
                Mousetrap.isSpaceDown = true;
                Mousetrap.spaceUsedAsModifier = false; // reset
            }
            else { // 'keyup'
//            console.log('space up');
                Mousetrap.isSpaceDown = false;
                if (!Mousetrap.spaceUsedAsModifier) {
                    invokeSpaceOnElement(e.target);
                }
                Mousetrap.spaceUsedAsModifier = false; // reset
            }
            e.stopImmediatePropagation();
            e.stopPropagation();
            e.preventDefault();

        }
        // any other key than space
        else {
            if (e.type === 'keydown' && Mousetrap.isSpaceDown) {
                Mousetrap.spaceUsedAsModifier = true;
            }
        }

    }

    document.addEventListener('keydown', handlerToEnableSpaceAsModifier, true);
    document.addEventListener('keyup', handlerToEnableSpaceAsModifier, true);

    /**
     * Given an element, this function invokes the action on this element that would have occurred had space been pressed
     * when this element had focus.
     * E.g: checkbox gets toggled.
     * If no action is associated with pressing space when the specified element has focus, nothing is done.
     * @param element
     */
    function invokeSpaceOnElement(element) {
        var $element = $(element);
        if ($element.is('input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], button')) {
            $element.click();
        }
    }

    /* We override this method to change the default Mousetrap behavior.
     1) We want to disable the keyboard handler only when the target element allows typing (but not other input element
     types. [Side effect: Because `space` can be used to interact even with non-text input elements, like toggling a
     check box, we must ensure we don't break that behavior (while continuing to allow `space` to be used as a modifier
     key for shortcuts, which should work correctly even when the focus is on a non-text input element). This is done
     within handlerToEnableSpaceAsModifier()]
     2) Also, even if the element allows typing we want to allow the keyboard shortcut
      i) if it contains one of these keys: ctrl, alt, option, meta, and command.
      ii) Or if it contains both space and shift (as modifiers) along with another key/other keys
     3) Finally (and we do this check first actually), if the shortcut is in `protectedWebpageShortcuts`, and the focus
     isn't within a UnitsProj created element, we return true (i.e. stop the callback)
     */
    Mousetrap.stopCallback = function(e, element, shortcut) {

        if (protectedWebpageShortcuts && protectedWebpageShortcuts.length &&
            protectedWebpageShortcuts.indexOf(shortcut) >= 0/* && !mod_contentHelper.isUnitsProjElement(element)*/) {
            return true;
        }

        // check if one of these 'special keys' present: ctrl, alt, option, meta, and command
        var shortcutKeys = shortcut.trim().split(/\s*\+\s*/),
            splKeys = ["ctrl", "alt", "option", "meta", "command"];

        for (var i = 0; i < shortcutKeys.length; ++i) {
            if (splKeys.indexOf(shortcutKeys[i]) >= 0) {
                return false;
            }
        }

        // if none of the 'special keys' is present, check if both `space` + `shift` are present
        if (shortcutKeys.indexOf('shift') >= 0 && shortcutKeys.indexOf('space') >= 0) {
            return false;
        }

        return mod_contentHelper.isElementEditable(element);

    };

    return thisModule;

})(Mousetrap, _u.mod_contentHelper, _u.mod_chromeAltHack);

