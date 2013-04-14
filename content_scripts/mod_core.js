_u.mod_core = (function($, mod_mutationObserver, CONSTS) {
    "use strict";

    var thisModule = $.extend({}, _u.mod_events, {

        /* This is used as a container for elements created by this program that we add to the page's DOM. (Technically,
         this would apply only to elements that don't need to be in the render flow of the page. As of 8 Apr 2013, this
         includes all elements added by this extension). This allows keeping modifications to the DOM localized inside a
         single element. */
        $topLevelContainer: $('<div></div>').addClass(CONSTS.class_addedByUnitsProj),
    });

    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
    function eh_ensureTopLevelContainerIsInDom() {
        if (!document.body.contains(thisModule.$topLevelContainer[0])) {
//        console.log('appending $topLevelContainer to body');
            thisModule.$topLevelContainer.appendTo(document.body);

        }
    }
    // the following code has been put in because ,in theory, JS code on a page can replace the body element with a new one
    // at run time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
    thisModule.listenTo(mod_mutationObserver, 'dom-mutations', eh_ensureTopLevelContainerIsInDom);

    return thisModule;
})(jQuery, _u.mod_mutationObserver, _u.CONSTS);


