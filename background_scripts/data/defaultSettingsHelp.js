// JSHint config
/* exported defaultSettingsHelp */

// Dictionary of defaultSettings keys and description

var defaultSettingsHelp = {
    disabledSites: "To disable Units on a site/ page, add its URL pattern or regex.",


    miscSettings: "These are some general miscellaneous settings. Click on the setting name to get its description.",

    selectCUOnLoad: "Select first CU (if CU's present) when a page loads", // whether the first CU should be selected when the page loads
    animatedCUScroll: "Activate animation on CU scrolling",
    animatedCUScroll_Speed: "Animated CU scoll speed. In pixels per millisecond, can be decimal.", // pixels per millisecond, can be a decimal
    animatedCUScroll_MaxDuration: "In milliseconds", // milliseconds

    increaseFontInSelectedCU: "Increase font size in selected CU. Default is false.",

    // determines if while scrolling a CU should always be centered (whenever possible) or only if it lies
    // outside the view port
    keepSelectedCUCentered: "While scrolling, keep CU always centered (when possible). If set to false, center CU only" +
        "if it lies outside the viewport.",

    // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
    sameCUScroll: "",

    pageScrollDelta: "pixels to scroll on each key press", // pixels to scroll on each key press

    enhanceActiveElementVisibility: "give special highlight to the active element on the page (if set to false, the " +
        "browser's default style will be applied.", // give special highlight to the active element on the page (if set to false,
    // the browser's default style will be applied.

    zenModeAutoOn: "Zen mode is on by default on page load. Default is false",
    /*
     Note for specifying keyboard shortcuts (Applies to the following three objects, as well as other shortcuts
     specified in the urlData for a webpage):
     In addition to the usual modifier keys, 'space' can be used as (and will only work as) a modifier key.
     i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
     */
    generalShortcuts: "Page-level shortcuts. These work on all sites, unless specifically excluded.",

    /*
     Default shortcuts that need CUs to be defined on a page.
     * */
    CUsShortcuts: "CU related shortcuts. Work when CU's are present on a page.",

    /*
     Default values for the description and kbdShortcuts associated with the standard ("std_") SUs and actions
     defined in the urlData for a page. In most cases, the urlData will not specify values for these. However, if the
     urlData specifies any of these values for any of the "std_" items, they will be used instead.
     */
    valuesFor_stdUrlDataItems: "Shortcuts for some 'standard' actions across websites.",

    // as of now, all keys are meant to be lower case only.
    quickSearchSelectedText_data: "Quick search"

}
