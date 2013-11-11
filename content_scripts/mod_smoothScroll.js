// This module implements a smooth scrolling function.
// [We use this over jQuery's animated scroll, since we have more control this way,
// and we don't have another jQuery dependency (plus, it seemed it would be fun to do!).
// Also (in limited testing) this seemed faster.]

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
        scrollProp,             // the scroll property of the element to modify -- mostly 'scrollTop' or 'scrollLeft',
                                // but can be 'pageYOffset' or 'pageXOffset' if the element is `window`
        startPosition,          // scrollTop/scrollLeft position of the element at the time of animation beginning
        destination,            // final value of scrollTop/scrollLeft
        scrollingForward,       // true - if scroll direction is down/right; false - direction is rup/left
        speed,                  // speed of the current scroll animation (pixes/millisecs)
        inProgress,             // true if a scroll animation currently ongoing
        startTime,              // time the current animation was started
        maxDuration,            // max duration that this animation should end in
        onAnimationEnd,         // function to be called once the animation is over

        // This will later be set to one of: _setScrollProp, setPageYOffset, setPageXOffset
        // We do it this way for performance reasons (we want scrolling to be as smooth as possible)
        setScrollProp,
        _setScrollProp = function(value) {
            element[scrollProp] = value;
        },
        setPageYOffset = function(value) {
            window.scroll(window.pageXOffset, value);
        },
        setPageXOffset = function(value) {
            window.scroll(value, window.pageYOffset);
        },

        requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame;

    /**
     * Smooth scrolls the specified element by setting it's 'scrollTop'/'scrollLeft' (or 'pageYOffset' or 'pageXOffset'
     * if the element is `window`) property to the `value` specified. If `isRelative` is passed as true, `value` is
     * treated as the "delta" between the current value and the desired destination.
     * over `duration` millisecs.
     * If this function is called again before the previous animation is over, the previous animation is
     * instantly ended at it's desired destination.
     * @param elemToScroll The element whose scroll-related property is to be changed in smooth increments
     * @param {string} scrollProperty Specifies which scroll property to modify -- 'mostly 'scrollTop' or 'scrollLeft',
     * but can be 'pageYOffset' or 'pageXOffset' if the element is `window`
     * @param value Destination scrollTop value at the end of animation
     * @param duration Duration of smooth scroll animation (millisecs). NOTE: This can be specified as 0 if we want
     * no animation (i.e. scrolling should be instant)
     * @param {Function} [callback] Optional. Function to be called once the animation is over
     * @param {boolean} [isRelative] Optional. Is `value` to be treated as the "delta" between the current value and the
     * desired destination? If this is being passed, `callback` must be passed as `null` even if no callback is needed.
     */
    function smoothScroll(elemToScroll, scrollProperty, value, duration, callback, isRelative) {
        if (inProgress) {
            endAtDestination(); // instantly terminate any ongoing animation at final destination before starting a new one
        }

        // Chrome (Canary) complains about `scrollTop` being deprecated on body (while it's value seems to
        // always be 0 in firefox), and documentElement.scrollTop seems to not work reliably on chrome, so:
        if (elemToScroll === document.body || element === document.documentElement ||
            // we have this last condition so to enable `window` being passed with 'scrollTop' or 'scrollLeft'
            // (which is required to be done from mod_basicUtils.scroll())
            elemToScroll === window) {

            elemToScroll = window;
            if (scrollProperty === 'scrollTop'){
                scrollProperty = 'pageYOffset';
            }
            else if (scrollProperty === 'scrollLeft') {
                scrollProperty = 'pageXOffset';
            }
        }

        // if this was specified as window or changed to window by the code above
        if (elemToScroll === window)
            setScrollProp = scrollProperty === 'pageYOffset'? setPageYOffset: setPageXOffset;
        else
            setScrollProp = _setScrollProp;

        element = elemToScroll;
        scrollProp = scrollProperty;
        onAnimationEnd = callback;
        startPosition = element[scrollProperty];

        if (isRelative) {
            destination = startPosition + value;
        }
        else {
            destination = value;
        }

        if (duration === 0 || destination === startPosition) {
            endAtDestination();
            return;
        }

        if (destination > startPosition) {
            scrollingForward = true;
        }
        else { // (destination < startPosition)
            scrollingForward = false;
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

        requestAnimationFrame(step, elemToScroll);
    }

    function endAtDestination() {
        setScrollProp(destination);
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
            setScrollProp(nextPosition);
            requestAnimationFrame(step, element);
        }
    }

    function isInProgress() {
        return inProgress;
    }
    return thisModule;

})();