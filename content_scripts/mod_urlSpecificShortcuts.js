

_u.mod_urlSpecificShortcuts = (function($, mod_keyboardLib, mod_CUsMgr, mod_commonHelper){
    var thisModule = {
        init: init
    };

    var expandedUrlData,
        $document = $(document);

    function init(settings) {
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
        setupMUsShortcuts(scope);
        setupActionShortcuts(scope);
    }

    function setupMUsShortcuts(scope) {
        var MUs;
        if (scope === 'CUs') {
            MUs = expandedUrlData.CUs_MUs;
        }
        else {
            MUs = expandedUrlData.page_MUs;
        }
        if (MUs) {
            for (var key in MUs) {
                if (MUs.hasOwnProperty(key)) {
                    var MU = MUs[key],
                        selectors = MU.selector,
                        kbdShortcuts = MU.kbdShortcuts;

                    if (selectors && kbdShortcuts) {
                        mod_keyboardLib.bind(kbdShortcuts, _accessMU.bind(null, selectors, scope),
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
                        mod_keyboardLib.bind(kbdShortcuts, _invokeAction.bind(null, fn, scope),
                            scope === 'CUs'? {CUSelected: true}: undefined);
                    }
                }
            }
        }
    }
    function _invokeAction (fn, scope) {
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
    function _accessMU(selectors, scope) {
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
                            // for some reason DOM API's click() works well, but jQuery's doesn't seem to always
                            $scope.find(selectorsArr[0])[0].click();
                            selectorsArr.splice(0, 1);
                            invokeSequentialClicks(selectorsArr);
                        },
                        function() {
                            return $scope.find(selectorsArr[0]).length;
                        },
                        2000
                    );
                }
            })(selectors);
        }
    }

    return thisModule;

})(jQuery, _u.mod_keyboardLib, _u.mod_CUsMgr, _u.mod_commonHelper);