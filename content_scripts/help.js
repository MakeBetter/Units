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

function setupHelpUI() {

    var $heading = $("<div id='heading'><span>UnitsProj Shortcuts</span></div>");

//    var browserShortcuts = null;
    var pageShortcuts = urlData && urlData.page_shortcuts;
    var MUShortcuts = urlData && urlData.MU_shortcuts;

    var $pageShortcutsSection = $("<div></div>");
    var $MUShortcutsSection = $("<div></div>");
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

    if (MUShortcuts) {
        var $MUShortcutsTable = $("<table></table>").appendTo($MUShortcutsSection);
        $.each(MUShortcuts, function(key, value) {
            $("<tr></tr>")
                .appendTo($MUShortcutsTable)
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
        .append($MUShortcutsSection)
        .append($generalShortcutsSection);

}

function showHelp() {
    $helpContainer.show();
}

function hideHelp() {
    $helpContainer.hide();

}
