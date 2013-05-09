/* global jQuery, _u, defaultSettings, specialDomain_masterDomain_map */

_u.mod_settings = (function($, mod_commonHelper, mod_getMainDomain, defaultSettings, specialDomain_masterDomain_map) {
    "use strict";

    /*-- Public interface --*/
    var thisModule ={
        getSettings: getSettings,
        getAllSettings: getAllSettings,
        setUserSettings: setUserSettings,
        getDefaultSettings: getDefaultSettings,
        addUrlPatternToUserDisabledSites: addUrlPatternToUserDisabledSites,
        getDisabledStatus: getDisabledStatus
    };

    /***
     * Return final settings (default settings overriden by user settings) for the specified location object
     * @param locationObj
     * @returns {{miscGlobalSettings: *, browserShortcuts: *, CUsShortcuts: *, generalShortcuts: *, disabledSites: *, expandedUrlData: *}}
     */
    function getSettings(locationObj) {
        var _defaultSettings = {
                miscGlobalSettings: defaultSettings.miscGlobalSettings,
                browserShortcuts: defaultSettings.browserShortcuts,
                generalShortcuts: defaultSettings.generalShortcuts,
                CUsShortcuts: defaultSettings.CUsShortcuts,
                disabledSites: defaultSettings.disabledSites,
                expandedUrlData:getExpandedUrlData(defaultSettings, locationObj)
            },
            userSettings = getUserSettings(locationObj),
            settings = $.extend(true, {}, _defaultSettings, userSettings);

        settings.isDisabled = getDisabledStatus(locationObj.href, settings.disabledSites);

        return settings;
    }

    /***
     * Get all the final settings (default settings overriden by user settings)
     * This is used to display the final settings in the settings UI.
     * @returns {*}
     */
    function getAllSettings() {
        var userSettings = getUserSettings(),
            settings = $.extend(true, {}, defaultSettings, userSettings);

        return settings;
    }

    /***
     * Get the default settings
     * @returns {*}
     */
    function getDefaultSettings() {
        return defaultSettings;
    }

    /***
     * Get user settings, stored in local storage.
     *
     * @param [locationObj] If locationObj is specified, then settingsObj.expandedUrlData will have the data for the
     * locationObj URL, if present. Otherwise, expandedUrlData will be null.
     * @returns {*}
     */
    function getUserSettings(locationObj) {
        var settingsJSON = localStorage.userSettings,
            settingsObj = null;

        if (settingsJSON) {
            try{
                settingsObj = JSON.parse(settingsJSON);
            }
            catch(exception) {
                console.error(exception);
                return settingsObj;
            }

            mod_commonHelper.destringifyJsonUnsupportedTypes_inSettings(settingsObj);
            settingsObj.expandedUrlData = getExpandedUrlData(settingsObj, locationObj);
        }
        return settingsObj;

    }

    function setUserSettings(settingsObj) {

        if (settingsObj) {
            mod_commonHelper.stringifyJSONUnsupportedTypes_inSettings(settingsObj);
            var settingsJSON = JSON.stringify(settingsObj);
            localStorage.userSettings = settingsJSON;


        }
        else {
            delete localStorage.userSettings;
        }

        // Send event to all tabs, so that settings are updated for the existing tabs as well.
        chrome.tabs.query({}, function(tabs) {
            for (var i=0; i<tabs.length; ++i) {
                chrome.tabs.sendMessage(tabs[i].id, {message: 'settingsChanged'});
            }
        });

    }

    /**
     * Method to add a URL pattern/ site to be disabled to the user settings. Used from popup.js for disabling site at
     * the currently active tab.
     * @param urlPattern
     * @returns {boolean}
     */
    function addUrlPatternToUserDisabledSites(urlPattern) {
        var userSettings = getUserSettings();
        if (!userSettings) {
            userSettings = $.extend(true, {}, defaultSettings);
        }

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

    function getExpandedUrlData(settings, locationObj) {

        if (!locationObj || !settings) {
            return null;
        }

        var domain = mod_getMainDomain.getMainDomain(locationObj);
        var urlData = getUrlDataUsingDomainKey(settings, domain, locationObj);

        if (!urlData) {
            var masterDomainKey = getMasterDomainKey(domain);
            if (masterDomainKey) {
                urlData = getUrlDataUsingDomainKey(settings, masterDomainKey, locationObj);
            }
        }

        if (urlData) {
            mod_commonHelper.stringifyFunctions(urlData);
            expandUrlData(urlData);
            return urlData;
        }
        else {
            // TODO: Url data not found; anything else to be done?
            return null;
        }
    }

    function getUrlDataUsingDomainKey(settings, domainKey, locationObj) {

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

        var urlDataArrLen = urlDataArr.length;
        for (var i = 0; i < urlDataArrLen; ++i) {

            var urlData = urlDataArr[i],
                regexpsToTest = [],
                currentUrl = locationObj.href,
                strippedUrl = getStrippedUrl(currentUrl);


            if (Array.isArray(urlData.urlPatterns)) {
                regexpsToTest = regexpsToTest.concat(getEquivalentRegexps(urlData.urlPatterns));
            }
            if (Array.isArray(urlData.urlRegexps)) {
                regexpsToTest = regexpsToTest.concat(urlData.urlRegexps);
            }
            var regexpsLen =  regexpsToTest.length;

            for (var j = 0, regexp; j < regexpsLen; ++j) {

                regexp = regexpsToTest[j];
                if (regexp.test(strippedUrl)) {
                    return urlData;
                }
            }

        }
        return false;
    }

    // Converts any "shorthand" notations within the urlData to their "expanded" forms.
// Also adds default 'miniDesc' and 'kbdShortcuts' values, if not specified by MUs/actions defined in urlData
    function expandUrlData(urlData) {

        // if key value at property 'key' in object 'obj' is a string, it is expanded to point to an object having a property
        // 'selector' that points to the string instead.
        var expandPropertyToObjIfString = function(obj, key) {
            var str;
            if (typeof (str = obj[key]) === "string") {
                obj[key] = {
                    selector: str
                };
            }
        };

        // uses defaultSettings.valuesFor_stdUrlDataItems to supplement values in the MU/action (specified using the first two params)
        // 'scope' can be either "page" or "CUs"
        var supplementWithDefaultValues = function(MUorAction, MUOrAction_Name, scope) {

            var temp;
            if (!MUorAction.kbdShortcuts && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][MUOrAction_Name])) {
                MUorAction.kbdShortcuts = temp.kbdShortcuts;
            }
            if (!MUorAction.miniDescr && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][MUOrAction_Name])) {
                MUorAction.miniDescr = temp.miniDescr;
            }
        };

        // scope can be either "page" or "CUs"
        var expandMUsOrActions = function(MUsOrActions, scope) {
            if (typeof MUsOrActions === "object") {
                for (var MUOrAction_Name in MUsOrActions) {
                    expandPropertyToObjIfString(MUsOrActions, MUOrAction_Name);
                    supplementWithDefaultValues(MUsOrActions[MUOrAction_Name], MUOrAction_Name, scope);
                }
            }
        };

        expandPropertyToObjIfString(urlData, 'CUs_specifier');

        expandMUsOrActions(urlData.CUs_MUs, "CUs");
        expandMUsOrActions(urlData.CUs_actions, "CUs");

        expandMUsOrActions(urlData.page_MUs, "page");
        expandMUsOrActions(urlData.page_actions, "page");

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
     - A '*' matches any combination of *one or more* characters of *ANY* type.)
     * @return {RegExp}
     */
    function wildcardPatternToRegexp(urlPattern) {

        // get the corresponding "regular expression escaped" string.
        var regexpStr = urlPattern.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');

        // replacing all instances of '\*' (to which '*'s would have been converted above) by the regexp equivalent
        // to match any combination of zero or more characters of any type
        regexpStr = regexpStr.replace(/\\\*/g, '.+');

        // replacing all instances of '@' by the regexp equivalent to match any combination of one or more
        // alphanumeric characters,  dashes, underscores and commas.
        regexpStr = regexpStr.replace(/@/g, '[a-z\\-_,]+');

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
