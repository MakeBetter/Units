_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_commonHelper,
                              mod_basicPageUtils, mod_keyboardLib, mod_context,
                              mod_mutationObserver, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document),
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        class_hint = 'UnitsProj-hintLabel',                     // class for all hint labels
        suppressEvent = mod_contentHelper.suppressEvent,
        matchingLink_class = 'UnitsProj-matchingLink',
        elementStyledAsActive,
        $currentMatches = $(),   // the set of elements in the viewport that match the main textbox input
        $assignedHints = $(),
        timeout_findMatches_mainInput,
        maxDelay_mainInputMatching = 200,
        class_noMatch = 'UnitsProj-selectLink-noMatch',
        isHelpVisible = false,
        timeout_viewportChange = false,
        $elemsInViewport,   // elements currently in the viewport (excluding elements that are belong to this extension)

        // This number only needs to be a sufficiently high enough to accommodate all the  links in the *viewport*
        // In case a webpage's has more links than this in the current viewport, links beyond this number should simply
        // be unreachable using hints, but the code should not break.
        // (Note: as a rule of thumb, a good webpage shouldn't have more than have more than 100 odd links. This does
        // not include infinitely scrollable feeds etc, but we can ignore those since we are only interested in the
        // maximum number of links that could be present in a given *viewport*.
        num_hintsToGenerate = 500;

    var reducedSet = "jfkdhglsurieytnvmbc",
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase(); //
    
    var hintsArr = [];

    var $textBox_main = $('<input type = "text">')
        .attr('id', 'UnitsProj-selectLink-textBox_main')
        .addClass("UnitsProj-selectLink-textBox")
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj)
        .attr('placeholder', "Enter some of link/button's text");

    var $textBox_hint = $('<input type = "text">')
        .attr('id', 'UnitsProj-selectLink-textBox_hint')
        .addClass("UnitsProj-selectLink-textBox")
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj)
        .attr('placeholder', "Hint text");

    var $countLabel = $('<span></span>').addClass('countLabel');    // this will contain a label like "4 of 20"

    var $textBoxContainer = $('<div></div>')
        .attr("id", "UnitsProj-selectLink-textBoxContainer")
        .append($textBox_main)
        .append($textBox_hint)
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

    // The hints container element is used to group the all the hint label spans
    // under a common element. It (a non-positioned element) is appended directly
    // to the $topLevelContainer (also a non-positioned element) so that its contents
    // can be positioned relative to the document, using "absolute" positioning
    var $hintsContainer = $("<div></div>")
        .addClass('UnitsProj-hintsContainer')
        .hide()
        .appendTo(_u.$topLevelContainer);

    var hintElements = [];  // array of hint spans (dom elements)

    function reset() {
        closeUI();
    }

    function setup(settings) {
        reset();

        hintsArr = generateHints(num_hintsToGenerate, hintCharsStr);
        generateHintLabels();

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $textBox_main[0]) for
        // the same reason. [This binding gets priority based on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_handleEsc, true);
        $textBox_main.on('input', onMainInput);
        $textBox_hint.on('input', onHintInput);
        $closeButton.on('click', closeUI);
        setup_focusRelatedEvents();

        var selectLinkShortcuts = settings.selectLinkShortcuts,
            miscShortcuts = settings.miscShortcuts;
        mod_keyboardLib.bind(miscShortcuts.showSelectLinkUI.kbdShortcuts, showUI);
        mod_keyboardLib.bind(selectLinkShortcuts.selectNextMatchedLink.kbdShortcuts, selectNext, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(selectLinkShortcuts.selectPrevMatchedLink.kbdShortcuts, selectPrev, {selectLinkUIActive: true}, true);

        mod_keyboardLib.bind(selectLinkShortcuts.openSelectedLink.kbdShortcuts, openSelectedLink, {selectLinkUIActive: true}, true);
        mod_keyboardLib.bind(selectLinkShortcuts.openSelectedLinkInNewTab.kbdShortcuts, openSelectedLink_newTab, {selectLinkUIActive: true}, true);

        $helpBtn.click(toggleHelpUI);
        $helpUI.text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum (end)");
    }

    
    function onFocus_hintTextBox() {
        resetHintTextBox();
        assignHints_to_currentMatches();
    }

    function onBlur_hintTextBox() {
        resetHintTextBox();
        removeAssignedHints();
    }
    
    function resetHintTextBox() {
        $hintsContainer.val('');
        $textBox_hint.removeClass(class_noMatch);
    }

    function setup_focusRelatedEvents() {
        $textBox_main.on('focusout', onFocusOut_textboxes); // we use focusout instead of blur since it supports e.relatedTarget
        $textBox_hint.on('focusout', onFocusOut_textboxes);

        $textBox_hint.on('focus', onFocus_hintTextBox);
        $textBox_hint.on('blur', onBlur_hintTextBox);
    }

    function remove_focusRelatedEvents() {
        $textBox_main.off('focusout', onFocusOut_textboxes);
        $textBox_hint.off('focusout', onFocusOut_textboxes);

        $textBox_hint.off('focus', onFocus_hintTextBox);
        $textBox_hint.off('blur', onBlur_hintTextBox);
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
        if ($currentMatches.length) {
            var index = $currentMatches.index(elementStyledAsActive);
            if (!elementStyledAsActive || index === -1) {
                index = 0;
                return;
            }

            if (direction === 'n') {
                ++index;
                if (index >= $currentMatches.length) {
                    index = 0;
                }
            }
            else if (direction === 'p') {
                --index;
                if (index < 0) {
                    index = $currentMatches.length - 1;
                }
            }
            styleAsActive($currentMatches[index], index);
        }
    }

    // returns all link elements + other input-type elements
    function $getAllLinkLikeElems() {
        return $document.find('a, input, button, select');
    }

    function getElementText_all(el) {
        return (el.innerText? el.innerText: "")  + " " + (el.value? el.value: "") + " " + (el.placeholder? el.placeholder: "");
    }

    function findMatches_mainInput() {
        clearTimeout(timeout_findMatches_mainInput);
        timeout_findMatches_mainInput = false;    // reset

        $currentMatches.removeClass(matchingLink_class);
        removeActiveElementStyling();
        $textBox_main.removeClass(class_noMatch);
        $textBox_hint.removeClass(class_noMatch);

        var mainInput_lowerCase = getMainInput_lowerCase();

        if (!mainInput_lowerCase) {
            $currentMatches = $(); // TODO: handle this differently as a special case for when typing on hint input
            return;
        }

        $currentMatches = $elemsInViewport.filter(function() {
            var text_lowerCase = getElementText_all(this).toLowerCase();
            if (fuzzyMatch(text_lowerCase, mainInput_lowerCase)) {
                return true;
            }
        });

        if ($currentMatches.length) {
            $currentMatches.addClass(matchingLink_class);

            styleAsActive($currentMatches[0], 0);
        }
        else {
            $textBox_main.addClass(class_noMatch);
        }
    }

    // to allow search-as-you-type, while executing the findMatchingLinks code only periodically even if the user
    // keeps typing continuously
    function onMainInput() {
        // compare explicitly with false, which is how we reset it
        if (timeout_findMatches_mainInput === false) {
            timeout_findMatches_mainInput = setTimeout(findMatches_mainInput, maxDelay_mainInputMatching);
        }
    }

    function onHintInput() {
       
        if (!$currentMatches.length) {
            $textBox_hint.val(''); // don't accept input
            $textBox_hint.addClass(class_noMatch);
        }
        var hintInput_upperCase = getHintInput_upperCase();

        if (!hintInput_upperCase) {
            return;
        }

        var elemWithExactMatch = null,
            $matching_partialOrExact;

        $matching_partialOrExact = $currentMatches.filter(function () {
            var elemHint_upperCase = (this.dataset.unitsHintLabel).toUpperCase();
            if (elemHint_upperCase.substring(0, hintInput_upperCase.length) === hintInput_upperCase) {
                if (!elemWithExactMatch && elemHint_upperCase === hintInput_upperCase) {
                    elemWithExactMatch = this;
                }
                return true;
            }
        });

        if ($matching_partialOrExact.length) {
            elemWithExactMatch && styleAsActive(elemWithExactMatch);
            $textBox_hint.removeClass(class_noMatch);
        }
        else {
            removeActiveElementStyling();
            $textBox_hint.addClass(class_noMatch);
        }
    }

    // From among the set of elements specified ($set), this returns the first element
    // in the viewport. If none is found to be in the viewport, returns the first element.
    // The return value is an object of the format:
    // {
    //      element: <element>,         // DOM element
    //      index: <indexInArray>,      // 0 based index in $set
    // }
//    function getElementToFocusInfo($set) {
//        var len = $set.length;
//        for (var i = 0; i < len; i++) {
//            var elem = $set[i];
//            if (isAnyPartOfElementInViewport(elem)) {
//                return {element: elem, index: i};
//            }
//        }
//        return {element: $set[0], index: 0};
//    }

    // Styles the specified element as active (while the actual focus continues to
    // remain on the select-link-textbox).
    // 2) Briefly sets actual focus to the specified element, before reverting it, in
    // order to get the element in the viewport if it isn't already
    /**
     * 1) Styles the specified element as active (while the actual focus continues to
     * remain on the selectLinkUI).
     * 2) Briefly sets actual focus to the specified element, before reverting it, in
     * order to get the element in the viewport if it isn't already
     * 3) Updates count label indicating which element is selected
     * @param el
     * @param [index] optional - index of el in $currentMatches (if not specified,
     * this will be calculated. If it is known, passing it is useful to avoid the
     * needless computation)
     */
    function styleAsActive(el, index) {
        removeActiveElementStyling();
        elementStyledAsActive = el;
        var saved = document.activeElement;
        remove_focusRelatedEvents();    // temporarily remove event binding
        el.focus();
        saved.focus();
        setup_focusRelatedEvents();     // revent event binding
        mod_basicPageUtils.styleActiveElement(el);
        if (index === undefined) {
            index = $currentMatches.index(el);
        }
        $countLabel[0].innerText = (index + 1) + " of " + $currentMatches.length;
    }

    function onFocusOut_textboxes(e) {
        if ($UIContainer.find(e.relatedTarget).length === 0) {
            closeUI();
        }
    }

    function closeUI() {

        var disabledByMe = mod_mutationObserver.disable();
        clearTimeout(timeout_findMatches_mainInput);
        timeout_findMatches_mainInput = false;    // reset

        clearTimeout(timeout_viewportChange);
        timeout_viewportChange = false;    // reset
        
        // blur (if not already blurred - to prevent infinite recursion)
        if (document.activeElement === $textBox_main[0])
            $textBox_main.blur();

        $textBox_main.val('');
        removeActiveElementStyling();
        $textBox_main.removeClass(class_noMatch);
        hideHelpUI();
        $UIContainer.hide();
        endMatching();
        mod_context.set_selectLinkUI_state(false);
        removeEvent_onViewportChange();
        $hintsContainer.hide();
        removeAssignedHints();
        disabledByMe && mod_mutationObserver.enable();
    }

    function showUI() {
        $UIContainer.show();
        $textBox_main.focus();
        mod_context.set_selectLinkUI_state(true);

        // This global variable is calculated and cached when the UI is invoked (and updated whenever the viewport changes)
        // Given that new links might dynamically get added to the viewport, ideally we should recalculate this variable
        // each time we use it. However, the current strategy is more performant (and given how short-lived this UI is
        // we can ignore the effect of new links getting added etc)
        $elemsInViewport = $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });
        setupEvent_onViewportChange();
    }

    function onKeyDown_spaceOrShift() {
        $textBox_hint.focus();
    }

    function removeAssignedHints() {
        $assignedHints.hide();
        $assignedHints = $();
    }

    // Assigns hints to `$currentMatches` (and undoes any previous assignment)
    function assignHints_to_currentMatches() {
        $hintsContainer.hide();
        removeAssignedHints();

        findMatches_mainInput(); // first call this (in case it is pending based on a timeout etc)

        $assignedHints = $();
        // If the current viewport has more (matching) links than `num_hintsToGenerate` (or technically
        // `hintElements.length` which can be a bit larger), we will ignore links beyond that count (for now).
        var len = Math.min($currentMatches.length, hintElements.length);
        for (var i = 0; i < len; i++) {
            var el = $currentMatches[i];
            var hintLabel = hintElements[i];
            $assignedHints.add(hintLabel);

            el.setAttribute('data-units-hint-label', hintLabel.innerText);
            var offset = mod_commonHelper.getOffsetPosition(el);
            hintLabel.style.top = offset.top + "px";
            hintLabel.style.left = offset.left + "px";
        }
        $assignedHints.show();
        $hintsContainer.show();
    }

    // returns (at least) 'n'  unique hints based on 'hintCharsStr'
    function generateHints(n, hintCharsStr) {
        var hintCharsArr = hintCharsStr.split(''),
            len_hintChars = hintCharsArr.length,
            hintsArray = [],
            lastSet = [''],
            currentSet,
            count = -1;

        while(true) {
            currentSet = [];
            var innerCount = -1;
            for (var i = 0; i < len_hintChars; i++) {
                var len_lastSet = lastSet.length;
                for (var j = 0; j < len_lastSet; j++) {
                    currentSet[++innerCount] = hintsArray[++count] = hintCharsArr[i] + lastSet[j];
                }
                // this check is made outside the inner loop to avoid unnecessary checks at each
                // inner iteration, since some extra hints getting generated won't hurt anyway.
                if(count >= n) {
                    return hintsArray;
                }
            }
            lastSet = currentSet;
        }
    }

    function generateHintLabels() {
        $hintsContainer.empty();
        hintElements = [];
        var len = hintsArr.length;
        for (var i = 0; i < len; i++) {
            var hintElement = document.createElement('span');
            hintElement.innerText = hintsArr[i];
            hintElement.classList.add(class_hint);
            hintElements[i] = (hintElement);
        }
        $hintsContainer.append(hintElements);
    }
    
    function removeActiveElementStyling() {
        if (elementStyledAsActive) {
            mod_basicPageUtils.removeActiveElementStyle(elementStyledAsActive);
            elementStyledAsActive = null;
        }
        $countLabel[0].innerText = "";
    }

    function endMatching() {
        $currentMatches.removeClass(matchingLink_class);
        $currentMatches = $();
        var temp = elementStyledAsActive; // save before making the function call below
        removeActiveElementStyling();
        temp && temp.focus();
    }

    function onKeydown_handleEsc(e) {
        var code = e.which;
        // 17 - ctrl, 18 - alt, 91 & 93 - meta/cmd/windows
        if (e.target === $textBox_main[0] && [17, 18, 91, 93].indexOf(code) == -1) {

            if (code === 27) { // Esc
                suppressEvent(e);
                closeUI();
            }
        }
    }

    function getMainInput_lowerCase() {
        return $textBox_main.val().toLowerCase();
    }

    function getHintInput_upperCase() {
        return $textBox_hint.val().toUpperCase();
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

    function setupEvent_onViewportChange() {
        $(window).on('resize scroll', onViewportChange);
    }

    function removeEvent_onViewportChange() {
        $(window).off('resize scroll', onViewportChange);
    }

    function onViewportChange() {
        if (timeout_viewportChange === false) {
            timeout_viewportChange = setTimeout(function() {
                clearTimeout(timeout_viewportChange);
                timeout_viewportChange = false;

                $elemsInViewport = $getAllLinkLikeElems().filter(function() {
                    return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
                });

                findMatches_mainInput();
                if (document.activeElement === $textBox_hint[0]) {
                    assignHints($currentMatches);
                }
            }, 250);
        }
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
        $textBox_main.focus();
    }

    function showHelpUI() {
        isHelpVisible = true;
        $helpUI.show();
        $textBox_main.focus();
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_commonHelper,
        _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_context,
        _u.mod_mutationObserver, _u.CONSTS);

