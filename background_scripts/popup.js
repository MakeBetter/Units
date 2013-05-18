var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(mod_settings) {
    // Since popup.js opens up
    var activeTabURL,
        activeTabId;

    //Since popup.js is included at the end of the body in popup.html, all the DOM elements are already present when the
    // script is executed.
    var enableExtensionUI = document.getElementById("extension-enabled"),
        disableExtensionUI = document.getElementById("extension-disabled");

    var disableUrlPatternButton = document.getElementById('disable-url-permanently'),
        disabledUrlPatternInput = document.getElementById("url-pattern-to-disable");

    var toggleExtensionButton = document.getElementById('disable-temporarily');

    document.addEventListener('DOMContentLoaded', onPopupLoaded);
    disableUrlPatternButton.addEventListener('click', disableUrlPattern);
    toggleExtensionButton.addEventListener('click', toggleExtensionTemporarily);
    
    /******
     * Event Handlers
     ******/

    function onPopupLoaded() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            activeTabURL = tabs[0] && tabs[0].url;
            activeTabId = tabs[0] && tabs[0].id;
            renderPopupUI(activeTabURL);
        });
    }

    function disableUrlPattern() {
        var urlPattern = disabledUrlPatternInput.value,
            success = mod_settings.addUrlPatternToUserDisabledSites(urlPattern);

        renderPopupUI(activeTabURL);

        if (success) {
            console.log("URL saved");
        }
        else {
            console.log("There was an error in saving");
        }
    }

    function toggleExtensionTemporarily() {
        chrome.tabs.sendMessage(activeTabId, {message: 'toggleContentScriptTemporarily'}, function(response) {
            renderPopupUI(activeTabURL); // While we do get isDisabled_temporarily status from the content script and
            // can use that to update the toggle button text, we're keeping it simple and calling renderPopupUI to handle
            // any updates to the popup UI.
        });
    }

    // Helpers

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

        var updateToggleExtensionUI = function(status) {
            if (status) {
                toggleExtensionButton.value = "Enable again";
            }
            else {
                toggleExtensionButton.value = "Disable for now";
            }
        };

        getTemporarilyDisabledStatus(updateToggleExtensionUI);

    }

    function getTemporarilyDisabledStatus(updateToggleExtensionUI) {
        chrome.tabs.sendMessage(activeTabId, {message: 'isContentScriptTemporarilyDisabled'}, function(response) {
            updateToggleExtensionUI(response);
        });
    }

    function getHost(url) {
        var a = document.createElement('a');
        a.href = url;
        return a.hostname;
    }

})(_u.mod_settings);

