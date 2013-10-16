// JSHint Config
/* global Mousetrap */

/*
 mod_keyboardLib

 This module provides a wrapper around, and extension to, the MouseTrap library for the rest of the module.
 If/when the MouseTrap library is replaced with something else, this is the only module that will have to be
 changed.

 The following extensions are made to the original Mousetrap library:
 1) Enable the use of 'space' key as a *special* modifier (used by mod_selectLink etc)
 2) Override Mousetrap.stopCallback according to our specific logic, which:
 i) allows shortcuts to be invoked even when on a text input element, as long as one of these keys is part of the
 shortcut: ctrl, alt, option, meta, and command
 ii) prevents shortcuts without one of the keys listed above from getting invoked ONLY within an text editable
 input element (see code for details), and NOT all input elements (which is mousetrap's default behavior)
 iii) Check that the shortcut being handled is not in `protectedWebpageShortcuts`
 3) Allowing alt+<key> type shortcuts to work well on Chrome+Windows (ref: mod_chromeAltHack)
 */

_u.mod_keyboardLib = (function(Mousetrap, mod_contentHelper, mod_globals, mod_domEvents, mod_chromeAltHack) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset:reset,
        setup: setup,
        bind: bind,
        shouldHandleShortcut: shouldHandleShortcut, // exposed publicly for Mousetrap library (mousetrap-modified.js)
        canUseSpaceAsModfier: canUseSpaceAsModfier,
        wasSpaceUsedAsModifier: wasSpaceUsedAsModifier,
        canIgnoreSpaceOnElement: canIgnoreSpaceOnElement
    });

    var protectedWebpageShortcuts,
        //    var protectedWebpageShortcuts_lowerCase,
        _canUseSpaceAsModifier,
        _wasSpaceUsedAsModifier = false,
        isSpaceDown = false;

    function setup(settings) {
        mod_domEvents.addEventListener(document, 'keydown', handlerToEnableSpaceAsModifier, true);
        mod_domEvents.addEventListener(document, 'keyup', handlerToEnableSpaceAsModifier, true);

        protectedWebpageShortcuts = settings.expandedUrlData && settings.expandedUrlData.protectedWebpageShortcuts;
//        protectedWebpageShortcuts_lowerCase = [];
//        for (var i = 0; i < protectedWebpageShortcuts.length; i++) {
//            protectedWebpageShortcuts_lowerCase[i] = protectedWebpageShortcuts[i].toLowerCase();
//        }

    }

    /**
     * The bind function maps an array of keyboard shortcuts to a handler. Before the handler is triggered for a
     * particular keyboard shortcut (and the the corresponding keyboard event suppressed), we call `shouldHandleShortcut`
     * to determine if the handler should be invoked. If multiple handlers are bound to the same shortcut, the first
     * one to successfully be handled will stop further propagation of the event, ensuring that only one handler
     * is invoked for a particular keyboard shortcut.
     *
     * @param {Array} shortcuts
     * @param {Function} handler
     * @param {Object|Function}[context] An object specifying the "context" for this shortcut to be applicable (refer:
     * isContextValid()). A function can also be specified -- the shortcut will be handled if the function
     * evaluates to true when the shortcut is invoked. If no `context` is specified, the shortcut is deemed valid in
     * any context.
     * @param {boolean} [dependsOnlyOnContext] If this is true, the function `canTreatAsShortcut` is not used to
     * determine whether or the shortcut should be invoked; only the supplied `context` is used to determine that.

     Further Notes:
     1) When handling a shortcut, we suppress further propagation of the event. This seems reasonable since if a
     shortcut has been invoked, nothing else should happen. (If required in the future, this behavior can be changed
     with an optional parameter. One particular example where event suppression is required is the Google search
     results page, where otherwise pressing keys results in corresponding text  getting typed into the search box.
     (In addition, Mousetrap (mousetrap-modified.js) has been changed to bind events in the capturing phase for this
     to work)
     2) Currently, each specified shortcut is bound on the 'keydown' event (while the corresponding 'keypress' and
     'keyup' events are handled are simply suppresed. This aids simplicity and consistency, but if found to be causing
     issues, can be re-thought.
     3) Binding is done for the capturing phase of the event (by modifying Mousetrap library)
     4) Owing to point 1), modules which have conflicting shortcuts should have their shortcuts bound in order of
     priority. TODO: give an example of this 
     */
    function bind(shortcuts, handler, context, dependsOnlyOnContext) {

        // If the shortcut is to be handled, suppresses event from propagation and returns 1. Else returns 0.
        // [returns 1/0 instead of true/false since returning `false` causes Mousetrap to suppress the event, which
        // causes problems with the 'keypress' and 'keydown' bindings (where this function is itself the callback)]
        var suppressPropagationIfHandling = function (e, shortcut) {
            if (shouldHandleShortcut(shortcut, e.target, context, dependsOnlyOnContext)) {
                mod_contentHelper.suppressEvent(e);
                return 1;
            }
            return 0;
        };

        Mousetrap.bind(shortcuts, function(e, shortcut) {
            if (suppressPropagationIfHandling(e, shortcut)) {
                e.__handledByUnitsProj = true;  // is checked within mousetrap-modified.js
                handler();
            }
        }, 'keydown');
        Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keypress');

        // NOTE: the following line has been commented out because if was preventing sequences
        // of the same letter (e.g.: 'f f') from functioning properly. (refer: github issue #72)
        //Mousetrap.bind(shortcuts, suppressPropagationIfHandling, 'keyup');

        if (mod_chromeAltHack) {
            mod_chromeAltHack.applyHackForSpecifiedShortcuts(shortcuts);
        }
    }

    function reset() {
        protectedWebpageShortcuts = null;
        Mousetrap.reset();
    }

    // Returns true if the [space] key was pressed down with the focus being on an element on which
    // the [space] key can be ignored (refer: canIgnoreSpaceOnElement()), and the [space] key hasn't
    // been released since.
    function canUseSpaceAsModfier() {
        return _canUseSpaceAsModifier;
    }

    // On each space *keyup* event, the value returned by this can be probed to check whether
    // space was used as a modifier or as a regular key. More specifically, this returns true if
    // some other key was pressed while space was pressed down, false otherwise.
    // <technical-detail>
    // Also, for true to be returned, space keydown must have happened on an element where it can be
    // "ignored"; refer: canIgnoreSpaceOnElement()
    // </technical-detail>
    function wasSpaceUsedAsModifier() {
        return _wasSpaceUsedAsModifier;
    }

    function handlerToEnableSpaceAsModifier(e) {
        var keyCode = e.which || e.keyCode;
        // 32 - space
        if (keyCode === 32) {
            if (e.type === 'keydown') {
                _wasSpaceUsedAsModifier = false; // reset the value on space keydown
                isSpaceDown = true;
                if (canIgnoreSpaceOnElement(e.target)) {
                    _canUseSpaceAsModifier = true;
                    mod_contentHelper.suppressEvent(e);
                    thisModule.trigger('space-down-ignored');
                }
            }
            else { // 'keyup'
                _canUseSpaceAsModifier = false;
                isSpaceDown = false;
            }
        }
        // any other key than space
        else {
            if (e.type === 'keydown' && _canUseSpaceAsModifier) {
                _wasSpaceUsedAsModifier = true;
                thisModule.trigger('space-used-as-modifier');
            }
        }
    }

    // Checks if space can be "ignored" on an element (if so, we can suppress the space key event
    // and use space as a modifier on such elements)
    function canIgnoreSpaceOnElement(elem) {
        var $elem = $(elem);

        return !( elem.tagName.toLowerCase() === "input" ||
            !mod_contentHelper.elemAllowsSingleKeyShortcut(elem) ||
            $elem.is('[role=button]') ||
            // checks if the element or any of its ancestors is an HTML5 video element
            // (On youtube pages with HTML5 video, the classes "html5-video-player", and
            // "html5-video-container" exist on the immediate ancestors of the <video>
            // element. If the video is clicked, it the '.html5-video-player' element that
            // seems to have focus rather than the actual <video> element, so we check for
            // these classes as well)
            $elem.closest('video, .html5-video-player, .html5-video-container').length );
    }

    /**
     * Determines whether the invoked key/key combination (`shortcut`) should be handled as a shortcut
     * @param {string} shortcut String representation of keyboard shortcut invoked
     * @param targetElement
     * @param {Object|Function}[context] An object specifying the "context" for this shortcut to be applicable (refer:
     * isContextValid()). A function can also be specified -- the shortcut will be handled if the function
     * evaluates to true when the shortcut is invoked. If no `context` is specified, the shortcut is deemed valid in
     * any context.
     * @param {boolean} [dependsOnlyOnContext] If this is true, the function `canTreatAsShortcut` is not used to
     * determine whether or the shortcut should be invoked; only the supplied `context` is used to determine that.

     */
    function shouldHandleShortcut(shortcut, targetElement, context, dependsOnlyOnContext) {

        // don't treat the current key as shortcut if
        // 1) hints are enabled
        // 2) space is pressed down
        if (mod_globals.hintsEnabled || isSpaceDown) {
            return false;
        }

        // check `canTreatAsShortcut()` only if `dependsOnlyOnContext` is false/unspecified
        if (!dependsOnlyOnContext && !canTreatAsShortcut(shortcut, targetElement)) {
            return false;
        }
        if (protectedWebpageShortcuts && protectedWebpageShortcuts.length &&
            protectedWebpageShortcuts.indexOf(shortcut) >= 0 && isContextValid({pageUIHasFocus: true})) {
            return false;
        }
        if (typeof context === "object") {
            return isContextValid(context);
        }
        else if(typeof context === "function") {
            return context();
        }
        return true;
    }

    /**
     * Returns true if the invoked key/key-combination (`shortcut`), may be treated as a shortcut when the
     * specified element (`targetElement`) has focus. Cases which are exceptions (and return false) are:
     *  - `single key` (i.e. without modifier) on text/content-editable elements
     *  - <Shift> + <key> on text/content editable elements
     *  - [Enter] or [space] on *all* types of <input> elements + <select> element
     *
     *  Note: Compared to Mousetrap's default implementation of `stopCallback`, this function allows a much larger
     *  set of shortcuts to be usable (blocking specifically only the cases listed above), without causing any problems
     *  (that we know of yet)
     * @param shortcut
     * @param targetElement
     */
    function canTreatAsShortcut(shortcut, targetElement) {

        shortcut = shortcut.replace('control', 'ctrl').replace('option', 'alt');

        var shortcutKeys = shortcut.trim().split(/\s*\+\s*/);

        // Irrespective of the target element, we can return true,
        // if: at least one of 'ctrl', 'command' or 'meta' is part of the shortcut,
        // else if: both 'shift' and 'alt' are part of it (either 'shift' or 'alt',
        // by itself isn't enough, since they are used for typing uppercase and
        // accented letters as well)
        if (shortcutKeys.indexOf('ctrl') > -1 ||
            shortcutKeys.indexOf('meta') > -1 ||
            shortcutKeys.indexOf('command') > -1 ||
            (shortcutKeys.indexOf('shift') > -1 && shortcutKeys.indexOf('alt') > -1)) {

            return true;
        }

        // If shortcut is the single key [enter] or [space] and element is *any* input type or the select type,
        // don't treat is as a shortcut
        if (shortcut === 'return' || shortcut === 'enter' || shortcut === 'space') {
            var tagName_lowerCase = targetElement.tagName.toLowerCase();
            if (tagName_lowerCase === 'input' || tagName_lowerCase === 'select') {
                return false;
            }
        }

        return mod_contentHelper.elemAllowsSingleKeyShortcut(targetElement);
    }

    // Override this with a no-op; we use custom logic which allows more shortcuts to be used than Mousetrap.stopCallback's
    // default implementation + shortcuts be run depending on "context". (See `shouldHandleShortcut()`)
    Mousetrap.stopCallback = function(e, element, shortcut) {
        return false;
    };

    // Method inside `supportedContexts` have names corresponding to supported context properties
    // supported by isContextValid()
    var supportedContexts = {
        CUSelected: function() {
            return mod_globals.isCUSelected;
        },
        pageUIHasFocus: function () {
            return !mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        unitsProjUIHasFocus: function () {
            return mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        pageHasUrlData: function() {
            return mod_globals.pageHasUrlData;
        },
        pageHasCUsSpecifier: function() {
            return mod_globals.pageHasCUsSpecifier;
        },
        pageHasCUs: function() {
            return (mod_globals.numCUs_filtered > 0);
        },
    };

    /**
     * Returns true if all the conditions (specified as key/value pairs in the supplied `context` object)
     * are valid. Else false.
     * The list of context conditions is specified in `supportedContexts`
     * Examples of `context` object:
     * {CUSelected: true}, {CUSelected: false, pageUIHasFocus: true}, {unitsProjUIHasFocus: true}, etc
     * (Properties not specified in the `context` object are simply ignored)
     * @param context
     * @returns {boolean}
     */
    function isContextValid(context) {

        for (var prop in context) {
            if (context.hasOwnProperty(prop)) {
                if (context[prop] !== supportedContexts[prop]()) {
                    return false;
                }
            }
        }
        return true;
    }

    return thisModule;

})(Mousetrap, _u.mod_contentHelper, _u.mod_globals, _u.mod_domEvents, _u.mod_chromeAltHack);

