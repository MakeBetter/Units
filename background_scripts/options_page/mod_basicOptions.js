// JSHint Config
/* global mod_optionsHelper, _u, Mousetrap*/
/* exported mod_basicOptions */

var mod_basicOptions = (function(mod_commonHelper, mod_settings, mod_optionsHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        render: render,
        setup: setup
    };

    var class_editingHelpMessage = "input-help-message",
        class_kbdShortcut = "kbdshortcut",

        settingType_miscSettings = "misc-settings",
        settingType_generalShortcuts = "general-shortcuts";


    function setup() {
        // Event handlers
        document.getElementById("misc-settings").addEventListener("change", saveOptions_miscSettings);
        document.getElementById("general-keyboard-shortcuts").addEventListener("focusout", saveOptions_generalShortcuts);

//        document.getElementById("basic-options").addEventListener("input", showMessage_editingHelp);
//        document.addEventListener("focusout", hideMessage_editingHelp);

        document.getElementById("general-keyboard-shortcuts").addEventListener("focusin", showMessage_startKbdShortcutInput);
        document.getElementById("general-keyboard-shortcuts").addEventListener("keydown", captureKeyboardShortcut);

    }

    function _render(settings) {

        var miscSettingsContainer = document.querySelector("#misc-settings>table"),
            generalShortcutsContainer = document.querySelector("#general-keyboard-shortcuts>table");

        // Reset contents
        miscSettingsContainer.innerHTML = '';
        generalShortcutsContainer.innerHTML = '';

        var tbody, tr, settingValue, innerHtml, key;

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
                kbdShortcutsHtml += "<input type='text' class= '"+ class_kbdShortcut + "' value='" + kbdShortcut + "' />";
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

    function saveOptions(event, settingType) {

        if (!settingType) {
            return;
        }

        var target = event.target,
            targetTagName = target.tagName.toLowerCase(),
            parentRow = target.parentElement && target.parentElement.parentElement;

        if (targetTagName !== "input" || !parentRow || parentRow.tagName.toLowerCase() !== "tr") {
            return;
        }

        var targetInputType = target.type && target.type.toLowerCase(),
            settings = mod_settings.getUserSettings(null, {getBasic: true}),
            settingKey, settingValue;

        if (targetInputType == "checkbox") {
            settingValue = target.checked;
        }
        else {
            settingValue = target.value;
        }

        settingKey = parentRow.id;

        if (settingType === settingType_miscSettings) {
            var miscSettings = settings.miscSettings;
            miscSettings[settingKey] = settingValue;
        }
        else if (settingType === settingType_generalShortcuts) {
            if (!settingValue) {
                render(); // so that the textbox value is reset
                return;
            }

            var generalShortcuts = settings.generalShortcuts;
            if (generalShortcuts[settingKey]) {
                generalShortcuts[settingKey].kbdShortcuts = getKeyboardShortcutsForRow(parentRow); 
            }
        }

        mod_optionsHelper.saveOptions(settings, "Option saved", render);
    }

    function getKeyboardShortcutsForRow(row) {
        var shortcutInputs = row.querySelectorAll("." + class_kbdShortcut),
            shortcuts = [];

        for (var i = 0; i < shortcutInputs.length; i++) {
            var shortcut = shortcutInputs[i];
            shortcuts.push(shortcut.value);
        }

        return shortcuts;
    }

    function saveOptions_miscSettings(event) {
        saveOptions(event, settingType_miscSettings);
    }

    function saveOptions_generalShortcuts(event) {
        saveOptions(event, settingType_generalShortcuts);
    }


    function showMessage_editingHelp(event) {
        var target = event.target,
            messageElement = document.createElement("span");

        messageElement.classList.add(class_editingHelpMessage);
        messageElement.textContent = "Press enter or click outside the textbox to save.";

        var parent = target.parentElement;

        if (!parent.querySelectorAll("." + class_editingHelpMessage).length) {
            parent.appendChild(messageElement);
        }
    }

    function hideMessage_editingHelp(event) {
        var target = event.target,
            messageElement = target.nextElementSibling;

        if (messageElement && messageElement.classList.contains(class_editingHelpMessage)) {
            messageElement.remove();
        }
    }

    function showMessage_startKbdShortcutInput(event) {
        var target = event.target;
        target.value = "";
        target.setAttribute("placeholder", "Type a shortcut");
    }

    function captureKeyboardShortcut(event) {
        var target = event.target,
            targetValue = target.value,
            modifiers = Mousetrap.eventModifiers(event),
            characterTyped = Mousetrap.characterFromEvent(event);

        // If the character typed is one of the modifiers, then disregard the input
        if (!characterTyped || modifiers.indexOf(characterTyped) > -1) {
            return;
        }

        // For sequence shortcuts. Append the current typed shortcut to existing value
        if (targetValue) {
            targetValue += " ";
        }


        for (var i = 0; i < modifiers.length; i++) {
            var modifier = modifiers[i];
            targetValue += modifier + "+";
        }

        targetValue += characterTyped;

        target.value = targetValue;

        event.preventDefault();

    }

    return thisModule;

})(_u.mod_commonHelper, _u.mod_settings, mod_optionsHelper);
