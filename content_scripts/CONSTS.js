_u.CONSTS = (function(mod_commonHelper){

    // properties defined in this object will be set as read-only properties of the global _u.CONSTS object
    var CONSTS = {

        /* -- Used by multiple modules -- */
        // This class should be applied to all elements added by this extension. This helps
        // distinguish elements added by UnitsProj from the other elements on the page.
        class_unitsProjElem: 'UnitsProj-elem',

        /* -- Used by mod_CUsMgr -- */
        class_CUOverlay : "CU-overlay",                     // class applied to all CU overlays
        class_CUSelectedOverlay : "CU-overlay-selected",    // class applied to overlay on a selected CU
        class_CUHoveredOverlay : "CU-overlay-hovered",      // class applied to overlay on a hovered CU
        // class applied to each of the 4 overlays covering the non-selected-CU part of the page
        class_nonCUPageOverlay: "non-CU-page-overlay",

        class_zenModeHidden: "UnitsProj-zen-mode-hidden", // class added to all elements made visible in the zen mode
        class_zenModeExcluded: "UnitsProj-zen-mode-excluded", // class added to all elements explicitly excluded in the zen mode
        class_zenModeVisible: "UnitsProj-zen-mode-visible", // class added to all elements hidden in the 'zen mode'
        class_zenModeActive: "UnitsProj-zen-mode-active", // class added to the body when zen mode is active

        // A selector for all elements that can receive the keyboard focus. Based on http://stackoverflow.com/a/7668761,
        // With the addition that a :visible has been added in each selector, instead of using a .filter(':visible')
        // AND we are filtering out elements with tabindex = -1 since we only require tab-able elements

        // NOTE: Removed 'iframe' and 'embed' in this selector. Although they are technically focusable, we don't need
        // them in the scenarios that this selector is used.
        focusablesSelector: 'a[href]:not(*[tabindex=-1]):visible, area[href]:not(*[tabindex=-1]):visible, ' +
            'input:not([disabled]):not(*[tabindex=-1]):visible, select:not([disabled]):not(*[tabindex=-1]):visible, ' +
            'textarea:not([disabled]):not(*[tabindex=-1]):visible, button:not([disabled]):not(*[tabindex=-1]):visible,' +
            '*[tabindex]:not(*[tabindex=-1]):visible, *[contenteditable]'

        };
    return mod_commonHelper.makeImmutable(CONSTS);
})(_u.mod_commonHelper);
