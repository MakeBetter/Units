// The following is just the dependencies from underscore.js 1.4.4(http://underscorejs.org/)
// that we need for the Events module from Backbone.

// Tip: Using the variable `root` (which is assigned `this` (which is `window` in the browser)),
// this code basically adds `_` as a property of `window`. This makes `_` available globally.
// [Note: the `window` object belongs to the extension and is not shared with the `window`
// of the page. So there aren't going to be any issues if the page uses the underscore/lodash
// itself, etc.]

(function() {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    // var previousUnderscore = root._;

    // Establish the object that gets returned to break out of a loop iteration.
    var breaker = {};

    var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

// Create quick reference variables for speed access to core prototypes.
    var
        // push             = ArrayProto.push,
        slice            = ArrayProto.slice;
        //concat           = ArrayProto.concat,
        //toString         = ObjProto.toString,
        //hasOwnProperty   = ObjProto.hasOwnProperty;

// All **ECMAScript 5** native function implementations that we hope to use
// are declared here.
    var
        nativeForEach      = ArrayProto.forEach,
        // nativeMap          = ArrayProto.map,
        // nativeReduce       = ArrayProto.reduce,
        // nativeReduceRight  = ArrayProto.reduceRight,
        // nativeFilter       = ArrayProto.filter,
        // nativeEvery        = ArrayProto.every,
        // nativeSome         = ArrayProto.some,
        // nativeIndexOf      = ArrayProto.indexOf,
        // nativeLastIndexOf  = ArrayProto.lastIndexOf,
        // nativeIsArray      = Array.isArray,
        nativeKeys         = Object.keys;
        // nativeBind         = FuncProto.bind;

    // Create a safe reference to the Underscore object for use below.
    var _ = function(obj) {
        if (obj instanceof _) return obj;
        if (!(this instanceof _)) return new _(obj);
        this._wrapped = obj;
    };

    // Export the Underscore object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `_` as a global object via a string identifier,
    // for Closure Compiler "advanced" mode.
    // if (typeof exports !== 'undefined') {
        //     if (typeof module !== 'undefined' && module.exports) {
        //         exports = module.exports = _;
        //     }
        //     exports._ = _;
    // } else {
        root._ = _;
    // }

    var each = _.each = _.forEach = function(obj, iterator, context) {
        if (obj == null) return;
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (var i = 0, l = obj.length; i < l; i++) {
                if (iterator.call(context, obj[i], i, obj) === breaker) return;
            }
        } else {
            for (var key in obj) {
                if (_.has(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) return;
                }
            }
        }
    };

    _.extend = function(obj) {
        each(slice.call(arguments, 1), function(source) {
            if (source) {
                for (var prop in source) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };

    // Retrieve the names of an object's properties.
    // Delegates to **ECMAScript 5**'s native `Object.keys`
    _.keys = nativeKeys || function(obj) {
        if (obj !== Object(obj)) throw new TypeError('Invalid object');
        var keys = [];
        for (var key in obj) if (_.has(obj, key)) keys[keys.length] = key;
        return keys;
    };

    // Returns a function that will be executed at most one time, no matter how
    // often you call it. Useful for lazy initialization.
    _.once = function(func) {
        var ran = false, memo;
        return function() {
            if (ran) return memo;
            ran = true;
            memo = func.apply(this, arguments);
            func = null;
            return memo;
        };
    };

    // Shortcut function for checking if an object has a given property directly
    // on itself (in other words, not on a prototype).
    _.has = function(obj, key) {
        return hasOwnProperty.call(obj, key);
    };

    // Generate a unique integer id (unique within the entire client session).
    // Useful for temporary DOM ids.
    var idCounter = 0;
    _.uniqueId = function(prefix) {
        var id = ++idCounter + '';
        return prefix ? prefix + id : id;
    };
}).call(this);



