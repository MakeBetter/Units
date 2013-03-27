/*
 As the project grows larger, the functionality provided by this file may be replaced by mechanisms
 like localstorage/websql/etc, working in conjunction with a server side repository etc.
 Alternatively, we could continue to use this file, but have it generated based on another data-source
 */

/* The 'urlToUrlDataMap' object (along with the 'specialDomain_masterDomain_map' object) provides a way to map a URL
 (stripped of http(s):// etc) to the data associated with that URL (called 'urlData'), which identifies elements of
  importance on the webpage, including any Container Units (CUs), and the  associated keyboard shortcuts. The 'urlData' also specifies
  any other information associated with the URL.

 Notes:
 1) Each key of the urlToUrlDataMap object is called a domain-key, and is the "main domain" for the corresponding
 website, i.e. the topmost "registrable" domain based on the public suffix list (publicsuffix.org).

 2) If the value mapped to a domain-key is a string, that string is used as the domain-key instead. The "pointed to"
 domain-key is called a "master domain". For example, google.com may be used as the master domain for google.co.in etc)

 The value mapped to any master domain-key is generally an array. Each object of the array is a 'urlData' type
 object, and it contains data associated with one or more URLs. Which URLs match a 'urlData' object depends on the
 'urlRegexps' (regular expressions) and 'urlPatterns' (explained below) properties of that object, and a single
 "urlData" key.
 For an array with only one 'urlData' object, the object may directly be specified instead of the array.

 So how exactly is a URL mapped to a 'urlData' object? For any url, from among the array of 'urlData' objects mapped
 to its domain/master domain, the 'urlData' object containing the first matching pattern/regexp is used. Hence the
 "urlData" objects should be ordered accordingly.
 Eg: The urlData associated with a default/catch-all regexp should be the last one specified.

 (The aforementioned "urlPatterns" offer a simpler alternative to regexps, in case a  full regexp is not required.
 They allow using *'s and @'s as "wildcards":
 - A '@' matches any combination of *one or more* alphanumeric characters,  dashes, underscores and commas
 - A '*' matches any combination of *one or more* characters of *ANY* type.)

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
*/
// TODO: format of each urlData to be explained along with various ways of specifying, and the various keys etc.
// TODO: maybe the formats can be explained at two levels - simple options and advanced ones
// One way of finding out all the properties that can be supplied to this object, is to search for urlData variable
// in the content scripts
var urlToUrlDataMap = {
    // ** NOTE: domain-keys are listed alphabetically **

    // this domain key serves only as an example illustrating the structure of a domain-key and value pair. is named so to appear first among sorted keys
    "0000-example.com": [
        {
            // If any one of the url-patterns or url-regexps listed below match the actual URL, the corresponding
            // object is considered to be a match. The first matching object found within a domain-key found is returned.
            urlPatterns: ["@.0000-example.com/images/*, www.example.com/archive/images/*"],
            // Use regexps for cases where a simple url-pattern using '*' and '@' won't suffice, for example:
            urlRegexps: [/^www\.000-example\.com\/image|images$/],
            CUSpecifier: ".image, .post"  // NOTE: currently CUs within others CUs are removed
        },

        {
            urlPatterns: ["www.0000-example.com/*"],
            urlRegexps: [], // since the array is empty this is redundant

            /* There are two types of shortcuts that can be specified here: page-specific and CU-specific.
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
            page_shortcuts: {
                "images": { keys: ["i"], selector: "#images"},

                "messages": { keys: ["m"], fn: function(document, $selectedCU) {
                    $(document).find('#messages').click();
                }}
            },
            CU_shortcuts: {
                "like": {keys: ["l", "u"],  selector: ".upvote" },

                // if 'selector' specifies an array of selectors, clicks will be invoked on those elements in order
                "foo": {keys: ["f"], selector: [".abc", "a.xyz"]},

                "collapse-comments": {keys: ["-", "c"], fn: function(document, $selectedCU) {
                    //do anything. like invoke some javascript, apply css to $selectedCU, etc
                }}
            },
            CUSpecifier: {
                CU: ".foo .bar",
                main: ".main-link",
                "overlay-padding": "5px",
                useInnerElementsToGetOverlaySize: false, // defaults to false; true is used in some sites like hacker news and reddit
            },
            fn_onCUSelection: function($deselectedCU, document) {
               // do anything here
            },
            fn_onCUDeselection: function($deselectedCU, document) {
                // do anything here
            },
            // element that should be clicked to load "next" page in a paginated view or "more" content in an infinite
            // scroll type page
            nextOrMore: ".uiMorePagerPrimary",
            searchField: "#search", // to a allow shortcut for focusing it

            // The header property needs to be specified only if the header element on the page "sticks" at the top
            // of the page even as the page is scrolled. If there are multiple sticky headers, specify all of them
            // separated with commas. [Though this is useful only for "sticky" headers, specifying non-sticky ones
            // here won't harm. So if not sure, specify the header element(s)]
            header: "#header",
        }
    ],
    "amazon.com": {
        urlPatterns: ["www.amazon.com*"],
        CUSpecifier: "#center .prod"
    },
    "facebook.com": {
        urlPatterns: ["www.facebook.com*"],
        CU_shortcuts: {
            "like": {keys: ["l", "u"],  selector: ".UFILikeLink" },
            "comment": {keys: ["c"],  selector: ".comment_link" },
            "share": {keys: ["s"],  selector: ".share_action_link" },
            "view_all_comments": {keys: ["v"],  selector: ".UFIPagerLink" }
        },
        CUSpecifier: {
//            CU: "li.genericStreamStory.uiUnifiedStory, .fbTimelineUnit, .escapeHatchUnit, .fbTimelineCompactSection",

            /* .genericStreamStory.uiUnifiedStory -> user's feed at facebook.com
             the rest -> timeline pages
             */
            CU: ".genericStreamStory.uiUnifiedStory, #fbTimelineHeadline .actions, .fbTimelineNavigationPagelet, .vTop, .leftUnits, .rightUnits, .timelineUnitContainer, .timelineReportContainer"
        },
        header: "#headNav, .stickyHeaderWrap",
        nextOrMore: ".uiMorePagerPrimary"
    },

    // the following key is redundant due to specialDomain_masterDomain_map array, but is included currently to serve
    // as an example
    "google.co.in": "google.com", // if the mapped value is a string, it is used as the key mapping to the actual value

    "google.com": [
        {
            // google search results page
            urlPatterns: ["www.google.@/*", "www.google.co.@/*"],
            urlRegexps: [], // since the array is empty this is redundant
            page_shortcuts: {
              "within-last-year": {
                  keys: ["y"],
                  selector: ["#hdtb_tls", ".hdtb-mn-hd:contains('Any time')", ".q.qs:contains('Past year')"]
              }
            },
            CU_shortcuts: {
                "toggle-preview": {
                    keys: ["p"],
                    // this function is meant to work in conjunction with fn_onCUDeselection (see below)
                    fn: function($selectedCU, document) {
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
            fn_onCUDeselection: function($deselectedCU, document) {
                if ($('#nycp').is(':visible')) { // if the preview pane is already visible
                    var closePreviewBtn = document.getElementById("nycx");
                    closePreviewBtn &&  closePreviewBtn.click();
                }
            },
            CUSpecifier: {
                CU: "#res li.g, #foot, #brs",
                main: "a.l",
                "overlay-padding": "5px"
            }
        },
        {
            // for scholar.google.com etc.
            urlPatterns: ["scholar.google.@/*", "scholar.google.co.@/*"],
            CUSpecifier: ".gs_r, .gs_ico_nav_next"
        }
    ],
    "guardian.co.uk": {
        urlPatterns: ["www.guardian.co.uk*"],
        CUSpecifier:"#inner-wrapper li.b3, #inner-wrapper li.inline-pic, #inner-wrapper li.wide-image"
    },
    "nytimes.com": {
        urlPatterns: ["www.nytimes.com*"],
        CUSpecifier: ".story:not(.clearfix,.advertisement), #wellRegion .column, .cColumn .columnGroup"
    },
    "quora.com": [
        {
            urlPatterns: ["www.quora.com"], // main quora feed page
            CUSpecifier: {
                CU: ".feed_item, .announcement, .pager_next.action_button",  //TODO: needs work
                main: " a.question_link"
            }

        },
        {
            urlPatterns: ["www.quora.com/*"], // all other pages on quora (tested currently for question pages)
            CUSpecifier: {
                CU: ".question.row, .w4_5.p1.answer_text, .pager_next.action_button",  //TODO: needs work
                main: ".answer_user>span>a.user",
//                "overlay-padding": "5px"
            }
        }
    ],
    "reddit.com": [
            {
                urlPatterns: ["www.reddit.com/*/comments/*"],
                CUSpecifier: {
                    buildCUAround: ".arrow.up, .usertext-edit",
    //                exclude: ".panestack-title, .menuarea"
    //                main: ".title",
    //                style: "minimal"
                },
                CU_shortcuts: {
                    "upvote": {keys: ["u"],  selector: ".arrow.up, .arrow.upmod" },
                    "downvote": {keys: ["d"],  selector: ".arrow.down, .arrow.downmod" },
                    "share": {keys: ["s"],  selector: ".share-button .active" },
                    "edit": {keys: ["c"],  selector: ".comments" },
                    "hide": {keys: ["h"],  selector: ".hide-button" },
                    "report": {keys: ["r"],  selector: ".report-button" },
                    "minimize": {keys: ["m"],  selector: ".noncollapsed .expand" }

                }
            },
            {
                urlPatterns: ["www.reddit.com*"],
                CUSpecifier: {
                    CU: "#siteTable>div.thing", //works well. doesn't include the promoted article though,
                    main: ".title",
                    // style: "minimal",
                    useInnerElementsToGetOverlaySize: true,
                    "overlay-padding": "5px 10px 5px 0"
                },
                CU_shortcuts: {
                    "upvote": {keys: ["u"],  selector: ".arrow.up, .arrow.upmod" },
                    "downvote": {keys: ["d"],  selector: ".arrow.down, .arrow.downmod" },
                    "share": {keys: ["s"],  selector: ".share-button .active" },
                    "edit": {keys: ["c"],
                        fn: function($selectedCU, document) {
                            var $el = $selectedCU.find(".flat-list.buttons .comments");
                            var ctrlClickEvent = document.createEvent("MouseEvents");

                            // detecting OS detection based on:
                            // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
                            if (isMac) {
                                ctrlClickEvent.initMouseEvent("click", true, true, null,
                                    0, 0, 0, 0, 0, false, false, false, true, 0, null); // cmd key set to true for mac
                            }
                            else {
                                ctrlClickEvent.initMouseEvent("click", true, true, null,
                                    0, 0, 0, 0, 0, true, false, false, false, 0, null); // ctrl key set to true for non-macs
                            }

                            $el[0].dispatchEvent(ctrlClickEvent);
                        }
                    },
                    "hide": {keys: ["h"],  selector: ".hide-button" },
                    "report": {keys: ["r"],  selector: ".report-button" },
                    "save": {keys: ["v"], selector: ".save-button a, .unsave-button a.togglebutton"}

                }
            }
    ],

    // Sites included: "*.stackexchange.com", "stackoverflow.com", "superuser.com", "serverfault.com", "stackapps.com",
    // "askubuntu.com"
    // Also, "meta.stackoverflow.com", "meta.superuser.com","meta.stackoverflow.com", etc.
    "stackexchange.com": [
           {
               // Pages with lists of questions
               // Examples: http://stackoverflow.com/questions, http://stackoverflow.com/questions/tagged/perl,
               // http://stackoverflow.com/
                urlPatterns: ["*.stackexchange.com/questions", "*.stackexchange.com/questions/tagged*",
                    "*.stackexchange.com\/"],
                urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions$/,
                    /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\/tagged\//,
                    /^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/$/],
                CUSpecifier: ".question-summary"
           },
           {
               // Pages with answers to a specific question
               // Example: http://stackoverflow.com/questions/5874652/prop-vs-attr
               urlPatterns: ["*.stackexchange.com/questions/*"],
               urlRegexps: [/^(meta\.)?(stackoverflow\.com|superuser\.com|serverfault\.com|stackapps\.com|askubuntu\.com)\/questions\//],
               CU_shortcuts: {
                   "upvote": {keys: ["u"],  selector: ".vote-up-off" },
                   "downvote": {keys: ["d"],  selector: ".vote-down-off" },
                   "share": {keys: ["s"],  selector: ".short-link" },
                   "edit": {keys: ["e"],  selector: ".suggest-edit-post" },
                   "add_comment": {keys: ["c"],  selector: ".comments-link" },
                   "star": {keys: ["r"],  selector: ".star-off" }
               },

               CUSpecifier: {
                   CU: ".question, .answer",
                   "overlay-padding": "0 5px 0 5px"
               }
           }
       ],
    "wikipedia.org": {
        urlPatterns: ["@.wikipedia.org/wiki/*"],
        CUSpecifier: {
            buildCUAround: "#mw-content-text>p:first-of-type, table.infobox, table.vcard, table.toc, table.wikitable, #bodyContent h2, #bodyContent h3, #bodyContent h4, .vertical-navbox, .horizontal-navbox, .navbox",
            exclude: ".dablink, .metadata, .ambox" //TODO: check these (.dablink was in steve job's). this is till unimplemented as of 6 Jan 2012
        }
    },
    "ycombinator.com": {
           urlPatterns: ["news.ycombinator.com*"],
           CU_shortcuts: {
               "comment": {
                   keys: ["c"],
                   fn: function($selectedCU, document) {
                       var $el = $selectedCU.find("a:contains('comment'), a:contains('discuss')");
                       var ctrlClickEvent = document.createEvent("MouseEvents");

                       // detecting OS detection based on:
                       // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
                       if (isMac) {
                           ctrlClickEvent.initMouseEvent("click", true, true, null,
                               0, 0, 0, 0, 0, false, false, false, true, 0, null); // cmd key set to true for mac
                       }
                       else {
                           ctrlClickEvent.initMouseEvent("click", true, true, null,
                               0, 0, 0, 0, 0, true, false, false, false, 0, null); // ctrl key set to true for non-macs
                       }

                       $el[0].dispatchEvent(ctrlClickEvent);
                   }
               }
           },
           CUSpecifier: {
               buildCUAround: "td.title>a",
               useInnerElementsToGetOverlaySize: true,
               "overlay-padding": "3px 6px 3px 0"
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
    }
];
