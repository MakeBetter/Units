function setupHelpUIAndEvents() {
    setupHelpUI();

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
//TODO: !!NOTE!! !!!!!@#@#@$#% When implementing the Help Page, remember to use the global object overriddenValuesFor_stdUrlDataItems !#$$$$$$$$$$$$$$

function setupHelpUI() {

    var $heading = $("<div id='heading'><span>UnitsProj Shortcuts</span></div>");

//    var browserShortcuts = null;
    var pageShortcuts = expandedUrlData && expandedUrlData.page_shortcuts;
    var CUShortcuts = expandedUrlData && expandedUrlData.CU_shortcuts;

    var $pageShortcutsSection = $("<div></div>");
    var $CUShortcutsSection = $("<div></div>");
    var $generalShortcutsSection = $("<div></div>");

    if (pageShortcuts) {
        var $pageShortcutsTable = $("<table></table>").appendTo($pageShortcutsSection);
        $.each(pageShortcuts, function(key, value) {
            $("<tr></tr>")
                .appendTo($pageShortcutsTable)
                .append($("<td></td>").text(value.keys.toString()))
                .append($("<td></td>").text(key));

        });
    }

    if (CUShortcuts) {
        var $CUShortcutsTable = $("<table></table>").appendTo($CUShortcutsSection);
        $.each(CUShortcuts, function(key, value) {
            $("<tr></tr>")
                .appendTo($CUShortcutsTable)
                .append($("<td></td>").text(value.keys.toString().replace(",", ", ")))
                .append($("<td></td>").text(key));

        });
    }
    if (generalShortcuts) {
        var $generalShortcutsTable = $("<table></table>").appendTo($generalShortcutsSection);
        $.each(generalShortcuts, function(key, value) {
            $("<tr></tr>")
                .appendTo($generalShortcutsTable)
                .append($("<td></td>").text(value.toString().replace(",", ",  ")))
                .append($("<td></td>").text(key));
        });
    }

    $helpContainer = $('<div id = "UnitsProj-help-container">')
        .addClass(class_addedByUnitsProjExtn)
        .hide()
        .appendTo($topLevelContainer)
        .append($heading)
        .append($pageShortcutsSection)
        .append($CUShortcutsSection)
        .append($generalShortcutsSection);

}

function showHelp() {
    $helpContainer.show();
}

function hideHelp() {
    $helpContainer.hide();

}
