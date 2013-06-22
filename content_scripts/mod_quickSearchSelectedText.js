/**
 * This module lets the user quickly invoke any search engine to search for the selected text on the page.
 * This is done by having the left mouse button held down while pressing the key identifying the search engine (e.g:
 * 'g' for 'google'). The behavior is designed such that the user can simply press a specific key before lifting
 * the mouse button after using it to make a selection.
 * The list of search engines and their associated keys is defined at `quickSearchSelectedText_data` (in settings)
 */
_u.mod_quickSearchSelectedText = (function($, mod_contentHelper, mod_domEvents){
    "use strict";

    var thisModule = {
        setup: setup
    };

    var isLeftMouseButtonDown = false,
        quickSearchSelectedText_data;

    function setup(settings) {
        quickSearchSelectedText_data = settings.quickSearchSelectedText_data;

        mod_domEvents.addEventListener(document, 'mousedown', onMouseDown, true);
        mod_domEvents.addEventListener(document, 'mouseup', onMouseUp, true);

        mod_domEvents.addEventListener(document, 'keydown', keyHandler, true);
        mod_domEvents.addEventListener(document, 'keypress', keyHandler, true);
        mod_domEvents.addEventListener(document, 'keyup', keyHandler, true);
    }

    function keyHandler(e) {
        if ((e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)) {
            return;
        }
        var selection;

        // If a kew is pressed while the left-mouse button is pressed down and some text is selected
        if (isLeftMouseButtonDown && (selection = document.getSelection().toString())) {

            if (e.type === 'keydown') {
                var code = e.which || e.keyCode,
                    searchKey = String.fromCharCode(code),
                    url;

                if (searchKey && (url = quickSearchSelectedText_data[searchKey.toLowerCase()])) {
                    url = url.replace("<<_serach_str_>>", selection);
                    chrome.runtime.sendMessage({message: "createTab", url: url});
                }
            }

            mod_contentHelper.suppressEvent(e); // for all types - keypress, keydown, keyup
        }
    }

    function onMouseDown(e) {
        if (!mod_contentHelper.isRtMouseButton(e)) {
            isLeftMouseButtonDown = true;
        }
    }

    function onMouseUp(e) {
        if (!mod_contentHelper.isRtMouseButton(e)) {
            isLeftMouseButtonDown = false;
        }
    }

    return thisModule;

})(jQuery, _u.mod_contentHelper, _u.mod_domEvents);