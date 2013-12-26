// JSHint Config
/* exported defaultSettings */

/**
 * Specifies the default values for various settings including keyboard shortcuts.
 * Most of these settings can be overridden by the user
 */
var defaultSettings = {

    // Only exists as a placeholder (for reference). The property assigned in urlDataMap.js
    urlDataMap: null,

    /*
    Specifies sites on which the extension is partially or fully disabled.
    Patterns for matching urls can be specified using either the 'url pattern' format allowing '@' and '*' wildcards,
    or regexp objects where the aforementioned patterns don't suffice. Details about the 'url pattern' format can be found
    in the urlDataMap.js file.
    */
    disabledSites: {

        urlPatterns: ['www.reddit.com*', 'gmail.com*', 'mail.google.com*', 'units.io', 'units.io/#*'], // Disabling
        // units.io homepage because it has the Units library running
        urlRegexps: []
    },

    /*
    Specifies misc. options used by the program. Functions (in the content scripts) that use this object might also
    accept a 'options' object as argument. In addition to providing additional options for the function, the 'options'
    argument can also be to override any properties of the 'miscSettings' object (for that specific invocation)
    by providing different values for those properties.
    */
    miscSettings: {
        selectCUOnLoad: true, // whether the first CU should be selected when the page loads
        pageScrollDelta: 200, // pixels to scroll on each key press
        animatedScroll: true,
        animatedScroll_Speed: 1, // pixels per millisecond, can be a decimal
        animatedScroll_MaxDuration: 333, // milliseconds

        increaseFontInSelectedCU: false,

        // determines if while upward/downward CU selection, the CU should always be (vertically) centered or
        // only if it lies outside the view port
        verticallyCenterSelectedCU: true,

        // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
        sameCUScroll: true,
        enhanceActiveElementVisibility: true, // give special highlight to the active element on the page (if set to false,
        // the browser's default style will be applied.

        zenModeAutoOn: false, // zen mode will be active on any page when the page first loads

        // default/starting opacity for non-CU-page overlays, can be anything between 0 and 1, but ideally should be
        // a low'ish value (close to 0)
        // TODO: should we allow different values for each "url pattern"?) + maybe sites with larger CUs can have a
        // higher value compared to sites with small CUs like HN, google search results etc.
        defaultSpotlightDimmingOpacity: 0
    },

    /*
    Note for specifying keyboard shortcuts (Applies to the following three objects, as well as other shortcuts
    specified in the urlData for a webpage):
    In addition to the usual modifier keys, 'space' can be used as (and will only work as) a modifier key.
    i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
    */

    /*
    Shortcuts related to navigating within a webpage
    */
    pageNavigationShortcuts: {
        scrollDown: {
            descr: "Scroll page down",
            kbdShortcuts: ['shift+j'],
            importanceHigh: true /* We use this flag in the Help UI to highlight 'important' labels */
        },
        scrollUp: {
            descr: "Scroll page up",
            kbdShortcuts: ['shift+k'],
            importanceHigh: true
        },
        scrollRight: {
            descr: "Scroll page right",
            kbdShortcuts: ['shift+l'],
        },
        scrollLeft: {
            descr: "Scroll page left",
            kbdShortcuts: ['shift+h'],
        },
        back: {
            descr: "Go back",
            kbdShortcuts: ['alt+h']
        },
        forward: {
            descr: "Go forward",
            kbdShortcuts: ['alt+l']
        },

        topOfPage: {
            descr: "Navigate: Top of page",
            kbdShortcuts: ['n t'],
            importanceHigh: true
        },
        bottomOfPage: {
            descr: "Navigate: Bottom of page",
            kbdShortcuts: ['n b']
        },
        pageUp: {
            descr: "Navigate: Up (fast scroll up)",
            kbdShortcuts: ['n u']
        },
        pageDown: {
            descr: "Navigate: Down (fast scroll down)",
            kbdShortcuts: ['n d']
        },
    },

    /*
    Shortcuts related to selecting or invoking elements in a page
    */
    elementNavigationShortcuts: {
        open: {
            descr: "Open/invoke selected item",
            // while 'enter' should work without having to specify it in the binding below, we specify it
            // explicitly since on some websites it might be bound as a shortcut for something else
            // (like on facebook it is bound to focus the comments textbox)
            kbdShortcuts: ['enter', 'shift+o']
        },
        openInNewTab: {
            descr: "Open selected link in new tab",
            kbdShortcuts: ['o'],
            importanceHigh: true
        },
        focusFirstTextInput: {
            descr: "Focus first text (input) box",
            kbdShortcuts: ['n i', 'alt+i'],
            importanceHigh: true
        },
        focusNextTextInput: {
            descr: "Focus next text box",
            kbdShortcuts: ['alt+o']
        },
        focusPrevTextInput: {
            descr: "Focus previous text box",
            kbdShortcuts: ['alt+shift+o']
        },
    },

    /*
    All other general page-level shortcuts that don't fall under pageNavigationShortcuts or elementNavigationShortcuts
     */
    miscShortcuts: {
        toggleZenMode: {
            descr: "Toggle zen mode",
            kbdShortcuts: ['z'],
            importanceHigh: true
        },
        toggleExtension: {
            descr: "Disable/enable Units on current page",
            kbdShortcuts: [','],
            importanceHigh: true
        },
        showHelp: {
            descr: "Show the help page",
            kbdShortcuts: ['alt+/'],
            importanceHigh: true
        }
    },

    /*
    Default shortcuts that need CUs to be defined on a page.
    * */
    CUsShortcuts: {
        // NOTE: since space is allowed as a modifier, it can only be used here in that capacity.
        // i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
        smartScrollDown: {
            descr: "Smart scroll down",
            kbdShortcuts: ['j'/*, 'down'*/],
            importanceHigh: true
        },
        smartScrollUp: {
            descr: "Smart scroll up",
            kbdShortcuts: ['k'/*, 'up'*/],
            importanceHigh: true
        },

        smartScrollRight: {
            descr: "Smart scroll right",
            kbdShortcuts: ['l'/*, 'right'*/],
        },
        smartScrollLeft: {
            descr: "Smart scroll left",
            kbdShortcuts: ['h'/*, 'left'*/],
        },
        selectCUDown: {
            descr: "Select next/down unit",
            kbdShortcuts: ['alt+shift+j'/*, 'down'*/],
        },
        selectCUUp: {
            descr: "Select prev/up unit",
            kbdShortcuts: ['alt+shift+k'/*, 'up'*/],
        },

        selectCURight: {
            descr: "Select right unit",
            kbdShortcuts: ['alt+shift+l'/*, 'right'*/],
        },
        selectCULeft: {
            descr: "Select left unit",
            kbdShortcuts: ['alt+shift+h'/*, 'left'*/],
        },

        selectFirstCU: {
            descr: "Select first unit",
            kbdShortcuts: ['^', 'alt+1']
        },
        selectLastCU: {
            descr: "Select last unit",
            kbdShortcuts: ['$', 'alt+9']
        },

        filterCUs: {
            descr: "Search and filter units ",
            kbdShortcuts: ['alt+f'],
            importanceHigh: true
        },

        // TODO: This shortcut is hardcoded in code at the moment.
        increaseSpotlight: {
            descr: "Increase spotlight on selected unit",
            kbdShortcuts: ["+"],
            importanceHigh: true
        }
    },

    /*
    Default values for the description and kbdShortcuts associated with the standard SUs and actions defined in the
    urlData for a page. In most cases, the urlData will not specify values for these. However, if the urlData does specify
    values for these items, they will be used instead.
    */
    valuesFor_stdUrlDataItems: {
        page: {
            searchField: {
                descr: "Focus search box",
                kbdShortcuts: ["/"]
            },
            header: {
                descr: "Focus (the first item on the) header",
                kbdShortcuts: ["alt+h"]
            },
            nextOrMore: {
                descr: "Show next or more content",
                kbdShortcuts: ["g down"]
            },
            comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            viewComments: {
                descr: "View comments",
                kbdShortcuts: ["g c"]
            },
            logout: {
                descr: "Logout",
                kbdShortcuts: ["q"]
            }
        },
        CUs: {
            main: {
                descr: ""
            },
            upvote: {
                descr: "Upvote (or 'like'/'+1'/etc).",
                kbdShortcuts: ["u"]
            },
            downvote: {
                descr: "Downvote (or '-1'/etc).",
                kbdShortcuts: ["d"]
            },
            share: {
                descr: "Share",
                kbdShortcuts: ["s"]
            },
            comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            viewComments: {
                descr: "View (more) comments",
                kbdShortcuts: ["v c"]
            },
            edit: {
                descr: "Edit",
                kbdShortcuts: ["e"]
            },
            profile: {
                descr: "Go to user profile",
                kbdShortcuts: ["p"]
            },
            sharedContent: {
                descr: "Open the shared content",
                kbdShortcuts: ["v s"]
            },
            toggleSelection: {
                descr: "toggleSelection",
                kbdShortcuts: ["x"]
            },
            seeMore: {
                descr: "See More",
                kbdShortcuts: ["m"]
            },
            star: {
                descr: "Star",
                kbdShortcuts: ["*"]
            }
        }
    },

    // as of now, all keys are meant to be lower case only.
    quickSearchSelectedText_data: {
        "g": "https://www.google.com/search?q=<<_serach_str_>>",
        "w": "http://en.wikipedia.org/w/index.php?search=<<_serach_str_>>",
        "m": "http://maps.google.com/maps?q=<<_serach_str_>>",
        "i": "http://www.imdb.com/find?q=<<_serach_str_>>&s=all"
    }
};
