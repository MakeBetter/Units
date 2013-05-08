
_u.mod_help = (function($, mod_core, mod_contentHelper, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        setup: setup,
        showHelp: showHelp,
        hideHelp: hideHelp
    });

    /*-- Module implementation --*/

    var $helpContainer,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        $topLevelContainer = mod_core.$topLevelContainer,
        suppressEvent = mod_contentHelper.suppressEvent;

    function setup(settings) {
        setupHelpUI(settings);

        var onEscapeKeyDownOnHelp = function(e) {
            var code = e.which || e.keyCode;
            if (code === 27) { // ESc
                if ($helpContainer.is(':visible')) {
                    hideHelp();
                    suppressEvent(e);
                }
            }

        };

        document.addEventListener('keydown', onEscapeKeyDownOnHelp, true);

    }

    function setupHelpUI(settings) {

        var browserShortcuts = settings.browserShortcuts,
            generalShortcuts = settings.generalShortcuts,
            CUsShortcuts = settings.CUsShortcuts,
            expandedUrlData = settings.expandedUrlData;

        var helpModalDialogHtml =
            '<div id = "UnitsProj-help-container">' +
                '<div class = "UnitsProj-modal-backdrop">' +
                '</div>' +

                '<div id= "help" class = "UnitsProj-modal">' +
                '<div class= "UnitsProj-modal-header">' +
                '<h1 class="UnitsProj-modal-title">Units Shortcuts</h1>' +
                '<button class= close>×</button>' +
                '</div>' +

                '<div class = "UnitsProj-modal-body">' +
                '</div>' +

                '</div>' +

                '</div>';


        var shortcutsSectionHtml =
            '<div class = "section">' +
                '<span class= "section-title"></span>' +
                '<table>' + '</table>' +
                '</div>';

        $helpContainer = $(helpModalDialogHtml);

        var $help = $helpContainer.find("#help");


        // shortcuts are displayed under three different heads: CUs based, page based, and general browser based.

        var CUs_MUs = expandedUrlData && expandedUrlData.CUs_MUs,
            CUs_actions = expandedUrlData && expandedUrlData.CUs_actions,
            CUs_allShortcuts = $.extend({}, CUs_MUs, CUs_actions, CUsShortcuts);

        var page_MUs = expandedUrlData && expandedUrlData.page_MUs,
            page_actions = expandedUrlData && expandedUrlData.page_actions,
            page_allShortcuts = $.extend({}, page_MUs, page_actions);

        var allGeneralShortcuts = $.extend({},browserShortcuts, generalShortcuts);
        // TODO: the generalShortcuts contains quite a few CUs based shortcuts. Make changes to the data to be able to
        // identify these CUs based shortcuts, and then show them as part of the CUs shortcuts.

        var appendSectionShortcuts = function(shortcuts, sectionTitle) {
            if (!shortcuts || !sectionTitle) {
                return;
            }

            var $section = $(shortcutsSectionHtml),
                $shortcutsTable = $section.find("table"),
                hasAtLeastOneShortcut = false;

            $.each(shortcuts, function(key, value) {
                if (value.kbdShortcuts) {
                    $("<tr></tr>")
                        .appendTo($shortcutsTable)
                        .append($("<td></td>").text(value.kbdShortcuts.toString().replace(",", ", ")))
                        .append($("<td></td>").text(value.miniDescr || key));

                    hasAtLeastOneShortcut = true;
                }
            });

            if (hasAtLeastOneShortcut) {
                $section.find(".section-title").text(sectionTitle);
                $help.find(".UnitsProj-modal-body").append($section);
            }

        };

        appendSectionShortcuts(CUs_allShortcuts, "CUs Shortcuts");
        appendSectionShortcuts(page_allShortcuts, "Page Shortcuts");
        appendSectionShortcuts(allGeneralShortcuts, "General Shortcuts");

        $helpContainer
            .addClass(class_addedByUnitsProj)
            .hide()
            .appendTo($topLevelContainer);
    }

    function showHelp() {
        $helpContainer.show();
    }

    function hideHelp() {
        $helpContainer.hide();

    }

    return thisModule;

})(jQuery, _u.mod_core, _u.mod_contentHelper, _u.CONSTS);    // pass as input external modules that this modules depends on
