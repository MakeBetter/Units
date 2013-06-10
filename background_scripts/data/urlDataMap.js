// JSHint config
/* global defaultSettings */
/* exported specialDomain_masterDomain_map */

/*
A note on the terms 'CU' and 'MU' that occur multiple times throughout this file:
 Often the most important content of a webpage (i.e the actual *content* excluding the header, footer, side bars,
 adverts) is composed of a set of repeating units. We call such a unit a Content Unit (CU). E.g. on the Google Search
 results page, each search result is a CU. Each CU is a logical unit of content, attention and navigation/access.
 In addition to these CUs, there can be many other types of important units on the page. We call them 'MU's (misc. units).
 MUs can generally be of two types:
 - ones occurring within each CU (e.g: 'like', 'share', etc links/buttons)
 - ones outside any CU, and generally applicable to the whole page itself (e.g: 'logout' link, search field, etc).
 */

/*
The object `defaultSettings.urlDataMap` (along with the 'specialDomain_masterDomain_map' object) provides a way to
map each URl to the data associated with it (which is called the `urlData` corresponding to that URL). [Currently, the
term "URL" is used to mean the part of the URL that is stripped of "http(s)://", etc].
Each `urlData` object identifies elements of importance on the webpage, including any "content units" (CUs), and the
associated keyboard shortcuts. The `urlData` also specifies any other information associated with the URL.

Notes:
1) Each key of the urlDataMap object is called a domain-key, and is the "main domain" for the corresponding
website, i.e. the topmost "registrable" domain based on the public suffix list (publicsuffix.org).

2) If the value mapped to a domain-key is a string, that string is used as the domain-key instead. The "pointed to"
domain-key is called a "master domain". For example, google.com may be used as the master domain for google.co.in etc)

The value mapped to any master domain-key is an array. For an array with only one `urlData` object, the object may
directly be specified instead of the array.

A URL is mapped to a `urlData` object as follows. For any url, from among the array of `urlData` objects mapped
to its domain/master domain, the `urlData` object containing the first matching wildcard pattern/regexp is used.
(And so the "urlData" objects should be ordered accordingly. Eg: The urlData associated with a default/catch-all regexp
should be the last one specified.)

The regexps associated with a `urlData` object are specified using the `urlRegexp` property. Wildcard-like patterns
can also be specified using the `urlPatterns` property, as explained below:
They allow using *'s and @'s as "wildcards":
 - A '*' matches any combination of *zero or more* characters of *ANY* type.
 - A '**' matches any combination of *one or more* characters of *ANY* type.
- A '@' matches any combination of *one or more* characters that are not 'slashes' or 'periods'.

3) Only the part of the url after http(s):// is considered for matching with the provided patterns/regexps.

4) As is convention, a domain name is considered case insensitive, but the rest of the URL isn't

5) Regarding functions specified in the object:
i) They will run in the context of the content script
ii) Most functions will have access to a $CU type variable. If for any reason, the function needs to modify any
properties on it, it must be done indirectly using the jQuery data() function (so that it stays associated with
underlying DOM element(s), rather  than the jQuery set which changes whenever the CUs array is recalculated,
for instance on dom change. E.g: $CU.data('foo', bar) instead of $CU.foo = bar.

The data is structured this way because:
i) it enables efficient lookup (which is not a very big concern as such, but still). This is so, because this way the retrieval of the array of
urlData objects associated with a URL's domain takes O(1) time, and search for the specific urlData object matching
the URL is then restricted to the (very small) array.
ii) it results in better structure/organization compared to having arrays of regexps at the top level.

6) Anywhere a selector is specified, the extended set of jQuery selectors can be used as well.

7) // Guide for standard ("std_") items in urlData:
This applies to MUs and actions (both within page and CU levels), whose names begin with the prefix "std_"
These items need not specify keyboard shortcuts ('kdbShortcuts' property) and brief description ('miniDescr' property).
This is the recommended policy for these items. In this case, the default shortcuts and description shall be applied
to these items. However, if it specifically makes sense in a given case, these values (one or both) should be provided
and they will override the defaults. Note: any keyboard shortcuts, if specified, will *replace* the default ones (as
opposed to supplementing them.) This allows complete control over what keyboard shortcuts are applied to a page.
 */
// TODO: format of each urlData to be explained along with various ways of specifying, and the various keys etc.
// TODO: maybe the formats can be explained at two levels - simple options and advanced ones
// One way of finding out all the properties that can be supplied to this object, is to search for urlData variable
// in the content scripts
defaultSettings.urlDataMap = {

    // this domain key serves only as an example illustrating the structure of a domain-key and value pair. is named so to appear first among sorted keys
    "example.com": [
        {
            // If any one of the url-patterns or url-regexps listed below match the actual URL, the corresponding
            // object is considered to be a match. The first matching object found within a domain-key found is returned.
            urlPatterns: ["@.example.com/images/*, www.example.com/archive/images/*"],
            // Use regexps for cases where a simple url-pattern using '*' and '@' won't suffice, for example:
            urlRegexps: [/^www\.000-example\.com\/image|images$/],
            CUs_specifier: ".image, .post"  // NOTE: currently CUs within others CUs are removed
        },

        {
            urlPatterns: ["www.example.com/*"],
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
                exclude: ".advert"         // TODO: check if this is implemented
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
            CUs_MUs: {
                std_mainEl: ".post_title",  // When a CU is selected, this identifies the element inside it that is given the initial focus (apart from allowing a shortcut to be specified to access it when a CU is selected)
                std_comment: ".comment",   // a "std_" MU can use the "shorthand" notation by directly specifying the selector here
                std_upvote: {
                    selector: ".upvote",   // if the "expanded" notation is used, the selector is specified here

                    // This following two keys are optional since this is a "std_" MU, but if one or both are
                    // specified, they will will override the default value
                    kbdShortcuts: ["u", "v"],
                    miniDescr: "customized description.."
                },
                std_share: {
                    selector: ".share"
//                        kbdShortcuts: ["u", "v"]
                },

                // the following MU, which is not standard (i.e. "std_" prefixed) requires the "expanded" notation
                markAsRead: {
                    miniDescr: "Mark as read",
                    selector: ".mark-read",
                    kbdShortcuts: ["r"]
                }
            },
            CUs_actions: {

            },


            // the structure of this item matches that of CUs_MUs
            page_MUs: {
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
    "backbonejs.org":  {
        urlPatterns: ["backbonejs.org"],
        CUs_specifier: {
            buildCUAround: ".container p:has(.header), h2",
        },
        CUs_style: {
            overlayPadding: "10px",
        }
    },
    "facebook.com": [
        {
            // Facebook main feed page
            urlPatterns: ["www.facebook.com", "www.facebook.com/groups/*"],
            CUs_specifier: ".genericStreamStory.uiUnifiedStory",
            CUs_MUs: {
                "std_upvote": {kbdShortcuts: ["l", "u"],  selector: ".UFILikeLink" },
                "std_comment": ".comment_link",
                "std_share": ".share_action_link",
                "std_viewComments": ".UFIPagerLink, .mls", //.UFIPagerLink for "view more comments" link, .mls for the comment icon
                std_mainEl: ".fbMainStreamAttachment a:first-child, .uiStreamSubstory .pronoun-link, .uiStreamAttachments a",
                // we can afford these to be non-optimized because these will be looked for inside $CU. If these were
                // meant for the entire page, then they'd be bad!
                "seeMore": {kbdShortcuts: ["m"], selector: ".text_exposed_link>a", miniDescr: "See more"}
            },
            page_MUs: {
                std_header: "#headNav",
            },
            zenModeWhiteList: ".uiLayer"
        },
        {
            urlRegexps: [/^www\.facebook\.com(?!\/pages).+/], // Match all facebook.com* pages except of the type facebook.com/pages*
            CUs_specifier: "._4_7u .fbTimelineUnit",
            CUs_MUs: {
                "std_upvote": {kbdShortcuts: ["l", "u"],  selector: ".UFILikeLink" },
                "std_comment": ".comment_link",
                "std_share": ".share_action_link",
                //.UFIPagerLink for "view more comments", .mls for the comment icon, and .UFIBlingBoxTimelineCommentIcon for number next to comment icon
                "std_viewComments": ".UFIPagerLink, .mls, .UFIBlingBoxTimelineCommentIcon",
                std_mainEl: ".shareUnit a, .profilePicChangeUnit a, a.coverPhotoChangeUnit, .photoUnit a", // for the timeline page
                "seeMore": {kbdShortcuts: ["m"], selector: ".text_exposed_link>a", miniDescr: "See more"}
            },
            page_MUs: {
                std_header: "#headNav, .stickyHeaderWrap", // #headNav is the main header, the latter is a dynamic header that sometimes shows up.
                std_nextOrMore: "a.uiMorePagerPrimary:contains('Show Older Stories')"
            }

        }
    ],

    "feedly.com": {
        // Note: Feedly units seem to have a higher z-index than 0 (CU overlays whose z-index are not explicitly set
        // are not visible on Feedly).
        urlPatterns:["www.feedly.com*"],
        CUs_specifier: {
            selector: ".u0Entry, .u5entry, .u100Entry, .u4Entry"
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
            /*
             #res li.g: search result
             #brs: "related searches"
             #pnnext: "Next" link
             */
            CUs_specifier: "#res li.g, #brs, #pnnext",
            CUs_style: {
                "overlayPadding": "5px"
            },
            CUs_MUs: {
                /*std_mainEl: "a.l"*/
            },
            CUs_actions: {
//                "toggle-preview": {
//                    kbdShortcuts: ["p"],
//                    // this function is meant to work in conjunction with std_onCUDeselection (see below)
//                    fn: function($selectedCU, document, urlData) {
//                        var $previewPane = $('#nycp');
//                        // Closes any open preview on the page.
//                        var closePreview = function() {
//                            if ($previewPane.is(':visible')) { // if the preview pane is already visible
//                                var closePreviewBtn = document.getElementById("nycx");
//                                closePreviewBtn &&  closePreviewBtn.click();
//                            }
//                        };
//                        // Shows preview associated with currently selected CU ($selectedCU)
//                        var showPreview = function() {
//                            var $previewButton = $selectedCU.find(".vspib");
//                            $previewButton.length && $previewButton[0].click();
//                        };
//                        if ($previewPane.is(':visible')) {
//                            closePreview();
//                        }
//                        else {
//                            showPreview();
//                        }
//                    }
//                }
            },
            page_MUs: {
                "within-last-year": {
                    miniDescr: "Show results from last year",
                    kbdShortcuts: ["y"],
                    selector: ".q.qs:contains('Past year')"    // jQuery extensions to CSS selector syntax are supported
                }
            },
            page_actions: {
//                "std_onCUDeselection": {
//                    fn: function($deselectedCU, document, urlData) {
//                        if ($('#nycp').is(':visible')) { // if the preview pane is already visible
//                            var closePreviewBtn = document.getElementById("nycx");
//                            closePreviewBtn &&  closePreviewBtn.click();
//                        }
//                    }
//                }
            }
        },
        {
            // for scholar.google.com etc.
            urlPatterns: ["scholar.google.@/*", "scholar.google.co.@/*"],
            CUs_specifier: ".gs_r, #gs_n td:last-child",
            CUs_style:{
//                useInnerElementsToGetOverlaySize: true
            }
        },
        {
            // for Gmail
            urlPatterns: ["gmail.com", "gmail.com/*", "mail.google.com", "mail.google.com/*"],
            protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n"]
        }
    ],

    "linkedin.com": [
        {
            urlPatterns: ["www.linkedin.com"],
            CUs_specifier: "#my-feed-post .feed-item",
            CUs_style: {
                overlayPadding: "0 0 20px 0"
            },
            CUs_MUs: {
                std_mainEl: ".new-miniprofile-container a"
            }
        }
    ],

    // Experimental. Does not work well. 
    "medium.com": [
        {
            urlPatterns: ["medium.com", "medium.com/@"],
            CUs_specifier: ".post-item"
        }
    ],

    "nytimes.com": [
        {
            urlPatterns: ["www.nytimes.com/**"],
            zenModeWhiteList: "#article"

        }
    ],

    "quora.com": [
        {
            // URL pattern for a question page. URLs should match the pattern www.quora.com/*/* but not end with 'home',
            // 'about', 'questions', 'new'. These are special pages in Quora, pertaining to a topic generally. These should be
            // handled by the CU selector for www.quora.com/* pattern (specified later).
            urlRegexps: [/^www\.quora\.com\/.+\/(?!about$|questions$|new$|home$).+/],
            CUs_specifier: {
                // includes selectors for the question, answer, and "invite to answer" block
                selector: ".question.row, .main_col>div>.row .row, .invite_to_answer, .wiki_section" /*seems to be working well, as on May 13, 2013! */
            },
            CUs_style: {
                overlayPadding: "2px 0 0 0"
            },
            CUs_MUs: {
                std_mainEl: ".answer_user>span>a.user",
                std_header: ".header",
                "std_upvote": ".rate_up",
                "std_viewComments": ".view_comments",
                "std_downvote": ".rate_down",
                "std_share": ".share_link",
                "follow": {
                    selector: ".follow_question",
                    kbdShortcuts:["shift+f"]
                }
            },
            page_MUs: {
                std_header: "#layout_header"
            }
        },
        {
            urlPatterns: ["www.quora.com", "www.quora.com/?share=1", "www.quora.com/*"], // The first two patterns match
            // with the main quora feed page.
            CUs_specifier: /*".feed_item, .announcement, .pager_next.action_button"*/  ".e_col.p1.w4_5, .feed_item.row.p1, .row.w5.profile_feed_item",
            // the first selector for quora main page (and a few others), the second one for a page like this one:
            // http://www.quora.com/Front-End-Web-Development
            CUs_MUs: {
                // because Quora has many different kinds of units (and units with the same classes across units),
                // it is important to have the main element data be very specific. otherwise, incorrect/ unexpected
                // main elements will get selected.
                std_mainEl: "a.question_link, h2.board_item_title a, .meta_feed_item a.topic_name, .meta_item_text>a.user",
                "std_upvote": ".add_upvote, .remove_upvote",
                "std_viewComments": {kbdShortcuts: ["c", "v c"], selector: ".view_comments"},
                "std_downvote": ".add_downvote, .remove_downvote",
                "std_share": ".share_link",
                "follow": {
                    selector: ".follow_question",
                    kbdShortcuts:["shift+f"]
                }
            },
            CUs_style: {
                overlayPadding: "0 0 0 5px"
            }
        }
    ],

    // only support on the main page
    "reddit.com": [
        {
            urlPatterns: ["www.reddit.com/*/comments/*"],
            CUs_specifier: {
                buildCUAround: ".arrow.up, .usertext-edit",
                //                exclude: ".panestack-title, .menuarea"

            },
            CUs_MUs: {
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
            urlPatterns: ["www.reddit.com", "www.reddit.com/?*"],
            CUs_specifier: {
                selector: "#siteTable>div.thing, .nextprev a[rel='nofollow next']" //works well. doesn't include the promoted article.
            },
            CUs_style: {
                useInnerElementsToGetOverlaySize: true,
                "overlayPadding": "5px 10px 5px 0"
            },
            CUs_MUs: {
                std_mainEl: ".title",
                "std_upvote": ".arrow.up, .arrow.upmod",
                "std_downvote": ".arrow.down, .arrow.downmod",
                "std_share": ".share-button .active",
                "std_viewComments": {kbdShortcuts: ["c", "v c"], selector: ".flat-list.buttons .comments"},
                "hide": {kbdShortcuts: ["h"],  selector: ".hide-button a" },
                "report": {kbdShortcuts: ["r"],  selector: ".report-button" },
                "save": {kbdShortcuts: ["shift+s"], selector: ".save-button a"}
            },
            CUs_actions: {

            }
        }
    ],

    "scribd.com": [
        {
            urlPatterns: ["www.scribd.com/*"],
            zenModeWhiteList: "#document_column, .sticky_bar"
        }
    ],

    "guardian.co.uk": [
        {
            urlPatterns: ["www.guardian.co.uk/**"],
            zenModeWhiteList: "#main-article-info, #content, .share-links.b3"
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
                "*.stackexchange.com"],
            urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions$/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\/tagged\//,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)$/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/search?/,

                /^(meta\.)?(mathoverflow\.net)\/questions$/,
                /^(meta\.)?(mathoverflow\.net)\/questions\/tagged\//,
                /^(meta\.)?(mathoverflow\.net)\/$/],
            CUs_specifier: ".question-summary, a[rel='next']"
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
            CUs_MUs: {
                "std_upvote": ".vote-up-off",
                "std_downvote": ".vote-down-off",
                "std_share": ".short-link",
                "std_edit": ".suggest-edit-post",
                "std_comment": ".comments-link",
                "star": {kbdShortcuts: ["r"],  selector: ".star-off", miniDescr: "Star question"}

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
            CUs_MUs: {
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

    "stackoverflow.com": "stackexchange.com",
    "superuser.com": "stackexchange.com",
    "serverfault.com": "stackexchange.com",
    "stackapps.com": "stackexchange.com",
    "askubuntu.com": "stackexchange.com",
    "mathoverflow.net" : "stackexchange.com",

    "underscorejs.org": [
        {
            urlPatterns: ["underscorejs.org/*"],
            CUs_specifier: {
                buildCUAround: "#documentation p:has(.header), h2",
            },
            CUs_style: {
                overlayPadding: "10px"
            }
        }
    ],

    "urbandictionary.com": {
        urlPatterns: ["*.urbandictionary.com*"],
        CUs_specifier: {
            buildCUAround: "td.index"
        }
    },

    // only support on the first page
    "ycombinator.com": {
        urlPatterns: ["news.ycombinator.com/*"],
        CUs_specifier: {
            buildCUAround: "td.title>a"
        },
        CUs_style: {
            useInnerElementsToGetOverlaySize: true,
            "overlayPadding": "3px 6px 3px 0"
        },
        CUs_actions: {

        },
        CUs_MUs: {
            "std_mainEl": "td.title>a",
            "std_viewComments": {
                kbdShortcuts: ["c", "v c"], // overridden to add additional shortcut
                selector: "a:contains('comment'), a:contains('discuss')"
            },
            "std_upvote": "td:nth-child(2)>center>a"
        }
    },

    "youtube.com": [
        {
            urlPatterns: ["www.youtube.com/results*"],
            urlRegexps: [],
            protectedWebpageShortcuts: [],
            CUs_specifier:  {
                selector: ".primary-col li"
            },
            CUs_MUs: {
                std_mainEl: ".feed-video-title"
            }
        },
        {
            urlPatterns:["www.youtube.com/*"],
            CUs_specifier: ".feed-list-item",
            CUs_MUs: {
                std_mainEl: ".feed-item-content a, .content-item-detail a"
            },
            CUs_style: {
                overlayPadding: "" // some negative margin-top would be nice to apply.
            }
        }
    ],

    //Data that may need to be removed for friend release. 1) These sites are either not very commonly known. 2) They are
    // experimental and not well supported by Units.
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

};

// this array allows mapping a special domain to the corresponding "master domain"
var specialDomain_masterDomain_map = [
    {
        // to match domains like google.fr, google.co.in, google.co.uk etc (in addition to google.com, the matching of
        // which is superfluous here as it is the "master domain" key.)
        regexp: /^google\.(?:com|((?:co\.)?[a-z]{2}))$/,
        masterDomainKey: "google.com"
    }
//    {
//        regexp: /^(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)/,
//        masterDomainKey: "stackexchange.com"
//    },
//    {
//        regexp: /^(mathoverflow\.net)/,
//        masterDomainKey: "stackexchange.com"
//    }
];
