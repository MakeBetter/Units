/**
 * The "mutation observer" module.
 * Detects changes in the DOM/url and triggers events in response.
 *
 * Events triggered:
 * 'dom-mutations' args passed: mutations
 * 'grouped-dom-mutations' args passed: mutations
 * 'url-change' args passed: new-url, old-url
 *
 * Dependencies:
 * mod_chromeAltHack: (Just in order to determine whether the 'accesskey' attribute needs to be observed for
 * mutations, depending on whether mod_chromeAltHack is loaded.)
 *
 * ////////////Note: currently using mod_chromeAltHack to make
 * calls to it as well. Remove those and communicate using events instead. Remove this note, when this is done.
 * ////////////////////
 */
_u.mod_mutationObserver = (function($, mod_core, mod_chromeAltHack, CONSTS) {
    "use strict";

    var thisModule = $.extend({}, _u.mod_events, {

        start: start,    // start observing DOM mutations
        stop: stop      // stop observing DOM mutations

    });

    var events = {

    }

    var timeout_domChanges,

    // millisecs. A sequence of DOM changes in which consecutive ones are separated by less than this period, will get
    // grouped for the "dom-mutations-grouped" event.
        groupingInterval_for_DomMutations = 100,
        currentUrl = window.location.href;

    var mutationObserver = new MutationObserver (_processMutations),
        timeout_warning;

    // start observing DOM mutations
    function start() {
        clearTimeout(timeout_warning);
        // TODO2: tweak further to prevent triggering mutation changes for unneeded dom changes when possible
        var mutationObserverConfig = {
            childList: true,
            subtree: true,
            attributes:true,
            attributeFilter: _u.mod_chromeAltHack? ['style', 'accesskey']: ['style'], // 'accesskey' used for "chrome alt hack"
            attributeOldValue: true
        };
        mutationObserver.observe(document, mutationObserverConfig);
    };

    // stop observing DOM mutations
    function stop() {
        var warnInSeconds = 60;
        mutationObserver.disconnect();
        timeout_warning = setTimeout(function() {
            console.warn('Mutation Observer was stopped ' + warnInSeconds + ' seconds ago and not restarted.');
        }, warnInSeconds * 1000)

    };

    function _processMutations(mutations) {
        var mutationsLen = mutations.length;
        for (var i = 0; i < mutationsLen; ++i) {

            if (_canIgnoreMutation(mutations[i])) {
                mutations.splice(i, 1); // remove current mutation from the array
                --mutationsLen;
                --i;
            }
        }

        // if there are mutations left still
        if (mutations.length) {
//        console.log('dom changed. mutations: ', mutations);
            _onDomChange(mutations);
        }
    }

    var groupedMutations = [];

    // Monitors dom changes. Responsible for triggering the events 'url-change', 'dom-mutations' and
    // 'dom-mutations-grouped'.
    var _onDomChange = function(mutations) {

        thisModule.trigger("dom-mutations", mutations);

        var newUrl = window.location.href;
        if (newUrl !== currentUrl) {

            thisModule.trigger("url-change", newUrl, currentUrl);
            currentUrl = newUrl;

        }

        // The following ensures that a set of closely spaced DOM mutation events triggers only one
        // "dom-mutations-grouped" event. Expensive operations can subscribe to this event instead of the
        // "dom-mutations" event.
        clearTimeout(timeout_domChanges);
        groupedMutations.push(mutations);
        timeout_domChanges = setTimeout( function () {
            thisModule.trigger("dom-mutations-grouped", groupedMutations);
            groupedMutations = []; // reset
        }, groupingInterval_for_DomMutations);

    };

    function _onDomChange_grouped() {
//        thisModule.trigger("dom-mutations-grouped", mutations);
        thisModule.trigger("dom-mutations-grouped");
    }

    // returns boolean
    function _canIgnoreMutation(mutationRecord) {
        var class_addedByUnitsProj = CONSTS.class_addedByUnitsProj;
        if (mutationRecord.type === "attributes" && mutationRecord.target.classList.contains(class_addedByUnitsProj)) {
            return true;
        }

        if (mutationRecord.type === "childList") {

            // returns boolean
            var canIgnoreAllNodes = function(nodes) {

                var canIgnore = true; // assume true to start off

                if (nodes && nodes.length) {
                    for (var i = 0; i < nodes.length; ++i) {
                        var node = nodes[i];
                        if(!  ((node.classList && node.classList.contains(class_addedByUnitsProj)) ||
                            node.nodeType === document.TEXT_NODE)  ) {
                            canIgnore = false;
                            break;
                        }
                    }
                }

                return canIgnore;
            };

            if (canIgnoreAllNodes(mutationRecord.addedNodes) && canIgnoreAllNodes(mutationRecord.removedNodes)) {
                return true;
            }
            else {
                return false;
            }

        }
        return false; // if not returned yet
    }



    return thisModule;

})(jQuery, _u.mod_core, _u.mod_chromeAltHack, _u.CONSTS);