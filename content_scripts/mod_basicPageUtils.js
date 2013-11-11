/**
 * This module implements the basic utility features this extension provides by to a page, like scrolling, 
 * going back/forward, etc
 */
_u.mod_basicPageUtils = (function($, mod_domEvents, mod_keyboardLib, mod_smoothScroll, mod_mutationObserver,
                                  mod_contentHelper) {
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
        overlap_pgUpPgDn = 50,
        smoothScroll = mod_smoothScroll.smoothScroll,

        // classes used when styling focused element
        class_focusedImage = "UnitsProj-focused-image",
        class_focusedLinkOrButton = "UnitsProj-focused-link-or-button",
        class_focusedLargeImage= "UnitsProj-focused-large-image",
        animatedScroll_Speed,
        animatedScroll_MaxDuration,
        regularScrollDelta,   // for page scrolling (i.e. non-CU type scrolling)
        regularScrollDuration;

    function reset() {
        removeActiveElementStyle();
    }

    function setup(settings) {
        reset();
        // NOTE: The 'click' event is triggered in response to invoking 'enter' or 'space' on an
        // "activate-able" element as well. (The event 'DOMActivate' which was used for this purpose
        // is now deprecated) [http://www.w3.org/TR/DOM-Level-3-Events/#event-flow-activation]
        mod_domEvents.addEventListener(document, 'click', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'focus', setLastInteractedElement, true);
        mod_domEvents.addEventListener(document, 'mouseover', setLastInteractedElement, true);

        miscSettings = settings.miscSettings;
        if (miscSettings.enhanceActiveElementVisibility) {
            mod_domEvents.addEventListener(document, 'focus', onFocus, true);
            mod_domEvents.addEventListener(document, 'blur', onBlur, true);
        }
        animatedScroll_Speed = miscSettings.animatedScroll? miscSettings.animatedScroll_Speed: Infinity;
        animatedScroll_MaxDuration = miscSettings.animatedScroll_MaxDuration;
        regularScrollDelta = miscSettings.pageScrollDelta;
        regularScrollDuration = Math.min(animatedScroll_MaxDuration, regularScrollDelta/animatedScroll_Speed);

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
        var scrollRight = function() {
            scroll("right");
        };
        var scrollLeft = function() {
            scroll("left");
        };
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollDown.kbdShortcuts, scrollDown);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollUp.kbdShortcuts, scrollUp);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollRight.kbdShortcuts, scrollRight);
        mod_keyboardLib.bind(pageNavigationShortcuts.scrollLeft.kbdShortcuts, scrollLeft);
        // special shortcuts, these will get invoked only when the page has no CUs
        mod_keyboardLib.bind(CUsShortcuts.smartScrollDown.kbdShortcuts, scrollDown, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollUp.kbdShortcuts, scrollUp, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollRight.kbdShortcuts, scrollRight, {pageHasCUs: false});
        mod_keyboardLib.bind(CUsShortcuts.smartScrollLeft.kbdShortcuts, scrollLeft, {pageHasCUs: false});
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
     * The function will actually scroll the innermost sensible element that can be scrolled further in the
     * appropriate direction. Very often that will end up being the document/window, but doesn't have to be.
     * E.g: If there is an child element that has focus and can be scrolled up, the first invocation of scroll("top")
     * will act on it, and the next one will act on a suitable ancestor (since the child can no longer be scrolled up)
     * @param {string} scrollType One of "up", "down", "left", "right", "pageUp", "pageDown", "top", "bottom"
     */
    function scroll(scrollType) {
        // call endAtDestination() first, so that the calculations below can be made relative to the
        // scrollTop position reached *after* any previous scrolling animation is completed. (this
        // helps keep the scrolling smooth by preventing "first-down-then-up" type movements)
        if (mod_smoothScroll.isInProgress()) {
            mod_smoothScroll.endAtDestination();
        }
        var elem, pos, duration, diff;

        switch(scrollType) {

            // NOTES:
            // 1) We pass `true` to some of the smoothScroll() calls below to indicate relative scroll
            // 2) If the element-to-scroll is `window`, we can still pass 'scrollTop'/'scrollLeft' (instead
            // of 'pageYOffset'/'pageXOffset') since smoothScroll() handles the scenario.

            case "down":
                smoothScroll(getElemToScroll('down'), 'scrollTop', regularScrollDelta, regularScrollDuration, null, true);
                break;
            case "up":
                smoothScroll(getElemToScroll('up'), 'scrollTop',  -regularScrollDelta, regularScrollDuration, null, true);
                break;
            case "right":
                smoothScroll(getElemToScroll('right'), 'scrollLeft',  regularScrollDelta, regularScrollDuration, null, true);
                break;
            case "left":
                smoothScroll(getElemToScroll('left'), 'scrollLeft', -regularScrollDelta, regularScrollDuration, null, true);
                break;
            case "pageDown":
                elem = getElemToScroll('down');
                pos = elem === window?
                    window.innerHeight - overlap_pgUpPgDn:
                    Math.min(50, Math.min(elem.clientHeight, window.innerHeight) - overlap_pgUpPgDn);
                duration = Math.min(animatedScroll_MaxDuration, pos/animatedScroll_Speed);
                smoothScroll(elem, 'scrollTop', pos, duration, null, true);
                break;
            case "pageUp":
                elem = getElemToScroll('up');
                pos = elem === window?
                    -(window.innerHeight - overlap_pgUpPgDn):
                    -(Math.min(50, Math.min(elem.clientHeight, window.innerHeight) - overlap_pgUpPgDn));
                duration = Math.min(animatedScroll_MaxDuration, -pos/animatedScroll_Speed); // since `pos` is -ve
                smoothScroll(elem, 'scrollTop', pos, duration, null, true);
                break;
            case "top":
                elem = getElemToScroll('up');
                diff = elem === window? window.pageYOffset: elem.scrollTop;
                duration = Math.min(animatedScroll_MaxDuration, diff/animatedScroll_Speed);
                smoothScroll(elem, 'scrollTop',  0, duration);
                break;
            case "bottom":
                elem = getElemToScroll('down');
                if (elem === window) {
                    pos = document.body.scrollHeight - window.innerHeight;
                    diff = pos - window.pageYOffset;
                }
                else {
                    pos = elem.scrollHeight - elem.clientHeight;
                    diff = pos - elem.scrollTop;
                }
                duration = Math.min(animatedScroll_MaxDuration, diff/animatedScroll_Speed);
                smoothScroll(elem, 'scrollTop',  pos, duration);
                break;
        }
    }
    /**
     * Gets the most sensible element to scroll based on `direction` [by finding the innermost
     * element that can be scrolled in the direction specified. Consequently, it results in the
     * element getting scrolled 1px in the specified direction (unless the "element" was found
     * to be `window` itself). If this is undesired, this 1px scroll can be undone in the future.]
     * NOTE: We return `window` instead of body/documentElement/document because window seems to work
     * more reliably cross-browser for scrolling the "page" as a whole. (Refer to mod_smoothScroll.js
     * for more on that)
     */
    function getElemToScroll(direction) {
        var elem = lastInteractedElement || document.activeElement,
            oldVal, newVal;

        // the last 2 checks in the condition below are mostly redundant, but they present just in case
        // some in browser `document.activeElement` returns `documentElement` or `document` itself (when
        // no element on page has focus)
        while (elem && elem !== document.body &&
            elem !== document.documentElement && elem !== document) {

            switch (direction){
                case 'down':
                    oldVal = elem.scrollTop;
                    elem.scrollTop += 1;
                    newVal = elem.scrollTop;
                    break;

                case 'up':
                    oldVal = elem.scrollTop;
                    elem.scrollTop -= 1;
                    newVal = elem.scrollTop;
                    break;

                case 'right':
                    oldVal = elem.scrollLeft;
                    elem.scrollLeft += 1;
                    newVal= elem.scrollLeft;
                    break;

                case 'left':
                    oldVal = elem.scrollLeft;
                    elem.scrollLeft -= 1;
                    newVal= elem.scrollLeft;
                    break;
            }

            if (oldVal !== newVal) { // if scrolled
                return elem;
            }
            else {
                elem = elem.parentElement;
            }
        }
        return window;
    }

    function setLastInteractedElement(event) {
        lastInteractedElement = event.target;
    }

    // gets visible text-input elements on the page (*excluding* ones
    // added by UnitsProj)
    function $getVisibleTextInputElements() {
        var $textInput = $document.find('input[type=text], input:not([type]), textarea, [contenteditable=true]').
            filter(function() {
                var $this = $(this);
                if ( ($this.is(':visible') || $this.css('visiblity') === 'visible') &&
                    !mod_contentHelper.isUnitsProjNode(this) ) {

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

        // Don't apply any Units-specific focus styles to element if it has tabindex = -1 and its outline-width is set to 0.
        // Examples of such elements: Gmail email container, and Twitter tweet container. They get focus by clicking on them,
        // and the Units outline style is rather distracting in these cases.
        if (el.tabIndex === -1 && parseInt($el.css("outline-width"), 10) === 0) {
            return;
        }

        // If it contains an image, show image-specific outline
        // TODO: Can put a better check to ensure that the element contains only ONE leaf child image/embed etc and no other
        // elements.
        var $img = $el.find('img');
        if ($el.is("a") && $img.length === 1) {
            $el.addClass(class_focusedImage);

            // for larger images, apply a thicker border with an offset.
            if ($img.height() > 50 || $img.width() > 50) {
                $el.addClass(class_focusedLargeImage);
            }
        }
        // Else if focused element is link or button
        else if ($el.is("a, button, input[type=button], [role=button]")) {
            $el
                .addClass(class_focusedLinkOrButton);
        }
        // for any other types of elements, no styles added.

        return;
    }

    function removeActiveElementStyle(element) {
        // *Note* The calls below for the disabling and enabling of the mutation
        // observer have been commented out as a fix for #151!
//        var disabledHere = mod_mutationObserver.disable();
        var el = element || document.activeElement;
        $(el)
            .removeClass(class_focusedImage)
            .removeClass(class_focusedLinkOrButton)
            .removeClass(class_focusedLargeImage);
//        disabledHere && mod_mutationObserver.enable();
    }

    return thisModule;
})(jQuery, _u.mod_domEvents,  _u.mod_keyboardLib, _u.mod_smoothScroll, _u.mod_mutationObserver,
        _u.mod_contentHelper);
