/**
 * This module allows:
 * 1) Keeping track of the DOM event handlers setup by this extension
 * 2) Removal of those events when required (like when the the extension
 *   is disabled (paused) when this module's reset() is called
 *
 * To implement point 1) listed above:
 * a) jQuery's `on` is overridden (this happens to the jQuery library embedded with the
 * extension, and not to the jQuery library used on the page, in case it is)
 * b) A wrapper to DOM's `addEventListener` is provided (as in the case of jQuery's `on`,
 * the the original DOM method `addEventListener` isn't overwritten since it is shared
 * with the webpage's DOM)
 *
 * NOTE: Both these methods – the `addEventListener` wrapper and the overridden jquery 'on' –
 * should only be called from within the respective module's setup() method, otherwise the
 * binding created by  it won't work after the extension is reinitialized for any reason (for
 * example after being paused, or the settings changed) since that involves this module's
 * reset() getting called which removes all handlers previously setup)
 */

_u.mod_domEvents = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = { // **Puts in a copy of Backbone's `Events` module**
        addEventListener: addEventListener,
        reset: reset
    };

    /*-- Module implementation --*/
    var addEventListener_eventHandlers = [],
        jQueryOn_eventHandlers = [];

    // Override jQuery's `on` function by a wrapper which allows tracking of the event bindings made by this extension
    // using $.on(). This should also work for $.click(), $.focus(), $.mouseover(), etc because these are shortcuts for
    // $.on()
    $.fn.on_original = $.fn.on;
    $.fn.on = function(/*args list intentionally left empty*/) {
        this.on_original.apply(this, arguments);
        jQueryOn_eventHandlers.push([this].concat(Array.prototype.slice.call(arguments)));
    };

    /**
     * This wrapper function should be used as an alternative to the DOM's native element.addEventListener
     * in order to track event handlers set up by this extension, so that they can be removed if required.
     * A technique similar to the overriding of jQuery's 'on' function cannot be used for this, because the DOM, including
     * its functions, are shared with current web page.
     *
     * (Also see the 'NOTE' near the top of this file)
     * @param target
     * @param event
     * @param handler
     * @param useCapture
     */
    function addEventListener(target, event, handler, useCapture) {
        target.addEventListener(event, handler, useCapture);
        addEventListener_eventHandlers.push(Array.prototype.slice.call(arguments));
    }


    // this function (and a similar $.fn.off()) is not being implemented as of now,
    // since it isn't really needed while being non-trivial to implement.
    // Not having this function might simply result in some "orphaned" entries
    // in `addEventListener_eventHandlers`, which will have no effect.
//    function removeEventListener(target, event, handler, useCapture) {
//        target.removeEventListener(event, handler, useCapture);
//        // TODO: remove from `addEventListener_eventHandlers`
//        // while not really needed, consider if should be done to be just to be technically correct –
//        // some future code might depend on the contents of addEventListener_eventHandlers etc.
//    }


    /**
     * Removes all event handlers that were previously setup using the overridden `jQuery.on` and `addEventListener`
     * defined in this module
     */
    function reset() {

        var i, len, ehInfo, target;

        len = addEventListener_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = addEventListener_eventHandlers[i];
            target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.removeEventListener.apply(target, ehInfo);
        }
        addEventListener_eventHandlers = [];

        len = jQueryOn_eventHandlers.length;
        for (i = 0; i < len; i++) {
            ehInfo = jQueryOn_eventHandlers[i],
                target = ehInfo[0];
            ehInfo.splice(0, 1);
            target.off.apply(target, ehInfo);
        }
        jQueryOn_eventHandlers = [];

    }

    return thisModule;

})(jQuery);


