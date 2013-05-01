/* JSHint config*/
/* global _u*/

"use strict";

/**
 * This module contains common/generic helper functions that are/might be used by more than one module (including the
 * background script).
 *
 * Note: This module should have no dependencies on other modules. Nor should it have any variables/state. Any data
 * required by a helper function should be passed to it. As such this is more a collection of miscellaneous helper
 * functions, rather than a single cohesive module with a particular function.
 */

_u.helper = {

    /**
     * Make the the specified object (deeply) immutable or "read-only", so that none of its properties (or
     * sub-properties) can be modified. The converted object is returned.
     * @param {object} obj Input object
     */
    makeImmutable: function makeImmutable (obj) {
        if ((typeof obj === "object" && obj !== null) ||
            (Array.isArray? Array.isArray(obj): obj instanceof Array) ||
            (typeof obj === "function")) {

            Object.freeze(obj);

            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    makeImmutable(obj[key]);
                }
            }
        }
        return obj;
    },

    /**
     * This function allows a passed function to be executed only after a specific condition is satisfied.
     * @param {function} functionToExecute The function to execute after a certain condition has been met
     * @param {function} testFunction This function should is a wrapper for the logic to test whether the condition for
     * functionToExecute has been met. It should return false till the condition is unmet, and true once it is met.
     * @param {int|undefined} timeOutMillisec Optional time out value. Default is 1 minute.
     *  If this value is zero or negative, functionToExecute won't be executed at all
     */
    executeWhenConditionMet: function (functionToExecute, testFunction, timeOutMillisec) {
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
            console.warn("UnitsProj: executeWhenConditionMet() timed out for function..:\n", functionToExecute, "\n... and testFunction:\n", testFunction);
        }
    },

    /**
     * returns true if the specified DOM element is editable (e.g: textbox), else false
     * @param {DomElement} element
     * @returns {boolean}
     */
    isElementEditable: function isElementEditable(element) {

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

        return false;
    },

    suppressEvent: function(e) {
        e.stopImmediatePropagation();
        e.preventDefault();
    },

    /**
     * returns an array containing ancestor elements in document order
     * @param element
     * @return {Array of DOM elements}
     */
    ancestorElements: function(element, blah) {
        var ancestors = [];
        for (; element; element = element.parentElement) {
            ancestors.unshift(element);
        }
        return ancestors;
    },

    /** returns that DOM element which is the closest common ancestor of the elements specified,
     * or null if no common ancestor exists.
     * @param {Array of DOM Elements | jQuery wrapper} elements
     * @return {DOM Element}
     */
    closestCommonAncestor: function(elements) {

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
            ancestorsArray[i] = _u.helper.ancestorElements(elements[i]);
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
        }

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
        for (var i = 0; i < arrLen; ++i) {
            if (isAncestorAtSpecifiedIndexCommon(i)) {
                closestCommonAnstr = ancestorArrayWithFewestElements[i];
            }
            else {
                break;
            }
        }

        return closestCommonAnstr;
    },


    /***
     * Stringifies any property in the obj that is a function (including in the nested/inner objects within it).
     * (Functions must be stringified before they can be passed to the content script, because only JSON type messages are
     * allowed between the background and content scripts)
     * @param obj
     */
    stringifyFunctions: function stringifyFunctions(obj) {

        // retruns the strigified version of the function passed
        var _stringifyFn = function(fn) {
            return "(" + fn.toString() + ")";
        };

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === "object") {
                    stringifyFunctions(obj[key]);
                }
                else if (typeof obj[key] === "function") {
                    obj[key] = _stringifyFn(obj[key])
                }
            }
        }
    },

    /***
     * De-stringifies any property in the obj that is a stringfied function (including in the nested/inner objects within it).
     * @param obj
     */
    destringifyFunctions: function destringifyFunctions(obj) {

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
    },

    /***
     * Stringifies regular expressions in a settings object.
     * Stringify regular expressions at specific known locations in the settings object:
     * settingsObj.urlDataMap[{key}][{index}].urlRegexps
     * @param settingsObj
     */
    stringifyRegexps_inSettings: function(settingsObj) {
        var stringifyRegexp_inUrlData = function(urlData) {
            var getStringifiedRegexp = function(regexp) {
                if (regexp && regexp instanceof RegExp) {
                    return regexp.source;
                }
            };

            if (!urlData || !urlData.urlRegexps) {
                return;
            }
            var urlRegexps = urlData.urlRegexps,
                regexStr;

            if (Array.isArray(urlRegexps)) {
                for (var index in urlRegexps) {
                    regexStr = getStringifiedRegexp(urlRegexps[index]);
                    if (regexStr) {
                        urlRegexps[index] = regexStr;
                    }
                }
            }
            else {
                regexStr = getStringifiedRegexp(urlRegexps);
                if (regexStr) {
                    urlData.urlRegexps = regexStr;
                }
            }

        };

        var urlDataMap = settingsObj && settingsObj.urlDataMap;

        if (!urlDataMap) {
            return;
        }

        var urlData;
        for (var key in urlDataMap) {
            urlData = urlDataMap[key];

            if (Array.isArray(urlData)) {
                for (var index in urlData) {
                    stringifyRegexp_inUrlData(urlData[index]);
                }

            }
            else {
                stringifyRegexp_inUrlData(urlData);
            }
        }
    },

    /***
     * Destringifies regular expressions in a settings object.
     * Destringify regular expressions at specific known locations in the settings object:
     * settingsObj.urlDataMap[{key}][{index}].urlRegexps
     * @param settingsObj
     */
    destringifyRegexps__inSettings: function(settingsObj) {

        var destringifyRegexp_inUrlData = function(urlData) {
            var getDestringifiedRegexp = function(regexpStr) {
                if (regexpStr && (regexpStr instanceof String || typeof regexpStr === "string")) {
                    return new RegExp(regexpStr);
                }
            };

            if (!urlData || !urlData.urlRegexps) {
                return;
            }
            var urlRegexps = urlData.urlRegexps,
                regexp;

            if (Array.isArray(urlRegexps)) {
                for (var index in urlRegexps) {
                    regexp = getDestringifiedRegexp(urlRegexps[index]);
                    if (regexp) {
                        urlRegexps[index] = regexp;
                    }
                }
            }
            else {
                regexp = getDestringifiedRegexp(urlRegexps);
                if (regexp) {
                    urlData.urlRegexps = regexp;
                }
            }

        };

        var urlDataMap = settingsObj && settingsObj.urlDataMap;

        if (!urlDataMap) {
            return;
        }

        var urlData;
        for (var key in urlDataMap) {
            urlData = urlDataMap[key];
            if (Array.isArray(urlData)) {
                for (var index in urlData) {
                    destringifyRegexp_inUrlData(urlData[index]);
                }

            }
            else {
                destringifyRegexp_inUrlData(urlData);
            }
        }
    },

    /***
     * Stringifies all the functions and regular expressions in a settings object (defaultSettings or userSettings)
     * @param {object} settingsObj
     */
    stringifyJSONUnsupportedTypes_inSettings: function(settingsObj) {
        this.stringifyFunctions(settingsObj);
        this.stringifyRegexps_inSettings(settingsObj);
    },

    /***
     * De-stringifies all the functions and regular expressions in a settings object (defaultSettings or userSettings)
     * @param {object} settingsObj
     */
    destringifyJsonUnsupportedTypes_inSettings: function(settingsObj) {
        this.destringifyFunctions(settingsObj);
        this.destringifyRegexps__inSettings(settingsObj);
    }
};
