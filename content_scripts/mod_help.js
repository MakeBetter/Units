/***
 * Module for displaying the "help" modal UI
 */
_u.mod_help = (function($, mod_contentHelper, mod_keyboardLib, mod_domEvents, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        setup: setup,
        showHelp: showHelp,
        hideHelp: hideHelp,
        toggleHelp: toggleHelp,
        positionHelpUI: positionHelpUI
    });


    /*-- Module implementation --*/

    var $helpContainer,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        class_visibilityHidden = 'hidden',
        class_visibilityVisible = 'visible',
        id_iframeHelp = 'UnitsProj-iframe-help',
        $topLevelContainer = _u.$topLevelContainer;

    function reset() {
        $helpContainer && $helpContainer.remove();
    }

    function setup(settings) {
        reset();
        setupHelpUI(settings);

        mod_keyboardLib.bind(settings.generalShortcuts.showHelp.kbdShortcuts, toggleHelp);
        mod_keyboardLib.bind('esc', hideHelp, function() {
            if ($helpContainer.css("visibility") === "visible") {
                return true;
            }
            else {
                return false;
            }
        });

        // clicking anywhere on the page should hide the help UI.
        var modalBackdrop = document.getElementById('UnitsProj-help-backdrop');
        modalBackdrop && mod_domEvents.addEventListener(modalBackdrop, 'click', hideHelp);
    }

    function setupHelpUI() {
        var $iframe = $("<iframe></iframe>")
                        .attr('id', id_iframeHelp)
                        .addClass(class_visibilityHidden)
                        .attr("src", chrome.runtime.getURL("content_scripts/helpUI/helpUI.html"));
        var $modalBackdrop = $("<div class = UnitsProj-modal-backdrop id='UnitsProj-help-backdrop'></div>");

        $helpContainer = $("<div id=UnitsProj-help-container></div>");

        $helpContainer
            .append($iframe, $modalBackdrop)
            .addClass(class_addedByUnitsProj)
            .addClass(class_visibilityHidden) //Setting visibility:hidden instead of display:none since we need to get the height of the
            // contents of the iframe. When we hide the iframe using display:none, we don't seem to get the correct height of its container.
            .appendTo($topLevelContainer);
    }

    function showHelp() {
        // set "visibility" class for both container and iframe. Setting styles on both as fix for #9.
        $helpContainer.find("#" + id_iframeHelp).addBack().removeClass(class_visibilityHidden).addClass(class_visibilityVisible);
    }

    function hideHelp() {
        $helpContainer.find("#" + id_iframeHelp).addBack().removeClass(class_visibilityVisible).addClass(class_visibilityHidden);
    }

    function toggleHelp() {
        if ($helpContainer.css("visibility") === 'hidden') {
            showHelp();
        }
        else {
            hideHelp();
        }
    }

    /***
     * Set the height of the help UI depending on iframe content height and current window height, and position the UI on page.
     * @param {number} helpUIContentsHeight Height of iframe contents (Retrieved by iframe document sending message to background script,
     * that sends message to content script.
     */
    function positionHelpUI(helpUIContentsHeight) {
        if ($helpContainer) {

            var $iframe = $helpContainer.find("#" + id_iframeHelp),
                iframeHeight = Math.min(helpUIContentsHeight, 0.9 * window.innerHeight), //0.9 is randomly chosen
                iframeTop = (window.innerHeight - iframeHeight)/2;

            $iframe[0].style.top = iframeTop + "px"; // center the help UI vertically on page
            $iframe[0].style.height = iframeHeight + "px"; // set height appropriate to contents height and window
        }
    }

    return thisModule;

})(jQuery, _u.mod_contentHelper, _u.mod_keyboardLib, _u.mod_domEvents, _u.CONSTS);    // pass as input external modules that this modules depends on
