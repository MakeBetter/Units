/**
 * Allows tracking of events set up by this extension (so that they be removed/reset when required)
 * For this,
 * 1) jQuery's `on` is overridden
 * 2) A wrapper `addEventListener` method is provided (like, in the case of jQuery's `on`, the the original DOM method
 * `addEventListener` isn't overwritten since it is shared with the webpage's DOM)
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
     * !!!!
     * NOTE: Make sure to call this method from a module's setup() method only. Otherwise all handlers bound with this will
     * get reset when the content script is initialized.
     * @param target
     * @param event
     * @param handler
     * @param useCapture
     */
    function addEventListener(target, event, handler, useCapture) {
        target.addEventListener(event, handler, useCapture);
        addEventListener_eventHandlers.push(Array.prototype.slice.call(arguments));
    }


    // this function is not being defined as of now, since it serves no real pupose,
    // unless the TODO is implemented. A similar thing will have to be done for
    // $.fn.off
//    function removeEventListener(target, event, handler, useCapture) {
//        target.removeEventListener(event, handler, useCapture);
//        // TODO: remove from `addEventListener_eventHandlers`, the the entry corresponding to the
//        // event binding just removed. (strictly speaking, there should be no issue even if this
//        // isn't done, but it should be done to be just to be technically correct, and since
//        // some future code might depend on the contents of addEventListener_eventHandlers)
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


