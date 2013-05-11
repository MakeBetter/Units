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
    * Top-level functions in the module should be defined using the function definition syntax, as opposed to the function
    expression syntax. (This allows using references to them in the `thisModule`, even though they are defined below it).
    But for defining inner functions, the function expression syntax is preferred.
    * Public functions: For each function to be exposed publicly, create a property in `thisModule` having the same name
    as the function, the value of which should be a reference to the function.
    * Within the module's code, public functions should be invoked directly with their local references (i.e. simply
    foo() instead of  thisModule.foo()). This makes it easier to change a function's type (from private to public, or
    vice-versa) when required.
 - Event handlers
    Each module can have event handlers for external events. For the sake of better organization, as well as self
    documenting code, all event bindings should be done near top of the module's definition (when possible).
 */

// A template for modules in this project
_u.mod_moduleName = (function($/*, mod_1*/) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_events, {
        func_foo: func_foo
    });

//  /*-- Event bindings --*/
//  thisModule.listenTo(mod_1, "eventA", _onEventA);
//  thisModule.listenTo(mod_1, "eventA", _onEventA);

    /*-- Module implementation --*/
    var value = 5; // private

    // public function
    function func_foo() {
        //_func1();
    }

    // private function
    function _func1() {
      value++;
      console.log(value);
    }

//  function _onEventA() {
//
//  }
//  function _onEventB() {
//
//  }

    return thisModule;

})(jQuery/*, mod_1*/);    // pass as input external modules that this modules depends on