_u.mod_selectLink = (function($, mod_keyboardLib, mod_mutationObserver, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document),
        timeout_typing,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj;

    var $textBox =  $('<input id = "UnitsProj-selectLink-textBox" type = "text">')
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj);

    var $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
        .addClass("UnitsProj-close-button")
        .addClass(class_addedByUnitsProj);

    var $UIContainer = $('<div id = "UnitsProj-selectLink-container">')
        .addClass(class_addedByUnitsProj)
        .append($textBox)
        .append($closeButton)
        .hide()     // to prevent from appearing when the page loads
        .appendTo(_u.$topLevelContainer);

    function setup(settings) {
        $textBox.on('input', onInput);
        $closeButton.on('click', closeUI);

        mod_keyboardLib.bind(['e e'], showUI);
    }

    function onInput() {
        // to allow search-as-you-type, while not executing the filtering related code till there is a brief pause in the typing
        clearTimeout(timeout_typing); // clears timeout if it is set
        timeout_typing = setTimeout (findMatchingLinks, 400);
    }

    function findMatchingLinks() {

    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_typing); // clears timeout if it is set
        $textBox.val('').blur();
        $UIContainer.hide();
        //undoPrevFiltering();
        //lastFilterText_lowerCase = ""; // reset
        thisModule.trigger('filter-UI-close');
        disabledByMe && mod_mutationObserver.enable();
    }

    function showUI() {
        $UIContainer.show();
    }

    return thisModule;

})(jQuery, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.CONSTS);

