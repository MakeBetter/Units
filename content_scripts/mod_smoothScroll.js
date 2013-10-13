
// We use this over jQuery's animated scroll, since we have more control this way, and we don't have another
// jQuery dependency (plus, it seemed it would be fun to do!). Also (in limited testing) this seemed faster.

_u.mod_smoothScroll = (function() {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        smoothScroll: smoothScroll,
        isInProgress: isInProgress,
        endAtDestination: endAtDestination

    });

    // The variables below are related to the currently ongoing scroll animation.
    // Having them as globals (within the module)  allows step() to be defined as a global
    // function rather than an inner function of smoothScroll() (which means the function
    // object doesn't need to be created each time smoothScroll() is called)
    var element,                // element being scrolled
        scrollProp,             // the scroll property of the element to modify -- 'scrollTop' or 'scrollLeft'
        startPosition,          // scrollTop/scrollLeft position of the element at the time of animation beginning
        destination,            // final value of scrollTop/scrollLeft
        scrollingForward,       // true - if scroll direction is down/right; false - direction is rup/left
        speed,                  // speed of the current scroll animation (pixes/millisecs)
        inProgress,             // true if a scroll animation currently ongoing
        startTime,              // time the current animation was started
        maxDuration,            // max duration that this animation should end in
        onAnimationEnd;         // function to be called once the animation is over

    /**
     * Smooth scrolls the specified element by setting it's scrollTop/scrollLeft to the `destination` value
     * over `duration` millisecs.
     * If this function is called again before the previous animation is over, the previous animation is
     * instantly ended at it's desired destination.
     * @param elementToScroll The element whose scrollTop/scrollLeft property is to be changed in smooth
     * increments
     * @param {string} scrollProperty Specifies which scroll property to modify -- 'scrollTop' or 'scrollLeft'
     * @param value Destination scrollTop value at the end of animation
     * @param duration Duration of smooth scroll animation (millisecs)
     * @param {Function} [callback] Optional. Function to be called once the animation is over
     */
    function smoothScroll(elementToScroll, scrollProperty, value, duration, callback) {
        if (scrollProperty !== 'scrollTop' && scrollProperty !== 'scrollLeft') {
            return;
        }
        if (inProgress) {
            endAtDestination(); // instantly terminate any ongoing animation at final destination before starting a new one
        }
        element = elementToScroll;
        scrollProp = scrollProperty;
        destination = value;
        onAnimationEnd = callback;

        startPosition = element[scrollProperty];

        if (destination > startPosition) {
            scrollingForward = true;
        }
        else if (destination < startPosition) {
            scrollingForward = false;
        }
        else {
            endAtDestination();
            return;
        }

        inProgress = true;
        // TODO: we are using the following instead of the commented out line below
        // as a temporary fix for issue #77 (GitHub). It may be reverted once Chrome
        // fixes the underlying issue (Also remove the line `now = Date.now();` in
        // step() function at that point
        startTime = Date.now();
//        startTime = performance.now();
        maxDuration = duration;

        var totalDisplacement = destination - startPosition;
        speed = totalDisplacement/duration; // pixels per millisec

        requestAnimationFrame(step, elementToScroll);
    }

    function endAtDestination() {
        element[scrollProp] = destination;
        inProgress = false;
        onAnimationEnd && onAnimationEnd();
    }

    // a single animation step
    function step(now) {
        // TODO: The following line has been added  as a temporary fix for issue
        // #77 (GitHub). It may be reverted once Chrome fixes the underlying issue
        // (Also make the related change in assigning `startTime` in the function
        // smoothScroll() at that point
        now = Date.now();
        var nextPosition = Math.round(startPosition + (now - startTime) * speed);
        if (scrollingForward? (nextPosition >= destination): (nextPosition <= destination) ||
            now - startTime >= maxDuration) {

            endAtDestination();
        }
        else {
            element[scrollProp] = nextPosition;
            requestAnimationFrame(step, element);
        }
    }

    function isInProgress() {
        return inProgress;
    }
    return thisModule;

})();