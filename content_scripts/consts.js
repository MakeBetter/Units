_u.CONSTS = (function(helper){

    // properties defined in this object will be set as read-only properties of the global _u.CONSTS object
    var CONSTS = {

        /* -- Used by multiple modules -- */
        /* This class should be applied to all elements added by this extension. Apart from generally being a sensible/
         responsible thing to do, we need to do this to distinguish DOM changes due to these elements (which we don't
         usually care about) from the other DOM changes on the page.
         */
        class_addedByUnitsProj: 'added-by-UnitsProj',

        /* -- Used by mod_CUsMgr -- */
        class_CUOverlay : "CU-overlay",                     // class applied to all CU overlays
        class_CUSelectedOverlay : "CU-overlay-selected",    // class applied to overlay on a selected CU
        class_CUHoveredOverlay : "CU-overlay-hovered",      // class applied to overlay on a hovered CU

    };
    return helper.getImmutableCopy(CONSTS);
})(_u.helper);