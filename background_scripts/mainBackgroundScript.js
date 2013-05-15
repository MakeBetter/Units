/* global _u */

//Remove the following commented out code later
//setInterval(function() {
//    chrome.tabs.query({}, function(tabs) {
//        localStorage.x++;
//        var message = {message: "settingsChanged", x: localStorage.x};
//
//      for (var i=0; i<tabs.length; ++i) {
//            chrome.tabs.sendMessage(tabs[i].id, message);
//        }
//    });
//}, 3000);

(function(mod_settings, mod_getMainDomain) {
    "use strict";

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if (request.message === 'getSettings') {
                getSettings(request, sender, sendResponse);
            }
            else if (request.message === 'setIcon') {
                setIcon(request.isEnabled);
            }
        }
    );

    // Whenever the active tab  or active window is changed, set the extension icon as enabled or disabled, as valid for the currently
    // active tab.
    chrome.tabs.onActivated.addListener(setCurrentTabIcon);
    chrome.windows.onFocusChanged.addListener(setCurrentTabIcon);


    function getSettings(request, sender, sendResponse) {
        var sendResponseWhenReady = function() {
            if (mod_getMainDomain.publicSuffixMap) {
                var settings = mod_settings.getSettings(request.locationObj);
                sendResponse(settings);
            }
            else {
                setTimeout(sendResponseWhenReady, 100);
            }
        };
        sendResponseWhenReady();
    }

    /***
     * Gets the status of the currently active tab, and sets the extension icon appropriately
     */
    function setCurrentTabIcon() {
        // Get the status of the current tab.
        chrome.tabs.query({active: true, currentWindow:true}, function(tabs){
            var tabId = tabs[0] && tabs[0].id;
            chrome.tabs.sendMessage(tabId, {message: 'isEnabled'}, function(response) {
                var isEnabled = response && response.isEnabled;
                setIcon(isEnabled);
            });
        });

        setIcon(false);

        // Set icon status to disabled. If no response received from the content script (for example, on a
        // new tab or chrome extensions page, then the icon will continue to look disabled.
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

})(_u.mod_settings, _u.mod_getMainDomain);
