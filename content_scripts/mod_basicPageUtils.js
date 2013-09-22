/**
 * This module implements the basic utility features this extension provides by to a page, like scrolling, 
 * going back/forward, etc
 */
_u.mod_basicPageUtils = (function($, mod_domEvents, mod_keyboardLib, mod_smoothScroll, mod_mutationObserver) {
    "use strict";

    /*-- Public interface --*/
    var thisModule = $.extend({}, _u.mod_pubSub, {
        setup: setup,
        reset: reset,
        scroll: scroll,

        back: back,
        forward: forward,

        focusFirstTextInput: focusFirstTextInput,
        focusNextTextInput: focusNextTextInput,
        focusPrevTextInput: focusPrevTextInput,

        openLink: openLink,
        styleActiveElement: styleActiveElement,
        removeActiveElementStyle: removeActiveElementStyle
    });

    /*-- Module implementation --*/
    var miscSettings,
        lastInteractedElement, // the last element which received user interaction (click, mouse over, focus etc)
        $document = $(document),
        isMac = navigator.appVersion.indexOf("Mac")!=-1, // are we running on a Mac
        overlap_pgUpPgDn = 100,
        scrollAnimationDuration = 150, // millisecs
        smoothScroll = mod_smoothScroll.smoothScroll,

        // classes used when styling focused element
        class_focusedElement = "UnitsProj-focused-element",
        class_focusedImage = "UnitsProj-focused-image",
        class_focusedLinkOrButton = "UnitsProj-focused-link-or-button",
        class_inlineBlock = "UnitsProj-focused-element-inline-block";

    function reset() {
        removeActiveElementStyle();
    }

    function setup(settings) {
        reset();
        // NOTE: The 'click' event is triggered whenever in response to invoking 'enter' or 'space' on a
        // an "activatable" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'focus', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'mouseover', setLastInteractedElement, true);

        miscSettings = settings.miscSettings;
        if (miscSettings.enhanceActiveElementVisibility) {
            mod_domEvents.addEventListener(document, 'focus', onFocus, true);
            mod_domEvents.addEventListener(document, 'blur', onBlur, true);
        }

        setupShortcuts(settings.pageNavigationShortcuts, settings.elementNavigationShortcuts, settings.CUsShortcuts);
    }

    function onBlur(e) {
        removeActiveElementStyle(e.target);
    }

    function onFocus() {
        setTimeout(styleActiveElement, 0); //yield first. we want to execute this method once the browser has
        // applied its default style for the focused element
    }
    
    function setupShortcuts(pageNavigationShortcuts, elementNavigationShortcuts, CUsShortcuts) {

        mod_keyboardLib.bind(pageNavigationShortcuts.topOfPage.kbdShortcuts,  function() {
            scroll("top");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.bottomOfPage.kbdShortcuts,  function() {
            scroll("bottom");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.pageUp.kbdShortcuts,  function() {
            scroll("pageUp");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.pageDown.kbdShortcuts,  function() {
            scroll("pageDown");
        });
        mod_keyboardLib.bind(pageNavigationShortcuts.back.kbdShortcuts, back);
        mod_keyboardLib.bind(pageNavigationShortcuts.forward.kbdShortcuts, forward);
        mod_keyboardLib.bind(elementNavigationShortcuts.open.kbdShortcuts, function() {
            openLink(document.activeElement);
        });
        mod_keyboardLib.bind(elementNavigationShortcuts.openInNewTab.kbdShortcuts, function() {
            openLink(document.activeElement, true); // open in new tab
        });
        mod_keyboardLib.bind(elementNavigationShortcuts.focusFirstTextInput.kbdShortcuts, focusFirstTextInput);
        mod_keyboardLib.bind(elementNavigationShortcuts.focusNextTextInput.kbdShortcuts, focusNextTextInput);
        mod_keyboardLib.bind(elementNavigationShortcuts.focusPrevTextInput.kbdShortcuts, focusPrevTextInput);

        var scrollDown = function() {
            scroll("down");
        };
        var scrollUp = function() {
            scroll("up");
        };
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollDown.kbdShortcuts, scrollDown);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollUp.kbdShortcuts, scrollUp);
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
     * @param {HtmlElement} [element] element whose scrollTop is to be modified. If not provided, we determine
     * the most appropriate one ourselves.
     */
    function scroll(scrollType, element) {
        var areScrollingUp = ["up", "pageUp", "top"].indexOf(scrollType) >= 0;
        var elToScroll = element || getElementToScroll(areScrollingUp);

        if (elToScroll) {

            // call endAtDestination() first, so that the calculations below can be made relative to the
            // scrollTop position reached *after* any previous scrolling animation is completed. (this
            // helps keep the scrolling smooth by preventing "first-down-then-up" type movements)
            if (mod_smoothScroll.isInProgress()) {
                mod_smoothScroll.endAtDestination();
            }
            
            switch(scrollType) {
                case "down":
                    smoothScroll(elToScroll, elToScroll.scrollTop + miscSettings.pageScrollDelta, scrollAnimationDuration);
                    break;
                case "up":
                    smoothScroll(elToScroll, elToScroll.scrollTop - miscSettings.pageScrollDelta, scrollAnimationDuration);
                    break;
                case "pageDown":
                    smoothScroll(elToScroll, elToScroll.scrollTop +
                        (Math.min(elToScroll.clientHeight, window.innerHeight) - overlap_pgUpPgDn), scrollAnimationDuration);
                    break;
                case "pageUp":
                    smoothScroll(elToScroll, elToScroll.scrollTop -
                        (Math.min(elToScroll.clientHeight, window.innerHeight) - overlap_pgUpPgDn), scrollAnimationDuration);
                    break;
                case "top":
                    smoothScroll(elToScroll, 0, scrollAnimationDuration);
                    break;
                case "bottom":
                    smoothScroll(elToScroll, elToScroll.scrollHeight, scrollAnimationDuration);
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
        return document.body;
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
     * Invokes a click (or ctrl/cmd+click) on the specified element.
     * @param {HtmlElement} element The DOM element on which a click (or ctrl/cmd+click) will be invoked. This is
     * generally a link, but can be any element, like a button etc
     * @param {boolean} newTab Specifying this as true invokes "ctrl+click" ("cmd+click" on Mac),
     * which has the effect of opening the link in a new tab (if the active element is a link)
 */
    function openLink(element, newTab) {
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

            element.dispatchEvent(ctrlClickEvent);
        }
        else {
            element.click();
        }
    }

    // see _styleActiveElement
    function styleActiveElement(el) {
        var disabledHere = mod_mutationObserver.disable();
        _styleActiveElement(el);
        disabledHere && mod_mutationObserver.enable();
    }

    /**
     This function is used apply our custom "active element" style of an element. If it is being used to style
     * the active, no argument needs to be passed. But in other cases (like when called from the mod_selectLink.js),
     * specify the element you want to apply the styling to.
     * @param [el]
     */
    function _styleActiveElement(el) {
        el = el || document.activeElement;
        var $el = $(el);

        var hasAnyBlockDescendant = function($el) {
            var $descendants = $el.find('*');
            for (var i = 0; i < $descendants.length; i++) {
                var $element = $descendants.eq(i);
                if ($element.is(":visible") && ($element.css("display") !== "inline" || $element.is("img"))) {
                    return true;
                }
            }
            return false;
        };

        // Don't apply any Units-specific styles to element with tabindex = -1 and if outline is set to 0 explicitly by the
        // website.
        // This is for elements such as the tweet container on Twitter, and email container on Gmail that have tabindex = -1
        // but the outline is set to 0 explicitly. Showing the Units elements on such elements can tend to be distracting.
        if (el.tabIndex === -1 && parseInt($el.css("outline-width"), 10) === 0) {
            return;
        }

        // If it contains an image, show the outline with an offset.
        // TODO: Can put a better check to ensure that the element contains only ONE leaf child image/embed etc and no other
        // elements.
        var $img = $el.find('img');
        if ($el.is("a") && $img.length === 1) {
            $el.addClass(class_focusedElement);

            if ($img.height() > 50 || $img.width() > 50) {
                $el.addClass(class_focusedImage);
            }
        }
        // if link or button, add styles.
        else if ($el.is("a, button, input[type=button]")) {
            $el
                .addClass(class_focusedElement)
                .addClass(class_focusedLinkOrButton);
        }
        // for any other types of elements, no styles added.


        // If the anchor has display:inline and has a non-inline child, then set the display to inline-block. This is so
        // that the outlnie around it is drawn correctly.
        // http://stackoverflow.com/questions/17146707/outline-is-drawn-incorrectly-on-chrome-if-outline-style-is-set-to-solid-and-n
        if ($el.css("display") === "inline" && hasAnyBlockDescendant($el)) {
            $el.addClass(class_inlineBlock);
        }

        return;
    }

    function removeActiveElementStyle(element) {
        var disabledHere = mod_mutationObserver.disable();
        var el = element || document.activeElement;
        $(el)
            .removeClass(class_focusedElement)
            .removeClass(class_focusedImage)
            .removeClass(class_focusedLinkOrButton)
            .removeClass(class_inlineBlock);
        disabledHere && mod_mutationObserver.enable();
    }

    return thisModule;
})(jQuery, _u.mod_domEvents,  _u.mod_keyboardLib, _u.mod_smoothScroll, _u.mod_mutationObserver);
