/*

 A general template suggested for modules in this program + it's conventions:

 Modules are generally created using a variation of the 'Module Pattern' in JS, which uses an immediately invoked function
 expression (IIFE) to return a module object, the methods associated with which have access to its "private" data via
 their closures.

 Notes:

 - The `thisModule` object
    * Define a `thisModule` object at the top of the IIFE, which lists down the *public interface* of the module, and will
    be returned by the IIFE.
    * Also, (if the module needs to publish or subscribe to events), `thisModule` should extend the `_u.mod_pubSub` module).
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
    * Two public methods `setup` and `reset` should be provided by the modules which need them. These will be called
    by the main module to initialize (and reinitialize) and reset (and disable) the module
 - Events handlers
    Each module can respond to events of other modules and raise events of its own. Ideally, both these groups ("Events
    Raised and "Events Consumed") should be documented just after the `thisModule`.
 */

// A template for modules in this project
_u.mod_moduleName = (function($/*, mod_1, mod_2*/) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        reset: reset, // reset the module (and disable it if applicable/required)
        setup: setup,   // (re) initialize the module
        public_foo: public_foo
    });

    /*-- Module implementation --*/
    var private_value = 5; // private

    function reset() {

    }
    function setup() {
        reset();    // typically called to reset state before proceeding with any other setting up required
        //... setup code
    }

    // public function
    function public_foo() {
        private_bar();
    }

    // private function
    function private_bar() {
        private_value++;
      console.log(private_value);
    }
    return thisModule;

})(jQuery/*, mod_1, mod_2*/);    // pass as input external modules that this modules depends on