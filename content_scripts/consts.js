_u.CONSTS = {};

(function(){

    // properties defined in this object will be set as read-only properties of the global _u.CONSTS object
    var CONSTS = {

        /* This class should be applied to all elements added by this extension. This is used to distinguish DOM mutation
        events caused by them from the those of the page's own elements. This is also a "responsible" thing since it marks
        out clearly elements added by this code to the DOM (for anyone looking at DOM, page source etc) */
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