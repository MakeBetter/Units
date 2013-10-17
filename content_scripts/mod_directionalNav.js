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
            dirDistances = [],

            // minimum directional distance between both sets of *corresponding* sides for an element to be considered a
            // match. E.g: if direction is 'up' or 'down', both the following should be higher than the value specified
            // by this variable:
            // 1) the vertical distance between the top sides of the elements
            // 2) the vertical distance between their bottom sides
            // (we consider this condition if actual "directional distance" between the two elements is negative, that
            // is they have "directional overlap".)
            minDirDistanceOfCorrespondingSides = 5,

            /* the following are for elements that are "ideal" candidates for a match, meaning they have a positive
             "perpendicular overlap" (while being to the correct side of the reference element directionally) */
            bestMatchIndex = -1,
            bestMatchOverlap = -Infinity,
            bestMatchDistance = Infinity,

            /* the following are for "fallback" matches, which are elements that (lie to the correct side of the
            reference element directionally, but) do NOT a positive "perpendicular overlap" */
            bestFallbackMatchIndex = -1,
            highestFallbackMatchScore = -Infinity;

        for (i = 0; i < len; i++) {
            if (i === ownIndex) continue;
            var otherRect = rects[i],
                sum,        // Sum of ownRect's + otherRect's sides that are perpendicular to the direction of movement)
                maxDiff,    // Max diff between any two points in the two rects (measured perpendicular to the direction
                            // of movement). if this is less than `sum`, there is a "perpendicular overlap"
                perpOverlap,
                // "directional distance" - distance between elements along the direction specified. This will
                // usually be positive, and if not there is a directional overlap between the elements  
                dirDistance,
                // directional distance between the leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                leadingEdgeDirDistance,
                // directional distance between the non-leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                nonLeadingEdgeDirDistance;

                if (direction === 'right' || direction === 'left') {
                sum = ownRect.height + otherRect.height;
                maxDiff = Math.max(ownRect.top + ownRect.height, otherRect.top + otherRect.height) -
                    Math.min(ownRect.top, otherRect.top);

                perpOverlap = sum - maxDiff; // higher the value, more the overlap

                var ownRectRight = ownRect.left + ownRect.width,
                    otherRectRight = otherRect.left + otherRect.width;
                if (direction === 'right') {
                    dirDistance = otherRect.left - ownRectRight;
                    leadingEdgeDirDistance = otherRectRight - ownRectRight;
                    nonLeadingEdgeDirDistance = otherRect.left - ownRect.left;
                }
                else {
                    dirDistance = ownRect.left - otherRectRight;
                    leadingEdgeDirDistance = ownRect.left - otherRect.left;
                    nonLeadingEdgeDirDistance = ownRectRight - otherRectRight;
                }
            }
            else if (direction === 'down' || direction === 'up') {
                sum = ownRect.width + otherRect.width;
                maxDiff = Math.max(ownRect.left + ownRect.width, otherRect.left + otherRect.width) -
                    Math.min(ownRect.left, otherRect.left);

                perpOverlap = sum - maxDiff; // higher the value, more the overlap

                var ownRectBottom = ownRect.top + ownRect.height,
                    otherRectBottom = otherRect.top + otherRect.height;
                if (direction === 'down') {
                    dirDistance = otherRect.top - ownRectBottom;
                    leadingEdgeDirDistance = otherRectBottom - ownRectBottom;
                    nonLeadingEdgeDirDistance = otherRect.top - ownRect.top;
                }
                else {
                    dirDistance = ownRect.top - otherRectBottom;
                    leadingEdgeDirDistance = ownRect.top - otherRect.top;
                    nonLeadingEdgeDirDistance = ownRectBottom - otherRectBottom;
                }
            }

            perpendicularOverlaps[i] = perpOverlap;
            dirDistances[i] = dirDistance;

            if (perpOverlap > 0 &&
                // the following 'or' condition ensures that don't miss any element that can be thought
                // to be positioned on the correct side of `refEl` as per the `direction` specified
                (dirDistance > 0 ||
                    (Math.min(leadingEdgeDirDistance, nonLeadingEdgeDirDistance) >= minDirDistanceOfCorrespondingSides))) {

                if (dirDistance < bestMatchDistance ||
                    (dirDistance === bestMatchDistance && perpOverlap > bestMatchOverlap)) {

                    bestMatchIndex = i;
                    bestMatchOverlap = perpOverlap;
                    bestMatchDistance = dirDistance;
                }
            }

            // if an "ideal" match (elements with positive perpOverlap; see comments near the top) is not found, the
            // following allows us to find best fallback match (elements with -ve perpOverlap ) from amongst elements
            // which lie in the correct side of `refEl` as per the `direction` specified
            if (bestMatchIndex === -1 &&
                (dirDistance > 0 ||
                    (Math.min(leadingEdgeDirDistance, nonLeadingEdgeDirDistance) >= minDirDistanceOfCorrespondingSides))) {

                var matchScore = perpOverlap - dirDistance;
                if (matchScore > highestFallbackMatchScore) {
                    highestFallbackMatchScore = matchScore;
                    bestFallbackMatchIndex = i;
                }
            }
        }
        return bestMatchIndex > -1? bestMatchIndex: bestFallbackMatchIndex;
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

