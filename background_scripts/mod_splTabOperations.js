/*
 mod_splTabOperations.js:
 In conjunction with the `commands` defined in `manifest.json`, this module allows handling of shortcuts for
 a minimal set of special tab-related operations - close tab, select next tab, select prev tab.
 These are defined as "global" shortcuts handled by the background script. This has the following effects/advantages:
 1) It allows these shortcuts to work when the tab has no content (e.g. 'new tab' tab, a tab in which the page could not
 be found, 'chrome://settings' tab)
 2) It lets this set of shortcuts work on a tab even if the (content script part of the) extension is disabled for the
 tab's URL (The nature of these shortcuts, and their extremely small number, makes this a desirable effect in our view.)
 */
(function() {
    "use strict";

    chrome.commands.onCommand.addListener(function(command) {
        if (command === 'closeTab') {
            closeTab();
        }
        else if (command === 'prevTab') {
            prevTab();
        }
        else if (command === 'nextTab') {
            nextTab();
        }
    });

    // close the currently active tab
    function closeTab() {
        chrome.tabs.query(
            {currentWindow: true, active : true},
            function(tabArray){
                if (tabArray && tabArray[0]) {
                    chrome.tabs.remove(tabArray[0].id);
                }
            }
        );
    }

    // select prev tab
    function prevTab() {
        selectTab("prev");
    }
    // select next tab
    function nextTab() {
        selectTab("next");
    }

    /**
     * Select next/prev tab
     * @param {string} which Can be "next" or "prev"
     */
    function selectTab(which) {
        // first, get currently active tab
        chrome.tabs.query({currentWindow:true, active: true}, function(tabs) {
            if (tabs.length) {
                var activeTab = tabs[0],
//                    tabId = activeTab.id,
                    currentIndex = activeTab.index;
                // next, get number of tabs in the window, in order to allow cyclic next
                chrome.tabs.query({currentWindow: true}, function (tabs) {

                    // finally, determine index of tab to activate and activate tab based on it
                    var numTabs = tabs.length,
                        index = currentIndex + ((which === "next")? 1: -1);

                    //cycle from the other side if we have reached an edge tab
                    if (index === -1) {
                        index = numTabs - 1;
                    }
                    else if (index === numTabs) {
                        index = 0;
                    }

                    chrome.tabs.query({currentWindow:true, index: index}, function(tabs) {
                        if (tabs.length) {
                            var tabToActivate = tabs[0],
                                tabToActivate_Id = tabToActivate.id;
                            chrome.tabs.update(tabToActivate_Id, {active: true});
                        }
                    });
                });
            }
        });
    }
})();
