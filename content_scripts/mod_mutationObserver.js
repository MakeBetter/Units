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

    var mutationObserver = new MutationObserver(mutationsHandler),
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

    function mutationsHandler(mutations) {
        filterMutations(mutations); // removes mutations that don't interest us
        // if there are mutations left still
        if (mutations.length) {
            handleRelevantMutations(mutations);
        }
    }
   
    // filters out mutations that don't interest us (currently it only removes mutations related to UnitsProj elements)
    function filterMutations(mutations) {
        for (var i = 0; i < mutations.length; ++i) {
            if (canIgnoreMutation(mutations[i])) {
                mutations.splice(i, 1); // remove current mutation from the array
                --i;
            }
        }
    }

    var groupedMutations = [];
    // Responds to dom changes. In particular, triggers the events 'url-change', 'dom-mutation' and
    // 'dom-mutations-grouped'.
    function handleRelevantMutations(mutations) {

        // Call this on every mutation, because,in theory, JS code on a page can replace the body element with a new one at
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

    function canIgnoreMutation(mutationRecord) {
        if (mod_contentHelper.isUnitsProjNode(mutationRecord.target)) {
            return true;
        }
        if (mutationRecord.type === "childList" && canIgnoreAllChildlistNodes(mutationRecord.addedNodes) &&
            canIgnoreAllChildlistNodes(mutationRecord.removedNodes)) {
                return true;
        }
        return false; 
    }

    function canIgnoreAllChildlistNodes(nodes) {
        if (nodes && nodes.length) {
            for (var i = 0; i < nodes.length; ++i) {
                var node = nodes[i];
                if(!mod_contentHelper.isUnitsProjNode(node)) {
                    return false;
                }
            }
        }
        return true;
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