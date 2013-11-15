// JSHint Config
/* exported settings */

var settings = {

    // Only exists as a placeholder (for reference). The property assigned in urlDataMap.js
    urlDataMap: null,

    /*
    Specifies sites on which the extension is partially or fully disabled.
    Patterns for matching urls can be specified using either the 'url pattern' format allowing '@' and '*' wildcards,
    or regexp objects where the aforementioned patterns don't suffice. Details about the 'url pattern' format can be found
    in the urlDataMap.js file.
    */
    disabledSites: {

        urlPatterns: ['www.reddit.com*', 'gmail.com*', 'mail.google.com*'], // Disabling Units because it might interfere
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

        // determines if while upward/downward CU selection, the CU should always be (vertically) centered or
        // only if it lies outside the view port
        verticallyCenterSelectedCU: true,

        // if true, scrollNext() and scrollPrev() will scroll more of the current CU, if it is not in view
        sameCUScroll: true,

        pageScrollDelta: 250, // pixels to scroll on each key press

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
            kbdShortcuts: ['shift+l']
        },
        scrollLeft: {
            descr: "Scroll page left",
            kbdShortcuts: ['shift+h']
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
        }
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
        }
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
            kbdShortcuts: ['l'/*, 'right'*/]
        },
        smartScrollLeft: {
            descr: "Smart scroll left",
            kbdShortcuts: ['h'/*, 'left'*/]
        },
        selectCUDown: {
            descr: "Select next/down unit",
            kbdShortcuts: ['alt+shift+j'/*, 'down'*/]
        },
        selectCUUp: {
            descr: "Select prev/up unit",
            kbdShortcuts: ['alt+shift+k'/*, 'up'*/]
        },

        selectCURight: {
            descr: "Select right unit",
            kbdShortcuts: ['alt+shift+l'/*, 'right'*/]
        },
        selectCULeft: {
            descr: "Select left unit",
            kbdShortcuts: ['alt+shift+h'/*, 'left'*/]
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
            },
            std_star: {
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

var urlData = {
    //'section' for units.io
    // '#posts .post' for blog.units.io
    CUs_specifier: "section, #posts .post"
};
_u.mod_commonHelper.stringifyFunctions(urlData);
expandUrlData(urlData);
settings.expandedUrlData = urlData;


// Converts any "shorthand" notations within the urlData to their "expanded" forms.
// Also adds default 'miniDesc' and 'kbdShortcuts' values, if not specified by SUs/actions defined in urlData
function expandUrlData(urlData) {

    // if key value at property 'key' in object 'obj' is a string, it is expanded to point to an object having a property
    // 'selector' that points to the string instead.
    var expandPropertyToObjIfString = function(obj, key) {
        var str;
        if (typeof (str = obj[key]) === "string") {
            obj[key] = {
                selector: str
            };
        }
    };

    // uses defaultSettings.valuesFor_stdUrlDataItems to supplement values in the SU/action (specified using the first two params)
    // 'scope' can be either "page" or "CUs"
    var supplementWithDefaultValues = function(SUorAction, SUorAction_Name, scope) {

        var temp;
        if (!SUorAction.kbdShortcuts && (temp = settings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
            SUorAction.kbdShortcuts = temp.kbdShortcuts;
        }
        if (!SUorAction.descr && (temp = settings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
            SUorAction.descr = temp.descr;
        }
    };

    // scope can be either "page" or "CUs"
    var expandSUsOrActions = function(SUsOrActions, scope) {
        if (typeof SUsOrActions === "object") {
            for (var SUorAction_Name in SUsOrActions) {
                expandPropertyToObjIfString(SUsOrActions, SUorAction_Name);
                supplementWithDefaultValues(SUsOrActions[SUorAction_Name], SUorAction_Name, scope);
            }
        }
    };

    expandPropertyToObjIfString(urlData, 'CUs_specifier');

    expandSUsOrActions(urlData.CUs_SUs, "CUs");
    expandSUsOrActions(urlData.CUs_actions, "CUs");

    expandSUsOrActions(urlData.page_SUs, "page");
    expandSUsOrActions(urlData.page_actions, "page");

}
