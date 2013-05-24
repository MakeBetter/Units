/*
 This module exists to enable mod_keyboardLib to be aware of context that depends on the state of other modules (e.g.
 whether a CU is selected, whether the filter search has focus, etc). mod_keyboardLib does not directly ask these
 modules for such information to avoid circular dependency (which as an experiment, we are sticking to in this project
 for now, even if it means having to jump around some hoops here and there).

 Since the purpose is to avoid circular dependency, this module (on which mod_keyboardLib depends) also cannot
 probe other modules for context-related information itself. Instead, it must be updated by the other modules whenever
 they undergo relevant state changes. That is, this module will not depend on those modules, but they will have this as
 a dependency if they need some of their contextual state tracked by this module.

 Given this approach, this module (i.e. its state and functions) could have been a part of mod_keyboardLibrary. We have
 made it a separate module just to keep all context related code in a separate place.

 */
_u.mod_context = (function(mod_contentHelper){

    var thisModule = {
        setup: setup,
        isContextValid: isContextValid,
        setCUSelectedState: setCUSelectedState,
        setCUsCount: setCUsCount
    };

    var pageHasUrlData,
        pageHasCUsSpecifier,
        isCUSelected,
        numCUs; // number of CUs currently on the page

    // Method inside `supportedContexts` have names corresponding to supported context properties (see isContextValid(),
    // which calls the the corresponding method in `supportedContexts` when evaluating a specific property's status)
    var supportedContexts = {
        CUSelected: function() {
            return isCUSelected;
        },
        pageUIHasFocus: function () {
            return !mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        unitsProjUIHasFocus: function () {
            return mod_contentHelper.isUnitsProjNode(document.activeElement);
        },
        pageHasUrlData: function() {
            return pageHasUrlData;
        },
        pageHasCUsSpecifier: function() {
            return pageHasCUsSpecifier;
        },
        pageHasCUs: function() {
            return (numCUs > 0);
        }
    };

    function setup(settings) {
        var expandedUrlData = settings.expandedUrlData;
        pageHasUrlData = expandedUrlData? true: false;
        pageHasCUsSpecifier = (expandedUrlData && expandedUrlData.CUs_specifier)? true: false;

        isCUSelected = false;
        numCUs = 0;
    }

    /**
     * Returns true if all the conditions (specified as key/value pairs in the `context` hash) are true. Else false.
     * Note: only the conditions specified are checked. Other conditions can have any value, and they won't affect
     * the result.
     *
     * The list of context conditions is specified below (each should be specified as a key of the `supportedContexts`
     * hash, with the corresponding property being true or false as desired):
     *
     * Examples of `context` object:
     * {CUSelected: true}, {CUSelected: true, pageUIHasFocus: true}, {unitsProjUIHasFocus: true}, etc
     *
     * @param context
     * @returns {boolean}
     */
    function isContextValid(context) {

        for (var prop in context) {
            if (context.hasOwnProperty(prop)) {
                if (context[prop] !== supportedContexts[prop]()) {
                    return false;
                }
            }
        }
        return true;
    }

    function setCUSelectedState(state) {
        isCUSelected = state;
    }

    function setCUsCount(n) {
        numCUs = n;
    }

    return thisModule;

})(_u.mod_contentHelper);