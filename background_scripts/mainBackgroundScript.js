(function(mod_settings, mod_getMainDomain) {

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
            if (mod_getMainDomain.publicSuffixMap) {
                var url = sender.tab.url;
                mod_settings.getSettings(url, sendResponse);
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
     * This method is executed when the active tab or window is changed. Sends a message to content scripts in all tabs.
     */
    function sendActiveTabChangedMessage() {
        // get all tabs
        chrome.tabs.query({}, function(tabs){
            for (var i = 0; i < tabs.length; i++) {
                var tab = tabs[i];

                if (tab.active) {
                    chrome.tabs.sendMessage(tab.id, {message: 'tabActivated'}, setIcon); // callback that sets the extension
                    // icon based on whether content script is enabled or disabled.
                }
                else {
                    chrome.tabs.sendMessage(tab.id, {message: 'tabDeactivated'});
                }
            }
        });
    }

})(_u.mod_settings, _u.mod_getMainDomain);
