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

    // Map of miscSettings keys and their friendly descriptions, to be used in the Basic Options UI
    var miscSettingsDescriptions = {
        selectCUOnLoad: "Select first Content Unit (CU) when page loads",
        keepSelectedCUCentered: "Keep selected CU always centered on page",
        enhanceActiveElementVisibility: "Give special highlight to the currently selected link", /*enhanceActiveElementVisibility: "Give special highlight to the currently focused link <sup>*</sup>",*/
        pageScrollDelta: "Scrolling speed (pixels per key press)",
        animatedCUScroll: "Animate scrolling",
        sameCUScroll: "Enable scrolling within a large CU (when required)"

    };


    var class_editingHelpMessage = "input-help-message",
        class_kbdShortcut = "kbdshortcut",
        class_addShortcut = "add-shortcut",
        class_deleteShortcut = "delete-shortcut",
        class_reset = "reset-value";

    var element_miscSettingsTable = document.getElementById("misc-settings").querySelector("table"),
        element_miscShortcutsTable = document.getElementById("misc"),
        element_CUShortcutsTable = document.getElementById("CU"),
        element_pageNavigationShortcutsTable = document.getElementById("navigate-page"),
        element_elementNavigationShortcutsTable = document.getElementById("navigate-elements");

    function setup() {
        // Attach events to the lowest common parent (of the event targets) that is present in the DOM at the time of
        // setup. The actual targets are added to the DOM dynamically.

        var element_basicOptionsContainer = document.getElementById("basic-options"),
            element_resetButton = element_basicOptionsContainer.querySelector(".reset-settings"),
            element_shortcutsContainer = document.getElementById("general-keyboard-shortcuts");

        // Save setting on input change or focusout
        element_miscSettingsTable.addEventListener("change", saveOptions_miscSettings);
        element_shortcutsContainer.addEventListener("focusout", saveOptions_shortcuts);

        // Reset/ Add/ Delete setting
        element_shortcutsContainer.addEventListener("click", onShortcutsTableClick);
        element_miscSettingsTable.addEventListener("click", onMiscSettingsTableClick);

        // Show/hide editing help message
        element_miscSettingsTable.addEventListener("input", showMessage_editingHelp);
        element_basicOptionsContainer.addEventListener("focusout", hideMessage_editingHelp);

        // Capture keyboard shortcuts
        element_shortcutsContainer.addEventListener("focusin", showMessage_startKbdShortcutInput);
        element_shortcutsContainer.addEventListener("keydown", captureKeyboardShortcut);

        // Reset all settings
        element_resetButton.addEventListener("click", resetAllOptions);

    }

    function getShortcutInputUI(kbdShortcut) {
        var kbdShortcutsHtml = "";
        kbdShortcutsHtml+= "<div class= '"+ class_kbdShortcut + "'>";
        kbdShortcutsHtml += "<input type='text' value='" + kbdShortcut + "'/>";
        kbdShortcutsHtml += "<span class='delete-button hidden " + class_deleteShortcut + "'>&times;</span></div>";

        var dummyElement = document.createElement("div");
        dummyElement.innerHTML = kbdShortcutsHtml;
        return dummyElement.firstElementChild;
    }

    function _render(settings) {

        // Reset contents
        element_miscSettingsTable.innerHTML = '';
        element_miscShortcutsTable.innerHTML = '';
        element_CUShortcutsTable.innerHTML = '';
        element_pageNavigationShortcutsTable.innerHTML = '';
        element_elementNavigationShortcutsTable.innerHTML = '';

        var tbody, tr, settingValue, innerHtml, key;

        tbody = document.createElement("tbody");

        for (key in miscSettingsDescriptions) {

            tr = document.createElement('tr');
            tr.setAttribute("id", key);
            innerHtml = '<td>' + miscSettingsDescriptions[key] + '</td>';

            settingValue = settings.miscSettings[key];

            if (typeof settingValue === "boolean") {

                innerHtml += "<td><input type='checkbox'" + (settingValue ? "checked" : "") + "/>";
            }
            else {
                innerHtml += "<td><input type='text' value='" + settingValue + "'/>";
            }
            innerHtml += "<button class='hidden " + class_reset+ "'> Reset</button> </td>";


            tr.innerHTML = innerHtml;
            tbody.appendChild(tr);
        }

        element_miscSettingsTable.appendChild(tbody);

        populateShortcutsTable(settings.CUsShortcuts, element_CUShortcutsTable);
        populateShortcutsTable(settings.miscShortcuts, element_miscShortcutsTable);
        populateShortcutsTable(settings.pageNavigationShortcuts, element_pageNavigationShortcutsTable);
        populateShortcutsTable(settings.elementNavigationShortcuts, element_elementNavigationShortcutsTable);
    }

    function resetUI() {

    }

    function populateShortcutsTable(shortcuts, table) {
        // Populate general keyboard shortcuts
        var shortcut, tbody, key, tr, innerHtml;

        tbody = document.createElement("tbody");

        for (key in shortcuts) {
            shortcut = shortcuts[key];

            tr = document.createElement('tr');
            tr.setAttribute("id", key);

            innerHtml = '<td>' + shortcut.descr + '</td>';

            var kbdShortcuts, kbdShortcut, kbdShortcutsHtml = "";

            kbdShortcuts = shortcut.kbdShortcuts;
            for (var i = 0; i < kbdShortcuts.length; i++) {
                kbdShortcut = kbdShortcuts[i];
                kbdShortcutsHtml += getShortcutInputUI(kbdShortcut).outerHTML;
            }
            kbdShortcutsHtml += "<button class='hidden " + class_reset+ "'> Reset</button>";
            kbdShortcutsHtml += "<button class='hidden " + class_addShortcut+ "'> + </button>";

            innerHtml += "<td>" + kbdShortcutsHtml + "</td>";

            tr.innerHTML = innerHtml;
            tbody.appendChild(tr);
        }

        table.appendChild(tbody);
    }

    function render() {
        mod_settings.getUserSettings(_render);
    }

    function getKeyboardShortcutsForRow(row) {
        var shortcutInputs = row.querySelectorAll("." + class_kbdShortcut + ">input"),
            shortcuts = [];

        for (var i = 0; i < shortcutInputs.length; i++) {
            var shortcut = shortcutInputs[i];
            shortcuts.push(shortcut.value);
        }

        return shortcuts;
    }

    function saveOptions_miscSettings(event) {
        var target = event.target;
        if (target.tagName.toLowerCase() !== "input") {
            return;
        }

        var parentRow = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr");

        if (!parentRow) {
            return;
        }

        var settingKey = parentRow.id,
            settingValue;

        if (target.type.toLowerCase() == "checkbox") {
            settingValue = target.checked;
        }
        else {

            // If the value can be parsed into a number, then save it as a number. Else, normally as a string.
            // NOTE: We can afford to do this because it is unlikely that we will have a setting value that can be parsed
            // to a number AND needs to be saved as a string.

            settingValue = parseInt(target.value, 10);
            if (!settingValue) {
                settingValue = target.value;
            }
        }

        // Save settings
        var settings = mod_settings.getUserSettings(null, {getBasic: true});
        settings.miscSettings[settingKey] = settingValue;
        mod_optionsHelper.saveOptions(settings, "Option saved", _render);

    }

    function saveOptions_shortcuts(event) {
        var target = event.target;

        if (target.tagName.toLowerCase() !== "input") {
            return;
        }

        if (event.relatedTarget && event.relatedTarget.tagName.toLowerCase() === "button") {
            return;
        }

        var parentRow = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr");

        if (!parentRow) {
            return;
        }

        parentRow.querySelector("." + class_addShortcut).disabled = false; // enable the add shortcut button again

        var value = target.value,
            targetOriginalValue = target.dataset.originalvalue; // NOTE: dataset works only in IE10+

        // If no value is entered, then reset the UI. 
        if (!value) {
            
            // If the textbox has no previous associated shortcut, then remove this textbox from the UI.
            if (!targetOriginalValue) {
                removeContainingShortcutUI(target);
            }

            // Else, reset the value of the textbox with its original value
            target.value = targetOriginalValue;
            return;
        }

        var settingKey = parentRow.id,
            settingParentKey = getSettingTopLevelKey_forTarget(target);

        // Save settings
        var settings = mod_settings.getUserSettings(null, {getBasic: true});
        settings[settingParentKey][settingKey].kbdShortcuts = getKeyboardShortcutsForRow(parentRow);
        mod_optionsHelper.saveOptions(settings, "Shortcut saved");
    }

    function showMessage_editingHelp(event) {
        var target = event.target,
            messageElement = document.createElement("span");

        messageElement.classList.add(class_editingHelpMessage);
        messageElement.textContent = "Click anywhere outside to save";

        var parent = mod_optionsHelper.getClosestAncestorOfTagType(target, "td");

        if (!parent.querySelectorAll("." + class_editingHelpMessage).length) {
            parent.appendChild(messageElement);
        }
    }

    function hideMessage_editingHelp(event) {
        var target = event.target,
            parent = mod_optionsHelper.getClosestAncestorOfTagType(target, "td"),
        messageElement = parent.querySelector("." + class_editingHelpMessage);

        if (messageElement && messageElement.classList.contains(class_editingHelpMessage)) {
            messageElement.remove();
        }
    }

    function showMessage_startKbdShortcutInput(event) {
        var target = event.target;
        target.setAttribute("data-originalvalue", target.value);
        target.value = "";
        target.setAttribute("placeholder", "Type a shortcut");
    }

    function captureKeyboardShortcut(event) {
        var target = event.target,
            targetValue = target.value,
            targetOriginalValue = targetValue,
            modifiers = Mousetrap.eventModifiers(event),
            characterTyped = Mousetrap.characterFromEvent(event);

        var sequenceKeysSeparator = " ";

        // If the character typed is one of the modifiers, then disregard the input
        if (!characterTyped || modifiers.indexOf(characterTyped) > -1) {
            return;
        }

        // If backspace is typed, then delete the last typed key combination. This is to help facilitate editing of
        // the shortcut field.
        // NOTE: If the backspace is typed with a modifier, we accept it as a shortcut.
        if (characterTyped === "backspace" && !modifiers.length) {
            var indexOfLastKeyCombination = targetValue.lastIndexOf(sequenceKeysSeparator);

            targetValue = targetValue.substr(0, indexOfLastKeyCombination);
            target.value = targetValue;

            event.preventDefault();
            return;
        }

        // For sequence shortcuts. Append the current typed shortcut to existing value
        if (targetValue) {
            targetValue += sequenceKeysSeparator;
        }


        // For combination shortcuts, prepend all the modifiers first.
        for (var i = 0; i < modifiers.length; i++) {

            // Save modifier "meta" as "command" on Mac. Ignore it on other platforms.
            if (modifiers[i] === "meta") {
               if (navigator.appVersion.indexOf("Mac")!=-1) {
                   modifiers[i] = "command";
               }
               else {
                   continue;
               }
            }

            targetValue += modifiers[i] + "+";
        }

        targetValue += characterTyped;

        target.value = targetValue;
        target.style.width = Math.max((target.value.length + 1) * 7, target.offsetWidth) + "px"; // Increase width of the
        // textbox if input very large.

        if (targetValue && targetOriginalValue!== targetValue) {
            showMessage_editingHelp(event);
        }

        event.preventDefault();

    }

    function onShortcutsTableClick(event) {
        var target = event.target;

        if (target.classList.contains(class_addShortcut)) {
            showTextboxForAddingShortcut(target);
            target.disabled = true; // disable the add shortcut button, till the adding of this shortcut is complete
        }
        else if (target.classList.contains(class_deleteShortcut)){
            deleteShortcut(target);
        }
        else if (target.classList.contains(class_reset)) {
            resetShortcut(target);
        }
    }

    function onMiscSettingsTableClick(event) {
        var target = event.target,
            parentRow = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr");

        if (target.classList.contains(class_reset)) {
            resetMiscSetting(parentRow);
        }
    }

    function showTextboxForAddingShortcut(target) {
        var row = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr"),
            clone = getShortcutInputUI(""),
            input = clone.querySelector("input[type=text]"),
            addButton = row.querySelector("." + class_addShortcut);

        row.lastElementChild.insertBefore(clone, addButton);
        input.focus();

        return false;
    }

    function removeContainingShortcutUI(element) {
        var shortcutContainer = mod_optionsHelper.getClosestAncestorOfTagType(element, "div");

        shortcutContainer.remove();
    }

    function deleteShortcut(target) {
        var parentRow = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr"),
            settingKey = parentRow.id,
            settings = mod_settings.getUserSettings(null, {getBasic: true}),
            settingTopLevelKey = getSettingTopLevelKey_forTarget(target),
            setting = settings[settingTopLevelKey];

        removeContainingShortcutUI(target);
        setting[settingKey].kbdShortcuts = getKeyboardShortcutsForRow(parentRow);

        mod_optionsHelper.saveOptions(settings, "Shortcut deleted", _render);
    }

    function resetShortcut(target) {
        var parentRow = mod_optionsHelper.getClosestAncestorOfTagType(target, "tr"),
            settingKey = parentRow.id,
            settings = mod_settings.getUserSettings(null, {getBasic: true}),
            defaultSettings = mod_settings.getDefaultSettings(),
            settingTopLevelKey = getSettingTopLevelKey_forTarget(target);

        settings[settingTopLevelKey][settingKey].kbdShortcuts = defaultSettings[settingTopLevelKey][settingKey].kbdShortcuts;

        mod_optionsHelper.saveOptions(settings, "Shortcut reset.", _render);
    }

    function resetMiscSetting(parentRow) {
        var settingKey = parentRow.id,
            settings = mod_settings.getUserSettings(null, {getBasic: true}),
            defaultSettings = mod_settings.getDefaultSettings();

        settings.miscSettings[settingKey] = defaultSettings.miscSettings[settingKey];

        mod_optionsHelper.saveOptions(settings, "Option reset.", _render);
    }

    function resetAllOptions() {
        if (confirm("Sure you want to reset all the options?")) {
            mod_optionsHelper.saveOptions(null, "All options are reset", _render);
        }
    }

    function getSettingTopLevelKey_forTarget(target) {
        var parentTable = mod_optionsHelper.getClosestAncestorOfTagType(target, "table"),
            settingTopLevelKey = parentTable.dataset.key;

        return settingTopLevelKey;
    }

    return thisModule;

})(_u.mod_commonHelper, _u.mod_settings, mod_optionsHelper);
