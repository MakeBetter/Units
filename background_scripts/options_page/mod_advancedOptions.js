// JSHint Config
/* global mod_optionsHelper, _u, backgroundPageWindow */
/* exported mod_advancedOptions */


// A template for modules in this project
var mod_advancedOptions = (function(mod_commonHelper, mod_settings, mod_optionsHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        render: render,
        setup: setup
    };

    var generalSettingsContainer = document.getElementById("general-settings"),
        siteSettingsContainer = document.getElementById("site-specific-settings"),
        globalSettingsTextContainer = document.getElementById("global-settings"),
        saveChangesButton = document.getElementById("save-settings"),
        resetOptionsButton = document.getElementById("advanced-options").querySelector(".reset-settings"),
        goToExtensionLink = document.getElementById("go-to-extensions");

    var defaultSettingsHelp = backgroundPageWindow.defaultSettingsHelp,
        advancedOptions_helpContainer;

    function setup() {
        advancedOptions_helpContainer = document.getElementById("advanced-options-help");

        // Event handlers
        saveChangesButton.addEventListener("click", saveChanges);
        resetOptionsButton.addEventListener("click", resetOptions);
        goToExtensionLink.addEventListener("click", goToAllExtensionsPage);

        document.addEventListener("mouseup", showMessage_JSONKeyHelp);
    }

    function _render(settings) {
        // settings are divided into general settings and site-specific settings.
        var generalSettings = settings,
            siteSpecificSettings,
            globalSettings;

        if (!generalSettings) {
            mod_optionsHelper.showErrorMessage("Your settings are in a corrupt state. Try resetting to default options.");
        }

        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(generalSettings);

        siteSpecificSettings = generalSettings.urlDataMap;
        siteSpecificSettings = JSON.stringify(siteSpecificSettings, null, 2);
        delete generalSettings.urlDataMap;

        globalSettings = generalSettings.globalChromeCommands;

        for (var i = 0; i < globalSettings.length; i++) {
            var setting = globalSettings[i];
            if (setting.shortcut === "") {
                globalSettings.splice(i,1);
            }
        }
        globalSettings = JSON.stringify(globalSettings, null, 2);
        delete  generalSettings.globalChromeCommands;

        generalSettings = JSON.stringify(generalSettings, null, 2);

        generalSettingsContainer.innerHTML = "<pre>"+ generalSettings + "</pre>";
        siteSettingsContainer.innerHTML = "<pre>" + siteSpecificSettings + "</pre>";
        globalSettingsTextContainer.innerHTML = "<pre>" + globalSettings + "</pre>";
    }

    function render(onComplete) {
        mod_settings.getUserSettings(function(settings) {
            _render(settings);
            onComplete && onComplete();
        });
    }

    function saveOptions(settings, successMessage) {
        mod_optionsHelper.saveOptions(settings, successMessage, render);
    }

    function _saveChanges(generalSettingsJSON, siteSpecificSettingsJSON) {
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

            mod_optionsHelper.showErrorMessage(errorMessage);
        }

        if (generalSettingsObj && siteSpecificSettingsObj) {
            var settingsObj = generalSettingsObj;
            settingsObj.urlDataMap = siteSpecificSettingsObj;

            mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            saveOptions(settingsObj, "Changes to advanced options saved");

            render();
        }
    }

    function saveChanges() {
        _saveChanges(generalSettingsContainer.querySelector("pre").textContent, siteSettingsContainer.querySelector("pre").textContent);
    }

    function resetOptions() {
        if (confirm("Sure you want to reset all the options?")) {
            saveOptions(null, "All options are reset");
        }
    }

    function goToAllExtensionsPage() {
        chrome.tabs.create({url: 'chrome://extensions/'});
    }

    function showMessage_JSONKeyHelp(event) {
        var target = event.target,
            selectedHtml,
            containingDiv = target.parentElement;

        selectedHtml = window.getSelection().toString(); // get the text selected by user

        var helpText = defaultSettingsHelp[selectedHtml];
        if (helpText) {
            advancedOptions_helpContainer.style.display = "block";

            advancedOptions_helpContainer.innerHTML = "<span class='key'>"+ selectedHtml +"</span>" + ": " + helpText;
            containingDiv.appendChild(advancedOptions_helpContainer);
            advancedOptions_helpContainer.style.top = (event.offsetY ) + "px";
            advancedOptions_helpContainer.style.left = (event.offsetX + 100) + "px";
        }
        else {
            advancedOptions_helpContainer.innerHTML = "";
            advancedOptions_helpContainer.style.display = "none";
        }
    }

    return thisModule;

})(_u.mod_commonHelper, _u.mod_settings, mod_optionsHelper);
