var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(mod_settings) {
    //Since popup.js is included at the end of the body in popup.html, all the DOM elements are already present when the
    // script is executed.
    var activeTabURL;

    var enableExtensionUI = document.getElementById("extension-enabled"),
        disableExtensionUI = document.getElementById("extension-disabled");

    var disableUrlPatternButton = document.getElementById('disable-url-permanently'),
        disabledUrlPatternInput = document.getElementById("url-pattern-to-disable");



    function getHost(url)
    {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

    function onPopupLoaded() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            activeTabURL = tabs[0] && tabs[0].url;
            renderPopupUI(activeTabURL);
        });
    }

    function renderPopupUI(activeTabURL) {
        var settings = mod_settings.getAllSettings(),
            disabledStatus = mod_settings.getDisabledStatus(activeTabURL, settings.disabledSites);

        if (!disabledStatus) {
            enableExtensionUI.style.display = "block";
            disableExtensionUI.style.display = "none";

            // populate textbox with the URL pattern for disabling the current domain
            var hostname = getHost(activeTabURL);
            disabledUrlPatternInput.value = hostname + "*";
        }
        else {
            enableExtensionUI.style.display = "none";
            disableExtensionUI.style.display = "block";
        }

    }

    function disableUrlPattern() {
        var urlPattern = disabledUrlPatternInput.value,
            success = mod_settings.addUrlPatternToUserDisabledSites(urlPattern);

        renderPopupUI(activeTabURL);

        if (success) {
            console.log("URL saved");
        }
        else {
            console.log("there was an error in saving");
        }
    }

    document.addEventListener('DOMContentLoaded', onPopupLoaded);
    disableUrlPatternButton.addEventListener('click', disableUrlPattern);

})(_u.mod_settings);

