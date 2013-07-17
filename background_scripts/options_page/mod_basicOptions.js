// JSHint Config
/* global mod_optionsHelper, _u */
/* exported mod_basicOptions */

// A template for modules in this project
var mod_basicOptions = (function(mod_commonHelper, mod_settings, mod_optionsHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        render: render,
        setup: setup
    };

    var basicOptions = document.getElementById("basic-options"),
        editingHelpMessage_className = "input-help-message";


    function setup() {
        // Basic Options handlers
        basicOptions.querySelector("#misc-settings").addEventListener("change", saveOptions_misc);
        basicOptions.querySelector("#misc-settings").addEventListener("input", showMessage_editingHelp);

        document.addEventListener("focusout", hideMessage_editingHelp);
    }

    function _render(settings) {

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
        }

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

    }

    function render() {
        mod_settings.getUserSettings(_render);
    }

    function saveOptions_misc(event) {
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
    }

    function saveOptions_generalShortcuts(event) {
        var target = event.target;
    }

    function showMessage_editingHelp(event) {
        var target = event.target,
            messageElement = document.createElement("span");

        messageElement.classList.add(editingHelpMessage_className);
        messageElement.textContent = "Press enter or click outside the textbox to save.";

        var parent = target.parentElement;

        if (!parent.querySelectorAll("." + editingHelpMessage_className).length) {
            parent.appendChild(messageElement);
        }
    }

    function hideMessage_editingHelp(event) {
        var target = event.target,
            messageElement = target.nextElementSibling;

        if (messageElement.classList.contains(editingHelpMessage_className)) {
            messageElement.remove();
        }
    }

    function saveOptions(settings, successMessage) {
        mod_optionsHelper.saveOptions(settings, successMessage, render);
    }

    return thisModule;

})(_u.mod_commonHelper, _u.mod_settings, mod_optionsHelper);
