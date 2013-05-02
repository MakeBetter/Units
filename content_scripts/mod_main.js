(function($, mod_core, mod_mutationObserver) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        // no public interface for the main module
    });

    /*-- Event bindings --*/
    // This binding exists because,in theory, JS code on a page can replace the body element with a new one at any
    // time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
    thisModule.listenTo(mod_mutationObserver, 'dom-mutation', ensureTopLevelContainerIsInDom);

    /*-- Module implementation --*/
    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
    function ensureTopLevelContainerIsInDom() {
        if (!document.body.contains(mod_core.$topLevelContainer[0])) {
//        console.log('appending $topLevelContainer to body');
            mod_core.$topLevelContainer.appendTo(document.body);
        }
    }

    //return thisModule; // not required
})(jQuery, _u.mod_core, _u.mod_mutationObserver);
