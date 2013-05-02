
/* Note: In the HTML page, we use the word 'options' instead of 'settings', which is used in code. 'Options' is more
consistent with Chrome extension terms. 'Settings' might be easier to understand in code. */

var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(helper, mod_settings) {
    "use strict";

    var generalSettingsTextArea = document.getElementById("general-settings"),
        siteSettingsTextArea = document.getElementById("site-specific-settings"),
        saveSettingsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings");

    var populateUserSettings = function() {
        // settings are divided into general settings and site-specific settings.
        var generalSettings = mod_settings.getAllSettings(),
            siteSpecificSettings;

        helper.stringifyJSONUnsupportedTypes_inSettings(generalSettings);

        siteSpecificSettings = generalSettings.urlDataMap;
        siteSpecificSettings = JSON.stringify(siteSpecificSettings, null, "\t");

        delete generalSettings.urlDataMap;
        generalSettings = JSON.stringify(generalSettings, null, "\t");

        generalSettingsTextArea.value = generalSettings;
        siteSettingsTextArea.value = siteSpecificSettings;
    };

    var saveSettings = function(generalSettingsJSON, siteSpecificSettingsJSON) {
        var generalSettingsObj = null,
            siteSpecificSettingsObj = null
        try {
            generalSettingsObj = JSON.parse(generalSettingsJSON);
            siteSpecificSettingsObj = JSON.parse(siteSpecificSettingsJSON);

        }
        catch(exception) {
            console.error("Error in saving the settings. Edited JSON is not valid", exception);
        }

        if (generalSettingsObj && siteSpecificSettingsObj) {
            var settingsObj = generalSettingsObj;
            settingsObj.urlDataMap = siteSpecificSettingsObj;

            helper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            mod_settings.setUserSettings(settingsObj);

            console.log("settings saved."); // till there is no user feedback, let's keep this.
        }

        populateUserSettings();

    };


    var eh_saveSettings = function() {
        saveSettings(generalSettingsTextArea.value, siteSettingsTextArea.value);
    };

    var resetSettings = function() {
      if (confirm("Sure you want to reset all the options?")) {
          mod_settings.setUserSettings(null);
          populateUserSettings();

          console.log("settings reset."); // till there is no user feedback, let's keep this.
      }
    };

    populateUserSettings();
    saveSettingsButton.addEventListener("click", eh_saveSettings);
    resetSettingsButton.addEventListener("click", resetSettings);

})(_u.helper, _u.mod_settings);
