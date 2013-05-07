/**
 * Content Script helper: This module contains helper functions are related to the content scripts i.e. generally ones
 * that depend on the DOM of the page. (Generic helper functions, which are not content script specific, are defined
 * in mod_commonHelper.js -- these may be shared between both the content and background scripts.
 *
 * This module is meant to be a collection of miscellaneous helper functions, rather than a single
 * cohesive module with a particular role.
 */

_u.mod_contentHelper = (function(mod_core, CONSTS) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = {
        elementAllowsSingleKeyShortcut: elementAllowsSingleKeyShortcut,
        elementAllowsTyping: elementAllowsTyping,
        suppressEvent: suppressEvent,
        ancestorElements: ancestorElements,
        closestCommonAncestor: closestCommonAncestor,
        isUnitsProjElement: isUnitsProjElement
    };

    /*-- Module implementation --*/
    /**
     * Returns true when single key shortcuts can be invoked when the specified element has focus. Exceptions are
     * elements which allow typing text on them + the <select> element
     * @param {HTMLElement} element
     * @returns {boolean}
     */
    function elementAllowsSingleKeyShortcut(element) {
        if (elementAllowsTyping(element) || element.tagName.toLowerCase() === "select") {
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
     * @param {Array of DOM Elements | jQuery wrapper} elements
     * @return {DOM Element}
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

        var isAncestorAtSpecifiedIndexCommon = function(index) {

            var referenceAncestor = ancestorsArray[0][index];

            ancestorsArrLen = ancestorsArray.length;
            for (var i = 1; i < ancestorsArrLen; ++i ) {
                if (ancestorsArray[i][index] !== referenceAncestor) {
                    return false;
                }

            }
            return true;
        };

        // check if all share the same topmost ancestor
        if (!isAncestorAtSpecifiedIndexCommon(0)) {
            return null;  // no common ancestor
        }

        // This will hold the index of the element in 'elements' with the smallest number of ancestors (in other words,  the element
        // that is highest in the DOM)
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
            if (isAncestorAtSpecifiedIndexCommon(i)) {
                closestCommonAnstr = ancestorArrayWithFewestElements[i];
            }
            else {
                break;
            }
        }

        return closestCommonAnstr;
    }

    function isUnitsProjElement(element) {
        if (mod_core.$topLevelContainer[0].contains(element) ||
            element.classList.contains(CONSTS.class_addedByUnitsProj) ||
            $(element).parents().hasClass(CONSTS.class_addedByUnitsProj)) {
            return true
        }
        return false;
    }

    return thisModule;

})(_u.mod_core, _u.CONSTS);