/* global jQuery, defaultSettings, specialDomain_masterDomain_map */

_u.mod_settings = (function($, mod_commonHelper, mod_getMainDomain, defaultSettings, specialDomain_masterDomain_map) {
    "use strict";

    /*-- Public interface --*/
    var thisModule ={
        getSettings: getSettings, // final computed settings i.e. default settings extended by user settings
        setUserSettings: setUserSettings,
        getDefaultSettings: getDefaultSettings,
        addUrlPatternToUserDisabledSites: addUrlPatternToUserDisabledSites
    };

    /***
     * Get applicable settings (computed by extending default settings by user settings). If url is specified, then
     * get location specific settings, else get settings for all sites.
     *
     * If url is specified, the settings object is appended with properties expandedUrlData and isDisabled, and
     * the urlDataMap property is removed.
     * @param url,
     * @param callback Callback function returns the settings.
     */
    function getSettings(url, callback) {

        var userSettings = getUserSettings(url),
            defaultSettings = getDefaultSettings();

        if (url) {
            defaultSettings.expandedUrlData = getExpandedUrlData(defaultSettings, url);
            delete defaultSettings.urlDataMap;
        }

        var settings = $.extend(true, {}, defaultSettings, userSettings);

        if (url) {
            settings.isDisabled = getDisabledStatus(url, settings.disabledSites);
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
     * Get user settings, stored in local storage.
     * If url is specified, get URL specific data in the expandedUrlData property. Else get data for all URLs in
     * the existing urlDataMap property
     *
     * @param [url]
     * @returns {*}
     */
    function getUserSettings(url) {
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

            if (url) {
                settingsObj.expandedUrlData = getExpandedUrlData(settingsObj, url);
                delete settingsObj.urlDataMap;
            }
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
     * Get the urlData object that matches for the given URL
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

        // uses defaultSettings.valuesFor_stdUrlDataItems to supplement values in the SU/action (specified using the first two params)
        // 'scope' can be either "page" or "CUs"
        var supplementWithDefaultValues = function(SUorAction, SUorAction_Name, scope) {

            var temp;
            if (!SUorAction.kbdShortcuts && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
                SUorAction.kbdShortcuts = temp.kbdShortcuts;
            }
            if (!SUorAction.miniDescr && (temp = defaultSettings.valuesFor_stdUrlDataItems[scope][SUorAction_Name])) {
                SUorAction.miniDescr = temp.miniDescr;
            }
        };

        // scope can be either "page" or "CUs"
        var expandSUsOrActions = function(SUsOrActions, scope) {
            if (typeof SUsOrActions === "object") {
                for (var SUorAction_Name in SUsOrActions) {
                    expandPropertyToObjIfString(SUsOrActions, SUorAction_Name);
                    supplementWithDefaultValues(SUsOrActions[SUorAction_Name], SUorAction_Name, scope);
                }
            }
        };

        expandPropertyToObjIfString(urlData, 'CUs_specifier');

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
        console.log(regexpStr);

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

    function extendUrlData() {

    }


    return thisModule;

})(jQuery, _u.mod_commonHelper, _u.mod_getMainDomain, defaultSettings, specialDomain_masterDomain_map);
