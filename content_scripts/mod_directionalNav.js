/*
 Enables 2-D directional navigation for CUs, links (or any other elements)
 */

_u.mod_directionalNav = (function($) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        getClosest: getClosest,
        getPerpOverlap: getPerpOverlap,
        getAlignmentScore: getAlignmentScore
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

        var
            ownRect = getBoundingRect(refEl),
            otherRect,

            // minimum directional distance between both sets of *corresponding* sides for an element to be considered a
            // match. E.g: if direction is 'up' or 'down', both the following should be higher than the value specified
            // by this variable:
            // 1) the vertical distance between the top sides of the elements
            // 2) the vertical distance between their bottom sides
            // (we consider this condition if actual "directional distance" between the two elements is negative, that
            // is they have "directional overlap".)
            minDirDistanceOfCorrespondingSides = 5,

            minPerpOverlap,   // a non-negative value, will be calculated later

            /* the following are "ideal" matches, i.e. elements with "perpendicular overlap" that is greater than
            `minPerpOverlap` (while lying to the correct side of the reference element directionally) */
            bestMatchIndex = -1,
            bestMatchDirDistance = Infinity,
            bestMatchAlignmentScore = -Infinity,
            bestMatchPerpOverlap = -Infinity,
//            bestMatchPerpDistBtwCenters = Infinity,

            /* the following are for "fallback" matches i.e . elements whose "perpendicular overlap" is less than
            `minPerpOverlap` (while lying to the correct side of the reference element directionally) */
            bestFallbackMatchIndex = -1,
            bestFallbackMatchDirDistance = Infinity,
            bestFallbackMatchAlignmentScore = -Infinity,
//            bestFallbackMatchPerpOverlap = -Infinity,
//            bestFallbackMatchPerpDistanceBtwCenters = Infinity,

            ownRectRight = ownRect.left + ownRect.width,
            ownRectBottom = ownRect.top + ownRect.height,
            ownRectPerpDimension;
//            perpDistanceBtwCenters,
//            ownRectPerpDimensionCenter;


        if  (direction === 'up' || direction === 'down') {
            ownRectPerpDimension = ownRect.width;
//            ownRectPerpDimensionCenter = ownRect.left + ownRectPerpDimension/2;
        }
        else {
            ownRectPerpDimension = ownRect.height;
//            ownRectPerpDimensionCenter = ownRect.top + ownRectPerpDimension/2;
        }

        var len = candidates.length;
        for (var i = 0; i < len; i++) {
            if (areSame(refEl, candidates[i]))
                continue;

            otherRect = getBoundingRect(candidates[i]);
            var
                perpOverlap = getPerpOverlap(ownRect, otherRect, direction),
                // "directional distance" - distance between elements along the direction specified. This will
                // usually be positive, and if not there is a directional overlap between the elements  
                dirDistance,
                alignmentScore = getAlignmentScore(ownRect, otherRect, direction),
                // directional distance between the leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                leadingEdgeDirDistance,
                // directional distance between the non-leading edges in specified `direction`. This will always
                // greater than `dirDistance`
                nonLeadingEdgeDirDistance;

            if (direction === 'down' || direction === 'up') {
                var otherRectBottom = otherRect.top + otherRect.height;
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
                minPerpOverlap = 0.1 * Math.max(ownRectPerpDimension, otherRect.width);  // 10% of the larger dimension
//                perpDistanceBtwCenters = Math.abs(ownRectPerpDimensionCenter - (otherRect.left + otherRect.width/2));
            }
            else { // (direction === 'right' || direction === 'left')
                var otherRectRight = otherRect.left + otherRect.width;
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
                minPerpOverlap = 0.1 * Math.max(ownRectPerpDimension, otherRect.height);  // 10% of the larger dimension
//                perpDistanceBtwCenters = Math.abs(ownRectPerpDimensionCenter - (otherRect.top + otherRect.height/2));
            }

            var bufferSmall = 20,
                bufferLarge = 60;

            // This check allows us to includes any element that might be considered to lie
            // on the correct side of `refEl` based on the `direction` specified
            if ((dirDistance > 0 ||
                (Math.min(leadingEdgeDirDistance, nonLeadingEdgeDirDistance) >= minDirDistanceOfCorrespondingSides))) {

                // Condition for "ideal matches" (see comments near the top)
                // Note: Entering the outer condition once ensures that we will find an "ideal" match. That is, we
                // *will* enter the inner block where bestMatchIndex is assigned a value (based on the initial values
                // of bestMatchDirDistance and  bestMatchPerpOverlap)
                if (perpOverlap > minPerpOverlap) {
                    var dirDistToConsider = Math.max(0, dirDistance);
                    // below we keep track of the best match so far, which is *usually* the element with the lowest
                    // `dirDistToConsider`, but can be another element if it's `dirDistToConsider` is only slightly
                    // worse than the value for the best match while having a significantly better value for `alignmentScore`
                    if ((dirDistToConsider <= bestMatchDirDistance && alignmentScore > bestMatchAlignmentScore) ||
                        (dirDistToConsider < bestMatchDirDistance - bufferSmall) ||
                        (dirDistToConsider < bestMatchDirDistance + bufferSmall &&
                            alignmentScore > bestMatchAlignmentScore + bufferLarge)) {

                        bestMatchDirDistance = dirDistToConsider;
                        bestMatchPerpOverlap = perpOverlap;
                        bestMatchAlignmentScore = alignmentScore;
//                        bestMatchPerpDistBtwCenters = perpDistanceBtwCenters;
                        bestMatchIndex = i;
                    }
                }

                // "fallback matches" (see comments near the top)
                else if (bestMatchIndex === -1) {
                    if (alignmentScore > bestFallbackMatchAlignmentScore ||
                        alignmentScore === bestFallbackMatchAlignmentScore && dirDistance < bestFallbackMatchDirDistance) {

                        bestFallbackMatchAlignmentScore = alignmentScore;
                        bestFallbackMatchDirDistance = dirDistance;
                        bestFallbackMatchIndex = i;
                    }
                }
            }
        }
        return bestMatchIndex > -1? bestMatchIndex: bestFallbackMatchIndex;
    }

    // Returns the "perpendicular overlap" between the reference rect (`refRect`) and the `otherRect`, i.e.
    // *horizontal overlap* if the `direction` is up/down, and *vertical overlap* if the direction is left/right.
    // The higher the returned value, the more the perpendicular overlap. If the returned value is negative, there
    // is no perp overlap, and the rects are actually separated by a "perpendicular distance" equal to the magnitude of
    // the negative value.
    function getPerpOverlap(refRect, otherRect, direction) {
        var perpSum,        // sum of the rectangles' heights if direction is right/left, and widths if it is up/down.
            perpMaxDiff;    // Max diff between any two points in the two rects (measured perpendicular to the direction
                            // of movement). if this is less than `perpSum`, there is a "perpendicular overlap"

        if (direction === 'right' || direction === 'left') {
            perpSum = refRect.height + otherRect.height;
            perpMaxDiff = Math.max(refRect.top + refRect.height, otherRect.top + otherRect.height) -
                Math.min(refRect.top, otherRect.top);

        }
        else { // 'down' or 'up'
            perpSum = refRect.width + otherRect.width;
            perpMaxDiff = Math.max(refRect.left + refRect.width, otherRect.left + otherRect.width) -
                Math.min(refRect.left, otherRect.left);
        }

        return perpSum - perpMaxDiff; // higher the value, more the overlap
    }

    // Score indicating how much `otherRect` is aligned to `refRect` when moving from `refRect`
    // in the direction `direction`. It measures by how much refRect's mid-point is covered by
    // `otherRect` on *each* side of the mid-point (all measurements obviously in the dimension
    // perpendicular to `direction`). So, a score of 5 means that otherRect covers refRect's 
    // mid-point by 5px on *each* side. For this reason, the max. possible score is half of
    // ownRect's size (in the dimension perpendicular to `direction`).
    // If ownRect's mid-point isn't covered by any part of refRect, the score is -ve, and its 
    // magnitude is the distance of the mid-point from the nearest edge of refRect.
    // Note: The score isn't symmetric w.r.t the two rects.
    function getAlignmentScore(refRect, otherRect, direction) {
        // Note: all measurements etc below are for the dimension perpendicular to `direction`
        var refRectMid;
        if (direction === 'right' || direction === 'left') {
            refRectMid = refRect.top + refRect.height/2;
            var otherRectTop = otherRect.top,
                otherRectBottom = otherRectTop + otherRect.height;

            if (refRectMid >= otherRectTop && refRectMid <= otherRectBottom) {
                return Math.min(refRect.height/2, refRectMid - otherRectTop, otherRectBottom  - refRectMid); // +ve
            }
            else {
                return -Math.min(Math.abs(refRectMid - otherRectTop), Math.abs(refRectMid - otherRectBottom)); // -ve
            }
        }
        else { // 'down' or 'up'
            refRectMid = refRect.left + refRect.width/2;
            var otherRectLeft = otherRect.left,
                otherRectRight = otherRectLeft + otherRect.width;

            if (refRectMid >= otherRectLeft && refRectMid <= otherRectRight) {
                return Math.min(refRect.width/2, refRectMid - otherRectLeft, otherRectRight  - refRectMid); // +ve
            }
            else {
                return -Math.min(Math.abs(refRectMid - otherRectLeft), Math.abs(refRectMid - otherRectRight)); // -ve
            }
        }
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

