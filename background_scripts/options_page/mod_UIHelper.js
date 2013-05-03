
mod_UIHelper = (function() {
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
    function showMessage(message, type) {
        messageDiv.value = message;
//        messageDiv

    }

    function showErrorMessage() {

    }

    function showSuccessMessage() {

    }

    return thisModule;

})();
