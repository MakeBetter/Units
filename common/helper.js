/**
 * This module contains common/generic helper functions that are/might be used by more than one module (including the
 * background script).
 *
 * Note: This module should have no dependencies on other modules. Nor should it have any variables/state. Any data
 * required by a helper function should be passed to it. As such this is more a collection of miscellaneous helper
 * functions, rather than a single cohesive module with a particular function.
 */

if (!window._u) window._u = {}; // useful for when this code is running as part of the the background script

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
    }
};
