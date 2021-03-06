// JSHint config
/* global defaultSettings */
/* exported specialDomain_masterDomain_map */


/* NOTE: Also see `urlData_readme.js` */


/*

- The purpose of this file is to map a URL to its associated data (a `urlData` object).

- The `urlData` object specifies how to identify individual "units of content" 
(such as search results) on a webpage. It may also specify other
things such as keyboard shortcts (refer: `urlData_readme.js`).

- `urlData` objects are listed in the `defaultSettings.urlDataMap` object, grouped
by website domains. 

- For a given website domain, an array of `urlData` objects is listed in 
`defaultSettings.urlDataMap` (or if there is only one object in the array, 
it may be directly listed). Each such `urlData` object contains one or
more patterns (`urlPatterns`) or regular expressions (`urlRegexps`) that
indicate which URL it corresponds to. 

- If a group of website domains share the same data, the data is listed 
for only one of the domains (which is then called the 'master domain')
and other domains are linked to it via the array `specialDomain_masterDomain_map`

- Method of matching:

First, the "registrable domain" (e.g.: google.com, google.co.in are registrable domains,
but NOT news.google.com, which is part of the google.com registrable domain - for more details see 
`mod_registrableDomain.js`) is determined for a given URL.  

Next, if the registrable domain is present as one of the keys in `defaultSettings.urlDataMap`,
the search ends there. However, if the registrable domain isn't directly found there,
it is searched for in `specialDomain_masterDomain_map` and if it is found there, the
corresponding master domain is used to obtain the `urlData`.

*/


// this object maps certain special domains (denoted via regexps) 
// to their corresponding "master domain"
var specialDomain_masterDomain_map = [
    {
        // maps country specific google domains like google.fr, google.co.in, google.co.uk, etc
        // to google.com
        regexp: /^google\.(?:com|((?:co\.)?[a-z]{2}))$/,
        masterDomainKey: "google.com"
    },
    {
        regexp: /craigslist\.(?:org|((?:co\.)?[a-z]{2}))$/,
        masterDomainKey: "craigslist.org"
    },

    {
        // Match domains *.blogspot.com, *.blogspot.in etc.
        regexp: /blogspot\.(?:com|((?:co\.)?[a-z]{2}))$/,
        masterDomainKey: "blogspot.com"
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


defaultSettings.urlDataMap = {

    // this domain key serves only as an example illustrating the structure of a domain-key and value pair.
    "_example.com": [
        // each object in this array is a `urlData` object
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
                useInnerElementsToGetOverlaySize: false, // defaults to false; true is used in some sites like hacker news and reddit
                setOverlayZIndexHigh: true  // use high z-index for CU overlay
            },
            CUs_SUs: {
                std_mainEl: ".post_title",  // When a CU is selected, this identifies the element inside it that is given the initial focus (apart from allowing a shortcut to be specified to access it when a CU is selected)
                std_comment: ".comment",   // a "std_" SU can use the "shorthand" notation by directly specifying the selector here
                std_upvote: {
                    selector: ".upvote",   // if the "expanded" notation is used, the selector is specified here

                    // This following two keys are optional since this is a "std_" SU, but if one or both are
                    // specified, they will will override the default value
                    kbdShortcuts: ["u", "v"],
                    descr: "customized description.."
                },
                std_share: {
                    selector: ".share"
//                        kbdShortcuts: ["u", "v"]
                },

                // the following SU, which is not standard (i.e. "std_" prefixed) requires the "expanded" notation
                markAsRead: {
                    descr: "Mark as read",
                    selector: ".mark-read",
                    kbdShortcuts: ["r"]
                }
            },
            CUs_actions: {
                mouseoverOnCUSelection: true // Specifies if a mouseover event should be invoked on particular element on CU selection.
                // Can have 2 types of values: 1) true 2) ".selector"
                // If mouseoverOnSelection = true, mouseover is invoked on the CU itself (more specifically, $CU[0])
                // If mouseoverOnSelection = ".selector", we find element specified by ".selector" in the CU and invoke mouseover on it.
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
            },

           /* Specifies the main content on a page. Currently being used for zen mode.

            NOTE: The shorthand notation page_mainContent: "#article-container" can be used to directly specify the
            "selector" property.
            */

            page_mainContent: {
                selector: "#article-container", // selector the main content
                exclude: ".advert" // explicitly specified
            }
        },

        // Data object that will be shared with all URLs under this main domain.
        // More specifically, the matching URL data will extend the shared data to get the final data for a URL.
        {
            shared: "true",
            page_SUs: {
                std_logout: "#logout"
            }
        }
    ],
    "amazon.com": [
        {
            urlPatterns: ["www.amazon.com"],
            CUs_specifier: "#centerA, #centerB, .widget",
            CUs_SUs: {
                // TODO: these don't have any effect right now since they are not focusable (see #178)
                std_mainEl: ".s9TitleText, img"
            }
        },
        {
            urlPatterns: ["www.amazon.com/**"],
            CUs_specifier: ".celwidget, .widget, .unified_widget, .shoveler, .yshShoveler",
            CUs_SUs: {
                std_mainEl: "h3>a"
            }
        }
    ],

    "backbonejs.org":  {
        urlPatterns: ["backbonejs.org*"],
        CUs_specifier: {
            buildCUAround: ".container p:has(.header), h2",
        },
        CUs_style: {
            overlayPadding: "10px",
        }
    },

    "blogspot.com": {
        urlPatterns: ["*.blogspot.*"],
        CUs_specifier: ".post-outer",
        CUs_SUs: {
            std_mainEl: ".post-title a"
        },
        CUs_style: {
            overlayPadding: "5px"
        }
    },

    "units.io": {
        urlPatterns:["blog.units.io*"],
        CUs_specifier: ".post"
    },

    "boredpanda.com": [
        {
            urlPatterns: ["www.boredpanda.com"],
            CUs_specifier: ".feature",
        },
        {
            urlPatterns: ["www.boredpanda.com/**"],
            CUs_specifier: ".copWrp_contentImageWrapper",
            CUs_SUs: {
                std_mainEl: ".wrapperSocialPanelButton"
            }
        }
    ],

    "craigslist.org": {
        // Matches delhi.craigslist.co.in, grenoble.fr.craigslist.fr, providence.craigslist.org etc.
        urlPatterns: ["*.craigslist.org/*", "*.craigslist.*/*"],
        CUs_specifier: ".row, .nextpage a",
        CUs_style: {
            overlayPadding: "8px",
            useInnerElementsToGetOverlaySize: true
        },
        CUs_SUs: {
            std_star: ".star"
        }
    },

    "engadget.com": {
        urlPatterns: ["www.engadget.com*"],
        CUs_specifier: "#carousel, article"
    },

    "gigaom.com": {
        urlPatterns: ["gigaom.com"],
        CUs_specifier: "article",
        CUs_style: {
            setOverlayZIndexHigh: true
        },
        CUs_SUs: {
            std_mainEl: "h3>a"
        }
    },

    "indiatimes.com": [
        {
            urlPatterns: ["timesofindia.indiatimes.com/*"],
            page_mainContent: {
                selector: ".left_bdr",
                exclude: "#adhomepage, .ad1, #fr38650, .mTop10_c iframe, #adDiv," +
                    ".main_social, #populatecomment, #outbrain_widget_0, #height_cal, #main-div, #follow_srch, #slidshdiv, #fnt11ba"
            }
        },
        {
            // Example page: http://articles.timesofindia.indiatimes.com/2010-11-22/edit-page/28261930_1_cities-ndmc-lieutenant-governor
            urlPatterns: ["articles.timesofindia.indiatimes.com/*"],
            page_mainContent: {
                selector: "#area-center-w-left, #area-bottom",
                exclude: "#mod-ctr-lt-in-top, .mod-adcpc, #area-article-side"
            }

        },
        {
            urlPatterns: ["blogs.timesofindia.indiatimes.com/*"],
            page_mainContent: "#profileBlock"
        }
    ],

    "instagram.com": [
        {
            urlPatterns: ["instagram.com"],
            CUs_specifier: ".timelineCenter",
            CUs_style: {
                setOverlayZIndexHigh: true
            },
            page_SUs: {
                std_header: "header",
            },
        }
    ],

    "facebook.com": [
        {
            // Facebook main feed page
            urlPatterns: ["www.facebook.com", "www.facebook.com/?ref=logo", "www.facebook.com/groups/*", "www.facebook.com/hashtag/*", "www.facebook.com/#"],
            CUs_specifier: ".genericStreamStory.uiUnifiedStory, " + // For the original layout. This selector has consistently
            // worked since Nov 2012. Possibly still exists for some users.
                           "._5uch._5jmm._5pat, " + // Related to changes made around Nov 2013
                           "._6kq, " + // for the new layout, that has a very limited release at the moment.
                            "._4-u2.mbm._5jmm._5pat._5v3q._x72, " + // added on Jan 26, 2015
                            ".userContentWrapper",      //added on Nov 24, 2018
            // NOTE: FB CU_specifier data needs cleanup

            CUs_SUs: {
                // The last selector in the following apply for the new FB layout (for eg: ._6k6, ._6k2 etc)
                "std_upvote": {kbdShortcuts: ["l", "u"],  selector: ".UFILikeLink,  ._6k6" },
                "std_comment": ".comment_link, ._6k2",
                "std_share": ".share_action_link, ._6j_",
                "std_viewComments": ".UFIPagerLink, .UFIBlingBoxCommentIcon, .prm:contains('Comment')", //.UFIPagerLink for "view more comments" link on both old and new layouts,
                // .UFIBlingBoxCommentIcon and .prm:contains('Comment')" for the comment icon on old and new layout respectively

                // We don't want to focus the following:
                // .highlightSelectorButton is the button on the top right of a post. We don't want it to be selected as
                // a main element. In some posts (such as the "suggested" posts), it is the first focusable in the post.

                // .photoRedesignLink is being applied to images that are part of an album. We don't want to select the
                // first image of albums on FB. See #174.
                //
                // .lfloat: Is applied to a left floating image in the shared content that has a supporting link on its right.
                // In such cases, we want the link to be focused/highlighted instead of the image (because the link is
                // the main shared content).
                // .shareRedesignContainer>a: Similar to the .lfloat case, except that here the image is on top, and the
                // shared link just below the image.
                // See screenshots in #175

                // NOTE: We can afford for these selectors to be non-optimized because these will be looked for inside $CU.
                // If these were meant for the entire page, then some of these would be very bad!

                std_mainEl: [
                    // mainEl is specified as an array of selectors for FB in order of preference.
                    // The first selector is for shared content, the second for the author of the post.


                    // 1. Shared content

                    // original FB layout (was working consistently since Nov 2012)
                    ".fbMainStreamAttachment a:first-child:not(.highlightSelectorButton, .fbQuestionPollForm a, ._4q5, .lfloat, .shareRedesignContainer>a), "  +
                    ".uiStreamAttachments a:not(.highlightSelectorButton, .fbQuestionPollForm a, ._4q5, .lfloat, .shareRedesignContainer>a), " +
                    ".uiStreamSubstory .pronoun-link, .shareText a, a.shareText, " +


                    // Since Nov 2013, some users' FB has the selectors changed.
                    "a.uiVideoThumb, " +
                    "a._5pb3._5dec, " + // image of shared link
                    "a._5pc0._5dec, ._5pc1._5dec a, ._5ys3 a," + // shared photo
                    "._5pb_.mvm>a, " + // photo. Not a directly "shared" photo, generally a photo that a friend commented on.
                    "._5pc1._5dec.mbs.mrs a, " + // photo in a shared album

                    // Latest FB layout. Rolled out to a very limited set of users.
                    "a._4-eo, ._6m3 a, a._52c6, a._6ki, a._6k_",


                    // 2. Author of post (default main element if shared content not present)

                    ".fwb.fcg a, a.profileLink"],

                std_seeMore: ".text_exposed_link>a"
            },
            page_SUs: {
                std_header: "#pagelet_bluebar .clearfix",
            },
            page_mainContent: ".uiLayer, #pagelet_stream_pager"
        },
        {
            urlRegexps: [/^www\.facebook\.com(?!\/pages).+/], // Match all facebook.com* pages except of the type facebook.com/pages*
            CUs_specifier: "._4_7u .fbTimelineUnit",
            CUs_SUs: {
                "std_upvote": {kbdShortcuts: ["l", "u"],  selector: ".UFILikeLink" },
                "std_comment": ".comment_link",
                "std_share": ".share_action_link",
                //.UFIPagerLink for "view more comments", .mls for the comment icon, and .UFIBlingBoxTimelineCommentIcon for number next to comment icon
                "std_viewComments": ".UFIPagerLink, .mls, .UFIBlingBoxTimelineCommentIcon",
                std_mainEl: ".shareUnit a, .profilePicChangeUnit a, a.coverPhotoChangeUnit, .photoUnit a", // for the timeline page
                "seeMore": {kbdShortcuts: ["m"], selector: ".text_exposed_link>a", descr: "See more"}
            },
            page_SUs: {
                std_header: "#headNav, .stickyHeaderWrap", // #headNav is the main header, the latter is a dynamic header that sometimes shows up.
                std_nextOrMore: "a.uiMorePagerPrimary:contains('Show Older Stories')"
            }

        },
        {
            shared: "true",
            page_SUs: {
                std_logout: "#logout_form input[type=submit]"
            }
        }
    ],

    "feedly.com": {
        urlPatterns:["cloud.feedly.com*"],
        protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n", "h", "l"]
    },

    "github.com": [

        {
            urlPatterns: ["github.com/*/commits/*"],
            CUs_specifier: ".js-navigation-item, .pagination>a:last-child"
        },
        {
            urlPatterns: ["github.com/*/issues*", "github.com/*/labels/*"],
            CUs_specifier: {
                selector: ".js-navigation-item",
                mouseoverOnCUSelection: true
            },
            CUs_SUs: {
                std_mainEl: ".js-navigation-open",
                std_toggleSelection: ".select-toggle-check"
            }
        },
        {
            // Search in all repositories, Search in current repository:
            urlPatterns: ["github.com/search?*", "github.com/*/search?*"],
            CUs_specifier: ".source, .user-list-item, .code-list-item, .issue-list-item, .next_page",
            CUs_SUs: {
                std_mainEl: "h3 a, .user-list-info>a"
            },
            CUs_style: {
                overlayPadding: "5px"
            }
        },
        {
            urlPatterns: ["github.com", "github.com/organizations/*"],
            CUs_specifier: ".alert, .pagination>a",
            CUs_SUs: {
                std_mainEl: ".title>a:last-child"
            }
        },
        {
            shared: "true",
            page_SUs: {
                std_logout: "#logout"
            }
        },
    ],

    // the following key is redundant due to specialDomain_masterDomain_map array, but is included currently to serve
    // as an example
    "google.co.in": "google.com", // if the mapped value is a string, it is used as the key mapping to the actual value

    "google.com": [
        {
            // google search results page
            urlPatterns: ["www.google.@/*", "www.google.co.@/*"],
            urlRegexps: [], // since the array is empty this is redundant
            /*
             g-section-with-header: header result
             #res div.g: search result
             #brs: related searches
             .NFQFxe: people results (also has data-attrid="kc:/people/person:sideways")
             #pnnext: "Next" link
             */
            CUs_specifier: "g-section-with-header, #res div.g, #brs, .NFQFxe, #pnnext",
            CUs_style: {
                "overlayPadding": "5px"
            },
            CUs_SUs: {
                std_mainEl: ".r>a" // For the "in-depth article" section of the search results
            },
            CUs_actions: {
//                // This feature has now been removed since google removed the "preview" feature
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
            page_SUs: {
                "within-last-year": {
                    descr: "Show results from last year",
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
            // for scholar.google.co*
            urlPatterns: ["scholar.google.@/*", "scholar.google.co.@/*"],
            CUs_specifier: ".gs_r, #gs_n td:last-child",
            CUs_style:{
                overlayPadding: "5px 0 5px 5px"
//                useInnerElementsToGetOverlaySize: true
            },
            CUs_SUs: {
                std_mainEl: ".gs_rt>a"
            }
        },
        {
            // for Gmail
//            urlPatterns: ["gmail.com*", "mail.google.com*"],
//            protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n"]
        },
        {
            shared: "true",
            page_SUs: {
                std_logout: "#gb_71"
            }
        }
    ],

    "hnsearch.com": [
        {
            urlPatterns: ["www.hnsearch.com/search*"],
            CUs_specifier: ".content-results-wrapper table", // .content-pagination a:contains('Next') main element
            // focus does not work because the link does not have an href. We need to implement a fake focus for such cases.
            CUs_SUs: {
                std_mainEl: ".content-result-subheader a:contains('on:')"
            },
            CUs_style: {
                overlayPadding: "5px"
            }
        }
    ],

    "linkedin.com": [
        {
            urlPatterns: ["www.linkedin.com/*"],
            CUs_specifier: "#my-feed-post .feed-item",
            CUs_style: {
                overlayPadding: "0 0 20px 0",
                setOverlayZIndexHigh: true
            },
            CUs_SUs: {
                std_mainEl: ".new-miniprofile-container a"
            }
        },
    ],

    "medium.com": [
        {
            urlPatterns: ["medium.com", "medium.com/*"],
            CUs_specifier: ".block--list",
            CUs_style: {
                overlayPadding: "0 10px"
            },
            CUs_SUs: {
                std_mainEl: ".block-title>a"
            }
        }
    ],

    "npr.org": [
        {
            urlPatterns: ["www.npr.org"],
            CUs_specifier: ".attachment-group, .story-wrap, article",
            CUs_style: {
                setOverlayZIndexHigh: true
            },
            CUs_SUs: {
                std_mainEl: ".story-text>a"
            },
            page_SUs: {
                std_header: ".header, nav"
            },

        },
    ],

    "nytimes.com": [
        {
            urlPatterns: ["www.nytimes.com/**"],
            page_mainContent: "#article"
        },
        {
            urlPatterns:["www.nytimes.com"],
            CUs_specifier: ".navigationHomeLede, .story, .headlinesOnly, .baseLayoutBelowFold .module>.column, .extendedVideoPlayerModule, #classifiedsWidget, #mostPopWidget, .tabbedBlogModule, .singleRule, #spanABTopRegion, #wsodMarkets"
//            CUs_specifier: ".column.last .columnGroup, #main .module .column, #insideNYTimesBrowser td"
        },
        {
            urlPatterns:["international.nytimes.com"],
            CUs_specifier: ".flush.primary, .story, .headlinesOnly, .baseLayoutBelowFold .module>.column, .extendedVideoPlayerModule, #classifiedsWidget, #mostPopWidget, .tabbedBlogModule, .singleRule, #spanABTopRegion, #wsodMarketsGlobalEditionHPModule"
//            CUs_specifier: ".column.last .columnGroup, #main .module .column, #insideNYTimesBrowser td"
        },
        {
            shared: "true",
            CUs_style: {
                overlayPadding: "2px"
            }
        }
    ],

//    "pinterest.com": [
//        {
//            urlPatterns: ["www.pinterest.com"],
//            CUs_specifier: ".item",
//            CUs_style: {
//                setOverlayZIndexHigh: true,
//                highlightCUOnSelection: true
//            }
//        },
//    ],

    "quora.com": [
        {
            urlPatterns: ["www.quora.com/search?*"],
            CUs_specifier: ".query_result, .results_page_add_question",
            CUs_SUs: {
            },
            CUs_style: {
                overlayPadding: "0 0 0 5px"
            }
        },
        {
            // URL pattern for a question page.

            // Matches patterns of type www.quora.com/*/* (where * is any character including a '/')
            // Does NOT match patterns of type www.quora.com/a/b where a is any word and be is one of 'home', 'about',
            // 'questions', 'new'. These are special pages in Quora, pertaining to a topic generally. These should be
            // handled by the CU selector for www.quora.com/* pattern (specified later).
            urlRegexps: [/^www\.quora\.com\/.+\/(?!about$|questions$|new$|home$).+/],
            CUs_specifier: {
                // .question.row: question
                // .main_col>div>.row .row: answer (on a regular question Quora page)
                // .answer_standalone>.row:first-child: answer (on a Quora question page that links to only one answer
                // (let's call such pages one-answer-shared-page), such as:
                // http://www.quora.com/Arvind-Kejriwal/Why-should-someone-vote-for-Arvind-Kejriwal/answer/Abhishek-Shrivastava)
                // .invite_to_answer: As evident, is the 'invite to answer' block
                selector: ".question.row, .main_col>div>.row .row, .invite_to_answer, .wiki_section, .answer_standalone>.row:first-child" /* Working well since May 2013*/
            },
            CUs_style: {
                overlayPadding: "2px 0 0 0"
            },
            CUs_SUs: {
                // .answer_wrapper .answer_user a.user: link to the user that has answered a question (inside an answer
                // unit). Specifying the .answer_wrapper is required to make sure that user links only inside answer units are
                // selected (and not those inside question units).
                // .question_link: link to the question. Used in the one-answer-shared-page.
                std_mainEl: ".question_link, .answer_wrapper .answer_user a.user, .topic_name",
            }
        },
        {
            urlPatterns: ["www.quora.com", "www.quora.com/?share=1"], // The first two patterns match
            // with the main quora feed page.
            CUs_specifier: /*".feed_item, .announcement, .pager_next.action_button"*/  ".e_col.p1.w4_5, .feed_item.row.p1, .row.w5.profile_feed_item",
            // the first selector for quora main page (and a few others), the second one for a page like this one:
            // http://www.quora.com/Front-End-Web-Development
            CUs_SUs: {
                // because Quora has many different kinds of units (and units with the same classes across units),
                // it is important to have the main element data be very specific. otherwise, incorrect/ unexpected
                // main elements will get selected.
                std_mainEl: "a.question_link, h2.board_item_title a, .meta_feed_item a.topic_name, .meta_item_text>a.user",

            },
            CUs_style: {
                overlayPadding: "0 0 0 5px"
            }
        },
        {
            // For a "topic" page such as http://www.quora.com/Front-End-Web-Development or a "question" page such as
            // http://www.quora.com/What-is-the-most-amazing-photo-you-have-ever-taken

            // NOTE: For now, we have pretty much combined the selectors of the feed/ topic page and the question page.
            urlPatterns: ["www.quora.com/@"],
            CUs_specifier: ".question.row, .main_col>div>.row .row, .invite_to_answer, .wiki_section, .e_col.p1.w4_5, .feed_item.row.p1, .row.w5.profile_feed_item",
            CUs_SUs: {
                std_mainEl: ".answer_user>span>a.user, a.question_link, h2.board_item_title a, .meta_feed_item a.topic_name, .meta_item_text>a.user",
            }
        },
        // Same as the URL pattern for the main feed page
        // TODO: check if this data is needed.
        {
            urlPatterns: ["www.quora.com/*"], //
            CUs_specifier: ".e_col.p1.w4_5, .feed_item.row.p1, .row.w5.profile_feed_item",
            CUs_SUs: {
                std_mainEl: "a.question_link, h2.board_item_title a, .meta_feed_item a.topic_name, .meta_item_text>a.user",
            },
            CUs_style: {
                overlayPadding: "0 0 0 5px"
            }
        },
        // Data shared by all pages
        {
            shared: "true",
            page_SUs: {
                std_logout: ".logout a:contains('Logout')",
                std_header: ".fixed_header.header"
            },
            CUs_SUs: {
                std_seeMore: ".more_link",
                "std_share": ".share_link",
                "follow": {
                    selector: ".follow_question",
                    kbdShortcuts:["shift+f"],
                    descr: "Follow"
                },
                "std_viewComments": {
                    kbdShortcuts: ["c", "v c"],
                    selector: ".view_comments"
                },
                "std_upvote": ".add_upvote, .remove_upvote, .rate_up",
                "std_downvote": ".add_downvote, .remove_downvote, .rate_down",
            },
        }
    ],

    // only support on the main page
    "reddit.com": [
        {
            // There is no straighforward CU_specifier selector for the comments page. It used to work well with
            // buildUnitAround using (".arrow.up") but seems to have recently stopped to work. There's likely work needed
            // in the buildUnitAround code.
            urlPatterns: ["www.reddit.com/*/comments/*"],
            protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n"]

        },
        {
            urlPatterns: ["www.reddit.com", "www.reddit.com/?*", "www.reddit.com/r/*", "www.reddit.com/@"],
            CUs_specifier: {
                selector: ".sitetable>div.thing, .nextprev a[rel='nofollow next']" //works well. doesn't include the promoted article.
            },
            CUs_style: {
                useInnerElementsToGetOverlaySize: true,
                "overlayPadding": "5px 10px 5px 0"
            },
            CUs_SUs: {
                std_mainEl: "a.title",
                "std_viewComments": {kbdShortcuts: ["c", "v c"], selector: ".flat-list.buttons .comments"},
                "hide": {kbdShortcuts: ["h"],  selector: ".hide-button a" },
                "save": {kbdShortcuts: ["shift+s"], selector: ".save-button a"}
            }
        },
        {
            shared: "true",
            page_SUs: {
                std_logout: ".logout a:contains('logout')"
            },
            CUs_SUs: {
                "std_upvote": ".arrow.up, .arrow.upmod",
                "std_downvote": ".arrow.down, .arrow.downmod",
                "std_share": ".share-button .active",
                "hide": {kbdShortcuts: ["h"],  selector: ".hide-button" },
                "report": {kbdShortcuts: ["r"],  selector: ".report-button" },
            }
        },
    ],

    "scribd.com": [
        {
            urlPatterns: ["www.scribd.com/*"],
            page_mainContent: "#document_column, .sticky_bar"
        }
    ],

    "theguardian.com": [
        {
            urlPatterns: ["www.theguardian.com/**"],
            page_mainContent: "#article-header, #content, .share-links.b3"
        }
    ],

//    "coffitivity.com": [
//        {
//            urlPatterns: ["coffitivity.com"],
//            CUs_specifier: ".content, .audiocontroller",
////            CUs_style: {
////                useInnerElementsToGetOverlaySize: true,
////                "overlayPadding": "10px 5px 50px 0px"
////            },
//        }
//    ],

    // Sites included: "*.stackexchange.com", "stackoverflow.com", "superuser.com", "serverfault.com", "stackapps.com",
    // "askubuntu.com"
    // Also, "meta.stackoverflow.com", "meta.superuser.com","meta.stackoverflow.com", etc.

    //StackExchange powered sites included: "mathoverflow.net"
    "stackexchange.com": [
        {
            urlPatterns: ["stackoverflow.com/about"],
            CUs_specifier: ".content-page>div",
            CUs_style: {
                useInnerElementsToGetOverlaySize: true,
                "overlayPadding": "10px 10px 50px 10px"
            },
        },
        {
            // Pages with lists of questions
            // Examples: http://stackoverflow.com/questions, http://stackoverflow.com/questions/tagged/perl,
            // http://stackoverflow.com/
            urlPatterns: ["*.stackexchange.com/questions", "*.stackexchange.com/questions/tagged*",
                "*.stackexchange.com", "*.stackexchange.com/search?*", "*.stackexchange.com/?tab=@"],
            urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions$/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\/tagged\//,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)$/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/search?/,
                /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/\?tab=[^\\.\/]+/,

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
            CUs_SUs: {
                "std_upvote": ".vote-up-off",
                "std_downvote": ".vote-down-off",
                "std_share": ".short-link",
                "std_edit": ".suggest-edit-post",
                "std_comment": ".comments-link",
                "star": {kbdShortcuts: ["r"],  selector: ".star-off", descr: "Star question"}

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

        },
        {
            shared: "true",
            page_SUs: {
                std_logout: [".profile-triangle", ".profile-links a:contains('log out')"] // DOES NOT WORK
            }
        }
    ],

    "stackoverflow.com": "stackexchange.com",
    "superuser.com": "stackexchange.com",
    "serverfault.com": "stackexchange.com",
    "stackapps.com": "stackexchange.com",
    "askubuntu.com": "stackexchange.com",
    "mathoverflow.net" : "stackexchange.com",

    "techcrunch.com": {
        urlPatterns: ["techcrunch.com/*"],
        CUs_specifier: {
            selector: ".top-featured-posts, .post, #paging-below .page-next>a, #paging-below .page-prev>a",
        },
        CUs_style: {
            overlayPadding: "0 10px"
        },
        CUs_SUs: {
            std_mainEl: "h2.headline>a, .featued-post-description .featured-post-link",
        },
        page_SUs: {
            std_header: '#module-header>.top-container',
            std_nextOrMore: ".page-next>a"
        }
    },

    "thehindu.com": [
        {
            urlPatterns: ["www.thehindu.com/"],
            CUs_specifier: ".left, .middle, .right, .courosel-row"
        },
        {
            urlPatterns: ["www.thehindu.com/**"],
            page_mainContent: "#left-column"
        }
    ],

    "tumblr.com": [
        {
            urlPatterns: ["*.tumblr.com", "*.tumblr.com/page/@"],
            CUs_specifier: "article, .post",

            page_SUs: {
                std_header: "#navigation, #top-ad"
            }
        }
    ],

    "twitter.com": [
        {
            urlPatterns: ["twitter.com/@"], // works on profile pages
            CUs_specifier: {
                // .inline-reply-tweetbox: Reply to tweet container
                // .view-more-container: "View more in conversation" link container
                // .js-actionable tweet: All tweets (Main tweets + response tweets that show when the main tweet is expanded)
                selector: ".js-actionable-tweet, .stream-user-gallery, .inline-reply-tweetbox, .view-more-container"
            },
            /* If I do not specify mainEl (like we have done for other Twitter pages), then the "date" link gets focus
            as it is the first focusable. It has a tooltip and focusing it for every tweet is unnecessarily distracting.
             */
            CUs_SUs: {
                std_mainEl: '.js-tweet-text a.pretty-link, .js-tweet-text a.twitter-timeline-link:not(.u-hidden), .ContextualLink'
            }
        },
        {
            urlPatterns: ["twitter.com/*"], // works on rest of the pages of twitter. Relevant URLS:  main feed page,
            // tweet page, search results page
            CUs_specifier: {
                // .inline-reply-tweetbox: Reply to tweet container
                // .view-more-container: "View more in conversation" link container
                // .js-actionable tweet: All tweets (Main tweets + response tweets that show when the main tweet is expanded)
                selector: ".js-actionable-tweet, .stream-user-gallery, .inline-reply-tweetbox, .view-more-container"
            }
            /* NOTE: no std_mainEl specified because selecting the first link or hashtag or username in the tweet content
            * is quite distracting. By default, the user profile link is given focus, works alright. */
        },
        {
            shared: "true",
            page_SUs: {
                std_logout: "#signout-button",
                std_header: ".global-nav"
            },
            CUs_SUs: {
                //std_mainEl: '.js-tweet-text a.pretty-link, .js-tweet-text a.twitter-timeline-link:not(.u-hidden), .ContextualLink',
                reply: {
                    selector: '.js-action-reply',
                    kbdShortcuts: ["r"],
                    descr: "Reply"
                },
                retweet: {
                    selector: '.retweet',
                    kbdShortcuts: ["t"],
                    descr: "Retweet"
                },
                favorite: {
                    selector: '.favorite, .unfavorite',
                    kbdShortcuts: ["v"],
                    descr: "Favorite/ Un-favorite"
                },
                expand: {
                    selector: '.js-details',
                    kbdShortcuts: ["e"],
                    descr: "Expand/ Collapse"
                },
                std_profile: '.js-user-profile-link'

            }
        }
    ],

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

    "washingtonpost.com": [
        {
            urlPatterns: ["www.washingtonpost.com", "www.washingtonpost.com/regional"],
            CUs_specifier: ".module:not(.right-rail, .hot-topics)", // :not can have comma within in jQuery's extensions to CSS selectors
            CUs_SUs: {
                std_mainEl: ".headline>a, h2>a"
            }
        },
        {
            urlPatterns: ["www.washingtonpost.com/**"],
            page_mainContent: {
                selector: "#content[role=main], #article-leaf-page>.main-content",
                exclude: "#header-v3, #wpni_adi_inline_bb, #article-side-rail, #article-leaf-page-footer-taboola, #echo_container_a"
            }
        }
    ],

//    "yahoo.com": [
//        {
//            urlPatterns: ["www.yahoo.com"],
//            CUs_specifier: ".main-story, #stream li, .voh-parent-wrapper, .app",
//            CUs_style: {
//                setOverlayZIndexHigh: true
//            }
//        }
//    ],

    "ycombinator.com": [
        {
            urlPatterns: ["news.ycombinator.com/item*"],
            CUs_specifier: {
                buildCUAround: "center>a" // upvote link
            },
            CUs_SUs: {
                std_mainEl: ".comhead>a, td.title>a", // commenter's name and shared post's title
                std_comment: {
                    selector: "a:contains('reply')",
                    descr: "Reply",
                    kbdShortcuts: ["r", "c"]
                },
                std_upvote: "center>a"
            }
        },
        {
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
                    kbdShortcuts: ["c", "v c"], // overridden to add additional shortcut
                    selector: "a:contains('comment'), a:contains('discuss')"
                },
                "std_upvote": "td:nth-child(2)>center>a"
            }
        }
    ],


    "youtube.com": [
        {
            urlPatterns: ["www.youtube.com/results*"],
            urlRegexps: [],
            protectedWebpageShortcuts: [],
            CUs_specifier:  {
                selector: "#search-results li"
            },
            CUs_SUs: {
                std_mainEl: ".yt-uix-tile-link"
            }
        },
        {
            urlPatterns: ["www.youtube.com/user/*"],
            CUs_specifier: ".channels-content-item, .c4-spotlight-module, .expanded-shelf-content-item-wrapper",
            CUs_SUs: {
                std_mainEl: ".yt-uix-tile-link, .title>a"
            },
            CUs_style: {
                overlayPadding: "0 0 4px 0"
            },
        },
        {
            urlPatterns: ["www.youtube.com/channel/*"],
            CUs_specifier: ".c4-welcome-primary-col, .feed-item-snippet, .expanded-shelf-content-item, " +
                ".feed-list-item, .yt-shelf-grid-item",
            CUs_SUs: {
                std_mainEl: ".yt-uix-tile-link, .yt-ui-ellipsis a"
            },
            CUs_style: {
                overlayPadding: "0 0 4px 0"
            },
        },
        {
            urlPatterns: ["www.youtube.com/*"],
            CUs_specifier: ".feed-list-item",
            CUs_SUs: {
                std_mainEl: ".feed-item-content a:not(.g-hovercard>a, .g-hovercard), .content-item-detail a, " +
                    "a.yt-uix-tile-link, a.yt-uix-redirect-link"
            },
            CUs_style: {
                overlayPadding: "" // some negative margin-top would be nice to apply.
            }
        },
        {
            shared: "true",
            page_SUs: {
                "upvote": {
                    selector: "#watch-like",
                    kbdShortcuts:["u"],
                    descr: "Like video"
                },
                "downvote": {
                    selector: "#watch-dislike",
                    kbdShortcuts:["d"],
                    descr: "Dislike video"
                },
                std_comment: ".comments-textarea-container textarea"
            }
        }
    ],

    //Data that may need to be removed for friend release. 1) These sites are either not very commonly known. 2) They are
    // experimental and not well supported by Units.
//    "sulekha.com": {
//        urlPatterns: ["*.sulekha.com/*"],
//        CUs_specifier: {
//            selector: ".sul_result_container"
//        }
//    },
//    "team-bhp.com": {
//        urlPatterns: ["*.team-bhp.com/*"],
//        CUs_specifier: {
//            selector: ".box>table tr"
//        }
//    },

    // pages that have their own units.

//    "github.com": {
//        urlPatterns: ["github.com/*"],
//        protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n"]
//    },

     "duckduckgo.com": {
        urlPatterns: ["duckduckgo.com/*"],
        protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n", "h", "l"]
    },

//     "delicious.com": {
//        urlPatterns: ["delicious.com/*"],
//        protectedWebpageShortcuts: ["j", "k", "g", "o", "f", "n"]
//    },




};