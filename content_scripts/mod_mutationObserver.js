/**
 * A central "mutation observer" module. It runs various MutationObserver instances required by other module.
 * Among other things, having this as a central module makes it easy to disable/enable DOM mutation observing when needed.
 * Detects changes in the DOM/url and triggers events in response.
 *
 * Events triggered:
 * 'url-change' args passed: new-url, old-url
 * 'document-mutations' args passed: mutations
 * 'CU-mutations' args passed: mutations
 *
 * Dependencies:
 * mod_chromeAltHack: (Just in order to determine whether the 'accesskey' attribute needs to be observed for
 * mutations, depending on whether mod_chromeAltHack is loaded.)
 */
_u.mod_mutationObserver = (function($, mod_chromeAltHack, mod_contentHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        enable: enable,
        disable: disable,
        enableFor_selectedCU: enableFor_selectedCU,
        enableFor_CUsAncestors: enableFor_CUsAncestors
    });

    /* NOTE: in this function mutation observer related variables have suffixes as follows:
    1. "fallback": This is for the "fallback" mutation observer, which is applied to `document`. It exists to allow
    handling of mutations that are missed by the other, more specific, mutation observers. It also tracks url change.
    2. "selectedCU": For the mutation observer(s) on the selected CU
    3. "CUsAncestors": For the mutation observer on the common ancestor of the CUs


    /*-- Module implementation --*/
    var
        isEnabled,
        currentUrl = window.location.href,
        timeout_disabledWarning;

    var attrFilter_fallback = ['class', 'style', 'height', 'width', 'cols', 'colspan', 'rows', 'rowspan', 'shape', 'size'];
    mod_chromeAltHack && attrFilter_fallback.push('accesskey'); // 'accesskey' required only for "chrome alt hack"

    var init_fallback = {
        childList: true,
        attributes:true,
        attributeFilter: attrFilter_fallback,
        characterData: true,
        subtree: true,
    };

    var MO_fallback = new MutationObserver(handler_fallback);

    var init_selectedCU = {
        childList: true,
        attributes:true,
        characterData: true,
        subtree: true,
    };
    var MOsArr_selectedCU = [];
    var $selectedCU;

    var init_CUsAncestors = {
        childList: true,
        attributes:true,
        characterData: true,
    };
    var MOsArr_CUsAncestors = [];
    var $CUsAncestors;

    // enable observing of DOM mutations
    function enable() {
        isEnabled = true;
        clearTimeout(timeout_disabledWarning);

        $selectedCU && enableFor_selectedCU();
        $CUsAncestors && enableFor_CUsAncestors();

        // Notes: Even to track (visual and state) changes to the set of CUs, we need to observe changes on the entire
        // *document* (as opposed to the common ancestor of the CUs). An example of why this is necessary: if an element
        // is added/resized near the top of the page, the position of the CUs would change.
        MO_fallback.observe(document, init_fallback);
    }

    /**
     * disable observing of DOM mutations. Returns 'true' if mod_mutationObserver was disabled due to this call, 'false'
     * if it was already dsiabled.
     * @param {string} [flag] Optional. Is the string "disableExtension" if called as part of disableExtension()
     */
    function disable(flag) {
        if (!isEnabled) {
            return false;   // already disabled, so return `false` to indicate that
        }
        else {
            var warnInSeconds = 30;
            if (flag !== "disablingExtension") {
                (function setWarningTimeout() {
                    clearTimeout(timeout_disabledWarning); // just in case it is set
                    timeout_disabledWarning = setTimeout(function() {
                        console.warn('Mutation Observer was stopped (+)' + warnInSeconds + ' seconds ago and not restarted.');
                        setWarningTimeout();
                    }, warnInSeconds * 1000);
                })();
            }

            MO_fallback.disconnect();
            disableMOsInArray(MOsArr_CUsAncestors);
            disableMOsInArray(MOsArr_selectedCU);
            isEnabled = false;
            return true;    // to indicate that it mod_mutationObserver was disabled due to this call to disable()
        }
    }

    function handler_fallback(mutations) {
//        console.log("fallback muts");
        // Call this on every mutation, because,in theory, JS code on a page can replace the body element with a new one at
        // any time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
        //ensureTopLevelContainerIsInDom();

        var newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            thisModule.trigger("url-change", newUrl, currentUrl);
            currentUrl = newUrl;
        }
        else {
            thisModule.trigger("document-mutations", mutations);
        }
    }

    function handler_selectedCU(mutations) {
//        console.log("!!!selectedCU-mutations !!!");
        thisModule.trigger("CU-mutations", mutations);
    }

    function handler_CUsAncestors(mutations) {
//        console.log("!!ancestor muts!!");
        thisModule.trigger("CUsAncestors-mutations", mutations);
    }

    // if $CU is passed use it to set $selectedCU, else use whatever $selectedCU is already set to
    function enableFor_selectedCU($CU) {
        if ($CU) {
            $selectedCU = $CU;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($selectedCU, handler_selectedCU, init_selectedCU, MOsArr_selectedCU);
        }
    }

    // if $ancestors is passed use it to set $CUsAncestors, else use whatever $CUsAncestors is already set to
    function enableFor_CUsAncestors($ancestors) {
        if ($ancestors) {
            $CUsAncestors = $ancestors;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($CUsAncestors, handler_CUsAncestors, init_CUsAncestors, MOsArr_CUsAncestors);
        }
    }

    function disableMOsInArray(MOsArr) {
        for (var i = 0; i < MOsArr.length; i++) {
            MOsArr[i].disconnect();
        }

        // empties the original array (http://stackoverflow.com/questions/1232040)
        MOsArr.length = 0;
    }


    function enableMOsForSet_and_saveRefs($set, handler, init, array) {
        disableMOsInArray(array);

        var len = $set.length;
        for (var i = 0; i < len; i++) {
            var MO = new MutationObserver(handler);
            MO.observe($set[i], init);
            array.push(MO);
        }
    }

    // 1. filters out unneeded mutations (currently it only removes mutations related to UnitsProj elements)
    // 2. sets the state of `hasChildListMutation` correctly for this batch of mutations
    // 3. calls `handleRelevantMutations` if required
//    function processMutations(mutations) {
//        hasChildListMutation = false;
//
//        for (var i = 0; i < mutations.length; ++i) {
//            var mutation = mutations[i];
//            if (canIgnoreMutation(mutation)) {
//                mutations.splice(i, 1); // remove current mutation from the array
//                --i;
//            }
//            else if (mutation.type === "childList") {
//                hasChildListMutation = true;
//            }
//        }
//
//        // if there are mutations left still
//        if (mutations.length) {
//            handleRelevantMutations(mutations);
//        }
//    }

//    function canIgnoreMutation(mutationRecord) {
//        if (mod_contentHelper.isUnitsProjNode(mutationRecord.target)) {
//            return true;
//        }
//        if (mutationRecord.type === "childList" && canIgnoreAllChildlistNodes(mutationRecord.addedNodes) &&
//            canIgnoreAllChildlistNodes(mutationRecord.removedNodes)) {
//                return true;
//        }
//        return false;
//    }

//    function canIgnoreAllChildlistNodes(nodes) {
//        if (nodes && nodes.length) {
//            for (var i = 0; i < nodes.length; ++i) {
//                var node = nodes[i];
//                if(!mod_contentHelper.isUnitsProjNode(node)) {
//                    return false;
//                }
//            }
//        }
//        return true;
//    }

    // Currently commented out because it mostly likely serves no real use, while possibly impacting performance
    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
//    function ensureTopLevelContainerIsInDom() {
//        if (!document.body.contains(_u.$topLevelContainer[0])) {
////        console.log('appending $topLevelContainer to body');
//            _u.$topLevelContainer.appendTo(document.body);
//        }
//    }

    return thisModule;

})(jQuery, _u.mod_chromeAltHack, _u.mod_contentHelper);