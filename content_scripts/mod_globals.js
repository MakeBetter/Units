/*
 This module provides a way to have globally visible state shared between various modules. This is useful
 especially for cases like this:
 mod_B depends on mod_A. Data X owned by mod_B needs to be shared with mod_A. Simply exposing X as a
 property of mod_B (say mod_B.X) won't suffice since that would require mod_A to refer to mod_B as well,
 creating a circular dependency. (As in experiment in this project, we are sticking to avoiding circular
 dependencies)

 This module however doesn't depend on any other modules, so all of them can have this as a dependency and
 read/write properties to it.

 */

_u.mod_globals = (function() {
    "use strict";

    /*-- Public interface - various modules can directly read/write globally shared data as properties
     of thisModule (mod_globals) --*/
    var thisModule = {
        reset: reset,
        setup: setup,

        /*-- For reference, document below all properties set on mod_globals by various modules --*/

        // The following properties are set during the setup()
        pageHasUrlData: false,
        pageHasCUsSpecifier: false,

        // The following properties are directly set by various modules as and when required:

        // by mod_CUsMgr
        isCUSelected: false,
        numCUs_all: 0,  // count of all CUs
        numCUs_filtered: 0, // count of all CUs *minus* any CUs hidden by filtering

        // by mod_selectLink
        hintsEnabled: false // If true, mod_keyboardLib doesn't trigger any shortcuts
    };

    function reset() {
        var t = thisModule;
        t.pageHasUrlData = t.pageHasCUsSpecifier = t.isCUSelected = t.hintsEnabled = false;
        t.numCUs_all = t.numCUs_filtered = 0;
    }

    // called from mod_main
    function setup (settings) {
        reset();
        var expandedUrlData = settings.expandedUrlData;
        thisModule.pageHasUrlData = expandedUrlData? true: false;
        thisModule.pageHasCUsSpecifier = (expandedUrlData && expandedUrlData.CUs_specifier)? true: false;
    }

    return thisModule;
})();
