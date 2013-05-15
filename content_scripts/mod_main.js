// See _readme_module_template.js for module conventions

/**
 * main module (mod_main.js) This is the main module which runs the extension by using the other modules
 */
(function($, mod_domEvents, mod_utils, mod_CUsMgr, mod_mutationObserver, mod_keyboardLib,
          mod_filterCUs, mod_help, mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_context) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        // no public interface for the main module
    });

    /*-- Event bindings --*/
    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);

    var
        $topLevelContainer = _u.$topLevelContainer,
        $document = $(document), // cached jQuery object

        // the following objects are retrieved from the background script
        miscSettings,
        generalShortcuts,
        CUsShortcuts,
        expandedUrlData,
        isDisabled = null; // initialized to null. Used later to check if a value has been set to isDisabled.

    /*-- Event bindings --*/
    // This binding exists because,in theory, JS code on a page can replace the body element with a new one at any
    // time, and so the current body may no longer contain $topLevelContainer even if it was inserted earlier
    thisModule.listenTo(mod_mutationObserver, 'dom-mutation', ensureTopLevelContainerIsInDom);

    /*-- Module implementation --*/

    // don't need to wait till dom-ready. allows faster starting up of the extension's features
    // (in certain sites at least. e.g. guardian.co.uk)
    // this should not cause any issues since we are handling dom changes anyway.
    (function initializeWhenReady (){
        if (!document.body) {
            setTimeout(initializeWhenReady, 100);
            return;
        }
        $topLevelContainer.appendTo(document.body);
        initializeExtension();
    })();

    function _onUrlChange() {
        initializeExtension(); // resets the extension
    }

    // reset state and disable the extension
    function disableExtension() {

        mod_CUsMgr.reset();
        mod_filterCUs.reset();
        $topLevelContainer.empty().remove();
        removeAllEventListeners();

        if (mod_chromeAltHack) {
            mod_chromeAltHack.undoAndDisableHack();
        }

        if (generalShortcuts) {  // need this check since since the obj wouldn't be defined the first time
            mod_keyboardLib.bind(generalShortcuts.toggleExtension.kbdShortcuts, initializeExtension);
        }
    }

    function removeAllEventListeners() {
        mod_domEvents.reset();
        mod_keyboardLib.reset();
        mod_mutationObserver.stop();
//    console.log("UnitsProj: all event handlers removed");
    }

// (reset and re-)initialize the extension.
    function initializeExtension() {

        disableExtension(); // resets the state

        chrome.runtime.sendMessage({
                message: "getSettings",
                locationObj: window.location
            },
            function(settings) {

                // assign references to module level variables
                miscSettings = settings.miscSettings;
                generalShortcuts = settings.generalShortcuts;
                CUsShortcuts = settings.CUsShortcuts;
                expandedUrlData = settings.expandedUrlData;
                isDisabled = settings.isDisabled;

                // set the extension icon as enabled/disabled every time the extension is initialized.
                chrome.runtime.sendMessage({
                    message: 'setIcon',
                    isEnabled: !isDisabled
                });

                if (isDisabled) {
                    disableExtension();
                    // the following lines exist to cater to url changes in single page apps etc. TODO: is it an
                    // overkill to be handling these rare cases?
                    mod_mutationObserver.start();
                    thisModule.stopListening(); // stop listening to all events from all modules...
                    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);// ...except 'url-change'

                    return;
                }
//                else if (settings.isDisabled === "partial") {
//                    // TODO: separate this stuff from CUsMgr
//                    mod_mutationObserver.start();
//                    thisModule.stopListening(mod_mutationObserver, 'dom-mutations-grouped'); // we continue to listen to the 'url-change' event
//                    return;
//                }

                // has to be done before the the call to makeImmutable :)
                if (settings.expandedUrlData) {
                    mod_commonHelper.destringifyFunctions(settings.expandedUrlData);
                }

                mod_commonHelper.makeImmutable(settings);

                if (settings.expandedUrlData && settings.expandedUrlData.protectedWebpageShortcuts) {
                    mod_keyboardLib.setProtectedWebpageShortcuts(settings.expandedUrlData.protectedWebpageShortcuts);
                }


                // this should be done  before binding other keydown/keypress/keyup events so that these event handlers get
                // preference (i.e. [left-mouse-button+<key>] should get preference over <key>)
                /* setupExternalSearchEvents(); */

                $topLevelContainer.appendTo(document.body);

                // All else being equal, modules should be setup in relative order of priority of keyboard shortcuts
                mod_context.setup(settings.expandedUrlData);
                mod_utils.setup(miscSettings);
                mod_help && mod_help.setup(settings);
                mod_filterCUs && mod_filterCUs.setup();
                mod_CUsMgr.setup(miscSettings, expandedUrlData);
                
                setupShortcuts();

                mod_mutationObserver.start();

            }
        );
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            // re-initialize the extension when background script informs of change in settings
            if (request.message === 'settingsChanged') {
                initializeExtension();
            }

            // respond with the enabled/ disabled status of the current URL, when asked for by the background script.
            // This is used for setting the extension icon appropriately.
            else if (request.message === "isEnabled") {
                var isEnabled = (isDisabled === null) ? false : !isDisabled;
                // if isDisabled is null (with which it was initalized), then we haven't got the settings from the
                // background script yet. In that case, assume the extension to be disabled.

                sendResponse({isEnabled: isEnabled});
            }
        }
    );

    // Checks if document.body contains the $topLevelContainer element, and appends it to the body if it doesn't.
    function ensureTopLevelContainerIsInDom() {
        if (!document.body.contains($topLevelContainer[0])) {
//        console.log('appending $topLevelContainer to body');
            _u.$topLevelContainer.appendTo(document.body);
        }
    }


    // setup shortcuts that don't depend on the urlData (`expandedUrlData`)
    function setupNonUrlDataShortcuts() {

        // This is a special shortcut. Bind it first (high priority). [Instead of binding this to a toggleExtension()
        // type method, we bind the handler for re-enabling within disableExtension(), because disableExtension() resets
        // all previously bound shortcuts shortcuts]
        mod_keyboardLib.bind(generalShortcuts.toggleExtension.kbdShortcuts, disableExtension);

        // Next, bind `CUsShortcuts`...
        if (expandedUrlData && expandedUrlData.CUs_specifier) {
            mod_keyboardLib.bind(CUsShortcuts.nextCU.kbdShortcuts, mod_CUsMgr.selectNext, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.prevCU.kbdShortcuts, mod_CUsMgr.selectPrev, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.firstCU.kbdShortcuts, function() {
                mod_CUsMgr.selectFirst(true, true);
            }, {pageHasCUs: true});
            mod_keyboardLib.bind(CUsShortcuts.lastCU.kbdShortcuts, function() {
                mod_CUsMgr.selectLast(true, true);
            }, {pageHasCUs: true});
            // the last parameter (context) is redundant due to the enclosing `if` condition, but its harmless
            mod_filterCUs && mod_keyboardLib.bind(CUsShortcuts.search.kbdShortcuts, mod_filterCUs.showSearchBox,
                {pageHasCUsSpecifier: true});

        }

        // Then, bind `generalShortcuts`...
        mod_keyboardLib.bind(generalShortcuts.showHelp.kbdShortcuts, mod_help.showHelp);
        mod_keyboardLib.bind(generalShortcuts.scrollDown.kbdShortcuts, mod_utils.scrollDown);
        mod_keyboardLib.bind(generalShortcuts.scrollUp.kbdShortcuts, mod_utils.scrollUp);
        mod_keyboardLib.bind(generalShortcuts.back.kbdShortcuts, mod_utils.back);
        mod_keyboardLib.bind(generalShortcuts.forward.kbdShortcuts, mod_utils.forward);
        mod_keyboardLib.bind(generalShortcuts.open.kbdShortcuts, mod_utils.openActiveElement);
        mod_keyboardLib.bind(generalShortcuts.openInNewTab.kbdShortcuts, function() {
            mod_utils.openActiveElement(true); // open in new tab
        });
        mod_keyboardLib.bind(generalShortcuts.focusFirstTextInput.kbdShortcuts, mod_utils.focusFirstTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusNextTextInput.kbdShortcuts, mod_utils.focusNextTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusPrevTextInput.kbdShortcuts, mod_utils.focusPrevTextInput);

    }

    /**
     * Sets up the shortcuts specified. Can be used to setup either page-specific or CU-specific shortcuts depending on
     * whether the 'scope' passed is "page" or 'CUs'.
     * @param scope
     */
    function _setupUrlDataShortcuts(scope) {
        _setupMUsShortcuts(scope);
        _setupActionShortcuts(scope);
    }

    function _setupMUsShortcuts(scope) {
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

    function _setupActionShortcuts(scope) {
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

    /**
     * Sets up the keyboard shortcuts.
     * Note: Because of the order in which shortcuts are set up, the more specific ones (e.g: ones which need a CU
     * to be selected, or CUs to be present on the page) will have priority over the general shortcuts, as long as
     * the context they require is valid. That is, if 's' is defined as the shortcut for 'sharing' a CU and also for
     * scrolling down on the page, it will do the former if a CU is selected, and the latter otherwise.
     */
    function setupShortcuts() {
        setupUrlDataShortcuts();
        setupNonUrlDataShortcuts();
    }

    // setup shortcuts that depend on the urlData (`expandedUrlData`)
    function setupUrlDataShortcuts() {

        if (expandedUrlData) {
            _setupUrlDataShortcuts('CUs'); // shortcuts for CUs
            _setupUrlDataShortcuts('page'); // shortcuts for the rest of the page
        }
    }

//    function setupExternalSearchEvents() {
//
//        var keyHandler = function(e) {
//            var selection;
//
//            // If a kew is pressed while the left-mouse button is pressed down and some text is selected
//            if (ltMouseBtnDown && (selection = document.getSelection().toString())) {
//
//                if (e.type === 'keydown') {
//                    var code = e.which || e.keyCode;
//
//                    // the background script will determine which site to search on
//                    chrome.runtime.sendMessage({message: "searchExternalSite", selection: selection, keyCode: code});
//                }
//
//                suppressEvent(e); // for all types - keypress, keydown, keyup
//            }
//        };
//
//        mod_domEvents.addEventListener(document, 'keydown', keyHandler, true);
//        mod_domEvents.addEventListener(document, 'keypress', keyHandler, true);
//        mod_domEvents.addEventListener(document, 'keyup', keyHandler, true);
//
//    }

    //return thisModule; // not required for main module

})(jQuery, _u.mod_domEvents, _u.mod_utils, _u.mod_CUsMgr, _u.mod_mutationObserver, _u.mod_keyboardLib,
        _u.mod_filterCUs, _u.mod_help, _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_context);
