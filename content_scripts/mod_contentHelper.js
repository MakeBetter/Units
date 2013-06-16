/**
 * Content Script helper: This module contains helper functions are related to the content scripts i.e. generally ones
 * that depend on the DOM of the page. (Generic helper functions, which are not content script specific, are defined
 * in mod_commonHelper.js -- these may be shared between both the content and background scripts.
 *
 * This module is meant to be a collection of miscellaneous helper functions, rather than a single
 * cohesive module with a particular role.
 */

_u.mod_contentHelper = (function(CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        elementAllowsSingleKeyShortcut: elementAllowsSingleKeyShortcut,
        elementAllowsTyping: elementAllowsTyping,
        suppressEvent: suppressEvent,
        ancestorElements: ancestorElements,
        closestCommonAncestor: closestCommonAncestor,
        isUnitsProjNode: isUnitsProjNode,
        isRtMouseButton: isRtMouseButton,
        filterOutUnneededMutations: filterOutUnneededMutations,
        getVisibleInnerText: getVisibleInnerText
    };

    /*-- Module implementation --*/
    /**
     * Returns true when single key shortcuts can be invoked when the specified element has focus. Exceptions are
     * elements which allow typing text on them + the <select> element
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function elementAllowsSingleKeyShortcut(element) {
        if (elementAllowsTyping(element) || element.tagName.toLowerCase() === "select" || isEmbedElement(element)) {
            return false;
        }
        return true;
    }

    /**
     * Does the specified element allow text to be typed on (when it has focus)
     * @param element
     * @returns {boolean}
     */
    function elementAllowsTyping(element) {
        var tagName_lowerCase = element.tagName.toLowerCase(),
            typeProp_lowerCase = element.type && element.type.toLowerCase(),

            editableInputTypes = ['text', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'password',
                'range', 'search', 'tel', 'time', 'url', 'week'];

        // if 'input' element with an unspecified type or an explicitly specified editable one
        if (tagName_lowerCase === 'input' && ( !typeProp_lowerCase || editableInputTypes.indexOf(typeProp_lowerCase) >= 0)) {

            return true;
        }

        if (tagName_lowerCase == 'textarea' || tagName_lowerCase == 'select') {
            return true;
        }

        if (element.isContentEditable) {
            return true;
        }

        // for everything else
        return false;
    }

    function isEmbedElement(element) {
        return ["embed", "object", "iframe"].indexOf(element.nodeName.toLowerCase()) > -1;
    }

    function suppressEvent(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    }

    /**
     * returns an array containing ancestor elements in document order
     * @param element
     * @return {Array of DOM elements}
     */
    function ancestorElements(element) {
        var ancestors = [];
        for (; element; element = element.parentElement) {
            ancestors.unshift(element);
        }
        return ancestors;
    }

    /** Returns that DOM element which is the closest common ancestor of the elements specified,
     * or null if no common ancestor exists.
     * @param {array|jQuery} elements Array of DOM elements OR a jQuery set of one of more elements
     * @return {HtmlElement}
     */
    function closestCommonAncestor(elements) {

        if(!elements || !elements.length) {
            return null;
        }

        if (elements.length ===1) {
            return elements[0];
        }

        // each element of this array will be an array containing the ancestors (in document order, i.e. topmost first) of
        // the element at the corresponding index in 'elements'
        var ancestorsArray = [],
            elementsLen = elements.length,
            ancestorsArrLen;

        for (var i = 0; i < elementsLen; ++i ) {
            ancestorsArray[i] = ancestorElements(elements[i]);
        }

        // check if all share the same topmost ancestor
        if (!arraysHaveSameElementAtSpecifiedIndex(ancestorsArray, 0)) {
            return null;  // no common ancestor
        }

        // This will hold the index of the element in 'elements' with the smallest number of ancestors (in other words,
        // the element that is highest in the DOM)
        var highestElementIndex = 0;


        ancestorsArrLen = ancestorsArray.length;

        for (i = 0; i < ancestorsArrLen; ++i) {
            if (ancestorsArray[i].length < ancestorsArray[highestElementIndex].length) {
                highestElementIndex = i;
            }
        }

        var ancestorArrayWithFewestElements = ancestorsArray[highestElementIndex]; // use this as the reference array
        var closestCommonAnstr = null,
            arrLen = ancestorArrayWithFewestElements.length;
        for (i = 0; i < arrLen; ++i) {
            if (arraysHaveSameElementAtSpecifiedIndex(ancestorsArray, i)) {
                closestCommonAnstr = ancestorArrayWithFewestElements[i];
            }
            else {
                break;
            }
        }

        return closestCommonAnstr;
    }

    // an array containing ancestor elements in document order
    function arraysHaveSameElementAtSpecifiedIndex(arrayOfArrays, index) {

        var refElement = arrayOfArrays[0][index],
        len = arrayOfArrays.length;

        for (var i = 1; i < len; ++i ) {
            if (arrayOfArrays[i][index] !== refElement) {
                return false;
            }

        }
        return true;
    }

    // gets the nearest containing (including itself) DOM Node that is a DOM Element
    function getNearestElement(node) {
        while(node) {
            if (node.nodeType === document.ELEMENT_NODE) {
                return node;
            }
            else {
                node = node.parentElement || node.parentNode;
            }
        }
    }

    /**
     * Checks if the specified DOM Node belongs to the UnitsProject
     * @param {Node} node
     * @returns {boolean}
     */
    function isUnitsProjNode(node) {
        var element = getNearestElement(node);
        if (!element) return false;

        if (_u.$topLevelContainer[0].contains(element) || element.classList.contains(CONSTS.class_addedByUnitsProj) ||
            $(element).parents().hasClass(CONSTS.class_addedByUnitsProj)) {
            return true;
        }
        return false;
    }

    // checks if the mouse event specified is for the right mouse button
    function isRtMouseButton(e) {
        // following right code mostly taken from http://www.quirksmode.org/js/events_properties.html
        var isRtButton;
//    if (!e) var e = window.event;
        if (e.which) isRtButton = (e.which == 3);
        else if (e.button) isRtButton = (e.button == 2);

        return isRtButton;
    }

    //filters out unneeded mutations (currently it only removes mutations related to UnitsProj elements)
    function filterOutUnneededMutations (mutations) {
        console.time("mutsFiltering");
        var len = mutations.length;
        for (var i = 0; i < len; ++i) {
            var mutation = mutations[i];
            if (canIgnoreMutation(mutation)) {
                mutations.splice(i, 1); // remove current mutation from the array
                --i;
                --len;
            }
        }
        console.timeEnd("mutsFiltering");
    }
    function canIgnoreMutation(mutationRecord) {
        if (isUnitsProjNode(mutationRecord.target)) {
            return true;
        }
//        if (mutationRecord.type === "childList" && canIgnoreAllChildlistNodes(mutationRecord.addedNodes) &&
//            canIgnoreAllChildlistNodes(mutationRecord.removedNodes)) {
//            return true;
//        }
        return false;
    }

    /***
     * Get the inner text of an element after removing any descendants that are not visible.
     * @param element Parent element to get the inner text of
     * @returns {string} text
     */
    function getVisibleInnerText(element) {
        var $element = $(element),
            class_invisibleElements = "UnitsProj-invisible-text";

        $element.find(":not(:visible)").addClass(class_invisibleElements); // add class to all invisible descendants

        var $elementClone = $element.clone();
        $elementClone.find("." + class_invisibleElements).remove();

        $element.find(class_invisibleElements).removeClass(class_invisibleElements); // revert any changes made to the page's DOM

        var text = $elementClone.text();
        if (!text && $element.is('input[type = "button"]')) {
            text = element.value;
        }

        return text;
    }
//    function canIgnoreAllChildlistNodes(nodes) {
//        if (nodes && nodes.length) {
//            for (var i = 0; i < nodes.length; ++i) {
//                var node = nodes[i];
//                if(!isUnitsProjNode(node)) {
//                    return false;
//                }
//            }
//        }
//        return true;
//    }

    return thisModule;

})(_u.CONSTS);
