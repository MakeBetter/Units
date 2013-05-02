// TODO: !!NOTE!!:consider making $topLevelContainer a direct property of `_u`, if this module does nothing apart from
// exposing it publicly
_u.mod_core = (function($, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {

        /* This is used as a container for elements created by this program that we add to the page's DOM. (Technically,
         this would apply only to elements that don't need to be in the render flow of the page. As of 8 Apr 2013, this
         includes all elements added by this extension). This allows keeping modifications to the DOM localized inside a
         single element. */
        $topLevelContainer: $('<div></div>').addClass(CONSTS.class_addedByUnitsProj),
    });

    return thisModule;
})(jQuery,_u.CONSTS);
