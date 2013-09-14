
_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_keyboardLib, mod_globals, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });


    var $document = $(document),
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        class_hint = 'UnitsProj-hintLabel',                     // class for all hint labels
        class_hintVisible = 'UnitsProj-hintLabel-visible',      // class applied to make a hint label visible,
        hintsEnabled,
        hintInputStr_upperCase;

    // vars related to hint chars 
    var reducedSet = "jfkdhglsurieytnvmbc", // easiest to press keys (roughly in order)
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase(); //

    // This is used to group the all the hint label spans within a common parent
    var $hintsContainer = $("<div></div>")
        .addClass('UnitsProj-hintsContainer')
        .addClass(class_addedByUnitsProj)
        .hide()
        .appendTo(_u.$topLevelContainer);

    // arrays of spans showing hints (dom elements)
    var hintSpans_singleDigit = [],  
        hintSpans_doubleDigit = [];

    function setup() {
        mod_domEvents.addEventListener(document, 'keypress', onKeyPress_forSpacePlusKey, true);
        mod_domEvents.addEventListener(document, 'keydown', onKeydown, true);
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
        // else, for partial match: nothing more to be done for now
    }

    function removeHints() {
        $hintsContainer.hide();
        $('.' + class_hintVisible).removeClass(class_hintVisible);
        hintsEnabled = mod_globals.hintsEnabled = false;
        removeEventForViewportChange();
    }
    
    function showHints($matchingElems) {
        assignHints($matchingElems);
        hintInputStr_upperCase = "";
        hintsEnabled = mod_globals.hintsEnabled = true;
        setupEventForViewportChange();
    }

    function setupEventForViewportChange() {
        $(window).on('resize scroll', onViewportChange);
    }

    function removeEventForViewportChange() {
        $(window).off('resize scroll', onViewportChange);
    }

    function onViewportChange() {
        removeHints();
    }

    function onKeydown(e) {
        // Modifiers are not required (or expected) to be pressed, so exclude keydown events having them
        // In particular, this check fixes #142 (gitHub)
        if (!(e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || mod_keyboardLib.isSpaceDown())) {

            if (hintsEnabled && e.which === 27) { // 27 - Esc
                mod_contentHelper.suppressEvent(e);
                removeHints();
            }
            else if (hintsEnabled) {
                mod_contentHelper.suppressEvent(e);
                onHintInput(String.fromCharCode(e.which || e.keyCode));
            }
        }
    }

    // this is bound to the the 'keypress' event rather than the usual 'keydown'
    // so that we get the correct charCode value even in those cases where shift
    // was pressed along with a digit/symbol key (in addition to space)
    function onKeyPress_forSpacePlusKey(e) {
        var code = e.which || e.charCode;

        if (mod_keyboardLib.isSpaceDown() &&  mod_keyboardLib.allowSpaceAsModifier(e)) {
            mod_contentHelper.suppressEvent(e);
            onSpacePlusKey(code, e);
        }
    }

    function onSpacePlusKey(code, e) {
        var $elemsInViewport = getElemsInViewport(),
            $matchingElems,
            char_lowerCase = String.fromCharCode(code).toLowerCase(); // for case insensitive matching

        // space + '.' targets all links without an inner text
        if (char_lowerCase === '.') {
            $matchingElems = $elemsInViewport.filter(function() {
                return !(getElementText(this).trim());
            });
        }

        // space + '/' targets all links
        else if (char_lowerCase === '/') {
            $matchingElems = $elemsInViewport;
        }

        // space + <key> targets all links starting with <key>
        // [More specifically, for increased usability, this targets all links
        // whose first letter, digit or special symbol is <key>.
        // E.g: a link with the text "+3.5 AAPL" (without the quotes) will be
        // matched if <key> is either 'a' (case insensitive), or '+', or '3']
        // TODO: implement the above
        else {
            $matchingElems = $elemsInViewport.filter(function() {
                var text_lowerCase = getElementText(this).toLowerCase();
                return text_lowerCase[0] === char_lowerCase;
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

    function assignHints($matchingElems) {
        $hintsContainer.hide();
        $('.' + class_hintVisible).removeClass(class_hintVisible);

        // generate the hint spans and put them in the DOM if not done yet
        if (!hintSpans_singleDigit.length) {
            generateHintSpansInDom();
        }

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

        $hintsContainer.show();
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

    function getElementText(el) {
        return (
            el.innerText? el.innerText: (
                el.value? el.value:
                    (el.placeholder? el.placeholder: "")
                )
            );
    }

    function getElemsInViewport() {
        return $getAllLinkLikeElems().filter(function() {
            return (!mod_contentHelper.isUnitsProjNode(this) && isAnyPartOfElementInViewport(this));
        });
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

    return thisModule;

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_keyboardLib, _u.mod_globals, _u.CONSTS);

