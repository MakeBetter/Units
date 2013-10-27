// This code runs in an iframe that is used to render the help UI on any website.
// Since this script is included at the end of the body, DOM is ready when we execute this script.

(function($) {
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

        $shortcutsContainer = $("#shortcuts-container"),
        $closeButton = $(".close"),
        $filterMenu = $("#filter-by"),
        $footerMessage = $("#footer-message"),
        $gettingStarted = $("#getting-started-content"),
        $faq = $('#faq-content'),
        $filterMessage = $("#filter-message"),
        $modalTitle = $(".modal-title");


    var areCUsSpecifiedForPage,
        menuHandlers = {
            "all" : showAllShortcuts,
            "most-important": showMostImportantShortcuts,
            "cu-based": showCUBasedShortcuts,
            "specific-to-page": showPageSpecificShortcuts,
            "getting-started": showGettingStartedSection,
            "faq": showFAQSection
        },

        class_pageSpecificShortcuts = "page-specific",
        class_importanceHigh = "importance-high",
        class_subsectionTitle = "subsection-title",
        class_subsectionEnd = "subsection-end",
        property_importanceHigh = "importanceHigh";

    // Setup event handlers
    function setup() {

        // Send message to content script, to check if CUs are specified for page. Show/Hide CUs based shortcuts based
        // on that.
        window.addEventListener('message', function(event) {
            var data = event.data;

            if (data.message === 'pageHasCUsSpecifier') {
                disableCUShortcutsIfUnavailable(data);
            }

            return false;

        }, false);


        // Close UI if close button is clicked on or if Esc is pressed.
        $closeButton.click(function() {
            close();
        });

        document.addEventListener("keydown", function(e) {
            var keyCode = e.which || e.keyCode;
            if (keyCode === 27) { // If Esc is pressed
                close();
            }
        });

        // Setup filter menu
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

        renderGettingStarted(settings);

        showMostImportantShortcuts();
    }

    function renderCUShortcuts(settings) {
        var CUsShortcuts_Default = settings.CUsShortcuts,
            expandedUrlData = settings.expandedUrlData,
            CUs_SUs = expandedUrlData && expandedUrlData.CUs_SUs,
            CUs_actions = expandedUrlData && expandedUrlData.CUs_actions,
            CUsShortcuts_URLBased = $.extend({}, CUs_SUs, CUs_actions);

        var $shortcutsTable = $CUShortcutsSection.find("table");

        addShortcutsSubsectionToParentTable(CUsShortcuts_Default, $shortcutsTable, "Unit based");
        addShortcutsSubsectionToParentTable(CUsShortcuts_URLBased, $shortcutsTable, "Unit based: for this page/site",class_pageSpecificShortcuts);
    }

    function renderMiscShortcuts(settings) {
        var miscShortcuts = settings.miscShortcuts,
            expandedUrlData = settings.expandedUrlData,
            globalShortcuts = settings.globalChromeCommands;

        // This is a special shortcut and is not part of defaultSettings.
        var selectAnyLinkShortcut = {
            selectAnyLink: {
                descr: "Select link(s) starting with that letter",
                kbdShortcuts: ["Space + letter"],
                importanceHigh: true
            }
        };

        // Using extend because we want selectAnyLink to be the first property in miscShortcuts.
        miscShortcuts = $.extend(selectAnyLinkShortcut, miscShortcuts);

        var page_SUs = expandedUrlData && expandedUrlData.page_SUs,
            page_actions = expandedUrlData && expandedUrlData.page_actions,
            page_allShortcuts = $.extend({}, page_SUs, page_actions);

        var $shortcutsTable = $miscShortcutsSection.find("table");

        $.each(globalShortcuts, function(key, shortcut) {
            shortcut[property_importanceHigh] = true;
        });

        addShortcutsSubsectionToParentTable(miscShortcuts, $shortcutsTable, "Miscellaneous");
        addShortcutsSubsectionToParentTable(globalShortcuts, $shortcutsTable, "Tab operations");
        addShortcutsSubsectionToParentTable(page_allShortcuts, $shortcutsTable, "Shortcuts for this page/site", class_pageSpecificShortcuts);
    }

    function renderPageNavigationShortcuts(settings) {
        var $shortcutsTable =  $navigatePageSection.find("table");

        var elementNavigationShortcuts = settings.elementNavigationShortcuts;
        var openShortcuts = elementNavigationShortcuts.open && elementNavigationShortcuts.open.kbdShortcuts;
        openShortcuts.unshift("enter");

        var openInNewTabShortcuts = elementNavigationShortcuts.openInNewTab && elementNavigationShortcuts.openInNewTab.kbdShortcuts;
        openInNewTabShortcuts.unshift("command + enter");

        addShortcutsSubsectionToParentTable(settings.pageNavigationShortcuts, $shortcutsTable, "Navigate Page");
        addShortcutsSubsectionToParentTable(settings.elementNavigationShortcuts, $shortcutsTable, "Navigate Page Elements");

        appendSpecialCases(settings, $navigatePageSection);
    }

    /**
     * Set up the Getting Started UI
     * @param settings
     */
    function renderGettingStarted(settings) {
        var nextTabShortcut, prevTabShortcut;

        for (var i = 0; i < settings.globalChromeCommands.length; i++) {
            var setting = settings.globalChromeCommands[i];
            if (setting.name === 'nextTab') {
                nextTabShortcut = setting.shortcut && setting.shortcut.toLowerCase();
            }
            else if (setting.name === 'prevTab') {
                prevTabShortcut = setting.shortcut && setting.shortcut.toLowerCase();
            }
        }

        $gettingStarted.find("#next-tab").text(nextTabShortcut);
        $gettingStarted.find("#prev-tab").text(prevTabShortcut);
    }

    /***
     * Append a subsection in the given $parentTable by rendering shortcuts in shortcutsObj. Add a title to this
     * subsection if specified as subsectionTitle.
     * @param shortcutsObj
     * @param $parentTable
     * @param [subSectionTitle]
     * @param [rowClass]
     */
    function addShortcutsSubsectionToParentTable(shortcutsObj, $parentTable, subSectionTitle, rowClass) {
        if (!shortcutsObj || !$parentTable) {
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
            $parentTable.append($subSectionTitle);
        }

        if ($parentTable.find("tr").length !== 1) {
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
                            .appendTo($parentTable)
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
            $parentTable.find("tr:last-child").addClass(class_subsectionEnd);

            if (hasAtleastOneImportantShortcut) {
                $subSectionTitle.addClass(class_importanceHigh);
            }
        }
        else {
            $subSectionTitle && $subSectionTitle.remove();
        }
    }

    /**
     * Append smartScrollDown shortcuts to scrollDown shortcuts in the Help UI. Similarly for Select CU Up, Left, Right
     * shortcuts.
     * @param settings
     * @param $miscShortcutsSection
     */
    function appendSpecialCases(settings, $miscShortcutsSection) {
        var pageNavigationShortcuts = settings.pageNavigationShortcuts,
            CUsShortcuts_Default = settings.CUsShortcuts,

            // Select CU shortcuts
            smartScrollDownShortcuts = CUsShortcuts_Default.smartScrollDown.kbdShortcuts,
            smartScrollUpShortcuts = CUsShortcuts_Default.smartScrollUp.kbdShortcuts,
            smartScrollRightShortcuts = CUsShortcuts_Default.smartScrollRight.kbdShortcuts,
            smartScrollLeftShortcuts = CUsShortcuts_Default.smartScrollLeft.kbdShortcuts,

            // Scroll shortcuts
            scrollDownShortcuts = pageNavigationShortcuts.scrollDown.kbdShortcuts,
            scrollUpShortcuts = pageNavigationShortcuts.scrollUp.kbdShortcuts,
            scrollRightShortcuts = pageNavigationShortcuts.scrollRight.kbdShortcuts,
            scrollLeftShortcuts = pageNavigationShortcuts.scrollLeft.kbdShortcuts,

            // Jquery element for where scroll shortcuts are rendered in Help UI
            $scrollDownShortcuts = $miscShortcutsSection.find("#scrollDown td.key"),
            $scrollUpShortcuts =  $miscShortcutsSection.find("#scrollUp td.key"),
            $scrollRightShortcuts =  $miscShortcutsSection.find("#scrollRight td.key"),
            $scrollLeftShortcuts =  $miscShortcutsSection.find("#scrollLeft td.key");


        var map = {
            up: [smartScrollUpShortcuts, scrollUpShortcuts, $scrollUpShortcuts],
            down: [smartScrollDownShortcuts, scrollDownShortcuts, $scrollDownShortcuts],
            right: [smartScrollRightShortcuts, scrollRightShortcuts, $scrollRightShortcuts],
            left: [smartScrollLeftShortcuts, scrollLeftShortcuts, $scrollLeftShortcuts]
        };

        // Append CU shortcuts to scroll shortcuts in the UI (for select CU up, down, right, left)
        for (var key in map) {
            var array = map[key],
                CUShortcuts = array[0],
                scrollShortcuts = array[1],
                $scrollShortcuts = array[2];

            if (scrollShortcuts.length) {
                $scrollShortcuts.append(keysSeparatorHtml);
            }

            var additionalShortcutsHtml = ""; // construct html based on CUShortcuts that will be appended to $scrollShortcuts
            for (var i = 0; i < CUShortcuts.length; i++) {
                additionalShortcutsHtml += "<span class=key-text>"+ CUShortcuts[i] + "* </span>";
                if (i !== CUShortcuts.length - 1) {
                    additionalShortcutsHtml+= keysSeparatorHtml;
                }
            }

            additionalShortcutsHtml && $scrollShortcuts.append(additionalShortcutsHtml);
        }
    }

    function disableCUShortcutsIfUnavailable(data) {
        var sectionDisabledClass = "disabled";

        areCUsSpecifiedForPage = data.value;
        // If the page does not have CUs specified, then gray out the CUs shortcuts section
        if (!areCUsSpecifiedForPage) {

            $CUShortcutsSection.addClass(sectionDisabledClass);
            return;
        }
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

    // The following functions starting with 'show' respond to navigation menu clicks. They are responsible for showing 
    // different Help UI views. 
    
    function showAllShortcuts() {
        resetUI();

        $CUShortcutsSection.show();
        $miscShortcutsSection.show();
        $navigatePageSection.show();
        $footerMessage.show();

        $("tr").show(); // show all keyboard shortcuts

        $filterMessage.hide();
    }

    function showMostImportantShortcuts() {
        showAllShortcuts();
        $("tr:not(.importance-high, .page-specific)").hide();
//        showFilterMessage("Here's a list of the main shortcuts to help you get started. Remember: j, k, o and enter are your best friends.");

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

    /**
     * Show message describing the filter applied to shortcuts.
     * @param message
     */
    function showFilterMessage(message) {
        $filterMessage
            .show()
            .find("span").html(message);
    }

    /**
     * Show the Getting Started UI (called when corresponding navigation tab clicked).
     */
    function showGettingStartedSection() {
        $shortcutsContainer.hide();
        $filterMessage.hide();
        $faq.hide();
        $modalTitle.text("Units: Getting Started");
        $gettingStarted.show();
    }

    function showFAQSection() {
        $shortcutsContainer.hide();
        $filterMessage.hide();
        $gettingStarted.hide();
        $faq.show();
        $modalTitle.text("Units: FAQs");
    }

    function resetUI() {
        $modalTitle.text("Units Shortcuts");

        $gettingStarted.hide();
        $faq.hide();
        $shortcutsContainer.show();
    }

    function close() {
        parent.postMessage({message: "hideHelpUI"}, "*");
    }

    setup();

})(jQuery);
