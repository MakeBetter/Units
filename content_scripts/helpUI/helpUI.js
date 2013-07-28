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
        
        $CUShortcutsSection = $("#CUs-shortcuts"),
        $miscShortcutsSection = $("#misc-shortcuts"),// second column. contains misc, global, and URL-specific page shortcuts
        $navigatePageSection = $("#navigate-page-shortcuts"),

        $closeButton = $(".close"),

        $filterMenu = $("#filter-by"),

        $footerMessage = $("#footer-message");

    var areCUsSpecifiedForPage,
        menuHandlers = {
            "all" : showAllShortcuts,
            "most-important": showMostImportantShortcuts,
            "cu-based": showCUBasedShortcuts,
            "specific-to-page": showPageSpecificShortcuts,
        },

        class_pageSpecificShortcuts = "page-specific",
        class_importanceHigh = "importance-high",
        class_subsectionTitle = "subsection-title",
        class_subsectionEnd = "subsection-end",
        property_importanceHigh = "importanceHigh";

    // Setup event handlers
    function setup() {
        $closeButton.click(function() {
            parent.postMessage({message: "closeIFrame"}, "*");
        });

        window.addEventListener('message', function(event) {
            var data = event.data;

            if (data.message === 'pageHasCUsSpecifier') {
                showOrHideCUShortcuts_onSetup(data);
            }

            return false;

        }, false);

        $filterMenu.click(onMenuClick);

    }

    function renderHelpUI(settings) {
        _renderHelpUI(settings);

        // send message to content script once the UI is rendered (and we have the final height of the contents)
        parent.postMessage({
            message: "setHelpUIHeight",
            height: $help.height()
        }, "*");

        parent.postMessage({
            message: "doesPageHaveCUsSpecifier"
        }, "*");
    }

    function _renderHelpUI(settings) {
        renderCUShortcuts(settings);
        renderMiscShortcuts(settings);
        renderPageNavigationShortcuts(settings);
    }

    function renderCUShortcuts(settings) {
        var CUsShortcuts_Default = settings.CUsShortcuts,
            expandedUrlData = settings.expandedUrlData,
            CUs_SUs = expandedUrlData && expandedUrlData.CUs_SUs,
            CUs_actions = expandedUrlData && expandedUrlData.CUs_actions,
            CUsShortcuts_URLBased = $.extend({}, CUs_SUs, CUs_actions);

        // Additional shortcut to be displayed
        CUsShortcuts_Default.selectAnyLink= {
            descr: "Select link(s) starting with that letter",
            kbdShortcuts: ["Space + letter"],
        };
        CUsShortcuts_Default.selectAnyLink[property_importanceHigh] = true;

        var $shortcutsTable = $CUShortcutsSection.find("table");

        renderShortcutsInSectionTable(CUsShortcuts_Default, $shortcutsTable, "Content Unit (CU) based");
        renderShortcutsInSectionTable(CUsShortcuts_URLBased, $shortcutsTable, "CU based: for this page/site",class_pageSpecificShortcuts);
    }

    function renderMiscShortcuts(settings) {
        var miscShortcuts = settings.miscShortcuts,
            expandedUrlData = settings.expandedUrlData,
            globalShortcuts = settings.globalChromeCommands;

        var page_SUs = expandedUrlData && expandedUrlData.page_SUs,
            page_actions = expandedUrlData && expandedUrlData.page_actions,
            page_allShortcuts = $.extend({}, page_SUs, page_actions);

        var $shortcutsTable = $miscShortcutsSection.find("table");

        $.each(globalShortcuts, function(key, shortcut) {
            shortcut[property_importanceHigh] = true;
        });

        renderShortcutsInSectionTable(miscShortcuts, $shortcutsTable, "Miscellaneous and Important");
        renderShortcutsInSectionTable(globalShortcuts, $shortcutsTable, "Tab operations");
        renderShortcutsInSectionTable(page_allShortcuts, $shortcutsTable, "Shortcuts for this page/site", class_pageSpecificShortcuts);
    }

    function renderPageNavigationShortcuts(settings) {
        var $shortcutsTable =  $navigatePageSection.find("table");

        renderShortcutsInSectionTable(settings.pageNavigationShortcuts, $shortcutsTable, "Navigate Page");
        renderShortcutsInSectionTable(settings.elementNavigationShortcuts, $shortcutsTable, "Navigate Page Elements");

        appendSpecialCases(settings, $navigatePageSection);
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
            hasAtleastOneImportantShortcut = false,
            $subSectionTitle;

        if (subSectionTitle) {
            $subSectionTitle = $("<tr><td colspan='2'></td></tr>");
            $subSectionTitle
                .addClass(class_subsectionTitle)
                .addClass(rowClass)
                .find("td").text(subSectionTitle);
            $shortcutsTable.append($subSectionTitle);
        }

        if ($shortcutsTable.find("tr").length !== 1) {
            $subSectionTitle.addClass("separator-row");
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
                    kbdShortcutsHtml += "<span class=key-text>"+ kbdShortcuts[i].toLowerCase() + "</span>";
                    if (i !== kbdShortcuts.length -1) {
                        kbdShortcutsHtml+= keysSeparatorHtml;
                    }
                }

                var shortcutDesc = value.descr || value.description || value.name || key; // properties description and
                // name used by chrome.commands. descr and key are applicable for all the other settings defined
                // in the project.

                var row = $("<tr></tr>")
                            .appendTo($shortcutsTable)
                            .attr("id", key)
                            .addClass(rowClass)
                            .append($("<td class= key></td>").html(kbdShortcutsHtml))
                            .append($("<td class = action></td>").text(shortcutDesc));

                if (value.importanceHigh) {
                    row.addClass(class_importanceHigh);
                    hasAtleastOneImportantShortcut = true;
                }

                hasAtLeastOneShortcut = true;
            }
        });

        if (hasAtLeastOneShortcut) {
            $shortcutsTable.find("tr:last-child").addClass(class_subsectionEnd);

            if (hasAtleastOneImportantShortcut) {
                $subSectionTitle.addClass(class_importanceHigh);
            }
        }
        else {
            $subSectionTitle && $subSectionTitle.remove();
        }
    }

    function appendSpecialCases(settings, $miscShortcutsSection) {
        var pageNavigationShortcuts = settings.pageNavigationShortcuts,
            CUsShortcuts_Default = settings.CUsShortcuts,
            nextCUShortcuts = CUsShortcuts_Default.nextCU.kbdShortcuts,
            prevCUShortcuts = CUsShortcuts_Default.prevCU.kbdShortcuts,
            scrollDownShortcuts = pageNavigationShortcuts.scrollDown.kbdShortcuts,
            scrollUpShortcuts = pageNavigationShortcuts.scrollUp.kbdShortcuts,
            $scrollDownShortcuts = $miscShortcutsSection.find("#scrollDown td.key"),
            $scrollUpShortcuts =  $miscShortcutsSection.find("#scrollUp td.key");

        var additionalShortcuts,
            i;

        // Append NextCU shortcuts to scrollDown shortcuts
        if (scrollDownShortcuts.length) {
            $scrollDownShortcuts.append(keysSeparatorHtml);
        }

        additionalShortcuts = "";
        for (i = 0; i < nextCUShortcuts.length; i++) {
            additionalShortcuts += "<span class=key-text>"+ nextCUShortcuts[i] + "</span>" + "*" ;
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
            additionalShortcuts += "<span class=key-text>"+ prevCUShortcuts[i] + "</span>" + "*";
            if (i !== prevCUShortcuts.length - 1) {
                additionalShortcuts+= keysSeparatorHtml;
            }
        }
        additionalShortcuts && $scrollUpShortcuts.append(additionalShortcuts);
    }

    function showOrHideCUShortcuts_onSetup(data) {
        var sectionDisabledClass = "disabled",
            $noCUsMessage = $("<span class='section-message'> No content units setup for this page</span>"),
            $CUsShortcuts = $CUShortcutsSection.find("tbody");

        areCUsSpecifiedForPage = data.value;
        // If the page does not have CUs specified, then hide the shortcuts and show a message.
        if (!areCUsSpecifiedForPage) {

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

    function onMenuClick(event) {
        var optionId = event.target.id;

        $filterMenu.find("li").removeClass("menu-selected");
        $("#" + optionId).addClass("menu-selected");

        menuHandlers[optionId] && menuHandlers[optionId]();

        // When filtering is applied, add class "first-visible-row" to the first visible row of each table. We use this
        // for alignment in CSS.

        var class_firstVisible = "first-visible-row";
        $(".section table").each(function(index, table) {

            $(table).find("tr").removeClass(class_firstVisible)
                .filter(":visible").eq(0).addClass(class_firstVisible);
        });
    }

    function showAllShortcuts() {
        $CUShortcutsSection.show();
        $miscShortcutsSection.show();
        $navigatePageSection.show();
        $footerMessage.show();

        $("tr").show(); // show all keyboard shortcuts

        $("#filter-message").hide();
    }

    function showMostImportantShortcuts() {
        showAllShortcuts();
        $("tr:not(.importance-high)").hide();
        showFilterMessage("Here's a list of the main shortcuts to help you get started. Remember: j, k, o and enter are your best friends.");

        $footerMessage.show();

    }

    function showCUBasedShortcuts() {
        showAllShortcuts();

        $miscShortcutsSection.hide();
        $navigatePageSection.hide();

        $CUShortcutsSection.show();

        showFilterMessage("These shortcuts are relevant only when Content Units (CUs) are present on a page. Also, some of them " +
            "would apply only for the <i>selected</i> CU.");
        $footerMessage.hide();
    }

    function showPageSpecificShortcuts() {
        showAllShortcuts();
        $("tr:not(.page-specific)").hide();

        showFilterMessage("These shortcuts are specific to the page or website that you are currently on: ");

        $footerMessage.hide();
    }

    function showFilterMessage(message) {
        $("#filter-message").html(message).show();
    }

    setup();

})();
