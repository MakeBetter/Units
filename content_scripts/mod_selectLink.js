_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_basicPageUtils, mod_keyboardLib, mod_context,
                              mod_mutationObserver, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document),
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        suppressEvent = mod_contentHelper.suppressEvent,
        matchingLink_class = 'UnitsProj-matchingLink',
        elementStyledAsActive,
        $empty = $(),   // saved reference
        $matching = $empty,

        timeout_findMatchingLinks,
        maxDelay_findMatchingLinks = 333,
        class_noMatch = 'UnitsProj-selectLink-noMatch',
        isHelpVisible = false;

    var $textBox =  $('<input type = "text">')
        .attr("id", "UnitsProj-selectLink-textBox")
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj)
        .attr('placeholder', "Click '?' to see usage...");

    var $countLabel = $('<span></span>').addClass('countLabel');    // this will contain a label like "4 of 20"

    var $textBoxContainer = $('<div></div>')
        .attr("id", "UnitsProj-selectLink-textBoxContainer")
        .append($textBox)
        .append($countLabel);

    var $helpBtn = $('<span>?</span>')
        .attr('id', 'UnitsProj-selectLink-helpButton')
        .attr('tabindex', 0);   // so that it can receive focus on click (see onTextBoxFocusOut())

    var $closeButton = $('<span>&times;</span>') // &times; is the multiplication symbol
        .addClass("UnitsProj-close-button")
        .addClass(class_addedByUnitsProj);

    var $helpUI = $('<div></div>')
        .addClass('UnitsProj-selectLink-helpUI')
        .hide();

    var $UIContainer = $('<div></div>')
        .attr("id", "UnitsProj-selectLink-UIContainer")
        .addClass(class_addedByUnitsProj)
        .append($helpUI)
        .append($textBoxContainer)
        .append($helpBtn)
        .append($closeButton)
        .hide()     // to prevent from appearing when the page loads
        .appendTo(_u.$topLevelContainer);

    function reset() {
        timeout_findMatchingLinks = false;
        closeUI();
    }
    
    function setup(settings) {
        reset();
        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $textBox[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_handleEsc, true);
        $textBox.on('input', onInput);
        $closeButton.on('click', closeUI);
        $textBox.on('focusout', onTextBoxFocusOut); // we use focusout instead of blur since it supports e.relatedTarget

        var generalShortcuts = settings.generalShortcuts;
        mod_keyboardLib.bind(generalShortcuts.showSelectLinkUI.kbdShortcuts, showUI);
        mod_keyboardLib.bind(generalShortcuts.selectNextMatchedLink.kbdShortcuts, selectNext, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(generalShortcuts.selectPrevMatchedLink.kbdShortcuts, selectPrev, {selectLinkUIActive: true}, true);

        mod_keyboardLib.bind(generalShortcuts.openSelectedLink.kbdShortcuts, openSelectedLink, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(generalShortcuts.openSelectedLinkInNewTab.kbdShortcuts, openSelectedLink_newTab, {selectLinkUIActive: true}, true);

        $helpBtn.click(toggleHelpUI);
        $helpUI.text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum (end)");
    }

    // to allow search-as-you-type, while executing the findMatchingLinks code only periodically even if the user
    // keeps typing continuously 
    function onInput() {
        // compare explicitly with false, which is how we reset it
        if (timeout_findMatchingLinks === false) {
            timeout_findMatchingLinks = setTimeout(findMatchingLinks, maxDelay_findMatchingLinks);
        }
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
     * Selects the next/previous matching link
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
            setFakeFocus($matching[index]);
            $countLabel[0].innerText = (index + 1) + " of " + $matching.length;
        }
    }

    function findMatchingLinks() {
        clearTimeout(timeout_findMatchingLinks);
        timeout_findMatchingLinks = false;    // reset
       
        $matching.removeClass(matchingLink_class);
        removeActiveElementStyling();

        var searchText_lowerCase = getSearchText_lowerCase();
        if (!searchText_lowerCase) {
            $countLabel[0].innerText = "";
            $textBox.removeClass(class_noMatch);
            return;
        }

        var $all = $document.find('a, input, button');
        $matching = $all.filter(function doesLinkMatch() {
            if (isAnyPartOfElementInViewport(this)) {
                var text_lowerCase = (this.innerText + " " + this.value + " " + this.placeholder).toLowerCase();
//            if (text_lowerCase.indexOf(searchText_lowerCase) >= 0) {
                if (fuzzyMatch(text_lowerCase, searchText_lowerCase)) {
                    return true;
                }
            }
        });

        if ($matching.length) {
            $matching.addClass(matchingLink_class);
            setFakeFocus($matching[0]);
            $countLabel[0].innerText = "1 of " + $matching.length;
            $textBox.removeClass(class_noMatch);
        }
        else {
            $countLabel[0].innerText = "0 of 0";
            $textBox.addClass(class_noMatch);
        }
    }

    // From among the set of elements specified ($set), this returns the first element
    // in the viewport. If none is found to be in the viewport, returns the first element.
    // The return value is an object of the format:
    // {
    //      element: <element>,         // DOM element
    //      index: <indexInArray>,      // 0 based index in $set
    // }
//    function getElementToFocuInfo($set) {
//        var len = $set.length;
//        for (var i = 0; i < len; i++) {
//            var elem = $set[i];
//            if (isAnyPartOfElementInViewport(elem)) {
//                return {element: elem, index: i};
//            }
//        }
//        return {element: $set[0], index: 0};
//    }

    // 1) Styles the specified element as active (while the actual focus continues to
    // remain on the select-link-textbox).
    // 2) Briefly sets actual focus to the specified element, before reverting it, in
    // order to get the element in the viewport if it isn't already
    function setFakeFocus(el) {
        removeActiveElementStyling();
        elementStyledAsActive = el;
        var saved = document.activeElement;
        $textBox.off('focusout', onTextBoxFocusOut);      // remove event handler
        el.focus();
        saved.focus();
        $textBox.on('focusout', onTextBoxFocusOut); // restore event handler ('focusout' is used since it supports e.relatedTarget)
        mod_basicPageUtils.styleActiveElement(el);
    }

    function onTextBoxFocusOut(e) {
        if ($UIContainer.find(e.relatedTarget).length === 0) {
            closeUI();
        }
    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_findMatchingLinks);
        timeout_findMatchingLinks = false;    // reset

        // blur (if not already blurred - to prevent infinite recursion)
        if (document.activeElement === $textBox[0])
            $textBox.blur();

        $textBox.val('');
        $countLabel[0].innerText = "";
        $textBox.removeClass(class_noMatch);
        hideHelpUI();
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
        // split around capital letters (useful for camel-case words, abbreviations etc)
        // and words separated by underscore
        // ('_'' considered a "word character")
        text = text.replace(/([A-Z]_)/g, ' $1');

        // splits the string on whitespace + each special character is included separately
        // e.g: "foo ba_r, foobar (bar)" => ["foo", "ba", "_", r", ",", "foobar", "(", "bar", ")"]
        // Instead of the regex /\w+|[^\w\s]/, we use the following one because we want
        // to also split the "_" character separately
        var tokens = text.match(/[A-Za-z0-9]+|[^A-Za-z0-9\s]/g) || [];

        // remove any whitespace from the input pattern (for now)
        pattern = pattern.replace(/\s+/g, '');
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

        return (top < (window.scrollY + window.innerHeight)) &&     // elTop < winBottom
            ((top + height) > window.scrollY) &&                    // elBottom > winTop
            (left < (window.scrollX + window.innerWidth)) &&        // elLeft < winRight
            ((left + width) > window.scrollX);                      // elRight > winLeft
    }

    function toggleHelpUI() {
        if (isHelpVisible) {
            hideHelpUI();
        }
        else {
            showHelpUI();
        }
    }

    function hideHelpUI() {
        isHelpVisible = false;
        $helpUI.hide();
        $textBox.focus();
    }

    function showHelpUI() {
        isHelpVisible = true;
        $helpUI.show();
        $textBox.focus();
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_context,
        _u.mod_mutationObserver, _u.CONSTS);

