// JSHint config
/* global defaultSettings */
/* exported specialDomain_masterDomain_map */

// This file is just a repository of all urlData that we have added in the past. This is not being used by the code.
// The main file, urlDataMap.js that is in use, contains only that data that works well.


defaultSettings.urlDataMap = {
    // ** NOTE: domain-keys are listed alphabetically **

    // this domain key serves only as an example illustrating the structure of a domain-key and value pair. is named so to appear first among sorted keys
    "0000-example.com": [
        {
            // If any one of the url-patterns or url-regexps listed below match the actual URL, the corresponding
            // object is considered to be a match. The first matching object found within a domain-key found is returned.
            urlPatterns: ["@.0000-example.com/images/*, www.example.com/archive/images/*"],
            // Use regexps for cases where a simple url-pattern using '*' and '@' won't suffice, for example:
            urlRegexps: [/^www\.000-example\.com\/image|images$/],
            CUs_specifier: ".image, .post"  // NOTE: currently CUs within others CUs are removed
        },

        {
            urlPatterns: ["www.0000-example.com/*"],
            urlRegexps: [], // since the array is empty this is redundant

            /*
             --------** NOTE ** The following comments are outdated. UPDATE THEM!! ----------
             There are two types of shortcuts that can be specified here: page-specific and CU-specific.
             Each shortcut is identified by a property that indicates its purpose, and has associated with it
             a set of keyboard shortcuts that invoke it. Each shortcut also has one of the  properties: 'selector'
             or 'fn'.

             If the 'selector' property is specified, and is a string, a click is invoked on the *first* element
             matching it within the page or the CU, depending on whether the shortcut is page or CU specific.
             If 'selector' specifies an array of selectors, the behavior is identical except that now a series of clicks
             will be invoked in order. (can be used to automate a sequence of clicks). If a pause is required after
             clicking an  element corresponding to a selector, before the element corresponding to the next selector
             can be found, it will be handled automatically)

             If, instead, the 'fn' property is used, it specifies a function that will be executed when the shortcut is
             invoked. The function is passed two arguments -- $selectedCU (which is the jQuery set
             consisting of the elements comprising the CU) and document

             [When using the 'fn' key, given that the functions for both page-specific and CU-specific shortcuts
             are passed the same arguments, it doesn't technically matter if the shortcut is defined as page
             specific or CU specific, except as a matter of good practice.]
             */

            // These are shortcuts on the page that the extension should NOT override
            protectedWebpageShortcuts: ["j", "k"],
            //TODO: consider allowing generalShortcuts etc to be specified here (or in a separate object)
            // if required to specify alternatives for protectedWebpageShortcuts. It will only ADD to the existing
            // list. Any removals should be done using `protectedWebpageShortcuts`?

            CUs_specifier:  {
                selector: ".foo .bar",
                exclude: ".advert"          // TODO: check if this is implemented
                //buildCUAround: ".unit-title" // This can be specified *instead*, If specifying a selector for a CU is not straightforward or possible,
                // then specify this. TODO: complete this.

                // If neither "selector", nor "buildCUAround" work, these can be used instead
                // first: ".heading",
                // last: ".comments",
            },
            CUs_style: {
                "overlayPadding": "5px",
                useInnerElementsToGetOverlaySize: false // defaults to false; true is used in some sites like hacker news and reddit
            },
            CUs_SUs: {
                std_mainEl: ".post_title",  // When a CU is selected, this identifies the element inside it that is given the initial focus (apart from allowing a shortcut to be specified to access it when a CU is selected)
                std_comment: ".comment",   // a "std_" SU can use the "shorthand" notation by directly specifying the selector here
                std_upvote: {
                    selector: ".upvote",   // if the "expanded" notation is used, the selector is specified here

                    // This following two keys are optional since this is a "std_" SU, but if one or both are
                    // specified, they will will override the default value
                    kbdShortcuts: ["u", "v"],
                    miniDescr: "customized description.."
                },
                std_share: {
                    selector: ".share"
//                        kbdShortcuts: ["u", "v"]
                },

                // the following SU, which is not standard (i.e. "std_" prefixed) requires the "expanded" notation
                markAsRead: {
                    miniDescr: "Mark as read",
                    selector: ".mark-read",
                    kbdShortcuts: ["r"]
                }
            },
            CUs_actions: {

            },


            // the structure of this item matches that of CUs_SUs
            page_SUs: {
                std_searchField: {
                    selector: "#search"
//                    kbdShortcuts: ["/"]
                },
                std_header: {
                // Apart from being identified as an important unit on the page, it is sometimes helpful to specify a
                // header in order to ensure that a new CU, upon selection, is positioned correctly on the page.
                // This is applicable when the page has a fixed header (i.e. one that stays visible even as the page is
                // scrolled).
                // If there are multiple floating headers, specify all of them separated by commas. If you specify a
                // non fixed header, it will simply be ignored for the purpose of positioning the CU causing  any issues.
                    selector: "#header"
                },
                std_nextOrMore: {
                    selector: ".next"
                    //kbdShortcuts: ["g down"]   // this is optional for standard items (i.e. ones prefixed with "std_")
                }
            },
            // the structure of this item matches that of CUs_actions
            page_actions: {
                "std_onCUSelection": {
                    // NOTE: the urlData paratmenter is a deep clone the original
                    fn: function($selectedCU, document, urlData) {
                        // this code will execute whenever a CU is selected
                    }
                    //kbdShortcuts: null  // this is optional for standard items (i.e. ones prefixed with "std_")
                },
                "std_onCUDeselection": {
                    fn: function($deselectedCU, document, urlData) {
                        // this code will execute whenever a CU is deselected
                    }
                }
            }
        }
    ],
    "amazon.com": {
        urlPatterns: ["www.amazon.com*"],
        CUs_specifier: "#center .prod"

    },
    "facebook.com": {
        urlPatterns: ["www.facebook.com*"],

        /* .genericStreamStory.uiUnifiedStory -> user's feed at facebook.com
         the rest -> timeline pages
         */
        CUs_specifier: ".genericStreamStory.uiUnifiedStory, #fbTimelineHeadline .actions, .fbTimelineNavigationPagelet, .vTop, .leftUnits, .rightUnits, .timelineUnitContainer, .timelineReportContainer",
        CUs_SUs: {
            "std_upvote": {kbdShortcuts: ["l", "u"],  selector: ".UFILikeLink" },
            "std_comment": ".comment_link",
            "std_share": ".share_action_link",
            "std_viewComments": ".UFIPagerLink"
        },
        page_SUs: {
            std_header: "#headNav, .stickyHeaderWrap",
            std_nextOrMore: ".uiMorePagerPrimary"
        }

    },

    // the following key is redundant due to specialDomain_masterDomain_map array, but is included currently to serve
    // as an example
    "google.co.in": "google.com", // if the mapped value is a string, it is used as the key mapping to the actual value

    "google.com": [
        {
            // google search results page
            urlPatterns: ["www.google.@/*", "www.google.co.@/*"],
            urlRegexps: [], // since the array is empty this is redundant
            CUs_specifier: "#res li.g, #foot, #brs",
            CUs_style: {
                "overlayPadding": "5px"
            },
            CUs_SUs: {
                std_mainEl: "a.l"
            },
            CUs_actions: {
                "toggle-preview": {
                    kbdShortcuts: ["p"],
                    // this function is meant to work in conjunction with std_onCUDeselection (see below)
                    fn: function($selectedCU, document, urlData) {
                        var $previewPane = $('#nycp');
                        // Closes any open preview on the page.
                        var closePreview = function() {
                            if ($previewPane.is(':visible')) { // if the preview pane is already visible
                                var closePreviewBtn = document.getElementById("nycx");
                                closePreviewBtn &&  closePreviewBtn.click();
                            }
                        };
                        // Shows preview associated with currently selected CU ($selectedCU)
                        var showPreview = function() {
                            var $previewButton = $selectedCU.find(".vspib");
                            $previewButton.length && $previewButton[0].click();
                        };
                        if ($previewPane.is(':visible')) {
                            closePreview();
                        }
                        else {
                            showPreview();
                        }
                    }
                }
            },
            page_SUs: {
                "within-last-year": {
                    kbdShortcuts: ["y"],
                    selector: ".q.qs:contains('Past year')"    // jQuery extensions to CSS selector syntax are supported
                }
            },
            page_actions: {
                "std_onCUDeselection": {
                    fn: function($deselectedCU, document, urlData) {
                        if ($('#nycp').is(':visible')) { // if the preview pane is already visible
                            var closePreviewBtn = document.getElementById("nycx");
                            closePreviewBtn &&  closePreviewBtn.click();
                        }
                    }
                }
            }
        },
        {
            // for scholar.google.com etc.
            urlPatterns: ["scholar.google.@/*", "scholar.google.co.@/*"],
            CUs_specifier: ".gs_r, .gs_ico_nav_next"
        },
        {
            // for Gmail
            urlPatterns: ["gmail.com", "gmail.com/*", "mail.google.com", "mail.google.com/*"],
            protectedWebpageShortcuts: ["j", "k"]
        }
    ],
    "guardian.co.uk": {
        urlPatterns: ["www.guardian.co.uk*"],
        CUs_specifier:"#inner-wrapper li.b3, #inner-wrapper li.inline-pic, #inner-wrapper li.wide-image"
    },
    "nytimes.com": {
        urlPatterns: ["www.nytimes.com*"],
        CUs_specifier: ".story:not(.clearfix,.advertisement), #wellRegion .column, .cColumn .columnGroup"
    },
    "quora.com": [
        {
            urlPatterns: ["www.quora.com"], // main quora feed page
            CUs_specifier: {
            },
            selector: ".feed_item, .announcement, .pager_next.action_button", //TODO: needs work
            CUs_SUs: {
                std_mainEl: " a.question_link"
            }
        },
        {
            urlPatterns: ["www.quora.com/*"], // all other pages on quora (tested currently for question pages)
            CUs_specifier: {
                //TODO: needs work
//                    selector: ".question.row, .w4_5.p1.answer_text, .pager_next.action_button",
                first: ".rating_options",
                last: ".item_action_bar"
            },
            CUs_SUs: {
                std_mainEl: ".answer_user>span>a.user",
                std_header: ".header"
            }
        }
    ],
    "reddit.com": [
        {
            urlPatterns: ["www.reddit.com/*/comments/*"],
            CUs_specifier: {
                buildCUAround: ".arrow.up, .usertext-edit"
                //                exclude: ".panestack-title, .menuarea"

            },
            CUs_SUs: {
                //                std_mainEl: ".title",
                "std_upvote": ".arrow.up, .arrow.upmod",
                "std_downvote": ".arrow.down, .arrow.downmod",
                "std_share": ".share-button .active",
                "std_viewComments": {kbdShortcuts: ["c, g c"],  selector: ".comments" },
                "hide": {kbdShortcuts: ["h"],  selector: ".hide-button" },
                "report": {kbdShortcuts: ["r"],  selector: ".report-button" },
                "minimize": {kbdShortcuts: ["m"],  selector: ".noncollapsed .expand" }
            }
        },
        {
            urlPatterns: ["www.reddit.com*"],
            CUs_specifier: {
                selector: "#siteTable>div.thing" //works well. doesn't include the promoted article though,
            },
            CUs_style: {
                useInnerElementsToGetOverlaySize: true,
                "overlayPadding": "5px 10px 5px 0"
            },
            CUs_SUs: {
                std_mainEl: ".title",
                "std_upvote": ".arrow.up, .arrow.upmod",
                "std_downvote": ".arrow.down, .arrow.downmod",
                "std_share": ".std_share-button .active",
                "std_viewComments": {kbdShortcuts: ["c", "g c"], selector: ".flat-list.buttons .comments"},
                "hide": {kbdShortcuts: ["h"],  selector: ".hide-button" },
                "report": {kbdShortcuts: ["r"],  selector: ".report-button" },
                "save": {kbdShortcuts: ["v"], selector: ".save-button a, .unsave-button a.togglebutton"}
            },
            CUs_actions: {

            }
        }
    ],

    // Sites included: "*.stackexchange.com", "stackoverflow.com", "superuser.com", "serverfault.com", "stackapps.com",
    // "askubuntu.com"
    // Also, "meta.stackoverflow.com", "meta.superuser.com","meta.stackoverflow.com", etc.

    //StackExchange powered sites included: "mathoverflow.net"
    "stackexchange.com": [
        {
            // Pages with lists of questions
            // Examples: http://stackoverflow.com/questions, http://stackoverflow.com/questions/tagged/perl,
            // http://stackoverflow.com/
            urlPatterns: ["*.stackexchange.com/questions", "*.stackexchange.com/questions/tagged*",
                "*.stackexchange.com\/"],
            urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions$/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\/tagged\//,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/$/,

                /^(meta\.)?(mathoverflow\.net)\/questions$/,
                /^(meta\.)?(mathoverflow\.net)\/questions\/tagged\//,
                /^(meta\.)?(mathoverflow\.net)\/$/],
            CUs_specifier: ".question-summary"
        },
        {
            // Pages with answers to a specific question
            // Example: http://stackoverflow.com/questions/5874652/prop-vs-attr
            urlPatterns: ["*.stackexchange.com/questions/*"],
            urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\//],
            CUs_specifier: ".question, .answer",
            CUs_style: {
                "overlayPadding": "0 5px 0 5px"
            },
            CUs_SUs: {
                "std_upvote": ".vote-up-off",
                "std_downvote": ".vote-down-off",
                "std_share": ".short-link",
                "std_edit": ".suggest-edit-post",
                "std_comment": ".comments-link",
                "star": {kbdShortcuts: ["r"],  selector: ".star-off" }

            },
            CUs_actions: {

            }
        },
        {
            urlRegexps: [/^(meta\.)?(mathoverflow\.net)\/questions\//],
            CUs_specifier: "#question, .answer",
            CUs_style: {
                "overlayPadding": "0 5px 0 5px"
            },
            CUs_SUs: {
                //TODO: specify shortcuts for MathOverflow.
//                   "std_upvote": {keys: ["u"],  selector: ".vote-up-off" },
//                   "std_downvote": {keys: ["d"],  selector: ".vote-down-off" },
//                   "std_share": {keys: ["s"],  selector: ".short-link" },
//                   "edit": {keys: ["e"],  selector: ".suggest-edit-post" },
//                   "add_comment": {keys: ["c"],  selector: ".comments-link" },
//                   "star": {keys: ["r"],  selector: ".star-off" }
            },
            CUs_actions: {

            }

        }
    ],
    "sulekha.com": {
        urlPatterns: ["*.sulekha.com/*"],
        CUs_specifier: {
            selector: ".sul_result_container"
        }
    },
    "team-bhp.com": {
        urlPatterns: ["*.team-bhp.com/*"],
        CUs_specifier: {
            selector: ".box>table tr"
        }
    },
//    "twitter.com": {
//        urlPatterns: ["twitter.com/", "twitter.com/*"],
//        CUs_specifier: {
//            selector: ".tweet"
//        },
//        page_actions: {
//            "std_onCUSelection": {
//                fn: function($selectedCU, document, urlData) {
//                    $selectedCU[0].click(); // to expand the tweet
//                }
//            },
//            "std_onCUDeselection": {
//                fn: function($deselectedCU, document, urlData) {
//                    $deselectedCU[0].click(); // to un-expand it again
//                }
//            }
//        }
//    },
    "urbandictionary.com": {
        urlPatterns: ["*.urbandictionary.com*"],
        CUs_specifier: {
            buildCUAround: "td.index"
        }
    },

//    "wikipedia.org": {
//        urlPatterns: ["@.wikipedia.org/wiki/*"],
//        CUs_specifier: {
//            buildCUAround: "#mw-content-text>p:first-of-type, table.infobox, table.vcard, table.toc, table.wikitable, #bodyContent h2, #bodyContent h3, #bodyContent h4, .vertical-navbox, .horizontal-navbox, .navbox",
//            exclude: ".dablink, .metadata, .ambox" //TODO: check these (.dablink was in steve job's). this is till unimplemented as of 6 Jan 2012
//        }
//    },

    "ycombinator.com": {
        urlPatterns: ["news.ycombinator.com*"],
        CUs_specifier: {
            buildCUAround: "td.title>a"
        },
        CUs_style: {
            useInnerElementsToGetOverlaySize: true,
            "overlayPadding": "3px 6px 3px 0"
        },
        CUs_actions: {

        },
        CUs_SUs: {
            "std_mainEl": "td.title>a",
            "std_viewComments": {
                kbdShortcuts: ["c", "g c"], // overridden to add additional shortcut
                selector: "a:contains('comment'), a:contains('discuss')"
            }
        }
    }
};

// this array allows mapping a special domain to the corresponding "master domain"
var specialDomain_masterDomain_map = [
    {
        // to match domains like google.fr, google.co.in, google.co.uk etc (in addition to google.com, the matching of
        // which is superfluous here as it is the "master domain" key.)
        regexp: /^google\.(?:com|((?:co\.)?[a-z]{2}))$/,
        masterDomainKey: "google.com"
    },
    {
        regexp: /^(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)/,
        masterDomainKey: "stackexchange.com"
    },
    {
        regexp: /^(mathoverflow\.net)/,
        masterDomainKey: "stackexchange.com"
    }
];
