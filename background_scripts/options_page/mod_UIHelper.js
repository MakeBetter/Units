// JSHint config
/* exported mod_UIHelper */

var mod_UIHelper = (function() {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        showMessage: showMessage,
        showErrorMessage: showErrorMessage,
        showSuccessMessage: showSuccessMessage
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

    return thisModule;

})();
