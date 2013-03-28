/**
 * This function allows a passed function to be executed only after a specific condition is satisfied.
 * @param {function} functionToExecute The function to execute after a certain condition has been met
 * @param {function} testFunction This function should is a wrapper for the logic to test whether the condition for
 * functionToExecute has been met. It should return false till the condition is unmet, and true once it is met.
 * @param {int|undefined} timeOutMillisec Optional time out value. Default is 1 minute.
 *  If this value is zero or negative, functionToExecute won't be executed at all
 */
function executeWhenConditionMet(functionToExecute, testFunction, timeOutMillisec) {
    if (typeof(timeOutMillisec) === "undefined") {
        timeOutMillisec = 60000; //1 min
    }

    if (testFunction()){
        functionToExecute();
    }
    else if (timeOutMillisec > 0){
        setTimeout(executeWhenConditionMet.bind(null, functionToExecute, testFunction, timeOutMillisec-50),50);
    }
    else {
        console.warn("UnitsProj extn: executeWhenConditionMet() timed out for function..:\n", functionToExecute, "\n... and testFunction:\n", testFunction);
    }
}

/**
 * De-stringifies the stringified functions in the urlData object passed to it.
 * <<NOTE>>: Any changes in this function should be kept consistent with the function stringifyFunctions() in the
 * background scripts.
 * @param urlData
 */
function destringifyFunctions(urlData) {

    var destringifyFn = function(stringifiedFn) {
        return eval(stringifiedFn);
    };

    if (urlData.fn_onCUSelection) {
        urlData.fn_onCUSelection = destringifyFn(urlData.fn_onCUSelection);
    }
    if (urlData.fn_onCUDeselection) {
        urlData.fn_onCUDeselection = destringifyFn(urlData.fn_onCUDeselection);
    }

    // to destringify any functions within 'CU_shortcuts' and 'page_shortcuts' objects which have the same structure
    var destringifyShortcuts = function(shortcuts) {

        if (shortcuts) {
            for (var id in shortcuts) {
                if (shortcuts[id].fn) {
                    shortcuts[id].fn = destringifyFn(shortcuts[id].fn);
                }
            }
        }

    };

    destringifyShortcuts(urlData.page_shortcuts);
    destringifyShortcuts(urlData.CU_shortcuts);

}

function suppressEvent(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
}

/**
 * Returns true if all (top most) constituents of $CU have css 'visibility' style equal to "hidden"
 * @param $CU
 * @return {Boolean}
 */
function isCUInvisible($CU) {

  for (var i = 0; i < $CU.length; ++i) {
      if ($CU.eq(i).css('visibility') !== "hidden") {
          return false;
      }
  }
  return true;
}

// returns true if any part of $CU is in the viewport, false otherwise
function isCUInViewport($CU) {

    // for the CU
    var boundingRect = getBoundingRectangle($CU),
        CUTop = boundingRect.top,
        CUHeight = boundingRect.height,
        CUBottom = CUTop + CUHeight;

    var // for the window:
        winTop = $document.scrollTop(),
    // winHeight = $(window).height(), // this doesn't seem to work correctly on news.ycombinator.com
        winHeight = window.innerHeight,
        winBottom = winTop + winHeight;


    return ( (CUTop > winTop && CUTop < winBottom) ||
        (CUBottom > winTop && CUBottom < winBottom) );
}

function changeFontSize($jQuerySet, isBeingIncreased) {
    if (!$jQuerySet || !$jQuerySet.length) {
        return;
    }

    for (var i = 0; i < $jQuerySet.length; i++) {
        var $el = $jQuerySet.eq(i);
        var font = $el.css('font-size');
        var numericVal = parseFloat(font);
        var CU = font.substring(numericVal.toString().length);

        var newNumericVal = isBeingIncreased?(numericVal+2): (numericVal-2);
        $el.css('font-size', newNumericVal+CU);

    }
}
function increaseFont($jQuerySet) {
    changeFontSize($jQuerySet, true);
}

function decreaseFont($jQuerySet) {
    changeFontSize($jQuerySet, false);
}


function checkOverlayCssHasTransition() {

    // create a short-lived element which is inserted into the DOM to allow determination of CSS transition property
    // on overlay elements, and then quickly removed.
    var $tempOverlay = $('<div></div>')
        .addClass(class_addedByUnitsProjExtn)
        .addClass(class_overlay)
        .hide()
        .appendTo(document.body);
    var properties = ['transition-duration', '-webkit-transition-duration', '-moz-transition-duration',
        '-o-transition-duration'];

    var transitionDuration;
    for (var property, i = 0; property = properties[i++]; ) {
        transitionDuration = $tempOverlay.css(property);
        if (transitionDuration !== null) {
            break;
        }
    }

    $tempOverlay.remove();

    transitionDuration = parseFloat(transitionDuration); // to get 0.3 from 0.3s etc

    // check if transitionDuration exists and has a non-zero value, while tolerating
    // precision errors with float (which should not occur for 0, but just in case)
    if (transitionDuration && transitionDuration > 0.00000001) {
        return true;
    }
    else {
        return false;
    }

}


// inspired from:
// http://johannburkard.de/blog/programming/javascript/highlight-javascript-text-higlighting-jquery-plugin.html
/* Main changes:
 1) Use of JS keyword 'with' (deprecated) was removed, and modifications made in accordance
 2) toLowercase() being instead of toUppercase, and also being calculated only once at the beginning.
 3) converted from jQuery plugin to a regular function; main since we want num of highlights made to be
 returned
 4) <removed> Only searches within visible elements. Since numHighlights is required by the calling function to
 detect if a CU should be counted as a match or not. Also helps with efficiency.
 5) Other minor optimizations
 6) Added comments
 */

function highlightInCU($CU, pattern) {

    var numHighlighted = 0, // count of how many items were highlighted
        patternLowerCase = pattern && pattern.toLowerCase();

    /*
     Called recursively. Each time this function is called on a text node, it highlights the first instance of
     'pattern' found. Upon finding 'pattern', it returns after creating 3 nodes in place of the original text node --
     a span node for the highlighted pattern and two text nodes surrounding it.
     Returns true or false to indicate if highlight took place
     */
    var innerHighlight = function (node) {

        var highlighted = false;

        if (node.nodeType == 3) { // nodeType 3 - text node

            var pos = node.data.toLowerCase().indexOf(patternLowerCase);
            if (pos >= 0) {
                var spannode = document.createElement('span');
                spannode.className = 'UnitsProj-highlight';
                var middlebit = node.splitText(pos);
                // var endbit = middlebit.splitText(patternLowerCase.length);
                var middleclone = middlebit.cloneNode(true);
                spannode.appendChild(middleclone);
                middlebit.parentNode.replaceChild(spannode, middlebit);
                highlighted = true;
                ++numHighlighted;
            }
        }
        // nodeType 1 - element node
        else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {

            // var $node = $(node); // node is an element
            // if (!$node.is(':visible') || $node.css('visibility') === 'hidden') {
            //     return;
            // }

            for (var i = 0; i < node.childNodes.length; ++i) {
                if (innerHighlight(node.childNodes[i])) {
                    ++i; // to move past the new span node created
                }
            }
        }
        return highlighted;
    };


    if ($CU.length && patternLowerCase && patternLowerCase.length) {
        $CU.each(function() {
            innerHighlight(this);
        });
    }

    return numHighlighted;
}

// container - dom node or jQuery set within which highlighting should be removed
function removeHighlighting (container) {
    var $container = $(container);

    $container.find(".UnitsProj-highlight").each(function() {
        var parentNode = this.parentNode;

        parentNode.replaceChild(this.firstChild, this);
        parentNode.normalize();

    });
}