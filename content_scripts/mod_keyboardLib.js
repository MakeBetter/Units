/*
mod_keyboardLib

This module provides a wrapper around, and extension to, the MouseTrap library for the rest of the module. If the MouseTrap
library can be replaced with something else, this is the only module that will have to be changed.

The following extensions are made to the original Mousetrap liberary:
1) Add code which enables the use of 'space' key as a modifier (working in conjunction with the mousetrap-modified.js
code)
2) Override Mousetrap.stopCallback according to our specific logic, which:
    i) allows shortcuts to be invoked when when on an text input element, as long as one of these keys is part of the
    shortcut: ctrl, alt, option, meta, and command
    ii) prevents shortcuts without one of the keys listed above from getting invoked ONLY within an text editable
     input element (see code for details), and NOT all input elements (which is mousetrap's default behavior)
 */


_u.mod_keyboardLib = (function(helper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        bind: bind,
        reset:reset,
        isSpaceDown: isSpaceDown
    });

    /**
     * Binds the shortcuts specified to the handler provided
     * @param shortcuts
     * @param handler
     * @param {string} type Can be one of keypress, keydown, keyup
     */
    function bind(shortcuts, handler, type) {
        Mousetrap.bind.call(Mousetrap, shortcuts, handler, type);
    }

    function reset() {
        Mousetrap.reset.call(this);
    }
    function isSpaceDown() {
        return Mousetrap.isSpaceDown;
    }

    Mousetrap.isSpaceDown = false;
    Mousetrap.spaceUsedAsModifier = false;

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
        if (helper.isElementEditable(e.target)) {
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
     We want to disable the keyboard handler only when the target element allows typing (but not other input element
     types.  We will handle separately the cases when the element allows selection/toggling/etc using space etc, e.g:
     checkbox)
     Also, even if the element allows typing we want to allow the keyboard shortcut
     1) if it contains one of these keys: ctrl, alt, option, meta, and command.
     2) Or if it contains both space and shift (as modifiers) along with another key/other keys
     */
    Mousetrap.stopCallback = function(e, element, shortcut) {

        var shortcutKeys = shortcut.trim().split(/\s*\+\s*/),
            splKeys = ["ctrl", "alt", "option", "meta", "command"];

        for (var i = 0; i < shortcutKeys.length; ++i) {
            if (splKeys.indexOf(shortcutKeys[i]) >= 0) {
                return false;
            }
        }

        if (shortcutKeys.indexOf('shift') >= 0 && shortcutKeys.indexOf('space') >= 0) {
            return false;
        }

        return helper.isElementEditable(element);

    };

    return thisModule;

})(_u.helper);

