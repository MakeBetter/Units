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

(function(helper, mod_settings, mod_getMainDomain) {
    "use strict";

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if (request.message === 'getSettings') {
                getSettings(request, sender, sendResponse);
            }
            else if (request.message === 'closeTab') {
                closeCurrentTab();
            }

        }
    );

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

})(_u.helper, _u.mod_settings, _u.mod_getMainDomain);
