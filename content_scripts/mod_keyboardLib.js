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

_u.mod_keyboardLib = (function(Mousetrap, mod_contentHelper, mod_context, mod_chromeAltHack) {
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
     * (the overridden) Mousetrap.stopCallback() is called to determine if the event should be handled or not (which,
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
     3) Owing to point 1), modules which have conflicting shortcuts should have their shortcuts bound in order of 
     priority. TODO: give an example of this 
     */
    function bind(shortcuts, handler, context) {

        // If the shortcut is to be handled, suppresses event from propagation and returns 1. Else returns 0.
        // [returns 1/0 instead of true/false since returning `false` causes Mousetrap to suppress the event, which
        // causes problems with the 'keypress' and 'keydown' bindings (where this function is itself the callback)]
        var suppressPropagationIfHandling = function (e, shortcut) {
            if (shouldHandleShortcut(shortcut, e.target, context)) {
                mod_contentHelper.suppressEvent(e);
                return 1;
            }
            return 0;
        };

        Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keypress');
        Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keyup');

        Mousetrap.bind(shortcuts, function(e, shortcut) {
            if (suppressPropagationIfHandling(e, shortcut)) {
                handler();
            }
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
     * This function handles the <space> keydown and keyup events to allow <space> to be used as a modifier. Importantly,
     * 1) It maintains the state of the two global variables 'isSpaceDown' and 'spaceUsedAsModifier'. The modified
     * mousetrap library code uses 'isSpaceDown'. 'spaceUsedAsModifier' is used to enable the following point.
     * 2) On space keyup, if space was not used as modifier (i.e. no other key was pressed during space keydown), this
     * function invokes on the target element the effect that pressing space normally would have on it (i.e. if space was
     * not being used as a modifier). This ensures space can still be used to do things like toggling a checkbox, if not
     * used in conjunction with another key.
     *
     * @param e Event
     */
    function handlerToEnableSpaceAsModifier(e) {

        var keycode = e.which || e.keycode;

        if (keycode === 32) { // space

            // First, ensure that we don't consider <space> a (potential) modifier if:
            // [the target element is a type-able element or a <select> element] AND there is no other modifier key
            if ((mod_contentHelper.elementAllowsTyping(e.target) || e.target.tagName.toLowerCase() === "select")  &&
                !(e.altKey || e.shiftKey || e.ctrlKey || e.metaKey)) {
                return;
            }

            // else...

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
     * (If the element would have got selected/toggled etc on space being pressed on it,) this function tries to simulate the
     * simulate that effect (currently simply by clicking it)
     * //TODO: is this good enough? can we handle the <select> element as well
     * @param element
     */
    function invokeSpaceOnElement(element) {
        //TODO: If there becomes available in the future a way to actually invoke `space` on the element, do that instead
        var $element = $(element);
        if ($element.is('input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], button')) {
            $element.click();
        }
    }

    /**
     * Determines whether the invoked key/key combination (`shortcut`) should be handled as a shortcut
     * @param {string} shortcut String representation of keyboard shortcut invoked
     * @param targetElement
     * @param context
     */
    function shouldHandleShortcut(shortcut, targetElement, context) {

        if (!canTreatAsShortcut(shortcut, targetElement)) {
            return false;
        }

        if (protectedWebpageShortcuts && protectedWebpageShortcuts.length &&
            protectedWebpageShortcuts.indexOf(shortcut) >= 0/* && !mod_context.isUnitsProjElement(element)*/) {
            return false;
        }

        /*
         For context:
         can specify context using a hash E.g: {CUSelected: true, pageUIHasFocus: true}, {CUSelected: true}, {CUSelected: true, unitsProjUIHasFocus: false}, etc
         OR If using strings, can have each of the used combinations (shouldn't be that many) described by a string etc
         */
//        if (context === "page") {
//
//        }
//        else if (context === "CUSelected") {
//
//        }
//        else if (typeof context === function) {
//            return context();
//        }

        return true;
    }

    /**
     * Returns true if the invoked key/key-combination (`shortcut`), should be treated as a shortcut when the
     * specified element (`targetElement`) has focus. Cases which are exceptions (and return false) are:
     *  - `single key` (i.e. without modifier) on text/content-editable elements
     *  - <Shift> + <key> on text/content editable elements
     *  - `space` (as modifier) + <key> on text/content editable elements (since this tends to get  invoked when typing
     *    quickly)
     *  - <Enter> on *all* types of <input> elements + <select> element
     *  - `space` on  *all* types of <input> elements + <select> element (this case is actually handled by
     *    handlerToEnableSpaceAsModifier())
     *
     *  Note: Compared to Mousetrap's default implementation of `stopCallback`, this function allows a much larger
     *  set of shortcuts to be usable (blocking specifically only the cases listed above), without causing any problems
     *  (that we know of yet)
     * @param shortcut
     * @param targetElement
     */
    function canTreatAsShortcut(shortcut, targetElement) {

        // Check if one of these 'special modifier keys' is present: `ctrl`, `alt`, `option`, `meta`, and `command` (i.e.
        // modifiers excluding `shift` and `space`), each of which by itself is enough to deem the key combination a
        // shortcut irrespective of the target element
        var shortcutKeys = shortcut.trim().split(/\s*\+\s*/),
            splModifierKeys = ["ctrl", "alt", "option", "meta", "command"];

        for (var i = 0; i < shortcutKeys.length; ++i) {
            if (splModifierKeys.indexOf(shortcutKeys[i]) >= 0) {
                return true;
            }
        }

        // Otherwise if *both* <space> and <shift> (+ some other <key(s)>) are present, we can deem the combination as a
        // shortcut irrespective of the target element
        if (shortcutKeys.indexOf('shift') >= 0 && shortcutKeys.indexOf('space') >= 0) {
            return true;
        }

        // If shortcut is the single key <enter> and element is *any* input type or the select type, don't treat is
        // as a shortcut
        // (note: the similar case for <space> is handled in handlerToEnableSpaceAsModifier())
        if (shortcut === 'return' || shortcut === 'enter') {
            var tagName_lowerCase = targetElement.tagName.toLowerCase();
            if (tagName_lowerCase === 'input' || tagName_lowerCase === 'select') {
                return false;
            }
        }

        return mod_contentHelper.elementAllowsSingleKeyShortcut(targetElement);
    }

    // Override this with a no-op; we use custom logic which allows more shortcuts to be used than Mousetrap.stopCallback's
    // default implementation + shortcuts be run depending on "context". (See `shouldHandleShortcut()`)
    Mousetrap.stopCallback = function(e, element, shortcut) {
        return false;
    };

    return thisModule;

})(Mousetrap, _u.mod_contentHelper, _u.mod_context, _u.mod_chromeAltHack);

