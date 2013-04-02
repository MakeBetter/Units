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

// De-stringifies any property in the obj that is a stringfied function (including in the nested/inner objects within it).
// Note: stringification assumed to have been done by stringifyFunctions() function called in the background script
function destringifyFunctions(obj) {

    // Returns the de-stringifed version of the function passed. If something other than a stringified function is passed in,
    // it is returned back unmodified.
    var _destringifyFn = function(stringifiedFn) {
        var returnVal;
        try {
            returnVal = eval(stringifiedFn);
            if (typeof returnVal === "function") {
                return returnVal;
            }
            else {
                return stringifiedFn; // return the input back unmodified
            }
        } catch (e) {
            return stringifiedFn; // return the input back unmodified
        }
    };

    var stringifiedFn,
        initialSubstr = "(function"; // this would be the initial part of any function stringified by us.

    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (typeof obj[key] === "object") {
                destringifyFunctions(obj[key]);
            }
            else if (typeof (stringifiedFn = obj[key]) === "string" &&
                stringifiedFn.slice(0, initialSubstr.length) === initialSubstr) {
                obj[key] = _destringifyFn(obj[key]);
            }
        }
    }
}

function suppressEvent(e) {
    e.stopImmediatePropagation();
    e.preventDefault();
}

/**
 * Returns true if all (top most) constituents of $MU have css 'visibility' style equal to "hidden"
 * @param $MU
 * @return {Boolean}
 */
function isMUInvisible($MU) {

  for (var i = 0; i < $MU.length; ++i) {
      if ($MU.eq(i).css('visibility') !== "hidden") {
          return false;
      }
  }
  return true;
}

// returns true if any part of $MU is in the viewport, false otherwise
function isMUInViewport($MU) {

    // for the MU
    var boundingRect = getBoundingRectangle($MU),
        MUTop = boundingRect.top,
        MUHeight = boundingRect.height,
        MUBottom = MUTop + MUHeight;

    var // for the window:
        winTop = $document.scrollTop(),
    // winHeight = $(window).height(), // this doesn't seem to work correctly on news.ycombinator.com
        winHeight = window.innerHeight,
        winBottom = winTop + winHeight;


    return ( (MUTop > winTop && MUTop < winBottom) ||
        (MUBottom > winTop && MUBottom < winBottom) );
}

function changeFontSize($jQuerySet, isBeingIncreased) {
    if (!$jQuerySet || !$jQuerySet.length) {
        return;
    }

    for (var i = 0; i < $jQuerySet.length; i++) {
        var $el = $jQuerySet.eq(i);
        var font = $el.css('font-size');
        var numericVal = parseFloat(font);
        var MU = font.substring(numericVal.toString().length);

        var newNumericVal = isBeingIncreased?(numericVal+2): (numericVal-2);
        $el.css('font-size', newNumericVal+MU);

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
 detect if a MU should be counted as a match or not. Also helps with efficiency.
 5) Other minor optimizations
 6) Added comments
 */

function highlightInMU($MU, pattern) {

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


    if ($MU.length && patternLowerCase && patternLowerCase.length) {
        $MU.each(function() {
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