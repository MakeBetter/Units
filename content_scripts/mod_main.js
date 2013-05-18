// See _readme_module_template.js for module conventions

/**
 * main module (mod_main.js) This is the main module which runs the extension by using the other modules
 */
(function($, mod_domEvents, mod_utils, mod_CUsMgr, mod_urlSpecificShortcuts, mod_mutationObserver, mod_keyboardLib,
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

        // the following are objects are retrieved from the background script
        miscSettings,
        generalShortcuts,
        CUsShortcuts,
        expandedUrlData,
        isDisabled_fromSettings = true, // assume true (disabled) till background script tells us otherwise

        // This should start off being `false` (till the user invokes toggleExtensionTemporarily() for the first time)
        // Note: Do NOT reset this in disableExtension() (or reset() for mod_main , if you make a function like that)
        isDisabled_temporarily = false,

        // modules that require init() and/or reset() to be called during extension initialization and disabling
        // respectively. All else being equal, modules should be initialized in relative order of priority of keyboard
        // shortcuts. init() is called in the order defined below, while reset() is called in the opposite order
        modulesToSetup = [mod_domEvents, mod_keyboardLib, mod_context, mod_help,
            mod_utils, mod_filterCUs, mod_urlSpecificShortcuts, mod_CUsMgr, mod_chromeAltHack];

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
    })();   // ** Main flow begins here!! **

    function _onUrlChange() {
        initializeExtension(); // resets the extension
    }

    // used to enable/disable the extension temporarily on the page -- it only affects the current run of the page,
    // i.e. no change is made to the user's settings for enabling/disabling that page)
    function toggleExtensionTemporarily() {
        if (isDisabled_temporarily) {
            isDisabled_temporarily = false;
            initializeExtension();
        }
        else {
            isDisabled_temporarily = true;
            disableExtension();
        }
    }

    // reset state and disable the extension
    function disableExtension() {
        setExtensionIcon(false); // show "disabled" icon

        // The following loop disables all modules, calling their `reset` methods (in reverse order of their setup).
        // It also removes all bindings for dom events, including keyboard shortcuts (as a result of calling restul() on
        // `mod_keyboardLib` and `mod_domEvents`
        for (var i = modulesToSetup.length - 1; i >= 0; i--) {
            var module = modulesToSetup[i];
            module && module.reset && module.reset();
        }

        // do the following once mod_keyboardLib.reset() has been called (from the loop above)
        if (!isDisabled_fromSettings  && generalShortcuts) {
            mod_keyboardLib.bind(generalShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);
        }

        mod_mutationObserver.stop();

        $topLevelContainer.empty().remove();
    }

    function setExtensionIcon(isEnabled) {
        chrome.runtime.sendMessage({
            message: 'setIcon',
            isEnabled: isEnabled
        });
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
                isDisabled_fromSettings = settings.isDisabled;

                if (isDisabled_fromSettings) {
                    disableExtension();
                    // the following lines exist to cater to url changes in single page apps etc.
                    mod_mutationObserver.start();
                    thisModule.stopListening(); // stop listening to all events from all modules...
                    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);// ...except 'url-change'
                    return;
                }

                setExtensionIcon(true); // show "enabled" icon

                // has to be done before the the call to makeImmutable :)
                if (settings.expandedUrlData) {
                    mod_commonHelper.destringifyFunctions(settings.expandedUrlData);
                }

                mod_commonHelper.makeImmutable(settings);

                if (settings.expandedUrlData && settings.expandedUrlData.protectedWebpageShortcuts) {
                    mod_keyboardLib.setProtectedWebpageShortcuts(settings.expandedUrlData.protectedWebpageShortcuts);
                }

                // Do this before binding any other shortcuts (so that his has higher priority)
                // This is required here in addition to within the disableExtension() function, since it would not
                // be able to execute there the first time that function runs (because `generalShortcuts` is not available
                // at that point)
                mod_keyboardLib.bind(generalShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);

                // this should be done  before binding other keydown/keypress/keyup events so that these event handlers get
                // preference (i.e. [left-mouse-button+<key>] should get preference over <key>)
                /* setupExternalSearchEvents(); */

                $topLevelContainer.appendTo(document.body);

                for (var i = 0; i < modulesToSetup.length; i++) {
                    var module = modulesToSetup[i];
                    module && module.init && module.init(settings);
                }
                
                setupShortcuts();

                mod_mutationObserver.start();

            }
        );
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            // re-initialize the extension when background script informs of change in settings
            if (request.message === 'settingsChanged') {
                !isDisabled_temporarily && initializeExtension();
            }

            // respond with the enabled/ disabled status of the current URL, when asked for by the background script.
            // This is used for setting the extension icon appropriately.
            else if (request.message === "isContentScriptEnabled") {
                sendResponse(!(isDisabled_fromSettings || isDisabled_temporarily));
            }

            else if(request.message === "isContentScriptTemporarilyDisabled") {
                sendResponse(isDisabled_temporarily);
            }
            else if(request.message === "toggleContentScriptTemporarily") {
                toggleExtensionTemporarily();
                sendResponse(isDisabled_temporarily);
            }
        }
    );

    // setup shortcuts that don't depend on the urlData (`expandedUrlData`)
    function setupNonUrlDataShortcuts() {

        // First, bind `CUsShortcuts`...


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

        // special shortcuts, based on the relative priority of shortcuts, these will get invoked only
        // when the page has no CUs
        mod_keyboardLib.bind(CUsShortcuts.nextCU.kbdShortcuts, mod_utils.scrollDown);
        mod_keyboardLib.bind(CUsShortcuts.prevCU.kbdShortcuts, mod_utils.scrollUp);

    }


    /**
     * Sets up the keyboard shortcuts.
     * Note: Because of the order in which shortcuts are set up, the more specific ones (e.g: ones which need a CU
     * to be selected, or CUs to be present on the page) will have priority over the general shortcuts, as long as
     * the context they require is valid. That is, if 's' is defined as the shortcut for 'sharing' a CU and also for
     * scrolling down on the page, it will do the former if a CU is selected, and the latter otherwise.
     */
    function setupShortcuts() {
        setupNonUrlDataShortcuts();
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

})(jQuery, _u.mod_domEvents, _u.mod_utils, _u.mod_CUsMgr, _u.mod_urlSpecificShortcuts, _u.mod_mutationObserver, _u.mod_keyboardLib,
        _u.mod_filterCUs, _u.mod_help, _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_context);
