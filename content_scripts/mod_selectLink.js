_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_basicPageUtils, mod_keyboardLib, mod_context,
                              mod_mutationObserver, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });


    var $document = $(document),
        timeout_typing,
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        suppressEvent = mod_contentHelper.suppressEvent,
        matchingLink_class = 'UnitsProj-matchingLink',
        elementStyledAsActive,
        $empty = $(),   // saved reference
        $matching = $empty;

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
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_handleEsc, true);
        $textBox.on('input', onInput);
        $closeButton.on('click', closeUI);
        $textBox.on('blur', closeUI);

        var generalShortcuts = settings.generalShortcuts;
        mod_keyboardLib.bind(generalShortcuts.showSelectLinkUI.kbdShortcuts, showUI);
        mod_keyboardLib.bind(generalShortcuts.selectNextMatchedLink.kbdShortcuts, selectNext, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(generalShortcuts.selectPrevMatchedLink.kbdShortcuts, selectPrev, {selectLinkUIActive: true}, true);

        mod_keyboardLib.bind(generalShortcuts.openSelectedLink.kbdShortcuts, openSelectedLink, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(generalShortcuts.openSelectedLinkInNewTab.kbdShortcuts, openSelectedLink_newTab, {selectLinkUIActive: true}, true);
    }

    function onInput() {
        // to allow search-as-you-type, while not executing the filtering related code till there is a brief pause in the typing
        clearTimeout(timeout_typing); // clears timeout if it is set
        timeout_typing = setTimeout (findMatchingLinks, 300);
    }

    function selectNext() {
        select('n');
    }

    function selectPrev() {
        select('p');
    }

    function openSelectedLink() {
        mod_basicPageUtils.openLink(elementStyledAsActive);
    }
    function openSelectedLink_newTab() {
        mod_basicPageUtils.openLink(elementStyledAsActive, true);
    }

    /**
     *
     * @param direction 'n' for next; 'p' for previous
     */
    function select(direction) {
        if ($matching.length) {
            var index = $matching.index(elementStyledAsActive);
            if (!elementStyledAsActive || index === -1) {
                console.warn('selectLink: $matching has elements, but elementStyledAsActive not present in it');
                return;
            }

            if (direction === 'n') {
                ++index;
                if (index >= $matching.length) {
                    index = 0;
                }
            }
            else if (direction === 'p') {
                --index;
                if (index < 0) {
                    index = $matching.length - 1;
                }
            }
            styleElementAsActive($matching[index]);
        }
    }

    function findMatchingLinks() {
//        clearTimeout(timeout_typing); // clears timeout if it is set
//        var searchText_lowerCase = getSearchText_lowerCase();
//        if (lastSearchText_lowerCase !== searchText_lowerCase) {
//            lastSearchText_lowerCase = searchText_lowerCase;
//
//
//        }

        $matching.removeClass(matchingLink_class);
        removeActiveElementStyling();

        var searchText_lowerCase = getSearchText_lowerCase();
        if (!searchText_lowerCase) {
            return;
        }

        var $all = $document.find('a');
        $matching = $all.filter(function doesLinkMatch() {
            // `this` points to the dom element
            if (!isAnyPartOfElementInViewport(this)) {
                return false;
            }
            var text_lowerCase = this.innerText.toLowerCase();
//            if (text_lowerCase.indexOf(searchText_lowerCase) >= 0) {
            if (fuzzyMatch(text_lowerCase, searchText_lowerCase)) {
                return true;
            }
        });

        if ($matching.length) {
            $matching.addClass(matchingLink_class);
            styleElementAsActive($matching[0]);
        }

    }

    function styleElementAsActive(el) {
        removeActiveElementStyling();
        elementStyledAsActive = el;
        mod_basicPageUtils.styleActiveElement(el);
    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_typing); // clears timeout if it is set

        // blur, if not already blurred (the check exists to prevent infinite recursion)
        if (document.activeElement === $textBox[0])
            $textBox.blur();

        $textBox.val('');

        $UIContainer.hide();
        endMatching();
        mod_context.set_selectLinkUI_state(false);
        disabledByMe && mod_mutationObserver.enable();
    }

    function showUI() {
        $UIContainer.show();
        $textBox.focus();
        mod_context.set_selectLinkUI_state(true);
    }

    function removeActiveElementStyling() {
        if (elementStyledAsActive) {
            mod_basicPageUtils.removeActiveElementStyle(elementStyledAsActive);
            elementStyledAsActive = null;
        }
    }

    function endMatching() {
        $matching.removeClass(matchingLink_class);
        $matching = $empty;
        var temp = elementStyledAsActive; // save before making the function call below
        removeActiveElementStyling();
        temp && temp.focus();
    }

    function onKeydown_handleEsc(e) {
        var code = e.which;
        // 17 - ctrl, 18 - alt, 91 & 93 - meta/cmd/windows
        if (e.target === $textBox[0] && [17, 18, 91, 93].indexOf(code) == -1) {

            if (code === 27) { // Esc
                suppressEvent(e);
                closeUI();
            }
        }
    }

    function getSearchText_lowerCase() {
        return $textBox.val().toLowerCase();
    }

    function fuzzyMatch(text, pattern) {
        // splits around non-word characters + underscore (which is considered a word character)
        var tokens = text.split(/[\W_]+/);
        // remove the same set from the pattern as well (for now)
        pattern.replace(/[\W_]/g, '');
        return doesPatternMatchTokens(pattern, tokens);
    }

    function doesPatternMatchTokens(pattern, tokens) {
        if (!pattern) {
            return true;
        }
        else if (!tokens.length) {
            return false;
        }
        var len = tokens.length,
            commonLen;
        for (var i = 0; i < len; i++) {
            var token = tokens[i];
            commonLen = getLongestCommonPrefixLength (token, pattern);
            if (commonLen) {
                if (doesPatternMatchTokens(pattern.substring(commonLen), tokens.slice(i+1))) {
                    return true;
                }
            }
        }
        return false;
    }

    // get the length of the longest substring that occurs at the beginning of both the strings
    // e.g: for "foo" and "foobar" it returns 3, for "foo" and "bar" it returns 0
    function getLongestCommonPrefixLength(str1, str2) {
        var smallerLen = Math.min(str1.length, str2.length);
        for (var i = 0; i < smallerLen; i++) {
            if (str1[i] !== str2[i]) {
                return i;
            }
        }
        return smallerLen;
    }

    function isAnyPartOfElementInViewport(el) {
        var top = el.offsetTop;
        var left = el.offsetLeft;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        // get top and left values relative to the document by traversing up the offsetParent chain
        while(el.offsetParent) {
            el = el.offsetParent;
            top += el.offsetTop;
            left += el.offsetLeft;
        }

        return  top < (window.scrollY + window.innerHeight) &&  // elTop < winBottom
            (top + height) > window.scrollY &&                  // elBottom > winTop
            left < (window.scrollX + window.innerWidth) &&      // elLeft < winRight
            (left + width) > window.scrollX;                    // elRight > winLeft
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_context,
        _u.mod_mutationObserver, _u.CONSTS);

