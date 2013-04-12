/*

 A general template suggested for modules in this program + it's conventions:

 Modules are generally created using a variation of the 'Module Pattern' in JS, which uses an immediately invoked function
 expression (IIFE) to return a module object, the methods associated with which have access to its "private" data via
 their closures.

 Notes:

 - The `thisModule` object
    * Define a `thisModule` object at the top of the IIFE, which lists down the *public interface* of the module, and will
    be returned by the IIFE.
    * Also, (if the module needs to publish or subscribe to events), `thisModule` should extend the `_u.mod_events` module).
    * `thisModule` is like the 'exports' object in node.js/require.js, but called so since triggering an event using
    `thisModule.trigger()` sounds better than `exports.trigger`. And similarly when accessing public variables
    (properties) etc using `thisModule.varName`
 - Module's data
    * All or most of the module's data should exist as private variables. These are defined outside the `thisModule` object.
    * Public variables should be avoided. But, if you must use them, they can be created as properties of the `thisModule`
    object.
 - Module's functions/methods:
    * Functions not requiring visibility outside the module (private methods) should have an underscore at the beginning
    of their names, while ones needing public visibility should not.
    * The `thisModule` object defined at the top should contain a property corresponding to each public function.
    The name of the property should be the same as that of the corresponding function, and its value a reference to the
    function.
    * Top-level functions in the module should be defined using the function definition syntax (as opposed to the function
    expression syntax). (This allows using references to them in the `thisModule`, even though they are defined below it).
    But for defining inner functions, the function expression syntax is preferred.
    * Within the module'd code, public functions should be invoked directly with their local references (i.e. simply
    foo() instead of  thisModule.foo()). This makes it easier to change a function's type (from private to public, or
    vice-versa) when required.
 - Event handlers
    * Any functions (even if technically "private") that are event handlers should be prefixed with 'eh_'
    * These will be invoked by external code (indirectly) and will be passed a specific number and type of arguments
    depending on the type of the external event they handle. So, they should be considered a part of the "public
    interface" of the module, along with the `thisModule` object. (And anything that is part of the public interface
    should stand out clearly, so that it can be handled properly while refactoring.)
 */

// A template for modules in this project
_u.mod_moduleName = (function($) {
    "use strict";

    var thisModule = $.extend({}, _u.mod_events, {

        // public methods:
        // func_foo: func_foo,
        // func_bar: func_bar

    });

//    var value = 5; // private
//
//    // public function
//    function func_foo() {
//        _func1();
//    }
//
//    // private function
//    function _func1() {
//        value++;
//        console.log(value);
//    }

    return thisModule;

})(jQuery);