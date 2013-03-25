var // used to reinstate the conflicting access key attributes that were removed from the original DOM
    chromeAltHack_accesskeysRemoved = [],

    // array of <key>'s that belonging to alt+<key> type shortcuts; used to detect conflicts on DOM changes
    altShortcutKeys = [],

    class_usedForChromeAltHack = 'UnitsProj-usedForChromeAltHack';


/**
 Any shortcuts defined using alt as a modifier cause a beep/"ding" sound in chrome when invoked.
 (Ref: http://code.google.com/p/chromium/issues/detail?id=105500)
 This hack allows  using "alt+<key>" type shortcuts without a beep by inserting an otherwise unused div into the dom
 for the sole purpose of setting its accesskey attribute to the key specified with alt in this shortcut.
 Note: this won't help with shortcuts like alt+shift+<key> etc, only of the type "alt+key"
 * @param {Array} shortcutsArr - array of strings, each of which specifies a keyboard shortcut
 */
function applyChromeAltHackIfNeeded(shortcutsArr) {

    var shortcutsLen = shortcutsArr.length;
    for (var i = 0; i < shortcutsLen; ++i) {
        var shortcut = shortcutsArr[i],
            tokens =  shortcut.trim().split(/\s*\+\s*/),
            keyAfterAlt;

        // this function is useful only when the following condition is true
        if (tokens && tokens.length == 2 && tokens[0].toLowerCase() === "alt") {

            keyAfterAlt = tokens[1];

            if (altShortcutKeys.indexOf(keyAfterAlt) === -1) {
                altShortcutKeys.push(keyAfterAlt)
            }

            removeAccessKey(keyAfterAlt, document);

            if (!$topLevelContainer.find('[accesskey="' + keyAfterAlt+ '"]').length) {

                $topLevelContainer.append(
                    $('<div></div>')
                        .attr('accesskey', keyAfterAlt)
                        .addClass(class_usedForChromeAltHack)
                        .addClass(class_addedByUnitsProjExtn)
                );
            }
        }
    }
}

/**
 * Removes the specified accessKey from anywhere within the specified DOM element, including its subtree.
 * This function is required as part of the "chrome alt hack" because calling stopImmediatePropagation()
 * or preventDefault() in the shortcut's handler does not prevent the accesskey attribute's function from
 * taking place. So any focusable elements with conflicting accesskey's on the page needs to have their acccesskey
 * attribute removed.
 * <Note> In the current code (Jan 24, 2012), this function is called 1) when shortcuts are setup (on url change), and
 * 2)on dom mutations
 * @param accessKey
 * @param {DOM element} element The DOM element within which (including its subtree) a conflicting accesskey will be
 * removed.
 */
function removeAccessKey(accessKey, element) {

    var $conflictingElements =  $(element).find('[accesskey="' + accessKey+ '"]:not(.'
        + class_usedForChromeAltHack + ')');

    $conflictingElements.each(
        function(index, element) {
            $(element).attr('accesskey', '');
            chromeAltHack_accesskeysRemoved.push({element: element, accessKey: accessKey});
//            console.log('chromeAltHack_accesskeysRemoved', chromeAltHack_accesskeysRemoved);
        }
    );
}

// removes conflicting accesskeys from the specified element and all its children
function removeConflictingAccessKeys(element) {
    var altShortcutKeysLen = altShortcutKeys.length;
    for (var i = 0; i < altShortcutKeysLen; ++i) {
        removeAccessKey(altShortcutKeys[i], element);
    }
}