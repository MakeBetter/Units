/**
 * This module implements the basic utility features this extension provides by to a page, like scrolling, 
 * going back/forward, etc
 */
_u.mod_basicPageUtils = (function($, mod_keyboardLib) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {

        setup: setup,

        scrollDown: scrollDown,
        scrollUp: scrollUp,

        back: back,
        forward: forward,

        focusFirstTextInput: focusFirstTextInput,
        focusNextTextInput: focusNextTextInput,
        focusPrevTextInput: focusPrevTextInput,

        openActiveElement: openActiveElement

    });

    /*-- Module implementation --*/
    var miscSettings,
        // tracks the element on which scrolling should be attempted first, when the user invokes scrolllDown/scrollUp
        elementToScroll,
        $document = $(document),
        isMac = navigator.appVersion.indexOf("Mac")!=-1; // since macs have different key layouts/behaviors;

    $document.on('click focus mouseover', function(e) {
        elementToScroll = e.target;
    });

    function setup(settings) {
        miscSettings = settings.miscSettings;
        setupShortcuts(settings.generalShortcuts, settings.CUsShortcuts);
    }
    
    function setupShortcuts(generalShortcuts, CUsShortcuts) {
        mod_keyboardLib.bind(generalShortcuts.scrollDown.kbdShortcuts, scrollDown);
        mod_keyboardLib.bind(generalShortcuts.scrollUp.kbdShortcuts, scrollUp);
        mod_keyboardLib.bind(generalShortcuts.back.kbdShortcuts, back);
        mod_keyboardLib.bind(generalShortcuts.forward.kbdShortcuts, forward);
        mod_keyboardLib.bind(generalShortcuts.open.kbdShortcuts, openActiveElement);
        mod_keyboardLib.bind(generalShortcuts.openInNewTab.kbdShortcuts, function() {
            openActiveElement(true); // open in new tab
        });
        mod_keyboardLib.bind(generalShortcuts.focusFirstTextInput.kbdShortcuts, focusFirstTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusNextTextInput.kbdShortcuts, focusNextTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusPrevTextInput.kbdShortcuts, focusPrevTextInput);

        // special shortcuts, these will get invoked only when the page has no CUs
        mod_keyboardLib.bind(CUsShortcuts.nextCU.kbdShortcuts, scrollDown, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.prevCU.kbdShortcuts, scrollUp, {pageHasCUs: false});
    }
    function scrollDown() {
        scroll(miscSettings.pageScrollDelta);
    }

    function scrollUp() {
        scroll(-miscSettings.pageScrollDelta);
    }

    // invokes the browser's 'back' action
    function back() {
        window.history.back();
    }
    // invokes the browser's 'forward' action
    function forward() {
        window.history.forward();
    }

    // Positive value for 'delta' scrolls down, negative scrolls up
    function scroll(delta) {
        var scrollElement = elementToScroll || document.activeElement || document.body,
            oldScrollVal;

        while (scrollElement) {
            oldScrollVal = scrollElement.scrollTop;
            scrollElement.scrollTop += delta;

            if (oldScrollVal !== scrollElement.scrollTop) { // if scrolled
                return;
            }
            else {
                scrollElement = scrollElement.parentElement;
            }
        }
    }


    function $getVisibleTextInputElements() {
        var $textInput = $document.find('input[type=text], input:not([type]), textarea, [contenteditable=true]').filter(function() {
            var $this = $(this);
            if ($this.is(':visible') || $this.css('visiblity') === 'visible') {
                return true;
            }
        });

        return $textInput;
    }

    function focusFirstTextInput() {
        var $textInput = $getVisibleTextInputElements();
        $textInput.length && $textInput[0].focus();
    }
    function focusNextTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex++;
                if (targetIndex >= $textInput.length) {
                    targetIndex = 0;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }
    function focusPrevTextInput() {
        var $textInput = $getVisibleTextInputElements(),
            currentIndex,
            targetIndex;

        if (!$textInput.length)
            return;

        if ( (currentIndex = $textInput.index(document.activeElement)) >= 0) {
            targetIndex = currentIndex;
            do {
                targetIndex--;
                if (targetIndex < 0) {
                    targetIndex = $textInput.length - 1;
                }

                $textInput[targetIndex].focus();  // this may not work in all cases (if the element is disabled etc), hence the loop
                currentIndex = $textInput.index(document.activeElement);
            } while (targetIndex !== currentIndex);
        }
        else {
            $textInput[0].focus();
        }
    }


    /**
     * Invokes a click on the active element. Passing true for 'newTab' invokes "ctrl+click" ("cmd+click" on Mac),
     * which has the effect of opening it in a new tab (if the active element is a link)
     * @param {boolean} newTab {Determines whether to invoke ctrl+click (or cmd+click on Mac) or simply a click
 */
    function openActiveElement(newTab) {

        if (newTab) {
            var ctrlClickEvent = document.createEvent("MouseEvents");

            // detecting OS detection based on:
            // http://stackoverflow.com/questions/7044944/jquery-javascript-to-detect-os-without-a-plugin
            if (isMac) {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, false, false, false, true, 0, null); // cmd key set to true for mac
            }
            else {
                ctrlClickEvent.initMouseEvent("click", true, true, null,
                    0, 0, 0, 0, 0, true, false, false, false, 0, null); // ctrl key set to true for non-macs
            }

            document.activeElement.dispatchEvent(ctrlClickEvent);
        }
        else {
            document.activeElement.click();
        }

    }

    return thisModule;
})(jQuery, _u.mod_keyboardLib);