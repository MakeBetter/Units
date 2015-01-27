/*

 Most of the source code for Units consists of self-contained *modules*.
 Each module has a specific role. A module can depend on other modules.
 Modules shouldn't have circular dependencies. [This is not really a
 "sacrosanct" rule but rather an experiment employed 1) because it seems
 to make sense intuitively (to avoid circular dependencies) and 2) to see
 how this affects the way we think of and design modules. If at any point
 this becomes more limiting than useful, it can be rethought.]

 This purpose of this file is to describe the general template used for modules
 (and coding conventions used therewith).

 Modules are generally created using a variation of the Javascript pattern
 called Module Pattern. This uses an immediately invoked function expression
 (IIFE) that returns the "module object" which exposes the public functionality
 of the module, while keeping its private data hidden from the outside world.
 (The private data is visible only to code within the IIFE.)

 Notes:

 - `thisModule` - the "module object"
    * Define a `thisModule` object just at the beginning of the IIFE. This is object
    * returned by the IIFE (and assigned to `_u.mod_moduleName`). `thisModule` lists
    * down the *public interface* of the module (via its properties).
    * If the module needs to publish or subscribe to events, `thisModule` should extend
    * the `_u.mod_pubSub` module).
    * `thisModule` is like the 'exports' object in node.js/require.js. (But we think
    * thisModule.trigger() or thisModule.publicVar reads better within the code of the
    * module than than exports.trigger() etc.
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
    Raised and "Events Consumed") should be documented just after the `thisModule` (TODO: is this being done? is it even
    needed?)
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