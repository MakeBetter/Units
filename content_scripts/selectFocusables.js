document.addEventListener('keydown', onKeydown_selectFocusable, true);

// to be used in conjunction with space. currently.
function onKeydown_selectFocusable (e) {

    var code = e.which || e.keycode;

    if (isSpaceDown && code !== 32 && code !== 16) { // 32 is space, 16 shift

        if (code === 190) { // code for '.' 
            selectFocusable(e.shiftKey? "prev": "next", null); 
        }
        else {
            var key = String.fromCharCode(code).toLowerCase();
            selectFocusable(e.shiftKey? "prev": "next", key);
        }

        suppressEvent(e);
    }

}

// Focuses next/prev focusable beginning with the specified char. If beginningChar is not specified/null, it selects
// the next/prev focusable WITHOUT any text (useful for cycling through non-textual links, buttons etc)
// If a CU is selected, this is applies only within it, else on the whole page
function selectFocusable(nextOrPrev, beginningChar) {

    var $selectedCU = $CUsArray[selectedCUIndex];
    var $scope =  $selectedCU || $document;

    
    var elementMatches = function(element) {
        var text = $(element).text();
        if (!text && $(element).is('input[type = "button"]')) {
            text = element.value;
        }
        if (beginningChar) {
            if (text && text[0].toLowerCase() === beginningChar) {
                return true;
            }
        }
        else {
            return !text;
        }
    };
    
    
    var $matchedFocusables = $scope.find(focusablesSelector).filter(function() {
        return elementMatches(this);  
    });

    console.log('matched focusables: ', $matchedFocusables);

    if ($matchedFocusables && $matchedFocusables.length) {

        var focusedElementInScope, // will refer to currently focused element in $scope, if any

            activeEl = document.activeElement;

        //if scope is the currently selected CU and the active element lies within it
        if ( ($scope === $selectedCU && getEnclosingCUIndex(activeEl) === selectedCUIndex) ||
            ($scope === $document)) {

            focusedElementInScope = activeEl;
        }

        if (elementMatches (focusedElementInScope)) {

            var index = ((nextOrPrev === "prev")? -1: 1) + $matchedFocusables.index(focusedElementInScope);

            console.log("$matchedFocusables.index(focusedElementInScope): ", $matchedFocusables.index(focusedElementInScope));

            console.log("index: ", index);

            console.log("$matchedFocusables.length: ", $matchedFocusables.length);

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
