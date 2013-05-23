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
        timeout_warning;
//
//    var attrFilter = ['style', 'class', 'id', 'height', 'width'];
//    _u.mod_chromeAltHack && attrFilter.push('accesskey'); // 'accesskey' required only for "chrome alt hack"
    var mutationObserverConfig = {
        childList: true,
        attributes:true,
        characterData: true,
        subtree: true,
//        attributeFilter: attrFilter,
//            attributeOldValue: true // TODO: not using this currently. consider if using this can help optimize updating CUs
    };

    // start observing DOM mutations
    function start() {
        clearTimeout(timeout_warning);
        mutationObserver.observe(document, mutationObserverConfig);
    }

    /**
     * stop observing DOM mutations
     * @param {string} [flag] Optional. Is the string "disableExtension" if called as part of disableExtension()
     */
    function stop(flag) {
        var warnInSeconds = 30;

        mutationObserver.disconnect();

        if (flag === "disableExtension") {
            return;
        }

        (function setWarningTimeout() {
            clearTimeout(timeout_warning); // to handle cases where stop() gets called twice without a start() in between
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

    // Responds to dom changes. In particular, triggersthe events 'url-change', 'dom-mutation' and
    // 'dom-mutations-grouped'.
    function _onDomChange(mutations) {

        // This function is called, because,in theory, JS code on a page can replace the body element with a new one at
        // any time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
        ensureTopLevelContainerIsInDom();

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

    }

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

    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
    function ensureTopLevelContainerIsInDom() {
        if (!document.body.contains(_u.$topLevelContainer[0])) {
//        console.log('appending $topLevelContainer to body');
            _u.$topLevelContainer.appendTo(document.body);
        }
    }

    return thisModule;

})(jQuery, _u.mod_chromeAltHack, _u.mod_contentHelper);