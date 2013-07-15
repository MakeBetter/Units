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
        globalSettingsTextArea = document.getElementById("global-settings"),
        saveSettingsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings"),
        goToExtensionLink = document.getElementById("go-to-extensions");

    var basicOptionsLink = document.getElementById("basic-options-nav"),
        advancedOptionsLink = document.getElementById("advanced-options-nav"),
        basicOptions = document.getElementById("basic-options"),
        advancedOptions = document.getElementById("advanced-options");


    // Advanced Options methods

    var populateAdvancedOptions = function() {
        mod_settings.getUserSettings(_populateAdvancedOptions);
    };

    var _populateAdvancedOptions = function(settings) {
        // settings are divided into general settings and site-specific settings.
        var generalSettings = settings,
            siteSpecificSettings,
            globalSettings;

        if (!generalSettings) {
            mod_UIHelper.showErrorMessage("Your settings are in a corrupt state. Try resetting to default options.");
        }

        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(generalSettings);

        siteSpecificSettings = generalSettings.urlDataMap;
        siteSpecificSettings = JSON.stringify(siteSpecificSettings, null, "\t");
        delete generalSettings.urlDataMap;

        globalSettings = generalSettings.globalChromeCommands;

        for (var i = 0; i < globalSettings.length; i++) {
            var setting = globalSettings[i];
            if (setting.shortcut === "") {
                globalSettings.splice(i,1);
            }
        }
        globalSettings = JSON.stringify(globalSettings, null, "\t");
        delete  generalSettings.globalChromeCommands;

        generalSettings = JSON.stringify(generalSettings, null, "\t");

        generalSettingsTextArea.value = generalSettings;
        siteSettingsTextArea.value = siteSpecificSettings;
        globalSettingsTextArea.value = globalSettings;
    };

    var _saveSettings = function(generalSettingsJSON, siteSpecificSettingsJSON) {
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

            mod_UIHelper.showSuccessMessage("All changes saved");
            populateAdvancedOptions();
        }
    };


    var saveSettings = function() {
        _saveSettings(generalSettingsTextArea.value, siteSettingsTextArea.value);
    };

    var resetSettings = function() {
        if (confirm("Sure you want to reset all the options?")) {
            mod_settings.setUserSettings(null);
            populateAdvancedOptions();

            mod_UIHelper.showSuccessMessage("Default options are reset");
        }
    };

    var goToExtensionsPage = function() {
        chrome.tabs.create({url: 'chrome://extensions/'});
    };


    // Basic Options methods

    var populateBasicOptions = function() {
        mod_settings.getUserSettings(_populateBasicOptions);
    };

    var _populateBasicOptions = function(settings) {

        // populate miscSettings
        var miscSettingsContainer = document.getElementById("misc-settings"),
            tbody, tr, settingValue, innerHtml, key;

        var basicMiscSettings = {
            selectCUOnLoad: "Select Content Unit on page on load",
            keepSelectedCUCentered: "Keep selected CU centered on page",
            enhanceActiveElementVisibility: "Enhance the active element style",
            pageScrollDelta: "Page scroll delta"
        };

        tbody = document.createElement("tbody");

        for (key in basicMiscSettings) {

            tr = document.createElement('tr');
            tr.setAttribute("id", key);
            innerHtml = '<td>' + basicMiscSettings[key] + '</td>';

            settingValue = settings.miscSettings[key];

            if (typeof settingValue === "boolean") {

                innerHtml += "<td><input type='checkbox'" + (settingValue ? "checked" : "") + "/></td>";
            }
            else {
                innerHtml += "<td><input type='text' value='" + settingValue + "'</td>";
            }

            tr.innerHTML = innerHtml;
            tbody.appendChild(tr);
        }

        miscSettingsContainer.appendChild(tbody);


        // populate general keyboard shortcuts
        var generalShortcuts = settings.generalShortcuts;

        var generalShortcutsContainer = document.getElementById("general-keyboard-shortcuts"),
            shortcut;

        tbody = document.createElement("tbody");

        for (key in generalShortcuts) {
            shortcut = generalShortcuts[key];
            tr = document.createElement('tr');
            tr.setAttribute("id", key);

            innerHtml = '<td>' + shortcut.descr + '</td>';

            var kbdShortcuts, kbdShortcut, kbdShortcutsHtml = "";

            kbdShortcuts = shortcut.kbdShortcuts;
            for (var i = 0; i < kbdShortcuts.length; i++) {
                kbdShortcut = kbdShortcuts[i];
                kbdShortcutsHtml += "<input type='text' value='" + kbdShortcut + "' />";
            }

            innerHtml += "<td>" + kbdShortcutsHtml + "</td>";

            tr.innerHTML = innerHtml;
            tbody.appendChild(tr);

        }
        generalShortcutsContainer.appendChild(tbody);

    };

    var showAdvancedOptions = function() {
        basicOptions.style.display = "none";
        advancedOptions.style.display = "block";

        advancedOptionsLink.classList.add("selected");
        basicOptionsLink.classList.remove("selected");
    };

    var showBasicOptions = function() {
        basicOptions.style.display = "block";
        advancedOptions.style.display = "none";

        advancedOptionsLink.classList.remove("selected");
        basicOptionsLink.classList.add("selected");
    };


    populateAdvancedOptions();
    populateBasicOptions();
    showBasicOptions();

    saveSettingsButton.addEventListener("click", saveSettings);
    resetSettingsButton.addEventListener("click", resetSettings);
    goToExtensionLink.addEventListener("click", goToExtensionsPage);

    basicOptionsLink.addEventListener("click", showBasicOptions);
    advancedOptionsLink.addEventListener("click", showAdvancedOptions);

})(_u.mod_commonHelper, _u.mod_settings, mod_UIHelper);
