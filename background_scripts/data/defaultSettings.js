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

        urlPatterns: [/*'mail.google.com', 'mail.google.com/*', 'gmail.com', 'gmail.com/*'*/],
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
        animatedCUScroll: true,
        animatedCUScroll_Speed: 1, // pixels per millisecond, can be a decimal
        animatedCUScroll_MaxDuration: 333, // milliseconds

        increaseFontInSelectedCU: false,

        // determines if while scrolling a CU should always be centered (whenever possible) or only if it lies
        // outside the view port
        keepSelectedCUCentered: true,

        // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
        sameCUScroll: true,

        pageScrollDelta: 150, // pixels to scroll on each key press

        enhanceActiveElementVisibility: true, // give special highlight to the active element on the page (if set to false,
        // the browser's default style will be applied.

        zenModeAutoOn: false // zen mode will be active on any page when the page first loads.
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
            descr: "Scroll down",
            kbdShortcuts: ['shift+j'],
            importanceHigh: true /* We use this flag in the Help UI to highlight 'important' labels */
        },
        scrollUp: {
            descr: "Scroll up",
            kbdShortcuts: ['shift+k'],
            importanceHigh: true
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
        open: { //TODO: should 'enter' be spcified here
            descr: "Open/invoke selected item",
            kbdShortcuts: ['shift+o']  // alt+o allows invoking only with one hand (at least in windows)
        },
        openInNewTab: {
            descr: "Open selected link in new tab",
            kbdShortcuts: ['o'],
            importanceHigh: true
        },
        focusFirstTextInput: {
            descr: "Focus first text box",
            kbdShortcuts: ['f i', 'alt+i'],
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
        showSelectLinkUI: {
            descr: "Select any link",
            kbdShortcuts: ['f l', 'f f'],
            importanceHigh: true
        },
        toggleZenMode: {
            descr: "Toggle zen mode",
            kbdShortcuts: ['z'],
        },
        toggleExtension: {
            descr: "Disable/enable Units on current page",
            kbdShortcuts: [','],
            importanceHigh: true
        },
        showHelp: {
            descr: "Show the help page",
            kbdShortcuts: ['alt+/'],
        }
    },

    /*
    Shortcuts related to Select Link module.
    NOTE: The shortcut to invoke the select link UI is included in miscShortcuts.
     */

    selectLinkShortcuts: {
        selectNextMatchedLink: {
            descr: "Selects the Next matched link",
            kbdShortcuts: ['tab']
        },
        selectPrevMatchedLink: {
            descr: "Selects the Previous matched link",
            kbdShortcuts: ['shift+tab']
        },
        openSelectedLink: {
            descr: "Opens the Selected link",
            kbdShortcuts: ['enter']
        },
        openSelectedLinkInNewTab: {
            descr: "Opens the Selected link in a New Tab",
            kbdShortcuts: ['command+enter', 'alt+enter', 'shift+enter']
        }
    },

    /*
    Default shortcuts that need CUs to be defined on a page.
    * */
    CUsShortcuts: {
        // NOTE: since space is allowed as a modifier, it can only be used here in that capacity.
        // i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
        nextCU: {
            descr: "Select next CU",
            kbdShortcuts: ['j'/*, 'down'*/],
            importanceHigh: true
        },
        prevCU: {
            descr: "Select previous CU",
            kbdShortcuts: ['k'/*, 'up'*/],
            importanceHigh: true
        },
        filterCUs: {
            descr: "Search and filter CUs ",
            kbdShortcuts: ['alt+f'],
        },
        firstCU: {
            descr: "Select first CU",
            kbdShortcuts: ['^', 'alt+1']
        },
        lastCU: {
            descr: "Select last CU",
            kbdShortcuts: ['$', 'alt+9']
        }
    },

    /*
    Default values for the description and kbdShortcuts associated with the standard ("std_") SUs and actions
    defined in the urlData for a page. In most cases, the urlData will not specify values for these. However, if the
    urlData specifies any of these values for any of the "std_" items, they will be used instead.
    */
    valuesFor_stdUrlDataItems: {
        page: {
            std_searchField: {
                descr: "Focus search box",
                kbdShortcuts: ["/"]
            },
            std_header: {
                descr: "Focus (the first item on the) header",
                kbdShortcuts: ["alt+h"]
            },
            std_nextOrMore: {
                descr: "Show next or more content",
                kbdShortcuts: ["g down"]
            },
            std_comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            std_viewComments: {
                descr: "View comments",
                kbdShortcuts: ["g c"]
            },
            std_logout: {
                descr: "Logout",
                kbdShortcuts: ["q"]
            }
        },
        CUs: {
            std_main: {
                descr: ""
            },
            std_upvote: {
                descr: "Upvote (or 'like'/'+1'/etc).",
                kbdShortcuts: ["u"]
            },
            std_downvote: {
                descr: "Downvote (or '-1'/etc).",
                kbdShortcuts: ["d"]
            },
            std_share: {
                descr: "Share",
                kbdShortcuts: ["s"]
            },
            std_comment: {
                descr: "Add comment",
                kbdShortcuts: ["c"]
            },
            std_viewComments: {
                descr: "View (more) comments",
                kbdShortcuts: ["v c"]
            },
            std_edit: {
                descr: "Edit",
                kbdShortcuts: ["e"]
            },
            std_profile: {
                descr: "Go to user profile",
                kbdShortcuts: ["p"]
            },
            std_sharedContent: {
                descr: "Open the shared content",
                kbdShortcuts: ["v s"]
            },
            std_toggleSelection: {
                descr: "toggleSelection",
                kbdShortcuts: ["x"]
            },
            std_seeMore: {
                descr: "See More",
                kbdShortcuts: ["m"]
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
