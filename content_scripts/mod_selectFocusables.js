_u.mod_selectFocusables = (function($, mod_keyboardLib, mod_domEvents, mod_CUsMgr, mod_contentHelper, CONSTS) {

    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup
    });

    var $document = $(document);


    function setup() {
        mod_domEvents.addEventListener(document, 'keydown', onKeydown_selectFocusable, true);
    }

// to be used in conjunction with space. currently.
    function onKeydown_selectFocusable (e) {

        var code = e.which || e.keycode;

        if (mod_keyboardLib.isSpaceDown() && code !== 32 && code !== 16) { // 32 is space, 16 shift

            if (code === 190) { // code for '.'
                selectFocusable(e.shiftKey? "prev": "next", null);
            }
            else {
                var key = String.fromCharCode(code).toLowerCase();
                selectFocusable(e.shiftKey? "prev": "next", key);
            }

            mod_contentHelper.suppressEvent(e);
        }
    }

// Focuses next/prev focusable beginning with the specified char. If beginningChar is not specified/null, it selects
// the next/prev focusable WITHOUT any text (useful for cycling through non-textual links, buttons etc)
// If a CU is selected, this is applies only within it, else on the whole page
    function selectFocusable(nextOrPrev, beginningChar) {

        var $selectedCU = mod_CUsMgr.$getSelectedCU();
        var $scope =  $selectedCU || $document;

        var elementMatchesBeginningChar = function(element) {
            var text = mod_contentHelper.getVisibleInnerText(element);

            if (beginningChar) {
                if (text && text[0].toLowerCase() === beginningChar) {
                    return true;
                }
            }
            else {
                return !text;
            }
        };

        var $matchedFocusables = $scope.find(CONSTS.focusablesSelector).filter(function() {
            return elementMatchesBeginningChar(this);
        });

//        console.log('matched focusables: ', $matchedFocusables);

        if ($matchedFocusables && $matchedFocusables.length) {

            var focusedElementInScope, // will refer to currently focused element in $scope, if any

                activeEl = document.activeElement;

            //if scope is the currently selected CU and the active element lies within it
            if ( ($scope === $selectedCU && ($selectedCU.has(activeEl).length || $selectedCU.is(activeEl)))  ||
                ($scope === $document)) {

                focusedElementInScope = activeEl;
            }

            if (elementMatchesBeginningChar (focusedElementInScope)) {

                var index = ((nextOrPrev === "prev")? -1: 1) + $matchedFocusables.index(focusedElementInScope);

//                console.log("$matchedFocusables.index(focusedElementInScope): ", $matchedFocusables.index(focusedElementInScope));
//                console.log("index: ", index);
//                console.log("$matchedFocusables.length: ", $matchedFocusables.length);

                if (index >=  $matchedFocusables.length) {
                    index = 0;
                }
                else  if (index <  0) {
                    index = $matchedFocusables.length-1;
                }
                $matchedFocusables[index].focus();
            }
            else {
                $matchedFocusables[0].focus();
            }
        }
    }

    return thisModule;

})(jQuery, _u.mod_keyboardLib, _u.mod_domEvents, _u.mod_CUsMgr, _u.mod_contentHelper, _u.CONSTS);

