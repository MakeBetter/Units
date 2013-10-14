/*
 Enables 2-D directional navigation for CUs, links (or any other elements)
 */

_u.mod_directionalNav = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        getClosest: getClosest
    };

    /**
     * This function enables 2D directional navigation for CUs, links etc. Given a reference element `refEl`,
     * this function returns the index of that element in the set `candidates` which is closest to `refEl` in
     * the `direction` specified (For convenience, `candidates` is allowed to include `refEl`; it will simply be
     * ignored as a candidate). If no suitable element is found, -1 is returned.
     * @param {HtmlElement|jQuery} refEl Reference element (or jQuery set, to accommodate CUs), i.e. the element
     * w.r.t. which the directional navigation is required to be done.
     * @param {Array} candidates Set of elements to consider (ALL members of this should of the same type as `refEl`).
     * As mentioned above, for convenience, `candidates` is allowed to include `refEl`; it will simply be ingored
     * as a candidate
     * @param {String} direction Direction; can be one of of 'up, 'down', 'left', 'right'
     * @param {Function} [getBoundingRect] Function to calculate bounding rects. *Needs* to be specified
     * as mod_CUMgr's `getBoundingRect` when using this function in the context of CUs, else should be left
     * unspecified, in which case we will use (a wrapper around) the DOM's native `getBoundingClientRect()`.
     * NOTE: Even though the DOM's `getBoundingClientRect()` calculates rects relative to the viewport while
     * mod_CUsMgr's `getBoundingRect()` calculates them relative to the document -- however, it doesn't matter
     * because we are only interested in the *relative* position of the various rects.
     * @param {Function} [areSame] Function to compare two CUs for equality. *Needs* to be specified when
     * calling this function in the context of CUs, else should be unspecified.
     */
    function getClosest(refEl, candidates, direction, getBoundingRect, areSame) {

        getBoundingRect || (getBoundingRect = _getBoundingRect);
        areSame || (areSame = _areSame);

        var ownIndex,   // index of `refEl` in `candidates`
            ownRect,    // rect for `refEl`
            rects = []; // rects corresponding to elements in arr

        var len = candidates.length;
        for (var i = 0; i < len; i++) {
            rects[i] = getBoundingRect(candidates[i]);
            if (areSame(refEl, candidates[i])) {
                ownIndex = i;
                ownRect = rects[i];
            }
        }

        if (!ownRect) { // in case `refEl` is not present in `candidates`
            ownRect = getBoundingRect(refEl);
        }

        var
            // "Perpendicular overlap" values between `refEl` and the elements in `candidates`. e.g: if the direction
            // specified is 'right', we consider the vertical overlap between the rects (irrespective
            // of the horizontal positions).
            // Higher the value more the overlap.
            perpendicularOverlaps = [],

            // "Directional distances" between `refEl` and elements in `candidates` - i.e. distance along the direction
            // specified (i.e horizontal distance when `direction` is left/right and vertical distance for up/down)
            distances = [],
            minPerpendicularOverlap = 1,
            maxDirectionalOverlap = 2,

            // this is for elements that have a positive perpendicular overlap (such an element is an "ideal" match)
            bestMatchIndex = -1,
            bestMatchOverlap = -Infinity,
            bestMatchDistance = Infinity,

            // this is for elements that have perpendicular overlap higher than a threshold negative value (such an
            // element is a "fallback" match)
            fallbackMatchMinPerpOverlap = -100,
            fallbackMatchIndex = -1,
            fallbackMatchOverlap = -Infinity,
            fallbackMatchDistance = Infinity;

        for (i = 0; i < len; i++) {
            if (i === ownIndex) continue;
            var otherRect = rects[i],
                sum,        // Sum of ownRect's + otherRect's sides that are perpendicular to the direction of movement)
                maxDiff,    // Max diff between any two points in the two rects (measured perpendicular to the direction
                            // of movement). if this is less than `sum`, there is a "perpendicular overlap"
                perpOverlap,
                distance;

            if (direction === 'right' || direction === 'left') {
                sum = ownRect.height + otherRect.height;
                maxDiff = Math.max(ownRect.top + ownRect.height, otherRect.top + otherRect.height) -
                    Math.min(ownRect.top, otherRect.top);

                perpOverlap = sum - maxDiff; // higher the value, more the overlap

               direction === 'right'?
                   (distance = otherRect.left - (ownRect.left + ownRect.width)):
                   (distance = ownRect.left - (otherRect.left + otherRect.width));

            }
            else if (direction === 'down' || direction === 'up') {
                sum = ownRect.width + otherRect.width;
                maxDiff = Math.max(ownRect.left + ownRect.width, otherRect.left + otherRect.width) -
                    Math.min(ownRect.left, otherRect.left);

                perpOverlap = sum - maxDiff; // higher the value, more the overlap

                direction === 'down'?
                    (distance = otherRect.top - (ownRect.top + ownRect.height)):
                    (distance = ownRect.top - (otherRect.top + otherRect.height));

            }

            perpendicularOverlaps[i] = perpOverlap;
            distances[i] = distance;

            // allow up to `maxDirectionalOverlap` directional overlap (i.e. allow distance to be negative till that value)
            if (perpOverlap >= minPerpendicularOverlap && distance >= -maxDirectionalOverlap && distance <= bestMatchDistance) {
                if (distance < bestMatchDistance ||
                    (distance === bestMatchDistance && perpOverlap > bestMatchOverlap)) {

                    bestMatchIndex = i;
                    bestMatchOverlap = perpOverlap;
                    bestMatchDistance = distance;
                }
            }

            // the following allows us to find matches overlap more than a certain small negative perpendicular overlap
            // if no element with a positive perpendicular overlap have been found yet
            if (bestMatchIndex === -1 && perpOverlap >= fallbackMatchMinPerpOverlap &&
                distance >= -maxDirectionalOverlap && distance <= fallbackMatchDistance) {

                if (distance < fallbackMatchDistance ||
                    (distance === fallbackMatchDistance && perpOverlap > fallbackMatchOverlap)) {

                    fallbackMatchIndex = i;
                    fallbackMatchOverlap = perpOverlap;
                    fallbackMatchDistance = distance;
                }
            }
        }
        return bestMatchIndex > -1? bestMatchIndex: fallbackMatchIndex;
    }

    // NOTE: since this uses getBoundingClientRect, the rect returned is relative to the viewport, but since
    // we're considering relative values only, it doesn't matter
    function _getBoundingRect(el) {
        return el.getBoundingClientRect();
    }

    function _areSame(a, b) {
        return a === b;
    }
    return thisModule;

})(jQuery);

