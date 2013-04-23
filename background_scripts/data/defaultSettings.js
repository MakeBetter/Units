/* This file specifies the default values for various settings including keyboard shortcuts.
The setting can be overridden by the user (mostly, if not in all cases).
 */


/* Specifies options used by the program. Functions that use this object might also accept a 'options' object as
 * argument. In addition to providing additional options for the function, the 'options' argument can also be
 * to override any properties of the 'globalMiscSettings' object (for that specific invocation) by providing different
 * values for those properties.
 */
var globalMiscSettings = {

    selectCUOnLoad: true, // whether the first CU should be selected when the page loads
    animatedCUScroll: true,
    animatedCUScroll_Speed: 2, // pixels per millisecond
    animatedCUScroll_MaxDuration: 300, // milliseconds

    increaseFontInSelectedCU: false,

    // determines if while scrolling a CU should always be centered (whenever possible) or only if it lies
    // outside the view port
    tryCenteringCUOnEachScroll: false,

    // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
    sameCUScroll: true,

    pageScrollDelta: 100 // pixels to scroll on each key press

};

/* Note for specifying keyboard shortcuts (Applies to the following three objects, as well as other shortcuts
 * specified in the urlData for a webpage):
 * In addition to the usual modifier keys, 'space' can be used as (and will only work as) a modifier key. This was done
 * by modifying the MouseTrap library.
 */

var browserShortcuts = {
    scrollDown: ['alt+j'],
    scrollUp: ['alt+k'],
    closeTab: ['alt+x'],

    // Special shortcut. Is made part of "browser action" shortcuts since it should be available even when
    // extension is only partially enabled.
    toggleExtension: ['ctrl+`']
};

var generalShortcuts = {
    // NOTE: since space is allowed as a modifier, it can only be used here in that capacity.
    // i.e. only 'space' or 'alt+space' are invalid shortcuts, while 'shift+space+x' is okay.
    nextCU: {
        miniDescr: "Select next CU",
        kbdShortcuts: ['j', '`', 'down']
    },
    prevCU: {
        miniDescr: "Select previous CU",
        kbdShortcuts: ['k', 'shift+`', 'up']
    },
    // TODO: rename this to filter
    search: {
        miniDescr: "Search and filter CUs ",
        kbdShortcuts: ['alt+f']
    },
    firstCU: {
        miniDescr: "Select first CU",
        kbdShortcuts: ['^', 'alt+1']
    },
    lastCU: {
        miniDescr: "Select last CU",
        kbdShortcuts: ['$', 'alt+9', 'alt+0']
    },
    showHelp: {
        miniDescr: "Show the help page",
        kbdShortcuts: ['alt+h', 'alt+?']
    },
    open: { //TODO: should 'enter' be spcified here
        miniDescr: "Open/invoke focused item",
        kbdShortcuts: ['shift+o', 'alt+o']  // alt+o allows invoking only with one hand (at least in windows)
    },
    openInNewTab: {
        miniDescr: "Open focused item in new tab",
        kbdShortcuts: ['o']
    },
    focusFirstTextInput: {
        miniDescr: "Focus first text input element",
        kbdShortcuts: ['g i', 'alt+i']   // TODO: on google search results page, invoking 'g i' results in g getting typed into the search box
    },
    focusNextTextInput: {
        miniDescr: "Focus next text input element",
        kbdShortcuts: ['alt+o']
    },
    focusPrevTextInput: {
        miniDescr: "Focus previous text input element",
        kbdShortcuts: ['alt+shift+o']
    }
};


// Default values for the description and kbdShortcuts associated with the standard ("std_") MUs and actions
// defined in the urlData for a page.
// In most cases, the urlData will not specify values for these. However,if  the urlData specifies any of these
// values for any of the "std_" items, they will be used instead.
var defaultValuesFor_stdUrlDataItems = {
    page: {
        std_searchField: {
            miniDescr: "Focus search box",
            kbdShortcuts: ["/"]
        },
        std_header: {
            miniDescr: "Focus (the first item on the) header",
            kbdShortcuts: ["alt+h"]
        },
        std_nextOrMore: {
            miniDescr: "Show next or more content",
            kbdShortcuts: ["g down"]
        },
        std_comment: {
            miniDescr: "Add comment",
            kbdShortcuts: ["c"]
        },
        std_viewComments: {
            miniDescr: "View comments",
            kbdShortcuts: ["g c"]
        }
    },
    CUs: {
        std_main: {
            miniDescr: ""
        },
        std_upvote: {
            miniDescr: "Upvote (or 'like'/'+1'/etc).",
            kbdShortcuts: ["u"]
        },
        std_downvote: {
            miniDescr: "Downvote (or '-1'/etc).",
            kbdShortcuts: ["d"]
        },
        std_share: {
            miniDescr: "Share",
            kbdShortcuts: ["s"]
        },
        std_comment: {
            miniDescr: "Add comment",
            kbdShortcuts: ["c"]
        },
        std_viewComments: {
            miniDescr: "View comments",
            kbdShortcuts: ["v c"]
        },
        std_edit: {
            miniDescr: "Edit",
            kbdShortcuts: ["e"]
        }
    }
};