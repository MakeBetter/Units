/*
 A not on the "chrome Alt hack" used in this project.
 This "hack" is meant to allow shortcuts of the type 'Alt + <key>' to work (better) on Chrome in Windows.
 There are two problems with such shortcuts on Chrome in Windows/Linux.
 a) Windows only: they cause a beep/"ding" sound in chrome when invoked (even when the keyboard event is suppressed in
 the JS handler).
 (Ref: http://code.google.com/p/chromium/issues/detail?id=105500)k
 b) Since chrome implements the "accesskey" attribute as 'Alt + <key>' shortcuts, this can a conflict with shortcuts
 defined by the extension (even if the keyboard event is suppressed). In case of such a conflict both the conflicting
 actions -- the execution of extension's shortcut handler and focusing of the element with the conflicting accesskey --
 take place, which is undesirable.

 These issues are handled in the following ways:
 1) For each 'alt+<key' shortcut required by this extension, we insert an otherwise unused div (non focusable by into the dom
 for the sole purpose of setting its accesskey attribute to the key specified with alt in this shortcut.

 It also removes conflicting access-keys attributes in the DOM (because calling preventDefault or stopImmediatePropagation
 is unable to stop their action). Finally, it reinstates the removed access-key attributes when the extension is
 disabled temporarily.

 Note: this won't help with shortcuts like alt+shift+<key> etc, only of the type "alt+key"
 */

if (navigator.userAgent.toLowerCase().indexOf('chrome') != -1 &&
    (navigator.appVersion.indexOf("Win")!=-1 || navigator.appVersion.indexOf("Linux")!=-1)) {
    _u.mod_chromeAltHack = (function($, mod_contentHelper, mod_mutationObserver, CONSTS) {
        "use strict";

       /*-- Public interface --*/
        var thisModule = $.extend({}, _u.mod_pubSub, {
            reset: reset, // Resets state AND *undoes* the hack including reinstating accessKey removed earlier
            applyHackForSpecifiedShortcuts: applyHackForSpecifiedShortcuts,
            removeAnyConflictingAccessKeyAttr: removeAnyConflictingAccessKeyAttr
        });

        /*-- Module implementation --*/
        /*-- Event bindings --*/
        thisModule.listenTo(mod_mutationObserver, 'documentMuts_fallback', onDomMutations);
        var
            // when the extension is disabled, this is used to reinstate the conflicting access key attributes
            // that were removed from the original DOM
            accesskeysRemoved = [],

            // array of <key>'s that are a part of alt+<key> type shortcuts; used to detect conflicts on DOM changes
            altShortcutKeys = [],

            class_dummyAccessKey = 'UnitsProj-dummyAccessKey',
            $topLevelContainer = _u.$topLevelContainer,
            class_unitsProjElem = CONSTS.class_unitsProjElem,

            // options for mutObs
            groupedMutations,
            timeout_mutations,
            lastMutationsHandledTime,
            // don't run mutation handler more than once per these many milliseconds. we specify a high value here
            // since accesskey are not expected to change frequently
            mutationGroupingInterval = 5000;

        // Resets state AND *undoes* the effect of the hack including reinstating accessKey removed earlier
        function reset() {

            // undo DOM changes due to hack...
            var len = accesskeysRemoved.length,
                data;
            for (var i = 0; i < len; i++) {
                data = accesskeysRemoved[i];
                $(data.element).attr('accesskey', data.accessKey); // reinstate the removed accesskeys
            }
            _u.$topLevelContainer.find('.' + class_dummyAccessKey).remove();

            // reset state for the future...
            accesskeysRemoved = [];
            altShortcutKeys = [];
            groupedMutations = [];
            lastMutationsHandledTime = 0;
            timeout_mutations = false;
        }

        /**
         * Applies the "chrome alt hack" (if required) to the page, based on array of keyboard shortcuts passed.
         * This involves two things:
         * 1) Inserting <div> elements with dummy accesskeys to disable the "ding" sound (see comments on top)
         * 2) Removing any conflicting accesskey attributes
         * These is meant to be called at the time of initializing the keyboard shortcuts for the current page.
         * @param {Array} shortcutsArr - array of strings, each of which specifies a keyboard shortcut
         */
        function applyHackForSpecifiedShortcuts(shortcutsArr) {

            var shortcutsLen = shortcutsArr.length;
            for (var i = 0; i < shortcutsLen; ++i) {
                var shortcut = shortcutsArr[i],
                    tokens =  shortcut.trim().split(/\s*\+\s*/),
                    keyAfterAlt;

                // this function is useful only when the following condition is true
                if (tokens && tokens.length == 2 && tokens[0].toLowerCase() === "alt") {

                    keyAfterAlt = tokens[1].toLowerCase();

                    if (altShortcutKeys.indexOf(keyAfterAlt) === -1) {
                        altShortcutKeys.push(keyAfterAlt);
                    }

                    removeAccessKey(keyAfterAlt, document);

                    if (!($topLevelContainer.find('[accesskey="' + keyAfterAlt+ '"]').length)) {

                        $topLevelContainer.append(
                            $('<div></div>')
                                .attr('accesskey', keyAfterAlt)
                                .addClass(class_dummyAccessKey)
                                .addClass(class_unitsProjElem)
                        );
                    }
                }
            }
        }

        /**
         * Removes any conflicting accesskey attributes that come into existence due to a DOM change, based on the
         * stored list of keyboard shortcuts active on the page. Groups closely separated mutations together for
         * performance.
         * @param mutations
         */
        function onDomMutations(mutations) {
//            mod_contentHelper.filterOutUnneededMutations(mutations); // removes mutations that aren't of interest

//            if (mutations.length) {
                groupedMutations = groupedMutations.concat(mutations);
                if (timeout_mutations === false) { // compare explicitly with false, which is how we reset it
                    // if timeout period is 0 or negative, will execute immediately (at the first opportunity after yielding)
                    timeout_mutations = setTimeout(_onDomMutations, mutationGroupingInterval - (Date.now() - lastMutationsHandledTime));
                }
//            }
        }
        function _onDomMutations() {
            console.time("chromeAltHack-muts");
            timeout_mutations = false;
            lastMutationsHandledTime = Date.now();
//            console.log('grouped _onDomMutations called');

            var mutationsLen = groupedMutations.length,
                mutationRecord,
                addedNodes,
                len;

            for (var i = 0; i < mutationsLen; ++i) {
                mutationRecord = groupedMutations[i];

                if ((addedNodes = mutationRecord.addedNodes) && (len = addedNodes.length)) {

                    for (var j = 0; j < len; ++j) {
                        var node = addedNodes[j];
                        if (node.nodeType === document.ELEMENT_NODE) {
                            removeAnyConflictingAccessKeyAttr(node);
                        }
                    }
                }

                if (mutationRecord.attributeName && mutationRecord.attributeName.toLowerCase() === 'accesskey') {
                    var accessKey = mutationRecord.target.getAttribute("accesskey");
                    accessKey = accessKey && accessKey.toLowerCase();
                    if (accessKey && altShortcutKeys.indexOf(accessKey) !== -1) {
                        mutationRecord.target.setAttribute('accesskey', '');

                    }
                }
            }
            groupedMutations = []; // reset
            console.timeEnd("chromeAltHack-muts");

        }

        /**
         * Removes  conflicting accesskeys from the specified element and all its children
         * @param element
         */
        function removeAnyConflictingAccessKeyAttr(element) {
            var altShortcutKeysLen = altShortcutKeys.length;
            for (var i = 0; i < altShortcutKeysLen; ++i) {
                removeAccessKey(altShortcutKeys[i], element);
            }
        }

        /**
         * Removes the specified accessKey attribute from the specified DOM element, and any descendants.
         * This is required because calling stopImmediatePropagation() or preventDefault() (in a conflicting keyboard
         * shortcut's handler does not prevent the accesskey attribute's function from taking place. So any focusable
         * elements with conflicting accesskey's on the page needs to have their acccesskey attribute removed.
         * @param accessKey
         * @param {HtmlElement} element The DOM element within which (including its subtree) a conflicting accesskey will be
         * removed.
         */
        function removeAccessKey(accessKey, element) {

            var $all =  $(element).find('[accesskey="' + accessKey+ '"]:not(.' +
                class_dummyAccessKey + ')');

            // we make this check since `document` doesn't have the setAttribute method
            if (element.setAttribute) {
                $all = $all.add(element);
            }

            $all.each(
                function(index, element) {
                    element.setAttribute('accesskey', '');
                    accesskeysRemoved.push({element: element, accessKey: accessKey});
//            console.log('accesskeysRemoved', accesskeysRemoved);
                }
            );
        }

        return thisModule;

    })(jQuery, _u.mod_contentHelper, _u.mod_mutationObserver, _u.CONSTS);
}

