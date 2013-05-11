// A basic pub-sub module. Any module which needs to publish/subscribe events should extend this module.
// Currently, it is simply a reference to (and a trivially basic facade for) the Backbone's `Events` module.

_u.mod_pubSub = window.BackboneEvents;