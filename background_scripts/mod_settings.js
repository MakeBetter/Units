/* global jQuery, defaultSettings, specialDomain_masterDomain_map */

_u.mod_settings = (function($, mod_commonHelper, mod_getMainDomain, defaultSettings, specialDomain_masterDomain_map) {
    "use strict";

    /*-- Public interface --*/
    var thisModule ={
        getUserSettings: getUserSettings, // final computed settings i.e. default settings extended by user settings
        setUserSettings: setUserSettings,
        getDefaultSettings: getDefaultSettings,
        addUrlPatternToUserDisabledSites: addUrlPatternToUserDisabledSites
    };

    // Used when calculating and applying "diff" to an array in the settings object
    var suffix_addedToArray = "_added",
        suffix_removedFromArray = "_removed";

    /***
     * Get applicable settings (computed by applying user settings diff to default settings). If url is specified, then
     * get url specific settings, else get settings for all sites.
     *
     * If url is specified, the settings object is appended with properties expandedUrlData and isDisabled, and
     * the urlDataMap property is removed.

     * @param callback Callback function returns the settings.
     * @param options Can contain properties:
     * url: If specified, then the URL specific settings are returned. Else, all settings are returned.
     * getBasic: Set this to true if you need the basic/main settings that are returned synchronously
     */
    function getUserSettings(callback, options) {

        var url = options && options.url,
            getBasic = options && options.getBasic;

        var settings = _getUserSettings(); // Get user diff applied settings.

        // Append URL specific settings
        if (url) {
            settings.expandedUrlData = getExpandedUrlData(settings, url);
            delete settings.urlDataMap;

            settings.isDisabled = getDisabledStatus(url, settings.disabledSites);
        }

        // Return partial settings synchronously if getBasic = true.
        // For certain scenarios (like when editing settings), we need to get only the basic/main settings and it is
        // handy to have them synchronously returned.
        if (getBasic) {
            return settings;
        }

        // Append settings.globalChromeCommands - get the set chrome commands and append them to the settings object
        chrome.commands.getAll(function(commands) {
            settings.globalChromeCommands = commands;

            callback && callback(settings);
        });
    }

    /***
     * Get the default settings
     * @returns {*}
     */
    function getDefaultSettings() {
        return $.extend(true, {}, defaultSettings);
    }


    /***
     * Applies the userSettingsDiff to defaultSettings, and returns the resultant settings. This is intermediate step
     * for getUserSettings method.
     *
     * NOTE: We don't apply diff to urlDataMap properties. Those are ignored, for now.
     * 
     * @returns {*}
     */
    function _getUserSettings() {

        var settingsDiffJSON = localStorage.userSettingsDiff,
            settingsDiff,
            finalSettings = getDefaultSettings();

        if (settingsDiffJSON) {
            try{
                settingsDiff = JSON.parse(settingsDiffJSON);
            }
            catch(exception) {
                console.error(exception);
            }

            mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsDiff);
            applyUserSettingsDiff(settingsDiff, finalSettings);

        }

        return finalSettings;
    }

    /**
     * Calculate the diff of userSettings and defaultSettings. Save the diff as "userSettingsJSON" in localStorage.   
     * @param userSettings 
     */
    function setUserSettings(userSettings) {

        if (userSettings) {

            var settingsDiff = getUserSettingsDiff(userSettings);

            mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(settingsDiff);

            var settingsDiffJSON = JSON.stringify(settingsDiff);

            localStorage.userSettingsDiff = settingsDiffJSON;
        }
        else {
            delete localStorage.userSettingsDiff;
        }

        // Send event to all tabs, so that settings are updated for the existing tabs as well.
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, {message: 'settingsChanged'});
            }
        });

    }


    // Methods related to _getUserSettings: Apply settings diff

    /***
     * Applies the given settingsDiff to the given defaultSettings object.
     * NOTE: The JSON unsupported types are already stringified
     * @param settingsDiff
     * @param defaultSettings
     */
    function applyUserSettingsDiff(settingsDiff, defaultSettings) {

        var finalSettings = defaultSettings,
            topLevelProperty_defaultSettings_settingsDiff,
            topLevelProperty_defaultSettings_finalSettings;

        // stringify settingsDiff and finalSettings. we need when for applying diff.
        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(finalSettings);
        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(settingsDiff);

        for (var topLevelKey in settingsDiff) {
            if (!finalSettings[topLevelKey]) {
                continue;
            }
            topLevelProperty_defaultSettings_settingsDiff = settingsDiff[topLevelKey];
            topLevelProperty_defaultSettings_finalSettings = finalSettings[topLevelKey];

            if (topLevelKey === "disabledSites"){
                applyDiffForArrays(topLevelProperty_defaultSettings_settingsDiff, topLevelProperty_defaultSettings_finalSettings);
            }
            else if (topLevelKey === "valuesFor_stdUrlDataItems") {
                for (var secondLevelKey in topLevelProperty_defaultSettings_settingsDiff) {
                    applyDiffForObjects(topLevelProperty_defaultSettings_settingsDiff[secondLevelKey],
                        topLevelProperty_defaultSettings_finalSettings[secondLevelKey]);
                }

            }
            else {
                applyDiffForObjects(topLevelProperty_defaultSettings_settingsDiff, topLevelProperty_defaultSettings_finalSettings);
            }
        }

        // destringify settingsDiff and finalSettings back to original state.
        mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(finalSettings);
        mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsDiff);
    }

    /**
     * Elements added and removed from the array with key say "shortcuts" are added to arrays with keynames
     * "shortcuts_added" and "shortcuts_removed" in the diff object. These are applied back to finalSettings in this
     * method.
     * @param diff
     * @param finalSettings
     */
    function applyDiffForArrays(diff, finalSettings) {
        var isElementNotRemoved = function(element) {
            return (diff[key].indexOf(element) === -1);
        };

        for (var key in diff) {
            var keyName;
            var indexAdded = key.indexOf(suffix_addedToArray);
            if (indexAdded !== -1) {
                keyName = key.substring(0, indexAdded);
                finalSettings[keyName] = finalSettings[keyName].concat(diff[key]); // Concat the added shortcuts to the
                // existing shortcuts
            }
            else {
                var indexRemoved = key.indexOf(suffix_removedFromArray);
                if (indexRemoved !== -1) {
                    keyName = key.substring(0, indexRemoved);
                    finalSettings[keyName] = finalSettings[keyName].filter(isElementNotRemoved); // Create a new
                    // array with the elements that have not been removed.
                }
            }
        }
    }

    /***
     * Apply diff for a UnitProj-settings specific object (not a generic object)
     * @param diff
     * @param finalSettings
     */
    function applyDiffForObjects(diff, finalSettings) {
        for (var key in diff) {
            var value_diff = diff[key],
                value_finalSettings = finalSettings[key];

            if (typeof value_diff === "string" || typeof value_diff === "number" || typeof value_diff === "boolean") {
                finalSettings[key] = value_diff;
            }
            else if (value_finalSettings && value_finalSettings.kbdShortcuts) {
                applyDiffForArrays(value_diff, value_finalSettings);
            }
        }
    }


    // Methods related to setUserSettings: Get settings diff

    /**
     * Get diff of userSettings and defaultSettings.
     * @param userSettings
     * @returns {{}}
     */
    function getUserSettingsDiff(userSettings) {

        var settingsDiff = {},
            defaultSettings = getDefaultSettings(); // gets clone of defaultSettings

        if (!userSettings || !defaultSettings) {
            // something's wrong! no diff for you.
            return null;
        }

        delete defaultSettings.urlDataMap; // No diff'ing the urlDataMap for now.
        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(defaultSettings);
        mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(userSettings);


        var topLevelProperty_defaultSettings,
            topLevelProperty_userSettings,
            settingName,
            settingValue_defaultSettings,
            settingValue_userSettings,
            settingValueDiff;

        for (var topLevelKey in defaultSettings) {
            topLevelProperty_defaultSettings = defaultSettings[topLevelKey];
            topLevelProperty_userSettings = userSettings[topLevelKey];

            if (!topLevelProperty_userSettings) {
                continue;
            }

            settingsDiff[topLevelKey] =  {};

            // NOTE: all top-level properties of defaultSettings are objects, as of June 27th, 2013.
            if (mod_commonHelper.isObject(topLevelProperty_defaultSettings)) {

                // "disabledSites" contains the settings "urlPatterns" and "urlRegexps". These need to be handled
                // differently from other settings since these are arrays (and all others are primitive values/ objects).
                if (topLevelKey === "disabledSites") {

                    for (settingName in topLevelProperty_defaultSettings) {
                        settingValue_defaultSettings = topLevelProperty_defaultSettings[settingName];
                        settingValue_userSettings = topLevelProperty_userSettings[settingName];

                        if (!Array.isArray(settingValue_defaultSettings) || !Array.isArray(settingValue_userSettings)) {
                            continue;
                        }

                        settingValueDiff = getArrayDiff(settingValue_defaultSettings, settingValue_userSettings);

                        if (!settingValueDiff) {
                            continue;
                        }

                        settingsDiff[topLevelKey][settingName + suffix_addedToArray] = settingValueDiff.added;
                        settingsDiff[topLevelKey][settingName + suffix_removedFromArray] = settingValueDiff.removed;
                    }
                }
                // Settings for "valuesFor_stdUrlDataItems" have additional grouping. Hence, the extra 'for' loop for
                // the second level key.
                else if (topLevelKey === "valuesFor_stdUrlDataItems") {
                    for (var secondLevelKey in topLevelProperty_defaultSettings) {

                        if (!topLevelProperty_userSettings[secondLevelKey]) {
                            continue;
                        }

                        for (settingName in topLevelProperty_defaultSettings[secondLevelKey]) {
                            settingValue_defaultSettings = topLevelProperty_defaultSettings[secondLevelKey][settingName];
                            settingValue_userSettings =  topLevelProperty_userSettings[secondLevelKey][settingName];

                            settingValueDiff = getSettingsValueDiff(settingValue_defaultSettings, settingValue_userSettings);
                            if (settingValueDiff === null) {
                                continue;
                            }

                            if (!settingsDiff[topLevelKey][secondLevelKey]) {
                                settingsDiff[topLevelKey][secondLevelKey] = {};
                            }
                            settingsDiff[topLevelKey][secondLevelKey][settingName] = settingValueDiff;
                        }
                    }
                }
                // All other top-level properties in the settings object have the same format.
                else {
                    for (settingName in topLevelProperty_defaultSettings) {
                        settingValue_defaultSettings = topLevelProperty_defaultSettings[settingName];
                        settingValue_userSettings = topLevelProperty_userSettings[settingName];

                        settingValueDiff = getSettingsValueDiff(settingValue_defaultSettings, settingValue_userSettings);

                        if (settingValueDiff === null) {
                            continue;
                        }

                        settingsDiff[topLevelKey][settingName] = settingValueDiff;
                    }
                }
            }

            // If no settings (keys) added to the topLevelKey, then remove the topLevelKey
            if (!Object.keys(settingsDiff[topLevelKey]).length) {
                delete settingsDiff[topLevelKey];
            }
        }

        mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(userSettings); // restore the userSettings to original
        // state.

        mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsDiff); // Return the object in the state
        // expected by the calling function.
        // JSON unsupported types are stringified at the beginning of this function only because that makes things
        // convenient for calculating the diff.

        return settingsDiff;
    }

    function getSettingsValueDiff(defaultSettingsValue, userSettingsValue) {
        var getKbdShortcutsArrayDiff = function(defaultSettingsValue, userSettingsValue) {
            var arrayDiff = getArrayDiff(defaultSettingsValue.kbdShortcuts, userSettingsValue.kbdShortcuts);
            if (!arrayDiff) {
                return null;
            }

            defaultSettingsValue.kbdShortcuts_added = arrayDiff.added;
            defaultSettingsValue.kbdShortcuts_removed = arrayDiff.removed;

            delete defaultSettingsValue.kbdShortcuts;

            return defaultSettingsValue;
        };


        if (defaultSettingsValue.kbdShortcuts && userSettingsValue.kbdShortcuts) {
            return getKbdShortcutsArrayDiff(defaultSettingsValue, userSettingsValue);
        }
        // Stringify all non-primitive values to check for equality (This does not apply for functions and regexps
        // because those should have been stringified).
        else if (typeof defaultSettingsValue === "object" && typeof userSettingsValue === "object") {
            if (JSON.stringify(userSettingsValue) !== JSON.stringify(defaultSettingsValue)) {
                return userSettingsValue;
            }
        }
        else if (userSettingsValue !== defaultSettingsValue) {
            return userSettingsValue;
        }

        return null;
    }

    /***
     * Get the diff of given 2 arrays
     *
     * How this works: Added elements (in the latter "userSettingsArray") are added to an array with key "added" and
     * and removed elements added to array with key "removed".
     *
     * @param defaultSettingsArray
     * @param userSettingsArray
     * @returns Object of the format {removed: [], added: []}
     */
    function getArrayDiff(defaultSettingsArray, userSettingsArray) {

        var diff = {};

        // if you need something more efficient, try something like this:
        // http://stackoverflow.com/questions/3476672/algorithm-to-get-changes-between-two-arrays

        diff.added = userSettingsArray.filter(function(element) {return (defaultSettingsArray.indexOf(element) === -1);});
        diff.removed = defaultSettingsArray.filter(function(element) {return (userSettingsArray.indexOf(element) === -1);});

        if (!diff.added.length && !diff.removed.length) {
            return null;
        }

        return diff;
    }



    /**
     * Method to add a URL pattern/ site to be disabled to the user settings. Used from popup.js for disabling site at
     * the currently active tab.
     * @param urlPattern
     * @returns {boolean}
     */
    function addUrlPatternToUserDisabledSites(urlPattern) {
        var userSettings = getUserSettings(null, {getBasic: true});

        // only allowing adding to URL patterns at the moment.
        if (userSettings.disabledSites && userSettings.disabledSites.urlPatterns) {
            var disabledUrlPatterns = userSettings.disabledSites.urlPatterns;
            disabledUrlPatterns.push(urlPattern);

            setUserSettings(userSettings);
            return true;
        }
        else {
            console.error("Settings seem to be corrupted. Disabled sites property not found");
            return false;
        }
    }

    function getExpandedUrlData(settings, url) {

        if (!url || !settings) {
            return null;
        }

        var domain = mod_getMainDomain.getMainDomain(url);
        var urlData = getUrlDataUsingDomainKey(settings, domain, url);

        if (!urlData) {
            var masterDomainKey = getMasterDomainKey(domain);
            if (masterDomainKey) {
                urlData = getUrlDataUsingDomainKey(settings, masterDomainKey, url);
            }
        }

        if (urlData) {
            urlData = $.extend(true, {}, urlData); // make a copy of urlData
            mod_commonHelper.stringifyFunctions(urlData);
            expandUrlData(urlData);
            return urlData;
        }
        else {
            // TODO: Url data not found; anything else to be done?
            return null;
        }
    }

    function getUrlDataUsingDomainKey(settings, domainKey, url) {

        var urlDataArr = settings.urlDataMap[domainKey];

        if (!urlDataArr) {
            return false;
        }

        while (typeof urlDataArr === "string") {
            urlDataArr = settings.urlDataMap[urlDataArr];
        }

        if (!Array.isArray(urlDataArr)) {
            urlDataArr = [urlDataArr];
        }

        var matchingUrlData = getMatchingUrlData(url, urlDataArr), // data that matches the current URL
            sharedUrlData = getSharedUrlData(urlDataArr), // data that is common to any URL in this main domain
            urlData = $.extend(true, {}, sharedUrlData, matchingUrlData); // merge matchingUrlData and sharedUrlData

        /*
         NOTE: About using $.extend for merging matchingUrlData and sharedUrlData.

         In the shared data, the URL patterns or regexes is irrelevant because "shared data" by definition applies
         to all URLs.
         All settings in UrlData (except for URL patterns and regexes) are Object based settings (and not Array
         based). Hence, $.extend() works fine, and no special handling is required for extending the shared and matching URL
         data at the moment. As of 22 June 2013. We will continue to need to revaluate this every time new types settings are
         added to urlData.
         */

        return urlData;
    }

    /***
     * Returns the urlData object that matches for the given URL
     * @param url URL of the page
     * @param urlDataArr URL data array specified for main domain
     * @returns {*} URL data that matches for the given URL or false
     */
    function getMatchingUrlData(url, urlDataArr) {
        var urlDataArrLen = urlDataArr.length;
        for (var i = 0; i < urlDataArrLen; ++i) {

            var urlData = urlDataArr[i],
                regexpsToTest = [],
                currentUrl = url,
                strippedUrl = getStrippedUrl(currentUrl);

            if (Array.isArray(urlData.urlPatterns)) {
                regexpsToTest = regexpsToTest.concat(getEquivalentRegexps(urlData.urlPatterns));
            }
            if (Array.isArray(urlData.urlRegexps)) {
                regexpsToTest = regexpsToTest.concat(urlData.urlRegexps);
            }
            var regexpsLen =  regexpsToTest.length,
                strippedUrlWithoutTrailingSlash;

            if (strippedUrl.lastIndexOf("/") === strippedUrl.length - 1) {
                strippedUrlWithoutTrailingSlash = strippedUrl.substr(0, strippedUrl.length-1);
            }

            for (var j = 0, regexp; j < regexpsLen; ++j) {

                regexp = regexpsToTest[j];
                if (regexp.test(strippedUrl) || regexp.test(strippedUrlWithoutTrailingSlash)) {
                    return urlData;
                }
            }
        }
        return false;
    }

    /***
     * Returns first object in urlDataArr that has property 'shared' = true
     * Shared data applies to any/ all URL within a main domain
     * @param urlDataArr  URL data array specified for main domain
     * @returns {*} first instance of shared data or false
     */
    function getSharedUrlData(urlDataArr) {
        var urlDataArrLen = urlDataArr.length;
        for (var i = 0; i < urlDataArrLen; ++i) {

            var urlData = urlDataArr[i];
            if (urlData.shared) {
                return urlData;
            }
        }
        return false;
    }

    // Converts any "shorthand" notations within the urlData to their "expanded" forms.
    // Also adds default 'miniDesc' and 'kbdShortcuts' values, if not specified by SUs/actions defined in urlData
    function expandUrlData(urlData) {

        // if key value at property 'key' in object 'obj' is a string or an Array, it is expanded to point to an object
        // having a property 'selector' that points to the string instead.
        var expandPropertyToObjIfStringOrArray = function(obj, key) {
            var value;
            if (typeof (value = obj[key]) === "string" || Array.isArray(value)) {
                obj[key] = {
                    selector: value
                };
            }
        };

        // uses defaultSettings.valuesFor_stdUrlDataItems to supplement values in the SU/action (specified using the first two params)
        // 'scope' can be either "page" or "CUs"
        var supplementWithDefaultValues = function(SUorAction, SUorAction_Name, scope) {

            var temp;
            if (!SUorAction.kbdShortcuts && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
                SUorAction.kbdShortcuts = temp.kbdShortcuts;
            }
            if (!SUorAction.descr && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
                SUorAction.descr = temp.descr;
            }
        };

        // scope can be either "page" or "CUs"
        var expandSUsOrActions = function(SUsOrActions, scope) {
            if (typeof SUsOrActions === "object") {
                for (var SUorAction_Name in SUsOrActions) {
                    expandPropertyToObjIfStringOrArray(SUsOrActions, SUorAction_Name);
                    supplementWithDefaultValues(SUsOrActions[SUorAction_Name], SUorAction_Name, scope);
                }
            }
        };

        expandPropertyToObjIfStringOrArray(urlData, 'CUs_specifier');

        expandSUsOrActions(urlData.CUs_SUs, "CUs");
        expandSUsOrActions(urlData.CUs_actions, "CUs");

        expandSUsOrActions(urlData.page_SUs, "page");
        expandSUsOrActions(urlData.page_actions, "page");

    }

    // returns the URl stripped of the protocol i.e. "http(s)://" etc
    function getStrippedUrl(url) {
        var protocolSeparator = "://", // to strip the leading http:// or https:// etc.
            strippedUrlBeginIndex = url.indexOf(protocolSeparator) + protocolSeparator.length;

        return url.substring(strippedUrlBeginIndex);
    }

    /**
     * Converts the specified wildcard patterns into an equivalent array of regexps.
     * @param {Array} wildcardPatterns
     */
    function getEquivalentRegexps (wildcardPatterns) {
        var regexps = [];

        if (wildcardPatterns) {
            var wildcardPatternsLen = wildcardPatterns.length;
            for (var i = 0, regexp; i < wildcardPatternsLen; ++i) {

                regexp = wildcardPatternToRegexp(wildcardPatterns[i]);
                regexps.push(regexp);

            }
        }
        return regexps;
    }

// returns the master domain-key for the specified domain, if one can be found
    function getMasterDomainKey(domain) {
        var len = specialDomain_masterDomain_map.length;
        for (var i = 0, currentObj; i < len; ++i) {
            currentObj = specialDomain_masterDomain_map[i];
            if (currentObj.regexp.test(domain)) {
                return currentObj.masterDomainKey;

            }
        }
    }

    /**
     * Returns the regexp object corresponding the to the url pattern supplied.
     * @param {String} urlPattern This is a string that can contain '*'s and @'s as "wildcards":
     - A '@' matches any combination of *one or more* alphanumeric characters,  dashes, underscores and commas
     - A '*' matches any combination of *zero or more* characters of *ANY* type.)
     * @return {RegExp}
     */
    function wildcardPatternToRegexp(urlPattern) {

        // get the corresponding "regular expression escaped" string.
        var regexpStr = urlPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
//        console.log(regexpStr);

        // replacing all instances of '\*\*' (to which '**'s would have been converted above) by the regexp equivalent
        // to match any combination of one or more characters of any type
        regexpStr = regexpStr.replace(/\\\*\\\*/g, '.+');

        // replacing all instances of '\*' (to which '*'s would have been converted above) by the regexp equivalent
        // to match any combination of zero or more characters of any type
        regexpStr = regexpStr.replace(/\\\*/g, '.*');

        // replacing all instances of '@' by the regexp equivalent to match one or more combinations of characters that
        // are not dots or slashes (in the replace string below we specify, in order, backslash, dot and forward slash
        // (after the caret)
        regexpStr = regexpStr.replace(/@/g, '[^\\.\/]+');

        regexpStr = "^" + regexpStr + "$";

        return new RegExp(regexpStr);

    }

    /**
     * Returns true/false indicating whether the extension is to be disabled on the URL specified
     * @param {string} url
     * @param {object} disabledSites Object specifying on which sites the extension is partially and fully disabled
     */
    function getDisabledStatus(url, disabledSites) {

        var strippedUrl = getStrippedUrl(url),
            regexps;

        var matches = function(data) {
            regexps = data.urlRegexps.concat(getEquivalentRegexps(data.urlPatterns));
            var regexpsLen = regexps.length;

            for (var i = 0; i < regexpsLen; ++i) {
                var regexp = regexps[i];
                if (regexp.test(strippedUrl)) {
                    return true;
                }
            }
            return false;
        };

//        if (matches(disabledSites.full)) {
        if (matches(disabledSites)) {
//            return "full";
            return true;
        }
//        else if (matches(disabledSites.partial)) {
//            return "partial";
//        }
        else {
            return false;
        }
    }

    return thisModule;

})(jQuery, _u.mod_commonHelper, _u.mod_getMainDomain, defaultSettings, specialDomain_masterDomain_map);
