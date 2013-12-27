// See _readme_module_template.js for module conventions

/**
 * main module (mod_main.js) This is the main module which runs the extension by using the other modules
 */
(function($, mod_domEvents, mod_easyScrollKeys, mod_basicPageUtils, mod_CUsMgr, mod_urlSpecificShortcuts, mod_mutationObserver,
          mod_keyboardLib, mod_selectLink, mod_filterCUs, mod_zenMode, mod_help, mod_quickSearchSelectedText,
          mod_chromeAltHack, mod_contentHelper, mod_commonHelper, mod_globals) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        // no public interface for the main module
    });

    /*-- Event bindings --*/
    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);

    var
        $topLevelContainer = _u.$topLevelContainer,

        miscShortcuts,
        CUsSpecifier,
        isDisabled_fromSettings = true, // assume true (disabled) till background script tells us otherwise

        // This should start off being `false` (till the user invokes toggleExtensionTemporarily() for the first time)
        // Note: Do NOT reset this in disableExtension() (or reset() for mod_main , if you make a function like that)
        isDisabled_temporarily = false,

        // mutation observer is disabled when the tab loses focus (unless filtering of CUs is active), and be
        // re-enabled when it gains focus
        isMutationObserverDisabled  = false,

        // modules that require setup() and/or reset() to be called during extension initialization and disabling
        // respectively. Generally, modules should be setup in relative order of priority of keyboard shortcuts
        // (this is the order in which they are listed in the array below), while reset() is called in the
        // opposite order
        modulesToSetup = [mod_domEvents, mod_keyboardLib, mod_globals, mod_chromeAltHack,
            // modules which define keyboard shortcuts are listed next, in order of priority
            mod_quickSearchSelectedText, mod_help, mod_selectLink, mod_easyScrollKeys, mod_basicPageUtils, mod_filterCUs, mod_zenMode,
            mod_urlSpecificShortcuts, mod_CUsMgr];

    /*-- Module implementation --*/

    function _onUrlChange(newUrl, currentUrl) {
        console.log("url changed from ", currentUrl, " to ", newUrl);
        reinitializeIfNotDisabledTemporarily();
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

            document.activeElement.blur(); // focus the body.

            /* NOTE: This is temporary. We are focusing body because of the Github issue where Github's keyboard shortcuts do not
             work unless the focus is with document.body. This issue is not seen on any other site so far.

             When this issue is fixed on Github, we should remove this statement (because that is the right thing to do!)
             Until then, to invoke Github's shortcuts, one would need to temporarily disable the extension, invoke shortcuts,
             and then activate extension again. */
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
        if (!isDisabled_fromSettings  && miscShortcuts) {
            mod_keyboardLib.bind(miscShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);
        }

        mod_mutationObserver.disable(true);

        $topLevelContainer.remove();

        CUsSpecifier = null;

    }

    function setExtensionIcon(isEnabled) {
        chrome.runtime.sendMessage({
            message: 'setIcon',
            isEnabled: isEnabled
        });
    }

    function reinitializeIfNotDisabledTemporarily() {
        !isDisabled_temporarily && initializeExtension();
    }

// (reset and re-)initialize the extension.
    function initializeExtension() {

        disableExtension(); // resets the state

        chrome.runtime.sendMessage({
                message: "getSettings"
            },
            function(settings) {

                // assign references to module level variables
                miscShortcuts = settings.miscShortcuts;
                isDisabled_fromSettings = settings.isDisabled;
                CUsSpecifier = settings.expandedUrlData &&  settings.expandedUrlData.CUs_specifier;

                if (isDisabled_fromSettings) {
                    disableExtension();
                    // the following lines exist to cater to url changes in single page apps etc.
                    mod_mutationObserver.enable();
                    thisModule.stopListening(); // stop listening to all events from all modules...
                    thisModule.listenTo(mod_mutationObserver, 'url-change', _onUrlChange);// ...except 'url-change'
                    return;
                }

                setExtensionIcon(true); // show "enabled" icon

                // destringify stringified functions before calling makeImmutable()
                settings.expandedUrlData && mod_commonHelper.destringifyFunctions(settings.expandedUrlData);
                mod_commonHelper.makeImmutable(settings);

                $topLevelContainer.appendTo(document.body);

                // do this before setting up other modules, so that it gets priority over shortcuts setup in them
                mod_keyboardLib.bind(miscShortcuts.toggleExtension.kbdShortcuts, toggleExtensionTemporarily);

                for (var i = 0; i < modulesToSetup.length; i++) {
                    var module = modulesToSetup[i];
                    module && module.setup && module.setup(settings);
                }

                mod_mutationObserver.enable();

                if (settings.miscSettings && settings.miscSettings.zenModeAutoOn) {
                    mod_zenMode.start();
                }
            }
        );
    }

    function isDisabled() {
        return isDisabled_fromSettings || isDisabled_temporarily;
    }

    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            // re-initialize the extension when background script informs of change in settings
            if (request.message === 'settingsChanged') {
                reinitializeIfNotDisabledTemporarily();
            }

            // respond with the enabled/ disabled status of the current URL, when asked for by the background script.
            // This is used for setting the extension icon appropriately.
            else if (request.message === "tabActivated") {
                sendResponse(!isDisabled());
                clearTimeout(timeout_onTabActivation);
                timeout_onTabActivation = setTimeout(onTabActivation, 200);
            }
            else if (request.message === "tabDeactivated") {
                clearTimeout(timeout_onTabActivation);
                onTabDeactivation();
            }
            else if(request.message === "isContentScriptTemporarilyDisabled") {
                sendResponse(isDisabled_temporarily);
            }

            else if(request.message === "toggleContentScriptTemporarily") {
                toggleExtensionTemporarily();
                sendResponse(isDisabled_temporarily);
            }

            else if(request.message === "showHelp") {
                mod_help.showHelp();
                sendResponse(true);
            }
        }
    );

    var timeout_onTabActivation;

    // triggers after the current tab got activated and remained active for a (very) brief period
    // (to prevent this from running for tabs that are briefly activated in the process
    // of moving through a bunch of tabs to reach a final one)
    function onTabActivation() {

        if (isMutationObserverDisabled) {
            isMutationObserverDisabled = false;
            mod_mutationObserver.enable();
            CUsSpecifier && mod_CUsMgr.updateCUsAndRelatedState();
            // since we had stopped observing mutations, we must check the entire document for
            // any conflicting access key attrs (if mod_chromeAltHack is being used)
            mod_chromeAltHack && mod_chromeAltHack.removeAnyConflictingAccessKeyAttr(document);
        }
    }

    function onTabDeactivation() {
        // disable mutation observer if the tab got deactivated AND didn't have CUs filtering ongoing
        if (!(mod_filterCUs && mod_filterCUs.isActive())) {
            mod_mutationObserver.disable(true);
            isMutationObserverDisabled = true;
        }
    }

    function onWindowMessage(event, targetOrigin) {
        var data = event.data,
            isMessageOriginValid = (mod_commonHelper.getHostname(event.origin) === mod_commonHelper.getHostname(chrome.runtime.getURL("")));

        if (!data ||  !isMessageOriginValid) {
            return;
        }

        if (data.message === 'hideHelpUI') {
            mod_help.hideHelp(); // hide the help iframe
            window.focus(); // restore focus to the window.
        }
        else if (data.message === 'setHelpUIHeight') {
            mod_help.positionHelpUI(data.height);
        }
        else if(data.message === 'doesPageHaveCUsSpecifier') {
            var pageHasCUsSpecifier = mod_globals.pageHasCUsSpecifier;

            var iframeHelp = document.getElementById("UnitsProj-iframe-help");
            iframeHelp.contentWindow.postMessage({message: 'pageHasCUsSpecifier', value: pageHasCUsSpecifier}, '*');
        }
        return false;
    }

    // Used to communicate with the Help UI iframe. This event does not need to be bound using mod_domEvents because we
    // don't need to remove it when extension is disabled.
    window.addEventListener('message', onWindowMessage, false);

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


    //return thisModule; // not required for main module

})(jQuery, _u.mod_domEvents, _u.mod_easyScrollKeys, _u.mod_basicPageUtils, _u.mod_CUsMgr, _u.mod_urlSpecificShortcuts, _u.mod_mutationObserver,
        _u.mod_keyboardLib, _u.mod_selectLink, _u.mod_filterCUs, _u.mod_zenMode, _u.mod_help, _u.mod_quickSearchSelectedText,
        _u.mod_chromeAltHack, _u.mod_contentHelper, _u.mod_commonHelper, _u.mod_globals);
