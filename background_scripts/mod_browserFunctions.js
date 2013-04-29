(function() {
    "use strict";

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            if (request.message === 'closeTab') {
                closeCurrentTab();
            }
            else  if (request.message === 'prevTab') {
                prevTab();
            }
            else  if (request.message === 'nextTab') {
                nextTab();
            }
        }
    );
    // close the currently active tab
    function closeCurrentTab() {
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