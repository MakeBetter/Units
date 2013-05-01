var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(helper, mod_settings) {
    "use strict";

    var settingsTextArea = document.getElementById("userSettingsJSON"),
        saveSettingsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings");

    var populateUserOptions = function() {
        var settings = mod_settings.getAllSettings();

        helper.stringifyJSONUnsupportedTypes_inSettings(settings);
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
            helper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            mod_settings.setUserSettings(settingsObj);
            console.log("settings saved."); // till there is no user feedback, let's keep this.
        }

        populateUserOptions();

    };


    var eh_saveSettings = function() {
        saveSettings(settingsTextArea.value);
    };

    var resetSettings = function() {
      if (confirm("Sure you want to reset the settings ?")) {
          delete localStorage.userSettings;
          populateUserOptions();

          console.log("settings reset."); // till there is no user feedback, let's keep this.
      }
    };

    populateUserOptions();
    saveSettingsButton.addEventListener("click", eh_saveSettings);
    resetSettingsButton.addEventListener("click", resetSettings);

})(_u.helper, _u.mod_settings);
