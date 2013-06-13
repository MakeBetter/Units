_u.CONSTS = (function(mod_commonHelper){

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

        class_zenModeVisible: "UnitsProj-zen-mode-visible", // class added to all elements hidden in the 'zen mode'
        class_zenModeHidden: "UnitsProj-zen-mode-hidden", // class added to all elements made visible in the zen mode

        // A selector for all elements that can receive the keyboard focus. Based on http://stackoverflow.com/a/7668761,
        // with the addition that a :visible has been added in each selector, instead of using a .filter(':visible')
        // AND we are filtering out elements with tabindex = -1 since we only require tab-able elements
        focusablesSelector: 'a[href]:not(*[tabindex=-1]:visible), area[href]:not(*[tabindex=-1]:visible), input:not([disabled]):not(*[tabindex=-1]:visible), select:not([disabled]):not(*[tabindex=-1]:visible), textarea:not([disabled]):not(*[tabindex=-1]:visible), button:not([disabled]):not(*[tabindex=-1]:visible), iframe:not(*[tabindex=-1]:visible), object:not(*[tabindex=-1]:visible), embed:visible, *[tabindex]:not(*[tabindex=-1]:visible), *[contenteditable]'

        };
    return mod_commonHelper.makeImmutable(CONSTS);
})(_u.mod_commonHelper);
