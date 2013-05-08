/***
 * Module for displaying the "help" modal UI
 */
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
        suppressEvent = mod_contentHelper.suppressEvent,
        helpModalDialogHtml =
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

                '</div>',


        shortcutsSectionHtml =
            '<div class = "section">' +
                '<span class= "section-title"></span>' +
                '<table>' + '</table>' +
            '</div>';

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
        $helpContainer = $(helpModalDialogHtml);
        var $help = $helpContainer.find("#help"),
        // shortcuts are displayed in two sections: CUs Shortcuts, and General Shortcuts.
            $CUsShortcutsSection = getCUsShortcutsSection(settings),
            $generalShortcutsSection = getGeneralShortcutsSection(settings);

        $help.find(".UnitsProj-modal-body").append($CUsShortcutsSection, $generalShortcutsSection);

        $helpContainer
            .addClass(class_addedByUnitsProj)
            .hide()
            .appendTo($topLevelContainer);
    }

    function getCUsShortcutsSection(settings) {
        var CUsShortcuts_Default = settings.CUsShortcuts,
            expandedUrlData = settings.expandedUrlData,
            CUs_MUs = expandedUrlData && expandedUrlData.CUs_MUs,
            CUs_actions = expandedUrlData && expandedUrlData.CUs_actions,
            CUsShortcuts_URLBased = $.extend({}, CUs_MUs, CUs_actions);

        var $section = $(shortcutsSectionHtml);
        $section
            .attr("id", "CUs-shortcuts")
            .find(".section-title").text("CUs based");

        var $shortcutsTable = $section.find("table");

        renderShortcutsInSectionTable(CUsShortcuts_Default, $shortcutsTable);
        renderShortcutsInSectionTable(CUsShortcuts_URLBased, $shortcutsTable);

        return $section;

    }

    function getGeneralShortcutsSection(settings) {
        var browserShortcuts = settings.browserShortcuts,
            generalShortcuts = settings.generalShortcuts,
            expandedUrlData = settings.expandedUrlData;

        var page_MUs = expandedUrlData && expandedUrlData.page_MUs,
            page_actions = expandedUrlData && expandedUrlData.page_actions,
            page_allShortcuts = $.extend({}, page_MUs, page_actions);

        var $section = $(shortcutsSectionHtml);
        $section
            .attr("id", "general-shortcuts")
            .find(".section-title").text("General");

        var $shortcutsTable = $section.find("table");

        renderShortcutsInSectionTable(generalShortcuts, $shortcutsTable);
        renderShortcutsInSectionTable(page_allShortcuts, $shortcutsTable);
        renderShortcutsInSectionTable(browserShortcuts, $shortcutsTable);

        return $section;
    }

    function renderShortcutsInSectionTable(shortcutsObj, $shortcutsTable) {
        if (!shortcutsObj || !$shortcutsTable) {
            return;
        }

        var hasAtLeastOneShortcut = false;

        $.each(shortcutsObj, function(key, value) {
            if (value.kbdShortcuts) {
                $("<tr></tr>")
                    .appendTo($shortcutsTable)
                    .append($("<td></td>").text(value.kbdShortcuts.toString().replace(",", ", ")))
                    .append($("<td></td>").text(value.miniDescr || key));

                hasAtLeastOneShortcut = true;
            }
        });

        if (hasAtLeastOneShortcut) {
          // TODO: show a marker to indicate end of this sub-section
        }
    }


    function showHelp() {
        $helpContainer.show();
    }

    function hideHelp() {
        $helpContainer.hide();

    }

    return thisModule;

})(jQuery, _u.mod_core, _u.mod_contentHelper, _u.CONSTS);    // pass as input external modules that this modules depends on
