/***
 * Module for displaying the "help" modal UI
 */
_u.mod_help = (function($, mod_contentHelper, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup,
        showHelp: showHelp,
        hideHelp: hideHelp
    });


    /*-- Module implementation --*/

    var $helpContainer,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        $topLevelContainer = _u.$topLevelContainer,
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
                '<table><thead><tr><th colspan="2" class="section-title"></th></tr></thead></table>' +
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
        $helpContainer.find(".close")[0].addEventListener('click', hideHelp);

    }

    function setupHelpUI(settings) {
        $helpContainer = $(helpModalDialogHtml);
        var $help = $helpContainer.find("#help"),
        // shortcuts are displayed in two sections: CUs Shortcuts, and General Shortcuts.
            $CUsShortcutsSection = getCUsShortcutsSection(settings),
            $generalShortcutsSection = getGeneralShortcutsSection(settings);

        $help.find(".UnitsProj-modal-body").append($CUsShortcutsSection, $generalShortcutsSection,
            $("<div class=UnitsProj-float-fixer></div>"));

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
        renderShortcutsInSectionTable(CUsShortcuts_URLBased, $shortcutsTable, "Applicable for this page/ website");

        return $section;

    }

    function getGeneralShortcutsSection(settings) {
        var generalShortcuts = settings.generalShortcuts,
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
        renderShortcutsInSectionTable(page_allShortcuts, $shortcutsTable, "Applicable for this page/ website");

        return $section;
    }

    /***
     *
     * @param shortcutsObj
     * @param $shortcutsTable
     * @param [subSectionTitle]
     * @param [isBrowserShortcut] TODO: This is temporary
     */
    function renderShortcutsInSectionTable(shortcutsObj, $shortcutsTable, subSectionTitle, isBrowserShortcut) {
        if (!shortcutsObj || !$shortcutsTable) {
            return;
        }

        var hasAtLeastOneShortcut = false,
            $subSectionTitle;

        if (subSectionTitle) {
            $subSectionTitle = $("<tr><td colspan='2'></td></tr>");
            $subSectionTitle
                .addClass('subsection-title')
                .find("td").text(subSectionTitle);
            $shortcutsTable.append($subSectionTitle);
        }

        $.each(shortcutsObj, function(key, value) {
            var kbdShortcuts = value.kbdShortcuts;
            if (isBrowserShortcut) {
                kbdShortcuts = value;
            }

            if (kbdShortcuts) {
                var kbdShortcutsHtml = "";

                // Create spans for each keyboard shortcut. And spans with the text "or" to connect them.
                for (var i = 0; i < kbdShortcuts.length; i++) {
                    kbdShortcutsHtml += "<span class=key>"+ kbdShortcuts[i] + "</span>";
                    if (i !== kbdShortcuts.length -1) {
                        kbdShortcutsHtml+= "<span class=separator> or </span>";
                    }
                }

                $("<tr></tr>")
                    .appendTo($shortcutsTable)
//                    .append($("<td class= key></td>").text(value.kbdShortcuts.toString().replace(",", ", ")))
                    .append($("<td class= key></td>").html(kbdShortcutsHtml))
                    .append($("<td class = action></td>").text(value.miniDescr || key));

                hasAtLeastOneShortcut = true;
            }
        });

        if (hasAtLeastOneShortcut) {
            $shortcutsTable.find("tr:last-child").addClass("subsection-end");
        }
        else {
            $subSectionTitle && $subSectionTitle.remove();
        }
    }


    function showHelp() {
        $helpContainer.show();
    }

    function hideHelp() {
        $helpContainer.hide();

    }

    return thisModule;

})(jQuery, _u.mod_contentHelper, _u.CONSTS);    // pass as input external modules that this modules depends on
