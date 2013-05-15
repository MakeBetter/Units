/**
 * The "mutation observer" module.
 * Detects changes in the DOM/url and triggers events in response.
 *
 * Events triggered:
 * 'dom-mutation' args passed: mutations
 * 'dom-mutations-grouped' args passed: mutations
 * 'url-change' args passed: new-url, old-url
 *
 * Dependencies:
 * mod_chromeAltHack: (Just in order to determine whether the 'accesskey' attribute needs to be observed for
 * mutations, depending on whether mod_chromeAltHack is loaded.)
 */
_u.mod_mutationObserver = (function($, mod_chromeAltHack, mod_contentHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        start: start,    // start observing DOM mutations
        stop: stop      // stop observing DOM mutations
    });

    /*-- Module implementation --*/
    var timeout_domChanges,

        // millisecs. A sequence of DOM changes in which consecutive ones are separated by less than this period, will get
        // grouped for the "dom-mutations-grouped" event.
        groupingInterval_for_DomMutations = 150,
        currentUrl = window.location.href;

    var mutationObserver = new MutationObserver(_processMutations),
        timeout_warning

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
    }

    // stop observing DOM mutations
    function stop() {
        var warnInSeconds = 30;

        mutationObserver.disconnect();

        (function setWarningTimeout() {
            timeout_warning = setTimeout(function() {
                console.warn('Mutation Observer was stopped (+)' + warnInSeconds + ' seconds ago and not restarted.');
                setWarningTimeout();
            }, warnInSeconds * 1000);

        })();

    }

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

    // Monitors dom changes. Responsible for triggering the events 'url-change', 'dom-mutation' and
    // 'dom-mutations-grouped'.
    var _onDomChange = function(mutations) {

        thisModule.trigger("dom-mutation", mutations);

        var newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            thisModule.trigger("url-change", newUrl, currentUrl);
            currentUrl = newUrl;
        }

        // The following ensures that a set of closely spaced DOM mutation events triggers only one
        // "dom-mutations-grouped" event. Expensive operations can subscribe to this event instead of the
        // "dom-mutation" event.
        clearTimeout(timeout_domChanges);
        groupedMutations.push(mutations);
        timeout_domChanges = setTimeout( function () {
            thisModule.trigger("dom-mutations-grouped", groupedMutations);
            groupedMutations = []; // reset
        }, groupingInterval_for_DomMutations);

    };

    // returns boolean
    function _canIgnoreMutation(mutationRecord) {
        if (mutationRecord.type === "attributes" && mod_contentHelper.isUnitsProjElement(mutationRecord.target)) {
            return true;
        }

        if (mutationRecord.type === "childList") {

            // returns boolean
            var canIgnoreAllNodes = function(nodes) {

                var canIgnore = true; // assume true to start off

                if (nodes && nodes.length) {
                    for (var i = 0; i < nodes.length; ++i) {
                        var node = nodes[i];
                        if(!  ((node.nodeType === document.ELEMENT_NODE && mod_contentHelper.isUnitsProjElement(node)) ||
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

})(jQuery, _u.mod_chromeAltHack, _u.mod_contentHelper);