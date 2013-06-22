// This code runs in an iframe that is used to render the help UI on any website.
// Since this script is included at the end of the body, DOM is ready when we execute this script.

(function() {
    "use strict";

    // First, get settings for the current tab URL and then render UI
    chrome.runtime.sendMessage({
            message: "getSettings",
            url: document.referrer
        },
        renderHelpUI
    );

    var keysSeparatorHtml = "<span class='separator UnitsProj-message'> or </span>",
        $help = $("#help"),
        $generalShortcutsSection = $("#general-shortcuts"),
        $CUShortcutsSection = $("#CUs-shortcuts"),
        $closeButton = $(".close");

    $closeButton.click(function() {
        parent.postMessage({message: "closeIFrame"}, "*");
    });


    window.addEventListener('message', function(event) {
        var data = event.data,
            sectionDisabledClass = "disabled",
            $noCUsMessage = $("<span class='disabled'> No content units setup for this page</span>"),
            $CUsShortcuts = $CUShortcutsSection.find("tbody");


        // If the page does not have CUs specified, then hide the shortcuts and show a message.
        if (data.message === 'pageHasCUsSpecifier') {
            if (!data.value) {
                // show the CU shortcuts as disabled
                $CUShortcutsSection.addClass(sectionDisabledClass);
                $CUShortcutsSection.append($noCUsMessage);
                $CUsShortcuts.hide();

                return;
            }

            $CUShortcutsSection.removeClass(sectionDisabledClass);
            if ($noCUsMessage) {
                $noCUsMessage.remove();
            }
            $CUsShortcuts.show();
        }

        return false;

    }, false);

    function renderHelpUI(settings) {
        renderCUShortcuts(settings);
        renderGeneralShortcuts(settings);
        appendSpecialCases(settings, $generalShortcutsSection);


        // send message to content script once the UI is rendered (and we have the final height of the contents)
        parent.postMessage({
            message: "setHelpUIHeight",
            height: $help.height()
        }, "*");

        parent.postMessage({
            message: "doesPageHaveCUsSpecifier"
        }, "*");
    }

    function renderGeneralShortcuts(settings) {
        var generalShortcuts = settings.generalShortcuts,
            expandedUrlData = settings.expandedUrlData,
            globalShortcuts = settings.globalChromeCommands;

        var page_SUs = expandedUrlData && expandedUrlData.page_SUs,
            page_actions = expandedUrlData && expandedUrlData.page_actions,
            page_allShortcuts = $.extend({}, page_SUs, page_actions);

        var $shortcutsTable = $generalShortcutsSection.find("table");

        renderShortcutsInSectionTable(generalShortcuts, $shortcutsTable);
        renderShortcutsInSectionTable(page_allShortcuts, $shortcutsTable, "Applicable for this page/ website", "page-specific");
        renderShortcutsInSectionTable(globalShortcuts, $shortcutsTable, "Global shortcuts (applicable on any tab)");
    }

    function renderCUShortcuts(settings) {
        var CUsShortcuts_Default = settings.CUsShortcuts,
            expandedUrlData = settings.expandedUrlData,
            CUs_SUs = expandedUrlData && expandedUrlData.CUs_SUs,
            CUs_actions = expandedUrlData && expandedUrlData.CUs_actions,
            CUsShortcuts_URLBased = $.extend({}, CUs_SUs, CUs_actions);

        // Additional shortcut to be displayed
        CUsShortcuts_Default.selectAnyLink= {
            miniDescr: "Select any link",
            kbdShortcuts: ["Space + [letter that link starts with]"]
        };

        var $shortcutsTable = $CUShortcutsSection.find("table");

        renderShortcutsInSectionTable(CUsShortcuts_Default, $shortcutsTable);
        renderShortcutsInSectionTable(CUsShortcuts_URLBased, $shortcutsTable, "Applicable for this page/ website", "page-specific");
    }

    /***
     * Append a subsection in the given $shortcutsTable by rendering shortcuts in shortcutsObj. Add a title to this
     * subsection if specified as subsectionTitle.
     * @param shortcutsObj
     * @param $shortcutsTable
     * @param [subSectionTitle]
     * @param [rowClass]
     */
    function renderShortcutsInSectionTable(shortcutsObj, $shortcutsTable, subSectionTitle, rowClass) {
        if (!shortcutsObj || !$shortcutsTable) {
            return;
        }

        var hasAtLeastOneShortcut = false,
            $subSectionTitle;

        if (subSectionTitle) {
            $subSectionTitle = $("<tr><td colspan='2'></td></tr>");
            $subSectionTitle
                .addClass('subsection-title')
                .find("td").text(subSectionTitle).addClass('UnitsProj-message');
            $shortcutsTable.append($subSectionTitle);
        }

        $.each(shortcutsObj, function(key, value) {
            var kbdShortcuts = value.kbdShortcuts || value.shortcut; // property shortcut used by chrome.commands

            if (kbdShortcuts && !Array.isArray(kbdShortcuts)) {
                kbdShortcuts = [kbdShortcuts];
            }

            if (kbdShortcuts) {
                var kbdShortcutsHtml = "";

                // Create spans for each keyboard shortcut. And spans with the text "or" to connect them.
                for (var i = 0; i < kbdShortcuts.length; i++) {
                    kbdShortcutsHtml += "<span class=key-text>"+ kbdShortcuts[i] + "</span>";
                    if (i !== kbdShortcuts.length -1) {
                        kbdShortcutsHtml+= keysSeparatorHtml;
                    }
                }

                var shortcutDesc = value.miniDescr || value.description || value.name || key; // properties description and
                // name used by chrome.commands. miniDescr and key are applicable for all the other settings defined
                // in the project.

                $("<tr></tr>")
                    .appendTo($shortcutsTable)
                    .attr("id", key)
                    .addClass(rowClass)
                    .append($("<td class= key></td>").html(kbdShortcutsHtml))
                    .append($("<td class = action></td>").text(shortcutDesc));

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

    function appendSpecialCases(settings, $generalShortcutsSection) {
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
            additionalShortcuts += "<span class=key>"+ nextCUShortcuts[i] + "</span>" + "*" ;
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
            additionalShortcuts += "<span class=key>"+ prevCUShortcuts[i] + "</span>" + "*";
            if (i !== prevCUShortcuts.length - 1) {
                additionalShortcuts+= keysSeparatorHtml;
            }
        }
        additionalShortcuts && $scrollUpShortcuts.append(additionalShortcuts);
    }
})();