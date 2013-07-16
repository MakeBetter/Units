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
        saveAdvancedOptionsButton = document.getElementById("save-settings"),
        resetSettingsButton = document.getElementById("reset-settings"),
        goToExtensionLink = document.getElementById("go-to-extensions");

    var basicOptionsLink = document.getElementById("basic-options-nav"),
        advancedOptionsLink = document.getElementById("advanced-options-nav"),
        basicOptions = document.getElementById("basic-options"),
        advancedOptions = document.getElementById("advanced-options");

    // Common methods

    var saveOptions = function(settings, successMessage) {
        mod_settings.setUserSettings(settings);
        populateAdvancedOptions();
        populateBasicOptions();

        mod_UIHelper.showSuccessMessage(successMessage);
    };

    var showAdvancedOptions = function() {
        // Reset/Populate advanced options
        populateAdvancedOptions();

        basicOptions.style.display = "none";
        advancedOptions.style.display = "block";

        // Update navigation link
        advancedOptionsLink.classList.add("selected");
        basicOptionsLink.classList.remove("selected");
    };

    var showBasicOptions = function() {
        // Populate/Reset basic options
        populateBasicOptions();

        basicOptions.style.display = "block";
        advancedOptions.style.display = "none";

        // Update navigation link
        advancedOptionsLink.classList.remove("selected");
        basicOptionsLink.classList.add("selected");
    };


    // Advanced Options methods

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

    var populateAdvancedOptions = function() {
        mod_settings.getUserSettings(_populateAdvancedOptions);
    };

    var _saveAdvancedOptions = function(generalSettingsJSON, siteSpecificSettingsJSON) {
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
            saveOptions(settingsObj, "Changes to advanced options saved")

            populateAdvancedOptions();
        }
    };

    var saveAdvancedOptions = function() {
        _saveAdvancedOptions(generalSettingsTextArea.value, siteSettingsTextArea.value);
    };

    var resetSettings = function() {
        if (confirm("Sure you want to reset all the options?")) {
            saveOptions(null, "Options reset to default");
        }
    };

    var goToAllExtensionsPage = function() {
        chrome.tabs.create({url: 'chrome://extensions/'});
    };

    var showAdvancedOptionsHelp = function(event) {

    };

    // Basic Options methods

    var _populateBasicOptions = function(settings) {

        var miscSettingsContainer = document.querySelector("#misc-settings>table"),
            generalShortcutsContainer = document.querySelector("#general-keyboard-shortcuts>table");

        // Reset contents
        miscSettingsContainer.innerHTML = '';
        generalShortcutsContainer.innerHTML = '';

        var tbody, tr, settingValue, innerHtml, key;

        // Populate miscSettings
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


        // Populate general keyboard shortcuts
        var generalShortcuts = settings.generalShortcuts,
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

    var populateBasicOptions = function() {
        mod_settings.getUserSettings(_populateBasicOptions);
    };

    var saveBasicOptions_misc = function(event) {
        var target = event.target,
            tagName = target.tagName.toLowerCase(),
            type = target.type && target.type.toLowerCase(),
            parentRow = target.parentElement && target.parentElement.parentElement,
            settings = mod_settings.getUserSettings(null, {getBasic: true}),
            miscSettings = settings.miscSettings,
            settingKey;

        if (parentRow.tagName.toLowerCase() === "tr") {
            settingKey = parentRow.id;
        }

        if (tagName === "input") {
            if (type == "checkbox") {
                miscSettings[settingKey] = target.checked;
            }
            else {
                miscSettings[settingKey] = target.value;
            }

            saveOptions(settings, "Option saved");
        }
    };

    var saveBasicOptions_generalShortcuts = function(event) {
        var target = event.target;

        if (target.tagName.toLowerCase() === "textarea") {
            var selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
            console.log(selectedText);
        }


    };

    var editingHelpMessage_className = "input-help-message";

    var showEditingHelpMessage = function(event) {
        var target = event.target,
            messageElement = document.createElement("span");

        messageElement.classList.add(editingHelpMessage_className);
        messageElement.textContent = "Press enter or click outside the textbox to save.";

        var parent = target.parentElement;

        if (!parent.querySelectorAll("." + editingHelpMessage_className).length) {
            parent.appendChild(messageElement);
        }
    };

    var hideEditingHelpMessage = function(event) {
        var target = event.target,
            messageElement = target.nextElementSibling;

        if (messageElement.classList.contains(editingHelpMessage_className)) {
            messageElement.remove();
        }
    };

    showBasicOptions();

    // Header navigation
    basicOptionsLink.addEventListener("click", showBasicOptions);
    advancedOptionsLink.addEventListener("click", showAdvancedOptions);

    // Advanced Options handlers
    saveAdvancedOptionsButton.addEventListener("click", saveAdvancedOptions);
    resetSettingsButton.addEventListener("click", resetSettings);
    goToExtensionLink.addEventListener("click", goToAllExtensionsPage);

    advancedOptions.addEventListener("select", showAdvancedOptionsHelp);

    // Basic Options handlers
    basicOptions.querySelector("#misc-settings").addEventListener("change", saveBasicOptions_misc);
    basicOptions.querySelector("#misc-settings").addEventListener("input", showEditingHelpMessage);

    document.addEventListener("focusout", hideEditingHelpMessage);


})(_u.mod_commonHelper, _u.mod_settings, mod_UIHelper);
