
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
    var element,            // element being scrolled
        startPosition,      // scrollTop position of the element at the time of animation beginning
        destination,        // destination scrollTop position
        areScrollingDown,   // true - scroll direction is down, false - up
        speed,              // speed of the current scroll animation (pixes/millisecs)
        inProgress,         // true if a scroll animation currently ongoing
        startTime,          // time the current animation was started
        maxDuration,        // max duration that this animation should end in
        onAnimationEnd;     // function to be called once the animation is over

    /**
     * Smooth scrolls the specified element by setting it's scrollTop to the `scrollTop` value specified
     * over `duration` millisecs.
     * If this function is called again before the previous animation is over, the previous animation is
     * instantly ended, with the scrollTop value being set to its destination value.
     * @param elementToScroll The element whose scrollTop is to be changed in smooth increments
     * @param scrollTop Destination scrollTop value at the end of animation
     * @param duration Duration of smooth scroll animation (millisecs)
     * @param {Function} [callback] Optional. Function to be called once the animation is over
     */
    function smoothScroll(elementToScroll, scrollTop, duration, callback) {
        if (inProgress) {
            endAtDestination(); // instantly terminate any ongoing animation at final destination before starting a new one
        }
        element = elementToScroll;
        destination = scrollTop;
        onAnimationEnd = callback;

        startPosition = element.scrollTop;

        if (destination > startPosition) {
            areScrollingDown = true;
        }
        else if (destination < startPosition) {
            areScrollingDown = false;
        }
        else {
            endAtDestination();
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
        element.scrollTop = destination;
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
        var currentPosition = Math.round(startPosition + (now - startTime) * speed);
        if (areScrollingDown? (currentPosition >= destination): (currentPosition <= destination) ||
            now - startTime >= maxDuration) {

            endAtDestination();
        }
        else {
            element.scrollTop = currentPosition;
            requestAnimationFrame(step);
        }
    }

    function isInProgress() {
        return inProgress;
    }
    return thisModule;

})();