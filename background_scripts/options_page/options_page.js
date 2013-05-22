// JSHint Config
/* global mod_UIHelper */

/* Note: In the HTML page, we use the word 'options' instead of 'settings', which is used in code. 'Options' is more
 consistent with Chrome extension terms. 'Settings' might be easier to understand in code. */

var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(mod_commonHelper, mod_settings, mod_UIHelper) {
    "use strict";

    var generalSettingsTextArea = document.getElementById("general-settings"),
        siteSettingsTextArea = document.getElementById("site-specific-settings"),
        saveSettingsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings");

    var populateUserSettings = function() {
        // settings are divided into general settings and site-specific settings.
        var generalSettings = mod_settings.getSettings(),
            siteSpecificSettings;

        if (!generalSettings) {
            mod_UIHelper.showErrorMessage("Your settings are in a corrupt state. Try resetting to default options.");
        }

        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(generalSettings);

        siteSpecificSettings = generalSettings.urlDataMap;
        siteSpecificSettings = JSON.stringify(siteSpecificSettings, null, "\t");

        delete generalSettings.urlDataMap;
        generalSettings = JSON.stringify(generalSettings, null, "\t");

        generalSettingsTextArea.value = generalSettings;
        siteSettingsTextArea.value = siteSpecificSettings;
    };

    var saveSettings = function(generalSettingsJSON, siteSpecificSettingsJSON) {
        var generalSettingsObj = null,
            siteSpecificSettingsObj = null;

        try {
            generalSettingsObj = JSON.parse(generalSettingsJSON);
            siteSpecificSettingsObj = JSON.parse(siteSpecificSettingsJSON);

        }
        catch(exception) {
            console.error("Error in saving the settings. Edited JSON is not valid", exception);

            var error = exception && exception.message,
                errorMessage = "<p>Invalid JSON Error: <span class='json-error-message'>" + error + "</span> </p>" +
                    "<span>Please make sure the edited JSON is valid before saving.</span>";

            mod_UIHelper.showErrorMessage(errorMessage);
        }

        if (generalSettingsObj && siteSpecificSettingsObj) {
            var settingsObj = generalSettingsObj;
            settingsObj.urlDataMap = siteSpecificSettingsObj;

            mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            mod_settings.setUserSettings(settingsObj);

            mod_UIHelper.showSuccessMessage("Options successfully edited!");
            populateUserSettings();
        }
    };


    var eh_saveSettings = function() {
        saveSettings(generalSettingsTextArea.value, siteSettingsTextArea.value);
    };

    var resetSettings = function() {
        if (confirm("Sure you want to reset all the options?")) {
            mod_settings.setUserSettings(null);
            populateUserSettings();

            mod_UIHelper.showSuccessMessage("Default options are reset!");
        }
    };

    populateUserSettings();
    saveSettingsButton.addEventListener("click", eh_saveSettings);
    resetSettingsButton.addEventListener("click", resetSettings);

})(_u.mod_commonHelper, _u.mod_settings, mod_UIHelper);
