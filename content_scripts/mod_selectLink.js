_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_basicPageUtils, mod_keyboardLib, mod_mutationObserver, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });


    var $document = $(document),
        timeout_typing,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        suppressEvent = mod_contentHelper.suppressEvent,
        lastSearchText_lowerCase,
        matchingLink_class = 'UnitsProj-matchingLink',
        elementStyledAsActive;

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

//        $document.on('mouseover', 'a', function() {console.log(this.innerText);});

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $textBox[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown, true);
        $textBox.on('input', onInput);
        $closeButton.on('click', closeUI);

        mod_keyboardLib.bind(['f f', 'f l'], showUI);
    }

    function onInput() {
        // to allow search-as-you-type, while not executing the filtering related code till there is a brief pause in the typing
        clearTimeout(timeout_typing); // clears timeout if it is set
        timeout_typing = setTimeout (findMatchingLinks_ifRequired, 400);
    }

    function findMatchingLinks_ifRequired() {
//        clearTimeout(timeout_typing); // clears timeout if it is set
//        var searchText_lowerCase = getSearchText_lowerCase();
//        if (lastSearchText_lowerCase !== searchText_lowerCase) {
//            lastSearchText_lowerCase = searchText_lowerCase;
//
//
//        }

        var searchText_lowerCase = getSearchText_lowerCase();
        if (!searchText_lowerCase) {
            endMatching();
            return;
        }

        var $all = $document.find('a');
        $all.removeClass(matchingLink_class);
        var $matching = $all.filter(function doesLinkMatch() {
            // `this` points to the dom element
            var text_lowerCase = this.innerText.toLowerCase();
            if (text_lowerCase.indexOf(searchText_lowerCase) >= 0) {
                return true;
            }
        });

        if ($matching.length) {
            $matching.addClass(matchingLink_class);
            elementStyledAsActive = $matching[0];
            mod_basicPageUtils.styleActiveElement(elementStyledAsActive);
        }

    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_typing); // clears timeout if it is set
        $textBox.val('').blur();
        $UIContainer.hide();
        endMatching();
        disabledByMe && mod_mutationObserver.enable();
    }

    function showUI() {
        $UIContainer.show();
        $textBox.focus();
    }

    function endMatching() {
        $('.' + matchingLink_class).removeClass(matchingLink_class);
        elementStyledAsActive && elementStyledAsActive.focus();
        elementStyledAsActive = null;
    }

    function onKeydown(e) {
        var code = e.which;
        // 17 - ctrl, 18 - alt, 91 & 93 - meta/cmd/windows
        if (e.target === $textBox[0] && [17, 18, 91, 93].indexOf(code) == -1) {

            if (code === 27) { // Esc
                suppressEvent(e);
                closeUI();
            }
            else  if (code === 13) { // Enter
                suppressEvent(e);
                findMatchingLinks_ifRequired();
            }
            else if (code === 9) { // Tab
//                suppressEvent(e);
//                triggerFilteringIfRequired();
//                thisModule.trigger('tab-on-filterUI');
            }
        }
    }

    function getSearchText_lowerCase() {
        return $textBox.val().toLowerCase();
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_mutationObserver, _u.CONSTS);

