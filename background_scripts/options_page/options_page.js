// JSHint Config
/* global mod_advancedOptions, mod_basicOptions */

/* Note: In the HTML page, we use the word 'options' instead of 'settings', which is used in code. 'Options' is more
 consistent with Chrome extension terms. 'Settings' might be easier to understand in code. */

(function(mod_commonHelper, mod_settings, mod_advancedOptions, mod_basicOptions) {
    "use strict";

    var basicOptionsLink = document.getElementById("basic-options-nav"),
        advancedOptionsLink = document.getElementById("advanced-options-nav"),
        basicOptions = document.getElementById("basic-options"),
        advancedOptions = document.getElementById("advanced-options");

    // Common methods

    var setup = function() {
        mod_basicOptions.setup();
        mod_advancedOptions.setup();

        navigateToBasicOptions();

        // Header navigation
        basicOptionsLink.addEventListener("click", navigateToBasicOptions);
        advancedOptionsLink.addEventListener("click", navigateToAdvancedOptions);
    };


    var navigateToAdvancedOptions = function() {
        // Reset/Populate advanced options
        mod_advancedOptions.render(function() {
            basicOptions.style.display = "none";
            advancedOptions.style.display = "block";

            // Update navigation link
            advancedOptionsLink.classList.add("selected");
            basicOptionsLink.classList.remove("selected");
        });
    };

    var navigateToBasicOptions = function() {
        // Populate/Reset basic options
        mod_basicOptions.render();

        basicOptions.style.display = "block";
        advancedOptions.style.display = "none";

        // Update navigation link
        advancedOptionsLink.classList.remove("selected");
        basicOptionsLink.classList.add("selected");
    };


    setup();

})(_u.mod_commonHelper, _u.mod_settings, mod_advancedOptions, mod_basicOptions);
