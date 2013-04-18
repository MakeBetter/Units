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
     * Returns a immutable or "read-only" copy of the object passed in (i.e. all its properties are read-only.
     * By default, the returned object is "deeply immutable", i.e. any sub-objects are immutable as well.)
     * @param {object} input Input object
     * @param {boolean} [shallow] Specify `true` to create a "shallow immutable" object. Defaults to false.
     */
    getImmutableCopy: function getImmutableCopy(input, shallow) {

        var output;

        if (typeof input === "object") {
            output = {};
        }
        //functions are objects too and can have properties
        else if (typeof input === "function") {
            // `eval` is not good in general. But it seems the best option in the given case. Also, what is being
            // eval'd is *not* a string with a random origin, and so is not really dangerous. (Using `bind` or `apply`
            // would make the created function have a preset `this` which is not desirable. Additionally, it would
            // make the function lose its name, if it had one.)
            output = eval('(' + input.toString() + ')');
        }
        else {
            return input;
        }

        for (var key in input) {
            var value = input[key];
            if (!shallow) {
                value = getImmutableCopy(value);
            }
            Object.defineProperty(output, key, {value: value, writable: false, enumerable: true});
        }
        Object.freeze(output); // to prevent addition of new properties
        return output;
    }
};
