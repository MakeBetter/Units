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
_u.mod_context = (function(){

})();