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
        goToExtensionLink = document.getElementById("go-to-extensions"),
        saveShortcutHelpSpan = document.querySelector("#general-settings-section .context-message"),
        navigationMenu = document.getElementById("advanced-options-sections-navigation");

    var defaultSettingsHelp = backgroundPageWindow.defaultSettingsHelp,
        advancedOptions_helpContainer;

    var element_advancedOptionsContainer = document.getElementById("advanced-options");

    var class_menuSelected = "menu-selected",
        headerHeight;


    function setup() {
        advancedOptions_helpContainer = document.getElementById("advanced-options-help");

        // Event handlers
        saveChangesButton.addEventListener("click", saveChanges);
        resetOptionsButton.addEventListener("click", resetOptions);
        goToExtensionLink.addEventListener("click", goToAllExtensionsPage);

        navigationMenu.addEventListener("click", function(event) {
            navigateToSection(event.target);
        });

        document.addEventListener("keydown", saveChanges_onKeyDown, true); //Bind to "document" because we want to be
        // able to save changes by pressing ctrl+s anywhere on the page.

        document.addEventListener("mouseup", showMessage_JSONKeyHelp);

        document.addEventListener("scroll", onDocumentScroll_highlightMenu);

        setupUI_saveShortcutMessage();

        headerHeight = document.getElementById("settings-header").offsetHeight + document.querySelector(".sub-header").offsetHeight;
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

        positionNavMenu();

        navigateToSection(navigationMenu.querySelector("li:first-child"));
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
        // If the basic options tab is open (and advanced options is hidden), then do nothing and return.
        if (!element_advancedOptionsContainer.offsetHeight) {
            return;
        }

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

    function saveChanges_onKeyDown(event) {

        // If the basic options tab is open (and advanced options is hidden), then do nothing and return.
        if (!element_advancedOptionsContainer.offsetHeight) {
            return;
        }

        // If ctrl/ cmd + s is pressed, then save the advanced settings.
        var keyPressed = String.fromCharCode(event.which),
            isCtrlOrCmdKeyPressed = event.ctrlKey || event.metaKey;

        if ((keyPressed === "S" || keyPressed === "s") && isCtrlOrCmdKeyPressed) {
            saveChanges();

            event.preventDefault(); // prevent browser's default action of saving page as a file.
        }
    }

    /***
     * Setup text and events related to the message UI "Cmd+s to save"
     */
    function setupUI_saveShortcutMessage() {
        var modifier;
        if (navigator.appVersion.indexOf("Mac")!=-1) {
            modifier = "command";
        }
        else {
            modifier = "ctrl";
        }

        saveShortcutHelpSpan.textContent = modifier + "+s to save changes";

        //show message when editable container focused.
        generalSettingsContainer.addEventListener("focus", function() {
            saveShortcutHelpSpan.style.display = "inline";
        });

        // hide message on focus out
        generalSettingsContainer.addEventListener("blur", function() {
            saveShortcutHelpSpan.style.display = "none";
        });
    }

    function positionNavMenu() {
        var mainContainer = document.getElementById("advanced-options-main-container"),
            navElement = document.getElementById("advanced-options-sections-navigation"),
            mainContentLeftPos = mod_commonHelper.getOffsetPosition(mainContainer).left,
            posLeft = mainContentLeftPos - 130;

        navElement.style.left = posLeft;
    }

    function navigateToSection(menuItem) {
        var sectionId = menuItem.dataset.target,
            section = document.getElementById(sectionId),
            pos = section && mod_commonHelper.getOffsetPosition(section);

        // Scroll to section
        window.scroll(pos.left, pos.top - headerHeight);

        // Highlight menu item
        highlightMenuItem(menuItem);
    }

    function highlightMenuItem(item) {
        if (!item) {
            return;
        }

        var selectedMenu = navigationMenu.querySelector("." + class_menuSelected);
        selectedMenu && selectedMenu.classList.remove(class_menuSelected);

        item.classList.add(class_menuSelected);
    }

    /**
     * On document scroll, check and highlight the menu option that matches the section in view.
     * @param event
     */
    function onDocumentScroll_highlightMenu(event) {
        var sections = element_advancedOptionsContainer.querySelectorAll("section"),
            body = document.body,
            currentlySelectedMenuOption = navigationMenu.querySelector("." + class_menuSelected),
            correspondingMenuOption;

            for (var i = 0; i < sections.length; i++) {
            var section = sections[i],
                sectionPositionTop = mod_commonHelper.getOffsetPosition(section).top - body.scrollTop; // get position
            // relative to the viewport

            if (sectionPositionTop > headerHeight && sectionPositionTop < 300) {
                correspondingMenuOption = document.getElementById(section.dataset.menuid); // Every section has its
                // corresponding menu option's id in its data

                if (correspondingMenuOption !== currentlySelectedMenuOption) {
                    highlightMenuItem(correspondingMenuOption);
                }
            }
        }

        // Special case for the last section.
        // If the scrollbar is close to the bottom of the page, and the last section's menu option is not highlighted
        // yet, then do that.
        if (body.scrollHeight - 300 <= body.clientHeight + body.scrollTop) {
            correspondingMenuOption = navigationMenu.querySelector("li:last-child");
            if (correspondingMenuOption !== currentlySelectedMenuOption) {
                highlightMenuItem(correspondingMenuOption);
            }
        }
    }

    return thisModule;

})(_u.mod_commonHelper, _u.mod_settings, mod_optionsHelper);
