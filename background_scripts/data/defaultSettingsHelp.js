// JSHint config
/* exported defaultSettingsHelp */

// Dictionary of defaultSettings keys and description

var defaultSettingsHelp = {
    disabledSites: "To disable Units on a site/ page, add its URL pattern or regex.",


    miscSettings: "These are some general miscellaneous settings. Click on the setting name to get its description.",

    selectCUOnLoad: "When a webpage loads, select the first CU by default. This, of course, applies only if CUs are specified for that page.", // whether the first CU should be selected when the page loads
    animatedScroll: "Activate smooth scrolling",
    animatedScroll_Speed: "Speed for smooth scrolling of CUs. In pixels per millisecond, can be decimal.", // pixels per millisecond, can be a decimal
    animatedScroll_MaxDuration: "Specify upper limit for the time it can take to (smooth) scroll between CUs. In milliseconds", // milliseconds

    increaseFontInSelectedCU: "Increase font size of text in the selected CU. Default is false. This is an experimental feature.",

    // determines if while scrolling a CU should always be vertically centered (whenever possible) or only if it lies
    // outside the view port
    verticallyCenterSelectedCU: "Keep selected CU (vertically) centered while scrolling. If set to false, center CU only" +
        "if it lies outside the viewport.",

    // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
    sameCUScroll: "Applicable for long CUs that extend beyond the viewport. Enable scrolling within long CUs. More specifically, pressing " +
        "shortcut for 'next CU' first scrolls within this long CU till its end, and then selects the next CU.",

    pageScrollDelta: "Page scroll speed (pixels to scroll on each key press).", // pixels to scroll on each key press

    enhanceActiveElementVisibility: "Give special highlight to the focused link/button on the page (if set to false, the " +
        "browser's default style will be applied. We recommend it to be set to true.", // give special highlight to the active element on the page (if set to false,
    // the browser's default style will be applied.

    zenModeAutoOn: "Set to true to have zen mode activated on any page by default. Caution: this is an experimental feature.",

    pageNavigationShortcuts: "Shortcuts related to navigating within a webpage.",
    elementNavigationShortcuts: "Shortcuts related to selecting or invoking elements in a page",
    miscShortcuts: "All other general page-level shortcuts that don't fall under pageNavigationShortcuts or elementNavigationShortcuts",

    /*
     Default shortcuts that need CUs to be defined on a page.
     * */
    CUsShortcuts: "Content Unit (CU) related shortcuts. Work when CUs are present on a page.",

    /*
     Default values for the description and kbdShortcuts associated with the standard ("std_") SUs and actions
     defined in the urlData for a page. In most cases, the urlData will not specify values for these. However, if the
     urlData specifies any of these values for any of the "std_" items, they will be used instead.
     */
    valuesFor_stdUrlDataItems: "Shortcuts for some 'standard' actions across websites.",

    // as of now, all keys are meant to be lower case only.
    quickSearchSelectedText_data: "Quick search"

}
