var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

(function(helper, mod_settings) {
    "use strict";

    var settingsTextArea = document.getElementById("userSettingsJSON"),
        saveSettingsButton = document.getElementById("save-settings");


    var populateUserOptions = function() {
        var settings = mod_settings.getAllSettings();

        helper.stringifyJSONUnsupportedTypes_inSettings(settings);
        settings = JSON.stringify(settings, null, "\t");

        settingsTextArea.value = settings;
    };


    var eh_saveSettings = function() {
        saveSettings(settingsTextArea.value);
    };

    var saveSettings = function(settingsText) {
        var settingsObj = JSON.parse(settingsText);
        helper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);

        mod_settings.setUserSettings(settingsObj);

        console.log("settings saved!"); // till there is no user feedback, let's keep this.
    };

    populateUserOptions();
    saveSettingsButton.addEventListener("click", eh_saveSettings);


})(_u.helper, _u.mod_settings);
