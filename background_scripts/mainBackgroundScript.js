(function(mod_settings, mod_getRegistrableDomain) {

    var id_lastActiveTab;

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if (request.message === 'getSettings') {
                sendSettingsWhenReady(request, sender, sendResponse);
                return true; // return true to indicate that the response will be sent asynchronously. Otherwise the message
                // channel is closed.
            }
            else if (request.message === 'setIcon') {
                if (sender.tab.active) {
                    setIcon(request.isEnabled);
                }
            }
            else if (request.message === 'createTab') {
                chrome.tabs.create({url: request.url});
            }
        }
    );

    chrome.tabs.onActivated.addListener(sendActiveTabChangedMessage);
    chrome.windows.onFocusChanged.addListener(sendActiveTabChangedMessage);

    // NOTE: we don't seem to need this at the moment. 
//    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//        if (changeInfo.url) {
//           setCurrentTabIcon();
//        }
//    });

    function sendSettingsWhenReady(request, sender, sendResponse) {
        (function _sendSettingsWhenReady() {
            if (mod_getRegistrableDomain.publicSuffixMap) {
                var url = sender.tab.url;
                mod_settings.getUserSettings(sendResponse, {url: url});
            }
            else {
                setTimeout(_sendSettingsWhenReady, 100);
            }
        })();
    }

    /***
     * Set the browser action icon of the extension as enabled or disabled
     * @param {boolean} isEnabled Status of the extension on the active tab
     */
    function setIcon(isEnabled) {
        var iconPath = isEnabled ? "icon.png" : "icon-disabled.png";

        chrome.browserAction.setIcon({
           path: iconPath
        });
    }

    /***
     * This method is executed when the active tab or window is changed. Sends a message to content script of the
     * tab that was just activated, and deactivated.
     */
    function sendActiveTabChangedMessage() {
        chrome.tabs.query({active:true, currentWindow: true}, function(tabs){

                var id_currentActiveTab = tabs[0].id;

                if (id_currentActiveTab !== id_lastActiveTab) {
                    chrome.tabs.sendMessage(id_currentActiveTab, {message: 'tabActivated'}, setIcon);
                    id_lastActiveTab && chrome.tabs.sendMessage(id_lastActiveTab, {message: 'tabDeactivated'});

                    id_lastActiveTab = id_currentActiveTab;
                }
        });
    }

    // Redirect to a Getting Started page when the extension is installed.  
    function redirectOnInstall() {
        if (localStorage.installTime)
            return;

        var now = new Date().getTime();
        localStorage.installTime = now;
        chrome.tabs.create({url: "http://units.io/installed.html"});
    }

    redirectOnInstall();

})(_u.mod_settings, _u.mod_getRegistrableDomain);
