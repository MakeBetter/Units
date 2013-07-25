// JSHint config
/* exported mod_optionsHelper */

var backgroundPageWindow = chrome.extension.getBackgroundPage(),
    _u = backgroundPageWindow._u;

var mod_optionsHelper = (function(mod_settings) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        showMessage: showMessage,
        showErrorMessage: showErrorMessage,
        showSuccessMessage: showSuccessMessage,
        saveOptions: saveOptions,
        getClosestAncestorOfTagType: getClosestAncestorOfTagType,
        getPosition: getPosition
    };

    var messageDiv = document.getElementById("user-message"),
        errorClass = "error",
        successClass = "success";

    /*-- Module implementation --*/

    /***
     * Show success or error message in the top user-message div.
     * @param message
     * @param type
     * @param [duration]
     */
    function showMessage(message, type, duration) {
        messageDiv.classList.remove(errorClass);
        messageDiv.classList.remove(successClass);

        if (type === "error") {
            messageDiv.classList.add(errorClass);
        }
        else if (type === "success"){
            messageDiv.classList.add(successClass);
        }

        messageDiv.innerHTML = message;
        messageDiv.style.display = "block";

        if (type === "success") {
            duration = parseInt(duration, 10) || 3000;
            setTimeout(function() {
                messageDiv.style.display = "none";
            }, duration);
        }
    }

    function showErrorMessage(message) {
        showMessage(message, "error");
    }

    function showSuccessMessage(message) {
        showMessage(message, "success");
    }

    function saveOptions(settings, successMessage, onSave) {
        mod_settings.setUserSettings(settings);

        mod_optionsHelper.showSuccessMessage(successMessage);

        mod_settings.getUserSettings(onSave);
    }

    function getClosestAncestorOfTagType(el, tagName) {
        while (el && el.tagName.toLowerCase() !== tagName) {
            el = el.parentElement;
        }
        return el;
    }

    return thisModule;

})(_u.mod_settings);
