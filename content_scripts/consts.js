_u.CONSTS = {};

(function(){

    // properties defined in this object will be set as read-only properties of the global _u.CONSTS object
    var CONSTS = {

        /* This class should be applied to all elements added by this extension. Apart from generally being a sensible/
        responsible thing to do, we need to do this to distinguish DOM changes due to these elements (which we don't usually care about) from the other DOM changes on the page.
        */
        class_addedByUnitsProj: 'added-by-UnitsProj',

    };
    for (var property in CONSTS) {
        Object.defineProperty(_u.CONSTS, property, {
            value: CONSTS[property],
            writable: false,
            enumerable: true,
        });
    }
})();