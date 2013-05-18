/***
 * Module for displaying the "help" modal UI
 */
_u.mod_help = (function($, mod_contentHelper, mod_keyboardLib, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset,
        init: init,
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
            '</div>',

        keysSeparatorHtml = "<span class=separator> or </span>";

    function reset() {
        $helpContainer && $helpContainer.remove();
    }

    function init(settings) {
        reset();
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

        mod_keyboardLib.bind(settings.generalShortcuts.showHelp.kbdShortcuts, showHelp);
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

        appendSpecialCases(settings, $generalShortcutsSection, $help.find(".UnitsProj-modal-body"));

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
     */
    function renderShortcutsInSectionTable(shortcutsObj, $shortcutsTable, subSectionTitle) {
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

            if (kbdShortcuts) {
                var kbdShortcutsHtml = "";

                // Create spans for each keyboard shortcut. And spans with the text "or" to connect them.
                for (var i = 0; i < kbdShortcuts.length; i++) {
                    kbdShortcutsHtml += "<span class=key>"+ kbdShortcuts[i] + "</span>";
                    if (i !== kbdShortcuts.length -1) {
                        kbdShortcutsHtml+= keysSeparatorHtml;
                    }
                }

                $("<tr></tr>")
                    .appendTo($shortcutsTable)
                    .attr("id", key)
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

    function appendSpecialCases(settings, $generalShortcutsSection, $helpModalBody) {
        var generalShortcuts = settings.generalShortcuts,
            CUsShortcuts_Default = settings.CUsShortcuts,
            nextCUShortcuts = CUsShortcuts_Default.nextCU.kbdShortcuts,
            prevCUShortcuts = CUsShortcuts_Default.prevCU.kbdShortcuts,
            scrollDownShortcuts = generalShortcuts.scrollDown.kbdShortcuts,
            scrollUpShortcuts = generalShortcuts.scrollUp.kbdShortcuts,
            $scrollDownShortcuts = $generalShortcutsSection.find("#scrollDown td.key"),
            $scrollUpShortcuts =  $generalShortcutsSection.find("#scrollUp td.key");

        var additionalShortcuts,
            i;

        // Append NextCU shortcuts to scrollDown shortcuts
        if (scrollDownShortcuts.length) {
            $scrollDownShortcuts.append(keysSeparatorHtml);
        }

        additionalShortcuts = "";
        for (i = 0; i < nextCUShortcuts.length; i++) {
            additionalShortcuts += "<span class=key>"+ nextCUShortcuts[i] + "*" + "</span>";
            if (i !== nextCUShortcuts.length - 1) {
                additionalShortcuts+= keysSeparatorHtml;
            }
        }
        additionalShortcuts && $scrollDownShortcuts.append(additionalShortcuts);


        // Append PrevCU shortcuts to scrollUp shortcuts
        if (scrollUpShortcuts.length) {
            $scrollUpShortcuts.append(keysSeparatorHtml);
        }

        additionalShortcuts = "";
        for (i = 0; i < prevCUShortcuts.length; i++) {
            additionalShortcuts += "<span class=key>"+ prevCUShortcuts[i] + "*" + "</span>";
            if (i !== prevCUShortcuts.length - 1) {
                additionalShortcuts+= keysSeparatorHtml;
            }
        }
        additionalShortcuts && $scrollUpShortcuts.append(additionalShortcuts);


        //Add * message at the end of $help

        var messageHtml = "<p class=message>* These will scroll the page up/down only when there are no CUs on the page. Else, these are used to " +
            "go to previous/next CU. </p>";
        $helpModalBody.append(messageHtml);
    }

    function showHelp() {
        $helpContainer.show();
    }

    function hideHelp() {
        $helpContainer.hide();

    }

    return thisModule;

})(jQuery, _u.mod_contentHelper, _u.mod_keyboardLib, _u.CONSTS);    // pass as input external modules that this modules depends on
