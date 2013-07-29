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
        class_hintVisible = 'UnitsProj-hintLabel-visible',      // class applied to make a hint label visible
        matchingLink_class = 'UnitsProj-matchingLink',
        elementStyledAsActive,
        $elemsMatchingMainText = $(),   // the set of elements in the viewport that match the main textbox input
        $assignedHintsSpans = $(),
        timeout_findMatches_mainInput = false,
        maxDelay_mainInputMatching = 200,
        class_textBox_noMatch = 'UnitsProj-selectLink-textBox-noMatch',
        timeout_viewportChange = false,
        $elemsInViewport;   // elements currently in the viewport (excluding elements that are belong to this extension)

    // vars related to hint chars (TODO: decide which set to use based on user settings)
    var reducedSet = "jfkdhglsurieytnvmbc",
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase(); //

    var $textBox_main = $('<input type = "text">')
        .attr('id', 'UnitsProj-selectLink-textBox_main')
        .addClass("UnitsProj-selectLink-textBox")
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj)
        .attr('placeholder', "Enter text from link/button");

    var $textBox_hint = $('<input type = "text">')
        .attr('id', 'UnitsProj-selectLink-textBox_hint')
        .addClass("UnitsProj-selectLink-textBox")
        .addClass("UnitsProj-reset-text-input")
        .addClass(class_addedByUnitsProj)
        .attr('placeholder', "Hint text");

    var $countLabel = $('<span></span>').addClass('countLabel');    // this will contain a label like "4 of 20"

    // this container exists only to aid positioning the $countLabel within the textbox (using CSS stylesheet)
    var $textBoxMain_container = $('<div></div>')
        .attr("id", "UnitsProj-selectLink-textBoxContainer")
        .append($textBox_main)
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

    var $tip = $("<div class = 'UnitsProj-selectLinkTip'>Keep <span class = 'UnitsProj-selectLink-KeyName'>space</span> (or <span class = 'UnitsProj-selectLink-KeyName'>shift</span>&nbsp;) pressed down to type hint letters<div>");

    var $UIContainer = $('<div></div>')
        .attr("id", "UnitsProj-selectLink-UIContainer")
        .addClass(class_addedByUnitsProj)
        .append($helpUI)
        .append($textBoxMain_container)
        .append($textBox_hint)
        .append($helpBtn)
        .append($closeButton)
        .append($tip)
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

    // arrays of spans showing hints (dom elements)
    var hintSpans_singleDigit = [],  
        hintSpans_doubleDigit = [];
    
    function reset() {
        closeUI();
    }

    function setup(settings) {
        reset();

        generateHintSpansInDom();

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $textBox_main[0]
        // or $textBox_hint[0]) for the same reason. [This binding gets priority over the bindings of mod_CUsMgr based
        // on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_handleEsc, true);

        mod_domEvents.addEventListener(document, 'keydown', onKeyDown_spaceOrShift, true);
        mod_domEvents.addEventListener(document, 'keyup', onKeyUp_spaceOrShift, true);
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

        $helpBtn.click(onHelpButtonClick);
        $helpUI.text("Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum (end)");
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
        if ($elemsMatchingMainText.length) {
            var index = $elemsMatchingMainText.index(elementStyledAsActive);
            if (!elementStyledAsActive || index === -1) {
                index = 0;
                return;
            }

            if (direction === 'n') {
                ++index;
                if (index >= $elemsMatchingMainText.length) {
                    index = 0;
                }
            }
            else if (direction === 'p') {
                --index;
                if (index < 0) {
                    index = $elemsMatchingMainText.length - 1;
                }
            }
            styleAsActive($elemsMatchingMainText[index], index);
        }
    }

    // returns all link elements + other input-type elements
    function $getAllLinkLikeElems() {
        return $document.find('a, input, button, select');
    }

    function getElementText_all(el) {
        return (el.innerText? el.innerText: "")  + " " + (el.value? el.value: "") + " " + (el.placeholder? el.placeholder: "");
    }

    function resetMainTextMatching() {
        $elemsMatchingMainText.removeClass(matchingLink_class);
        $elemsMatchingMainText = $();
    }

    // to allow search-as-you-type, while executing the findMatchingLinks code only periodically even if the user
    // keeps typing continuously
    function onMainInput() {
        // compare explicitly with false, which is how we reset it
        if (timeout_findMatches_mainInput === false) {
            timeout_findMatches_mainInput = setTimeout(findMatches_mainInput, maxDelay_mainInputMatching);
        }
    }

    /**
     *
     * @param [matchAllForEmptyInput] Optional. Should be passed as true if empty input should match all links
     * in the viewport. Currently, this is passed as true only when called from assignHints_to_currentMatches()
     */
    function findMatches_mainInput(matchAllForEmptyInput) {
        clearTimeout(timeout_findMatches_mainInput);
        timeout_findMatches_mainInput = false;    // reset

        resetMainTextMatching();
        removeActiveElementStyling();
        $textBox_main.removeClass(class_textBox_noMatch);
        $textBox_hint.removeClass(class_textBox_noMatch);

        var mainInput_lowerCase = getMainInput_lowerCase();

        if (!mainInput_lowerCase && !matchAllForEmptyInput) {
            return;
        }

        if (!mainInput_lowerCase && matchAllForEmptyInput) {
            $elemsMatchingMainText = $elemsInViewport;
        }
        else {
            $elemsMatchingMainText = $elemsInViewport.filter(function() {
                var text_lowerCase = getElementText_all(this).toLowerCase();
                if (fuzzyMatch(text_lowerCase, mainInput_lowerCase)) {
                    return true;
                }
            });
        }

        if ($elemsMatchingMainText.length) {
            $elemsMatchingMainText.addClass(matchingLink_class);

            styleAsActive($elemsMatchingMainText[0], 0);
        }
        else {
            $textBox_main.addClass(class_textBox_noMatch);
            $countLabel[0].innerText = "0 of 0";
        }
    }

    function onHintInput() {
        findMatches_hintInput();
    }

    function findMatches_hintInput() {

        if (!$elemsMatchingMainText.length) {
            $textBox_hint.val(''); // don't accept input
            $textBox_hint.addClass(class_textBox_noMatch);
        }
        var hintInput_upperCase = getHintInput_upperCase();

        if (!hintInput_upperCase) {
            $assignedHintsSpans.addClass(class_hintVisible);    // if there no hint input, show hints on all
            return;
        }

        var elem_exactMatch = null,
            hintSpan_exactMatch,
            potentialMatches = [];

        var len = $assignedHintsSpans.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = $assignedHintsSpans[i],
                elem = $(hintSpan).data('element');

            var elemHint_upperCase = hintSpan.innerText.toUpperCase();
            if (elemHint_upperCase.substring(0, hintInput_upperCase.length) === hintInput_upperCase) {
                if (!elem_exactMatch && elemHint_upperCase === hintInput_upperCase) {
                    elem_exactMatch = elem;
                    hintSpan_exactMatch = hintSpan;
                }
                hintSpan.classList.add(class_hintVisible);
                potentialMatches.push(elem);
            }
            else {
                hintSpan.classList.remove(class_hintVisible);
            }

        }

        if (potentialMatches.length) {
            if (elem_exactMatch) {
                styleAsActive(elem_exactMatch);
                // exact element found. hide it's hint to prevent (part of) the element being occluded by the hint
                // (which something I greatly disliked about 'hints' in Vimium etc.)
                hintSpan_exactMatch.classList.remove(class_hintVisible);
            }
            else {
                styleAsActive(potentialMatches[0]);
            }
            $textBox_hint.removeClass(class_textBox_noMatch);
        }
        else {
            removeActiveElementStyling();
            $textBox_hint.addClass(class_textBox_noMatch);
        }
    }

    /**
     * 1) Styles the specified element as active (while the actual focus continues to
     * remain on the selectLinkUI).
     * 2) Briefly sets actual focus to the specified element, before reverting it, in
     * order to get the element in the viewport if it isn't already
     * 3) Updates count label indicating which element is selected
     * @param el
     * @param [index] optional - index of el in $elemsMatchingMainText (if not specified,
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
            index = $elemsMatchingMainText.index(el);
        }
        $countLabel[0].innerText = (index + 1) + " of " + $elemsMatchingMainText.length;
    }

    function closeUI() {
        var disabledByMe = mod_mutationObserver.disable();

        clearTimeout(timeout_findMatches_mainInput);
        timeout_findMatches_mainInput = false;    // reset
        clearTimeout(timeout_viewportChange);
        timeout_viewportChange = false;    // reset

        $UIContainer.hide();
        $hintsContainer.hide();
        $helpUI.hide();

        removeAssignedHints();
        resetMainTextMatching();
        var elToFocus = elementStyledAsActive; // save reference before calling removeActiveElementStyling()
        removeActiveElementStyling();
        if (elToFocus) {
            elToFocus.focus();
        }
        else if (document.activeElement === $textBox_main[0]) {
            // blur (if not already blurred - to prevent infinite recursion)
            $textBox_main.blur();
        }
        else if (document.activeElement === $textBox_hint[0]) {
            $textBox_hint.blur();
        }


        resetMainTextBox();
        resetHintTextBox();
        removeEvent_onViewportChange();
        mod_context.set_selectLinkUI_state(false);

        disabledByMe && mod_mutationObserver.enable();
    }

    function showUI() {
        // This global variable is calculated and cached when the UI is invoked (and updated whenever the viewport changes)
        // Given that new links might dynamically get added to the viewport, ideally we should recalculate this variable
        // each time we use it. However, the current strategy is more performant (and given how short-lived this UI is
        // we can ignore the effect of new links getting added etc)
        $elemsInViewport = $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });

        $UIContainer.show();
        $textBox_main.focus();
        mod_context.set_selectLinkUI_state(true);

        setupEvent_onViewportChange();
    }


    function onKeyDown_spaceOrShift(e) {
        if (e.target === $textBox_main[0] || e.target === $textBox_hint[0]) {
            var code = e.which || e.keyCode;
            if (code === 16 || code === 32) { // 16 shift, 32 space
                $textBox_hint[0].focus();
                mod_contentHelper.suppressEvent(e);
            }
        }
    }

    function onKeyUp_spaceOrShift(e) {
        if (e.target === $textBox_main[0] || e.target === $textBox_hint[0]) {
            var code = e.which || e.keyCode;
            if (code === 16 || code === 32) { // 16 shift, 32 space
                $textBox_main[0].focus();
                mod_contentHelper.suppressEvent(e);
            }
        }
    }

    function removeAssignedHints() {
        $assignedHintsSpans.removeClass(class_hintVisible);
        $assignedHintsSpans = $();
    }

    // Assigns hints to `$elemsMatchingMainText` (and undoes any previous assignment)
    function assignHints_to_currentMatches() {
        $hintsContainer.hide();
        removeAssignedHints();

        findMatches_mainInput(true); // first call this (in case it is pending due to a timeout etc)

        var hintSpansToUse;
        if ($elemsMatchingMainText.length <= hintSpans_singleDigit.length) {
            hintSpansToUse = hintSpans_singleDigit;
        }
        else {
            hintSpansToUse = hintSpans_doubleDigit;
        }

        var assignedHintSpans = [];
        // Note: If the extremely unlikely scenario that the current *viewport* has more (matching) links than
        // `hintSpans_doubleDigit.length`, we will ignore links beyond that count (for now) -- the code won't
        // break, but these links will simply have no hint assigned.
        var len = Math.min($elemsMatchingMainText.length, hintSpansToUse.length);
        for (var i = 0; i < len; i++) {
            var el = $elemsMatchingMainText[i];
            var hintSpan = hintSpansToUse[i];
            assignedHintSpans[i] = hintSpan;

            var offset = mod_commonHelper.getOffsetPosition(el);
            hintSpan.style.top = offset.top + "px";
            hintSpan.style.left = offset.left + "px";
            $(hintSpan).data('element', el);
        }

        $assignedHintsSpans = $(assignedHintSpans);
        $assignedHintsSpans.addClass(class_hintVisible);
        $hintsContainer.show();
    }

    // gets hints based on hintCharsStr
    function getHints(hintCharsStr) {
        var hintsArr = hintCharsStr.split(''),
            doubleDigit_hintsArr = [],
            len = hintsArr.length,
            count = -1;

        for (var i = 0; i < len; ++i) {
            for (var j = 0; j < len; ++j) {
                doubleDigit_hintsArr[++count] = hintsArr[i] + hintsArr[j];
            }
        }
        return {singleDigit: hintsArr, doubleDigit: doubleDigit_hintsArr};
    }

    function generateHintSpansInDom() {
        var hints = getHints(hintCharsStr);

        hintSpans_singleDigit = getHintSpans(hints.singleDigit);
        hintSpans_doubleDigit = getHintSpans(hints.doubleDigit);

        $hintsContainer.empty();
        $hintsContainer.append(hintSpans_singleDigit);
        $hintsContainer.append(hintSpans_doubleDigit);
    }

    function getHintSpans(hintsArr) {
        var hintSpans = [];
        var len = hintsArr.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = document.createElement('span');
            hintSpan.innerText = hintsArr[i];
            hintSpan.classList.add(class_hint);
            hintSpans[i] = hintSpan;
        }
        return hintSpans;
    }

    function removeActiveElementStyling() {
        if (elementStyledAsActive) {
            mod_basicPageUtils.removeActiveElementStyle(elementStyledAsActive);
            elementStyledAsActive = null;
        }
        $countLabel[0].innerText = "";
    }

    function onKeydown_handleEsc(e) {
        var code = e.which;
        // 17 - ctrl, 18 - alt, 91 & 93 - meta/cmd/windows
        if ((e.target === $textBox_main[0] || e.target === $textBox_hint[0]) && [17, 18, 91, 93].indexOf(code) == -1) {

            if (code === 27) { // Esc
                mod_contentHelper.suppressEvent(e);
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

    function resetHintTextBox() {
        $textBox_hint.val('');
        $textBox_hint.removeClass(class_textBox_noMatch);
    }

    function resetMainTextBox() {
        $textBox_main.val('');
        $textBox_main.removeClass(class_textBox_noMatch);
    }

    function setup_focusRelatedEvents() {
        $textBox_main.on('focusout', onFocusOut_textboxes); // we use focusout instead of blur since it supports e.relatedTarget
        $textBox_hint.on('focusout', onFocusOut_textboxes);

        $textBox_main.on('focus', onFocus_mainTextBox);
        $textBox_hint.on('focus', onFocus_hintTextBox);
        $textBox_hint.on('blur', onBlur_hintTextBox);
    }

    function remove_focusRelatedEvents() {
        $textBox_main.off('focusout', onFocusOut_textboxes);
        $textBox_hint.off('focusout', onFocusOut_textboxes);

        $textBox_main.off('focus', onFocus_mainTextBox);
        $textBox_hint.off('focus', onFocus_hintTextBox);
        $textBox_hint.off('blur', onBlur_hintTextBox);
    }

    function onFocus_mainTextBox() {
        resetHintTextBox();
        if (!$textBox_main.val()) {
            // even if this if condition is true, $elemsMatchingMainText might be set due to $textBox_hint having focus
            resetMainTextMatching();
            $countLabel[0].innerText = "";
        }
    }

    function onFocus_hintTextBox() {
        resetHintTextBox();
        assignHints_to_currentMatches();
    }

    function onBlur_hintTextBox() {
        resetHintTextBox();
        removeAssignedHints();  // hints are only visible (and assigned) if it has focus
    }

    function onFocusOut_textboxes(e) {
        if ($UIContainer.find(e.relatedTarget).length === 0) {
            closeUI();
        }
    }

    function setupEvent_onViewportChange() {
        $(window).on('resize scroll', onViewportChange);
    }

    function removeEvent_onViewportChange() {
        $(window).off('resize scroll', onViewportChange);
    }

    function onViewportChange() {
        if (timeout_viewportChange === false) {
            timeout_viewportChange = setTimeout(_onViewPortChange, 400);
        }
    }

    function _onViewPortChange() {
        clearTimeout(timeout_viewportChange);
        timeout_viewportChange = false;

        $elemsInViewport = $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });

        findMatches_mainInput();
        resetHintTextBox();
        if (document.activeElement === $textBox_hint[0]) {
            assignHints_to_currentMatches();
        }
    }

    function onHelpButtonClick() {
        if ($helpUI.is(':visible')) {
            $helpUI.hide();
        }
        else {
            $helpUI.show();
        }
        $textBox_main.focus();  // do this in either case
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_commonHelper,
        _u.mod_basicPageUtils, _u.mod_keyboardLib, _u.mod_context,
        _u.mod_mutationObserver, _u.CONSTS);

