/**
 * This module contains common helper functions that are used by more than one module (including the background script).
 * Note: This module should have no dependencies on other modules. Nor should it have any variables/state. Any data
 * required by a helper function should be passed to it.
 */

if (!window._u) window._u = {}; // useful for when this code is running as part of the the background script

_u.helper = {

    /**
     * Returns an object that is same as the one passed, except that all its properties are read only.
     * @param inputObj
     */
    constantize: function(inputObj) {
        var outputObj = {};
        for (var property in inputObj) {
            Object.defineProperty(outputObj, property, {
                value: inputObj[property],
                writable: false,
                enumerable: true
            });
        }
        return outputObj;
    }
}