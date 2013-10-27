
_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_directionalNav, mod_keyboardLib, mod_globals, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document),
        $window = $(window),
        class_unitsProjElem = CONSTS.class_unitsProjElem,
        class_hint = 'UnitsProj-hintLabel',                     // class for all hint labels
        class_hintVisible = 'UnitsProj-hintLabel-visible',      // class applied to make a hint label visible,
        hintsEnabled,
        hintInputStr_upperCase,

        // arrays of spans showing hints (dom elements)
        hintSpans_singleDigit = [],
        hintSpans_doubleDigit = [],
        timeout_removeHints,
        timeout_blurDummyTextbox,
        timeoutPeriod = 4000;

    // vars related to hint chars 
    var reducedSet = "jkdhglsurieytnvmbc",// easiest to press keys (roughly in order), exluding 'f'
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase();

    // This is used to group the all the hint label spans within a common parent
    var $hintsContainer = $("<div></div>")
        .addClass('UnitsProj-hintsContainer')
        .addClass(class_unitsProjElem)
        .hide()
        .appendTo(_u.$topLevelContainer);

    // "dummy" text box (based on css styling) used to get "match-char" input (input on this triggers onMatchCharInput(),
    // see it's documentation)
    var $dummyTextBox = $('<input type = "text">')
        .addClass(class_unitsProjElem)
        .addClass('UnitsProj-dummyInput')
        .attr('tabindex', -1)
        .hide()
        .appendTo(_u.$topLevelContainer);

    function reset() {
        removeHints();
    }

    function setup() {
        reset();
        mod_domEvents.addEventListener(document, 'keydown', onKeyDown, true);
        mod_domEvents.addEventListener($dummyTextBox[0], 'blur', onDummyTextBoxBlur, true);

        $dummyTextBox.on('input', onDummyTextBoxInput );
    }

    function onHintInput(character) {
        hintInputStr_upperCase += character.toUpperCase();

        var elem_exactMatch = null,
            partialMatches = [],
            $assignedHintSpans = $('.' + class_hintVisible);
            
        var len = $assignedHintSpans.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = $assignedHintSpans[i],
                elem = $(hintSpan).data('element');

            var elemHint_upperCase = hintSpan.innerText;
            if (elemHint_upperCase.substring(0, hintInputStr_upperCase.length) === hintInputStr_upperCase) {
                partialMatches.push(elem);
                if (elemHint_upperCase === hintInputStr_upperCase) {
                    elem_exactMatch = elem;
                    break;
                }
            }
            else {
                hintSpan.classList.remove(class_hintVisible);
            }
        }

        // exact match
        if (elem_exactMatch) {
            elem_exactMatch.focus();
            removeHints();
        }
        // no match
        else if (!partialMatches.length) {
            removeHints();
        }
        // partial match
        else {
            // reset the timeout
            clearTimeout(timeout_removeHints);
            timeout_removeHints = setTimeout(removeHints, timeoutPeriod);
        }
    }

    function removeHints() {
        $hintsContainer.hide();
        $('.' + class_hintVisible).removeClass(class_hintVisible);
        hintsEnabled = mod_globals.hintsEnabled = false;

        // event is unbound when hints are removed since there is no need to track the 'scroll' event continuously
        $window.off('resize scroll', onViewportChange);
        clearTimeout(timeout_removeHints);

    }
    
    function showHints($matchingElems) {
        // Call removeHints() for cases where showHints() is called consecutively
        // without removeHints() being called in between (clears existing
        // timeout + unbinds bound event + generally resets state)
        removeHints();
        _assignHints($matchingElems);
        $hintsContainer.show();

        hintInputStr_upperCase = "";
        hintsEnabled = mod_globals.hintsEnabled = true;

        $window.on('resize scroll', onViewportChange);
        timeout_removeHints = setTimeout(removeHints, timeoutPeriod);
    }

    function onViewportChange() {
        removeHints();
    }

    function onKeyDown(e) {
        var keyCode = e.which || e.keyCode || e.charCode;
        var target = e.target;

        // some (other) key pressed while [space] was already pressed down with the focus being
        // on a non-input type element
        if (keyCode !== 32 && mod_keyboardLib.canUseSpaceAsModfier()) { // 32 - space

            // if one of the arrow keys was pressed:
            // space+left OR space+shift+H
            if (keyCode === 37 || e.shiftKey && keyCode === 72) {
                selectNextFocusable('left');
                mod_contentHelper.suppressEvent(e);
            }
            // space+up OR space+shift+K
            else if (keyCode === 38 || e.shiftKey && keyCode === 75) {
                selectNextFocusable('up');
                mod_contentHelper.suppressEvent(e);
            }
            // space+right OR space+shift+L
            else if (keyCode === 39 || e.shiftKey && keyCode === 76) {
                selectNextFocusable('right');
                mod_contentHelper.suppressEvent(e);
            }
            // space+down OR space+shift+J
            else if (keyCode === 40 || e.shiftKey && keyCode === 74) {
                selectNextFocusable('down');
                mod_contentHelper.suppressEvent(e);
            }

            // some other NON-SHIFT key was pressed
            else if (keyCode != 16) {

                // Focus the dummy text box. And stop the event from propagating, but don't
                // prevent it's default action, so that it enters text into the text box.
                // This lets us give focus to the dummy text box just-in-time (i.e. when the
                // <char> is pressed after pressing space, and not at the keydown of space
                // itself. This is nicer for a couple of reasons:
                // 1) it doesn't take away focus from the active element till as late as
                // possible, and if the user decides to not press anything after pressing
                // space, the focus will remain where it was.
                // 2) this will be make it easier to implement in the future a feature where
                // if the user presses space without pressing anything else the document is
                // scrolled down by a page (like the default browser behavior which gets broken
                // due to this feature)
                focusDummyTextBoxAndRemoveHints();
                e.stopImmediatePropagation();
            }
        }
        // 'f' pressed. focus dummy text box so that the next char entered triggers onMatchCharInput
        else if (String.fromCharCode(keyCode).toLowerCase() === "f" &&
            !(e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) &&
            (mod_contentHelper.elemAllowsSingleKeyShortcut(target))) {

            mod_contentHelper.suppressEvent(e);
            focusDummyTextBoxAndRemoveHints();
            clearTimeout(timeout_blurDummyTextbox);
            timeout_blurDummyTextbox = setTimeout(function() {
                blurDummyTextBox();
            }, timeoutPeriod);
        }
        else if (hintsEnabled) {
            // These modifiers are not required (or expected) to be pressed, so exclude keydown events having them
            if (!(e.ctrlKey || e.altKey || e.metaKey)) {
                mod_contentHelper.suppressEvent(e);
                if (e.which === 27) { // 27 - Esc
                    removeHints();
                }
                else {
                    onHintInput(String.fromCharCode(e.which || e.keyCode));
                }
            }
        }
    }

    function focusDummyTextBoxAndRemoveHints() {
        $dummyTextBox.val('').show().focus();
        removeHints();
    }

    // We read input off of this dummy element to determine the actual character
    // entered by the user (as opposed to the key pressed down) even while binding
    // to the 'keydown' event for input rather than 'keypress' (refer: #144)
    function onDummyTextBoxInput () {
        var input = $dummyTextBox.val();
        input = input[input.length - 1]; // consider only the last char typed in case there is more than one
        var char_lowerCase = input.trim().toLowerCase(); // for case insensitive matching
        char_lowerCase && onMatchCharInput(char_lowerCase);
        blurDummyTextBox();
    }

    // This map allows us to determine the char that would be typed had
    // shift been pressed along with a key. This only works for the
    // standard US keyboard, but since it's required only for an optional
    // feature, it's ok.
    var stdUSKbdShiftMap = {
        '`': '~',
        '1': '!',
        '2': '@',
        '3': '#',
        '4': '$',
        '5': '%',
        '6': '^',
        '7': '&',
        '8': '*',
        '9': '(',
        '0': ')',
        '-': '_',
        '=': '+',
        '[': '{',
        ']': '}',
        '\\': '|',
        ';': ':',
        '\'': '"',
        ',': '<',
        '.': '.',
        '/': '?'
    };

    // Handler for when a "match-char" is input by the user
    // A match-char refers to a character typed to match
    // links starting with it, etc.
    function onMatchCharInput(matchChar_lowerCase) {
        removeHints();  // first remove any existing hints
        var $elemsInViewport = $getFocusablesInViewport(),
            $matchingElems;

        // space + '.' targets all links without any alphabetic text, considering only the innerText
        // and the element's 'value' (but ignoring the placeholder text, so that an element with nothing
        // but placeholder text *will* also get matched, for better usability]
        if (matchChar_lowerCase === '.') {
            $matchingElems = $elemsInViewport.filter(function() {
                var elemText = getElementText(this, true);  // true - placeholder text be ignored
                return !(elemText && elemText.match(/[a-zA-Z]/));
            });
        }

        // space + '/' targets all links
        else if (matchChar_lowerCase === '/') {
            $matchingElems = $elemsInViewport;
        }

        // space + <char> targets all links starting with <char>
        // Actually, for increased usability, this targets all links
        // whose first letter, digit or special symbol is <char>
        // E.g: a link with the text "-3 AAPL" (without the quotes) will be
        // matched if <char> is either 'a' (case insensitive), or '-', or '3']
        // Additionally, if the "match-char" corresponds to a key pressed without
        // shift, we also use for matching the char that would be typed if
        // shift had been pressed as well (based on `stdUSKbdShiftMap`)
        else {
            $matchingElems = $elemsInViewport.filter(function() {
                var text_lowerCase = getElementText(this).toLowerCase(),
                linkChars = [];

                /* TODO: need to support unicode letters, digits, symbols. JS regex
                   does not have unicode support built in. Useful resources at
                   http://stackoverflow.com/questions/280712/javascript-unicode
                   Close #147 when this is done
                 */
                var letter = text_lowerCase.match(/[a-z]/),
                    digit = text_lowerCase.match(/\d/),
                    symbol = text_lowerCase.match(/[^\da-z ]/); // not digit, a-z, or space

                letter && linkChars.push(letter[0]); // if there is a match, String.match returns an array
                digit && linkChars.push(digit[0]);
                symbol && linkChars.push(symbol[0]);

                // especially since we don't support unicode yet, it's useful to ensure that
                // the first character of the (trimmed) text is always included in linChars.
                // In any case, there is no harm even if it gets included twice.
                linkChars.push(text_lowerCase[0]);

                var matchChars = [matchChar_lowerCase],
                    shiftUpChar = stdUSKbdShiftMap[matchChar_lowerCase];
                
                shiftUpChar && matchChars.push(shiftUpChar);

                for (var i = 0; i < linkChars.length; i++) {
                    var char1 = linkChars[i];
                    for (var j = 0; j < matchChars.length; j++) {
                        var char2 = matchChars[j];
                        if (char1 === char2) {
                            return true;
                        }
                    }
                }
                return false;
            });
        }

        if ($matchingElems.length) {
            if ($matchingElems.length === 1) {
                $matchingElems.focus();
            }
            else {
                showHints($matchingElems);
            }
        }
    }

    // meant to be called from within showHints()
    function _assignHints($matchingElems) {
        // generate the hint spans and put them in the DOM if not done yet
        if (!hintSpans_singleDigit.length) {
            generateHintSpansInDom();
        }

        $('.' + class_hintVisible).removeClass(class_hintVisible);

        var hintSpansToUse;
        hintSpansToUse = $matchingElems.length <= hintSpans_singleDigit.length?
            hintSpans_singleDigit: hintSpans_doubleDigit;

        // Note: If the extremely unlikely scenario that the current *viewport* has more matching links than
        // `hintSpans_doubleDigit.length`, we ignore links beyond that count, i.e. these links won't get a hint
        var len = Math.min($matchingElems.length, hintSpansToUse.length);
        for (var i = 0; i < len; i++) {
            var el = $matchingElems[i];
            var hintSpan = hintSpansToUse[i];
            hintSpan.classList.add(class_hintVisible);

            var viewportOffset = el.getBoundingClientRect();
            hintSpan.style.top = viewportOffset.top + "px";
            hintSpan.style.left = viewportOffset.left + Math.min(20, Math.round(el.offsetWidth/2)) + "px";
            $(hintSpan).data('element', el);
        }
    }

    // gets hints based on hintCharsStr
    function getHints(hintCharsStr) {
        var singleDigitHints = hintCharsStr.split(''),
            doubleDigitHints = [],
            len = singleDigitHints.length,
            count = -1;

        for (var i = 0; i < len; ++i) {
            for (var j = 0; j < len; ++j) {
                // [j] + [i] instead of [i] + [j] so that the the first character
                // of neighbouring double digit hints is scattered (which is nicer)
                doubleDigitHints[++count] = singleDigitHints[j] + singleDigitHints[i];
            }
        }
        return {singleDigit: singleDigitHints, doubleDigit: doubleDigitHints};
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

    // returns all link elements + other input-type elements
    function $getAllLinkLikeElems($scope) {
        $scope || ($scope = $document);
        return $scope.find(CONSTS.focusablesSelector);
    }

    function getElementText(el, ignorePlaceholderText) {
        var innerText = mod_contentHelper.getVisibleInnerText(el);

        return (
            innerText? innerText: (
                el.value? el.value:
                    (!ignorePlaceholderText && el.placeholder? el.placeholder: "")
                )
            ).trim();
    }

    function $getFocusablesInViewport() {
        return $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });
    }

    function isAnyPartOfElementInViewport(el) {
        var offset = $(el).offset();
        var top = offset.top;
        var left = offset.left;
        var width = el.offsetWidth;
        var height = el.offsetHeight;

        return (top < (window.scrollY + window.innerHeight)) &&     // elTop < winBottom
            ((top + height) > window.scrollY) &&                    // elBottom > winTop
            (left < (window.scrollX + window.innerWidth)) &&        // elLeft < winRight
            ((left + width) > window.scrollX);                      // elRight > winLeft
    }

    // note: this function will result in onDummyTextBoxBlur() getting called as well
    function blurDummyTextBox() {
        $dummyTextBox[0].blur();
        // in case the above doesn't work (on old browsers?)
        if (document.activeElement === $dummyTextBox[0]) {
            document.body.focus();
        }
    }

    function onDummyTextBoxBlur() {
        $dummyTextBox[0].value = '';
        clearTimeout(timeout_blurDummyTextbox);
    }

    function selectNextFocusable(direction) {
        var elems = $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this));
        });
        var activeEl = document.activeElement;
        // if active element is not in the viewport, focus first element in the viewport
        if (!activeEl || activeEl === document.body) {
            var len = elems.length;
            for (var i = 0; i < len; i++) {
                var elem = elems[i];
                if(isAnyPartOfElementInViewport(elems)) {
                    elem.focus();
                    return;
                }
            }
            elems[0].focus();
        }
        // this is the main flow of the method
        else {
            var index = mod_directionalNav.getClosest(activeEl, elems, direction);
            if (index > -1) {
                elems[index].focus();
            }
        }
    }

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_directionalNav, _u.mod_keyboardLib, _u.mod_globals, _u.CONSTS);

