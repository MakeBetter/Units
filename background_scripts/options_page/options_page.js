
/* Note: In the HTML page, we use the word 'options' instead of 'settings', which is used in code. 'Options' is more
consistent with Chrome extension terms. 'Settings' might be easier to understand in code. */

var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(mod_commonHelper, mod_settings) {
    "use strict";

    var settingsTextArea = document.getElementById("userSettingsJSON"),
        saveSettingsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings");

    var populateUserSettings = function() {
        var settings = mod_settings.getAllSettings();

        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(settings);
        settings = JSON.stringify(settings, null, "\t");

        settingsTextArea.value = settings;
    };

    var saveSettings = function(settingsText) {
        var settingsObj = null;
        try {
            settingsObj = JSON.parse(settingsText);
        }
        catch(exception) {
            console.error("Error in saving the settings. Edited JSON is not valid", exception);
        }

        if (settingsObj) {
            mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            mod_settings.setUserSettings(settingsObj);
            console.log("settings saved."); // till there is no user feedback, let's keep this.
        }

        populateUserSettings();

    };


    var eh_saveSettings = function() {
        saveSettings(settingsTextArea.value);
    };

    var resetSettings = function() {
      if (confirm("Sure you want to reset the settings ?")) {
          delete localStorage.userSettings;
          populateUserSettings();

          console.log("settings reset."); // till there is no user feedback, let's keep this.
      }
    };

    populateUserSettings();
    saveSettingsButton.addEventListener("click", eh_saveSettings);
    resetSettingsButton.addEventListener("click", resetSettings);

})(_u.mod_commonHelper, _u.mod_settings);
