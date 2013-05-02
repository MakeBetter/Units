/*
 mod_specialBrowserFunctions:
 Defines functions corresponding to actions which will be bound to a group of so called *special shortcuts*. These
 minimal shortcuts remain active even when the extension is to be partially disabled on a URL. Most of these `special
 shortcuts` are defined/modified using manifest.json or chrome.commands api. The keys bound to these shortcuts can be
 changed by the user using the *Configure Commands* interface provided by Chrome on the extensions page.
 Note: apart from these shortcuts, the extension for *toggle extension state* is considered part of the set of special
 shortcuts. It is defined
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
                    tabId = activeTab.id,
                    currentIndex = activeTab.index;
                // next, get number of tabs in the window, in order to allow cyclic next
                chrome.tabs.query({currentWindow: true}, function (tabs) {
                    var numTabs = tabs.length;
                    // finally, determine index of tab to activate and activate tab based on it
                    chrome.tabs.query({currentWindow:true, index: (currentIndex + ((which === "next")? 1: -1)) % numTabs}, function(tabs) {
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