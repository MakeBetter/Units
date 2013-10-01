/**
 * This module sets up shortcuts that are based on the urlData (specified in urlDataMap.js) -- both for CUs and the
 * overall page
 */
_u.mod_urlSpecificShortcuts = (function($, mod_keyboardLib, mod_CUsMgr, mod_commonHelper, mod_contentHelper){
    "use strict";

    var thisModule = {
        setup: setup
    };

    var expandedUrlData,
        $document = $(document);

    function setup(settings) {
        expandedUrlData = settings.expandedUrlData;

        if (expandedUrlData) {
            setupUrlDataShortcuts('CUs'); // shortcuts for CUs
            setupUrlDataShortcuts('page'); // shortcuts for the rest of the page
        }

    }


    /**
     * Sets up the shortcuts specified. Can be used to setup either page-specific or CU-specific shortcuts depending on
     * whether the 'scope' passed is "page" or 'CUs'.
     * @param scope
     */
    function setupUrlDataShortcuts(scope) {
        setupSUsShortcuts(scope);
        setupActionShortcuts(scope);
    }

    function setupSUsShortcuts(scope) {
        var SUs;
        if (scope === 'CUs') {
            SUs = expandedUrlData.CUs_SUs;
        }
        else {
            SUs = expandedUrlData.page_SUs;
        }
        if (SUs) {
            for (var key in SUs) {
                if (SUs.hasOwnProperty(key)) {
                    var SU = SUs[key],
                        selectors = SU.selector,
                        kbdShortcuts = SU.kbdShortcuts;

                    if (selectors && kbdShortcuts) {
                        mod_keyboardLib.bind(kbdShortcuts, accessSU.bind(null, selectors, scope),
                            scope === 'CUs'? {CUSelected: true}: undefined);
                    }
                }
            }
        }
    }

    function setupActionShortcuts(scope) {
        var actions;
        if (scope === 'CUs') {
            actions = expandedUrlData.CUs_actions;
        }
        else {
            actions = expandedUrlData.page_actions;
        }
        if (actions) {
            for (var key in actions) {
                if (actions.hasOwnProperty(key)) {
                    var action = actions[key],
                        fn = action.fn,
                        kbdShortcuts = action.kbdShortcuts;
                    if (typeof fn === "function" && kbdShortcuts) {
                        mod_keyboardLib.bind(kbdShortcuts, invokeAction.bind(null, fn, scope),
                            scope === 'CUs'? {CUSelected: true}: undefined);
                    }
                }
            }
        }
    }
    function invokeAction (fn, scope) {
        var $selectedCU = mod_CUsMgr.$getSelectedCU() ;
        if (scope === 'CUs' && !$selectedCU) {
            return;
        }
        var urlDataDeepCopy =  $.extend(true, {}, expandedUrlData);
        fn($selectedCU, document, urlDataDeepCopy);
    }

    /**
     *
     * @param selectors
     * @param {string} scope Can be either "page" or 'CUs'
     */
    function accessSU(selectors, scope) {
        var $scope;

        if (scope === 'CUs') {
            $scope =  mod_CUsMgr.$getSelectedCU() ;
        }
        else  {
            $scope = $document;
        }
        if ($scope) {
            if (typeof selectors === 'string' ) {
                selectors = [selectors];
            }
            (function invokeSequentialClicks (selectorsArr) {
                if (selectorsArr.length) {
                    mod_commonHelper.executeWhenConditionMet(
                        function() {

                            var el = $scope.find(selectorsArr[0]+':visible')[0]; // The ':visible' selector appended
                            // because of an issue on Quora. There were some invisible elements present in a CU which had
                            // the same class as the valid SU.

                            // We first mouseover on the element and then click.
                            // This is a fix for #25: On Quora, keyboard shortcuts are not working properly for some
                            // links. It works better if we give the mouseover event to the element before clicking it.

                            mod_contentHelper.dispatchMouseOver(el);
                            el.click();

                            selectorsArr.splice(0, 1);
                            invokeSequentialClicks(selectorsArr);
                        },
                        function() {
                            return $scope.find(selectorsArr[0]+':visible').length;
                        },
                        2000
                    );
                }
            })(selectors);
        }
    }

    return thisModule;

})(jQuery, _u.mod_keyboardLib, _u.mod_CUsMgr, _u.mod_commonHelper, _u.mod_contentHelper);
