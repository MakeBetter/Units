
// We use this over jQuery's animated scroll, since we have more control this way, and we don't have another
// jQuery dependency (plus, it seemed it would be fun to do!). Also (in limited testing) this seemed faster.

_u.mod_smoothScroll = (function() {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        smoothScroll: smoothScroll
    });

    // The variables below are related to the currently ongoing scroll.
    // Having them as globals (within the module)  allows `invokeIncrementalScroll` to be defined as a global
    // function rather than an inner function of `smoothScroll` (which aids performance)
    var element,                // element being scrolled
        currentPosition,        // current scrollTop position of the element
        destination,            // destination scrollTop position
        intervalId,             // interval ID returned by the setInterval call used to run the animation
        areScrollingDown,       // true - scroll direction is down, false - up
        speed,                  // speed of the current scroll animation (pixes/millisecs)
        animationInProgress,    // true if a scroll animation currently ongoing
        lastInvokedTime,        // last time an incremental scroll movement was made as part of the overall animation
        startedTime,            // time the current animation was started
        maxDuration,            // max duration that this animation should end in

        // millisecs - interval between consecutive incremental scroll invocations (actually this is the *minimum*
        // interval - the actual interval might be higher due to javascript's single threaded nature. We account for
        // that by calculating the time diff. between invocations. See later.)
        intervalPeriod = 20;

    /**
     * Smooth scrolls the specified element by setting it's scrollTop to the `scrollTop` value specified
     * over `duration` millisecs.
     * If this function is called again before the previous animation is over, the previous animation is
     * instantly ended, with the scrollTop value being set to its destination value.
     * @param elementToScroll The element whose scrollTop is to be changed in smooth increments
     * @param scrollTop Destination scrollTop value at the end of animation
     * @param duration Duration of smooth scroll animation (millisecs)
     */
    function smoothScroll(elementToScroll, scrollTop, duration) {
        if (animationInProgress) {
            endAnimationAtDestination();
        }
        element = elementToScroll;
        destination = scrollTop;

        currentPosition = element.scrollTop;
//        var areScrollingDown;

        if (destination > currentPosition) {
            areScrollingDown = true;
        }
        else if (destination < currentPosition) {
            areScrollingDown = false;
        }
        else {
            return;
        }

        animationInProgress = true;
        startedTime = Date.now();
        maxDuration = duration;

        var totalDisplacement = destination - currentPosition;
        speed = totalDisplacement/duration; // pixels per millisec

        // in the following lines, we call  'invokeIncrementalScroll' once, after setting 'lastInvokedTime' to the
        // current time minus 'intervalPeriod'. This allows the first invocation of the function to take place immediately
        // rather than at the end of the 'intervalPeriod'.
        lastInvokedTime = Date.now() - intervalPeriod;
        invokeIncrementalScroll();      // invoke once immediately, before setting setInterval.
        clearInterval(intervalId);      // clear any existing interval
        intervalId = setInterval (invokeIncrementalScroll, intervalPeriod);
    }

    function endAnimationAtDestination() {
        clearInterval(intervalId);
        element.scrollTop = destination;
        animationInProgress = false;
    }

    function invokeIncrementalScroll() {

        var now = Date.now();
        currentPosition += (now - lastInvokedTime) * speed;
        lastInvokedTime = now;
        if (areScrollingDown? (currentPosition >= destination): (currentPosition <= destination) ||
            now - startedTime >= maxDuration) {

            endAnimationAtDestination();
        }
        else {
            element.scrollTop = currentPosition;
        }

    }
    return thisModule;

})();