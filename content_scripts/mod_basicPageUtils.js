/**
 * This module implements the basic utility features this extension provides by to a page, like scrolling, 
 * going back/forward, etc
 */
_u.mod_basicPageUtils = (function($, mod_domEvents, mod_keyboardLib) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup,

        scroll: scroll,

        back: back,
        forward: forward,

        focusFirstTextInput: focusFirstTextInput,
        focusNextTextInput: focusNextTextInput,
        focusPrevTextInput: focusPrevTextInput,

        openActiveElement: openActiveElement
    });

    /*-- Module implementation --*/
    var miscSettings,
        lastInteractedElement, // the last element which received user interaction (click, mouse over, focus etc)
        $document = $(document),
        isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        overlap_pgUpPgDn = 100,
        scrollAnimationDuration = 150; // millisecs

    function setup(settings) {
        mod_domEvents.addEventListener(document, 'click', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'focus', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'mouseover', setLastInteractedElement, true);

        miscSettings = settings.miscSettings;
        setupShortcuts(settings.generalShortcuts, settings.CUsShortcuts);
    }
    
    function setupShortcuts(generalShortcuts, CUsShortcuts) {

        mod_keyboardLib.bind(generalShortcuts.topOfPage.kbdShortcuts,  function() {
            scroll("top");
        });
        mod_keyboardLib.bind(generalShortcuts.bottomOfPage.kbdShortcuts,  function() {
            scroll("bottom");
        });
        mod_keyboardLib.bind(generalShortcuts.pageUp.kbdShortcuts,  function() {
            scroll("pageUp");
        });
        mod_keyboardLib.bind(generalShortcuts.pageDown.kbdShortcuts,  function() {
            scroll("pageDown");
        });
        mod_keyboardLib.bind(generalShortcuts.back.kbdShortcuts, back);
        mod_keyboardLib.bind(generalShortcuts.forward.kbdShortcuts, forward);
        mod_keyboardLib.bind(generalShortcuts.open.kbdShortcuts, openActiveElement);
        mod_keyboardLib.bind(generalShortcuts.openInNewTab.kbdShortcuts, function() {
            openActiveElement(true); // open in new tab
        });
        mod_keyboardLib.bind(generalShortcuts.focusFirstTextInput.kbdShortcuts, focusFirstTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusNextTextInput.kbdShortcuts, focusNextTextInput);
        mod_keyboardLib.bind(generalShortcuts.focusPrevTextInput.kbdShortcuts, focusPrevTextInput);

        var scrollDown = function() {
            scroll("down");
        };
        var scrollUp = function() {
            scroll("up");
        };
        mod_keyboardLib.bind(generalShortcuts.scrollDown.kbdShortcuts, scrollDown);
        mod_keyboardLib.bind(generalShortcuts.scrollUp.kbdShortcuts, scrollUp);
        // special shortcuts, these will get invoked only when the page has no CUs
        mod_keyboardLib.bind(CUsShortcuts.nextCU.kbdShortcuts, scrollDown, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.prevCU.kbdShortcuts, scrollUp, {pageHasCUs: false});
    }

    // invokes the browser's 'back' action
    function back() {
        window.history.back();
    }
    // invokes the browser's 'forward' action
    function forward() {
        window.history.forward();
    }

    /**
     * Scroll the page as specified by `scrollType`
     * The function will actually apply to the innermost sensible element that can be scrolled further in the
     * appropriate direction.
     * E.g: If there is an child element that has focus and can be scrolled up, the first invocation of scroll("top")
     * will act on it, and the next one will act on a suitable ancestor (since the child can no longer be scrolled up)
     * @param {string} scrollType One of "up", "down", "pageUp", "pageDown", "top", "bottom"
     */
    function scroll(scrollType) {
        var areScrollingUp = ["up", "pageUp", "top"].indexOf(scrollType) >= 0;
        var elToScroll = getElementToScroll(areScrollingUp);

        if (elToScroll) {
            var $elToScroll = $(elToScroll);
            $elToScroll.stop(true, true); // stop on-going animation, if any
            switch(scrollType) {
                case "down":  
                    $elToScroll.animate({scrollTop: elToScroll.scrollTop + miscSettings.pageScrollDelta}, scrollAnimationDuration);
                    break;
                case "up":
                    $elToScroll.animate({scrollTop: elToScroll.scrollTop - miscSettings.pageScrollDelta}, scrollAnimationDuration);
                    break;
                case "pageDown":
                    $elToScroll.animate({scrollTop: elToScroll.scrollTop +
                        (Math.min(elToScroll.clientHeight, window.innerHeight) - overlap_pgUpPgDn)}, scrollAnimationDuration);
                    break;
                case "pageUp":
                    $elToScroll.animate({scrollTop: elToScroll.scrollTop -
                        (Math.min(elToScroll.clientHeight, window.innerHeight) - overlap_pgUpPgDn)}, scrollAnimationDuration);
                    break;
                case "top":
                    $elToScroll.animate({scrollTop: 0}, scrollAnimationDuration);
                    break;
                case "bottom":
                    $elToScroll.animate({scrollTop: elToScroll.scrollHeight}, scrollAnimationDuration);
                    break;
            }
        }
    }
    /**
     * Gets the most sensible element to scroll based on  `areScrollingUp`
     * @param {boolean} areScrollingUp true - scrolling up. false - scrolling down
     */
    function getElementToScroll(areScrollingUp) {
        var scrollElement = lastInteractedElement || document.activeElement || document.body,
            oldScrollVal;
        while (scrollElement) {
            oldScrollVal = scrollElement.scrollTop;

            scrollElement.scrollTop += areScrollingUp? -1: 1;

            if (oldScrollVal !== scrollElement.scrollTop) { // if scrolled
                return scrollElement;
            }
            else {
                scrollElement = scrollElement.parentElement;
            }
        }
    }

    function setLastInteractedElement(event) {
        lastInteractedElement = event.target;
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

            // detecting OS based on:
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
})(jQuery, _u.mod_domEvents,  _u.mod_keyboardLib);