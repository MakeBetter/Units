/**
 * A central "mutation observer" module. It runs various MutationObserver instances required by other module.
 * Among other things, having this as a central module makes it easy to disable/enable DOM mutation observing when needed.
 * Detects changes in the DOM/url and triggers events in response.
 *
 * Events triggered:
 * 'url-change' args passed: new-url, old-url
 * 'documentMuts_fallback' args passed: mutations
 * 'selectedCUTopLevelMuts' args passed: mutations
 * 'selectedCUDescendantsMuts' args passed: mutations
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
        enableFor_selectedCUAndDescendants: enableFor_selectedCUAndDescendants,
        enableFor_CUsAncestors: enableFor_CUsAncestors
    });

    /* NOTE: Throughout this file, mutation observer related variables have suffixes as follows:
    1. "fallback": This is for the "fallback" MO, which is applied to `document`. It exists to allow
    handling of mutations that are missed by the other, more specific, MOs. It also tracks url change.
    2. "selectedCUTopLevel": For the MO(s) on the selected CU's top-level element(s)
    3. "selectedCUDescendants": For the MOs on the descendants of the selected CU
    4. "CUsAncestors": For the MOs on all the ancestors of the selected CU/middle CU (in most cases,
    (most of) these ancestors will be shared by all the the CUs)

    /*-- Module implementation --*/
    var
        isEnabled,
        currentUrl = window.location.href,
        timemout_reenable,
        MutationObserver = window.MutationObserver ||window.WebKitMutationObserver || window.MozMutationObserver;


    var attrFilter = ['class', 'style', 'height', 'width', 'cols', 'colspan', 'rows', 'rowspan', 'shape', 'size'];
    // 'accesskey' required only for "chrome alt hack". It should be okay adding it to the entire list since the 'accesskey'
    // attribute hardly changes. (In mod_chromeAltHack we specifically check that an "attribute" mutation should be a 
    // mutation mutation in the 'accesskey' attr.
    mod_chromeAltHack && attrFilter.push('accesskey'); 

    var init_withSubtree = {
        childList: true,
        attributes:true,
        attributeFilter: attrFilter,
        characterData: true,
        subtree: true,
    };

    var init_withOUTSubtree = {
        childList: true,
        attributes:true,
        attributeFilter: attrFilter,
        characterData: true,
    };

    var MO_fallback = new MutationObserver(handler_fallback);
    var MOsArr_selectedCUTopLevel = [];
    var MOsArr_selectedCUDescendants = [];
    var MOsArr_CUsAncestors = [];

    var $selectedCU;
    var $CUsAncestors;

    // Enable observing of DOM mutations
    // NOTE: a function which wants to disable the mutation observer temporarily
    // before enabling it again, should make the call to enable() only if true was
    // returned from calling disable() (for example see how it's done in mod_CUsMgr.js)
    function enable() {
        isEnabled = true;
        clearTimeout(timemout_reenable);

        MO_fallback.observe(document, init_withSubtree);
        $CUsAncestors && enableFor_CUsAncestors();
        $selectedCU && enableFor_selectedCUAndDescendants();
    }

    /**
     * Disable observing of DOM mutations. Returns 'true' if mod_mutationObserver was disabled due
     * to this call, 'false' if it was already disabled.
     * @param {boolean} [allowLongDisable] Optional. If this is true, we don't automatically re-enable
     * after a specified period
     */
    function disable(allowLongDisable) {
        if (!isEnabled) {
            return false;   // already disabled, so return `false` to indicate that
        }
        else {
            if (!allowLongDisable) {
                var enableAgainPeriod = 30000; // millisecs
                clearTimeout(timemout_reenable); // just in case it is set
                timemout_reenable = setTimeout(function() {
                    console.warn('Mutation Observer was stopped ' + enableAgainPeriod + ' ms ago and not restarted. Is being re-enabled');
                    enable();
                }, enableAgainPeriod);
            }

            MO_fallback.disconnect();
            disableMOsInArray(MOsArr_CUsAncestors);
            disableMOsInArray(MOsArr_selectedCUDescendants);
            disableMOsInArray(MOsArr_selectedCUTopLevel);
            isEnabled = false;
            return true;    // to indicate that it mod_mutationObserver was disabled due to this call to disable()
        }
    }

    function handler_fallback(mutations) {
        var newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            thisModule.trigger("url-change", newUrl, currentUrl);
            currentUrl = newUrl;
        }
        else {
            thisModule.trigger("documentMuts_fallback", mutations);
        }
    }

    function handler_selectedCUTopLevel(mutations) {
        thisModule.trigger("selectedCUTopLevelMuts", mutations);
    }
    function handler_selectedCUDescendants(mutations) {
        thisModule.trigger("selectedCUDescendantsMuts", mutations);
    }
    function handler_CUsAncestors(mutations) {
        thisModule.trigger("CUsAncestorsMuts", mutations);
    }

    // if $CU is passed use it to set $selectedCU, else use whatever $selectedCU is already set to
    function enableFor_selectedCUAndDescendants($CU) {
        if ($CU) {
            $selectedCU = $CU;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($selectedCU, handler_selectedCUTopLevel, init_withOUTSubtree, MOsArr_selectedCUTopLevel);
            enableMOsForSet_and_saveRefs($selectedCU.children(), handler_selectedCUDescendants, init_withSubtree, MOsArr_selectedCUDescendants);
        }
    }

    // if $ancestors is passed use it to set $CUsAncestors, else use whatever $CUsAncestors is already set to
    function enableFor_CUsAncestors($ancestors) {
        if ($ancestors) {
            $CUsAncestors = $ancestors;
        }
        if (isEnabled) {
            enableMOsForSet_and_saveRefs($CUsAncestors, handler_CUsAncestors, init_withOUTSubtree, MOsArr_CUsAncestors);
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

    return thisModule;

})(jQuery, _u.mod_chromeAltHack, _u.mod_contentHelper);