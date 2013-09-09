
_u.mod_selectLink = (function($, mod_domEvents, mod_contentHelper, mod_commonHelper, mod_keyboardLib, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });


    var $document = $(document),
        class_addedByUnitsProj = CONSTS.class_addedByUnitsProj,
        class_hint = 'UnitsProj-hintLabel',                     // class for all hint labels
        class_hintVisible = 'UnitsProj-hintLabel-visible',      // class applied to make a hint label visible,
        $assignedHintsSpans = $();

    // vars related to hint chars 
    var reducedSet = "jfkdhglsurieytnvmbc", // easiest to press keys (roughly in order)
        remainingSet = "axzwoqp",
        // hint chars: set of letters used for hints. easiest to reach letters should come first
        hintCharsStr = (reducedSet + remainingSet).toUpperCase(); //

    // "dummy" text box (based on css styling) used only to get the user's hint input  
    var $hintTextBox = $('<input type = "text">').
        addClass(class_addedByUnitsProj).
        addClass('UnitsProj-dummyHintInput').
        appendTo(_u.$topLevelContainer);

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

    function setup() {

        // Instead of specifying 'keydown' as part of the on() call below, use addEventListener to have priority over
        // `onKeydown_Esc` which is bound in mod_CUsMgr. We bind the event on `document` (instead of $hintTextBox) for
        // the same reason. [This binding gets priority over the bindings of mod_CUsMgr based
        // on the order in which modules are set up in the main module]
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_handleEsc, true);
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_spacePlusKey, true);

        $hintTextBox.on('input', onHintInput);
        $hintTextBox.on('blur', stopMatchingInput);

    }

    function onHintInput() {
        var hintInput_upperCase = $hintTextBox[0].value.toUpperCase();

        var elem_exactMatch = null,
            partialMatches = [];

        var len = $assignedHintsSpans.length;
        for (var i = 0; i < len; i++) {
            var hintSpan = $assignedHintsSpans[i],
                elem = $(hintSpan).data('element');

            var elemHint_upperCase = hintSpan.innerText;
            if (elemHint_upperCase.substring(0, hintInput_upperCase.length) === hintInput_upperCase) {
                hintSpan.classList.add(class_hintVisible);
                partialMatches.push(elem);
                if (elemHint_upperCase === hintInput_upperCase) {
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
            stopMatchingInput();
        }
        // no match
        else if (!partialMatches.length) {
            stopMatchingInput();
        }
        // else, for partial match: do nothing
    }

    function stopMatchingInput() {
        // check condition to prevent infinite callbacks for the 'blur' event on $hintTextBox
        if (document.activeElement === $hintTextBox[0]) {
            document.body.focus();
        }
        $hintTextBox.val('');
        removeAssignedHints();
    }

    function onKeydown_handleEsc(e) {
        var code = e.which;
        if (code === 27 && e.target === $hintTextBox[0]) {
            mod_contentHelper.suppressEvent(e);
            stopMatchingInput();
        }
    }

    function onKeydown_spacePlusKey (e) {

        var code = e.which || e.keycode;

        if (mod_keyboardLib.isSpaceDown() &&
            mod_keyboardLib.allowSpaceAsModifier(e) &&
            code !== 32 && code !== 16) { // 32 is space, 16 shift

            mod_contentHelper.suppressEvent(e);

            var $elemsInViewport = getElemsInViewport(),
                $matchingElems;

            // space + '.' targets all links without an inner text
            if (code === 190) { // code for '.'
                $matchingElems = $elemsInViewport.filter(function() {
                    return !(getElementText(this).trim());
                });
            }

            // space + '/' targets all links
            else if (code === 191) { // code for '/'
                $matchingElems = $elemsInViewport;
            }

            // space + <key> targets all links starting with <key>
            // [More specifically, for increased usability, this targets all links
            // whose first character, digit or special symbol is <key>.
            // E.g: a link with the text "+3% AAP" (without the quotes) will be
            // matched if <key> is either 'a' (case insensitive), or '+', or '3']
            // TODO: implement the above
            else {
                var key = String.fromCharCode(code).toLowerCase();
                $matchingElems = $elemsInViewport.filter(function() {
                    var text_lowerCase = getElementText(this).toLowerCase();
                    return text_lowerCase[0] === key;
                });
            }

            if ($matchingElems.length) {
                if ($matchingElems.length === 1) {
                    $matchingElems.focus();
                }
                else {
                    assignHints($matchingElems);
                    $hintTextBox.val('').focus();
                }
            }
        }
    }

    function removeAssignedHints() {
        $hintsContainer.hide();
        $assignedHintsSpans.removeClass(class_hintVisible);
        $assignedHintsSpans = $();
    }

    function assignHints($matchingElems) {
        removeAssignedHints();

        // generate the hint spans and put them in the DOM if not done yet
        if (!hintSpans_singleDigit.length) {
            generateHintSpansInDom();
        }

        var hintSpansToUse,
            assignedHintSpans = [];

        hintSpansToUse = $matchingElems.length <= hintSpans_singleDigit.length?
            hintSpans_singleDigit: hintSpans_doubleDigit;

        // Note: If the extremely unlikely scenario that the current *viewport* has more matching links than
        // `hintSpans_doubleDigit.length`, we ignore links beyond that count, i.e. these links won't get a hint
        var len = Math.min($matchingElems.length, hintSpansToUse.length);
        for (var i = 0; i < len; i++) {
            var el = $matchingElems[i];
            var hintSpan = hintSpansToUse[i];
            assignedHintSpans[i] = hintSpan;

            var offset = mod_commonHelper.getOffsetPosition(el);
            hintSpan.style.top = offset.top + "px";
            hintSpan.style.left = offset.left + Math.min(20, Math.round(el.offsetWidth/2)) + "px";
            $(hintSpan).data('element', el);
        }

        $assignedHintsSpans = $(assignedHintSpans);
        $assignedHintsSpans.addClass(class_hintVisible);
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

})(jQuery, _u.mod_domEvents, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_keyboardLib, _u.CONSTS);

