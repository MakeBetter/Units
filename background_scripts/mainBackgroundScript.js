(function(helper) {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {

            if (request.message === 'getSettings') {

                var sendResponseWhenReady = function() {
                    if (publicSuffixMap) {
                        var settings = getSettings(request.locationObj);
                        sendResponse(settings);
                    }
                    else {
                        setTimeout(sendResponseWhenReady, 100);
                    }
                };
                sendResponseWhenReady();

            }
            else if (request.message === 'closeTab') {
                closeCurrentTab();
            }

        }
    );

    function closeCurrentTab() {
        chrome.tabs.query(
            {currentWindow: true, active : true},
            function(tabArray){
                if (tabArray && tabArray[0]) {
                    chrome.tabs.remove(tabArray[0].id);
                }
            }
        );
    }

    var xhr = new XMLHttpRequest();
    var publicSuffixMap;

    function getPublicSuffixMap(publicSuffixStr) {

        var publicSuffixMap = {};

        var lines = publicSuffixStr.split('\n'),
            linesLen = lines.length;
        for (var i = 0, line; i < linesLen; ++i) {
            line = lines[i];

            if (line.indexOf('//') === 0) {
                continue;
            }

            line = line.trim();
            if (line) {
                var indexOfLastDot = line.lastIndexOf('.');
                var tld = (indexOfLastDot >= 0)? line.substr(indexOfLastDot+1): line;

                var subdomainsArray = line.split('.');
                if (publicSuffixMap[tld]) {
                    publicSuffixMap[tld].push(subdomainsArray);
                }
                else {
                    publicSuffixMap[tld] = [subdomainsArray];
                }
            }
        }
//    console.log(publicSuffixMap);
        return publicSuffixMap;
    }


    xhr.onload = function(e) {
        publicSuffixMap =  getPublicSuffixMap(xhr.response);
    };

    xhr.open('GET', 'background_scripts/data/public_suffix_list.txt', true);
    xhr.send();



// Returns the topmost "registrable" domain, based on the public suffix list, converted to all lowercase
// letters for the sake of consistency, since domain names are case insensitive
    function getMainDomain(locationObj) {
        var mainDomain = _getMainDomain(locationObj);
        if (typeof mainDomain === "string") {
            return mainDomain.toLowerCase();
        }
        else {
            return mainDomain;
        }
    }

    /**
     * Returns the topmost "registrable" domain, based on the public suffix list
     * Algorithm:
     * 1. Split the domain name into tokens.
     * 2. Get the top level domain (tld) from the domain name.
     * 3. Using the tld as the key, get the suffixes array for that tld from publicSuffixMap
     * 4. Now based on the rules of the public suffix list (reference: http://publicsuffix.org/list/), get the public suffix
     * for this domain. The main/ registrable domain is the public suffix plus the next label/ token in the domain name.
     * For example, for "images.google.co.in", "co.in" is the public suffix and "google.co.in" is the registrable domain.
     * Similarly, for the domain, "en.wikipedia.org", "wikipedia.org" is the registrable domain
     *
     */
    function _getMainDomain(locationObj) {
        var domain = locationObj.hostname,
            domainTokens = domain.split("."),   // "data.gov.ac" -> ["data", "gov", "ac"]
            domainTokensLen = domainTokens.length,
            tld = domainTokens[domainTokensLen -1],
            suffixesArr = publicSuffixMap[tld]; // this will be an array of arrays.  e.g: for the tld "ac", this will be:
        //  [["ac"], ["com", "ac"], ["edu", "ac"], ["gov", "ac"],...]

        if (!suffixesArr) {
            //TODO: see if this needs to be handled in any other way
            return domain;
        }

        var mainDomain = null,
            suffixesArrLen = suffixesArr.length;

        // first check for the "exception rules" i.e. rules starting with "!" because they have the highest precedence
        for (var i = 0; i < suffixesArrLen; ++i) {
            var suffixTokens = suffixesArr[i];

            if (suffixTokens[0].charAt(0) === "!") {
                if (domainMatchesSuffix(domainTokens, suffixTokens)) {
                    mainDomain = domainTokens.slice(domainTokensLen - suffixTokens.length).join('.'); // for exception rules, the public suffix is obtained by removing the leftmost label/ token.
                    return mainDomain;
                }
            }
        }

        // Now check for all the other rules (except the exception rules)
        // Match the domain tokens decrementing the number of tokens to be matched in each iteration. Stop at the first match
        // found since that would be the match with the most tokens.
        for (var numTokensToMatch = domainTokensLen; numTokensToMatch >0; numTokensToMatch--) {
            for (var i = 0; i < suffixesArrLen; ++i) {
                var suffixTokens = suffixesArr[i];
                if (numTokensToMatch !== suffixTokens.length || suffixTokens[0].charAt(0) === '!') {
                    continue;
                }

                // check if suffixArray[i] matches the last numTokensToMatch tokens of the domain
                if (domainMatchesSuffix(domainTokens, suffixTokens)) {
                    mainDomain = domainTokens.slice(domainTokensLen - numTokensToMatch - 1).join('.');
                    return mainDomain;
                }
            }
        }
    }

// Returns true if domain tokens match all the suffix tokens, else false.
// The rules regarding tokens containing "*" or "!" are followed as applicable to the public suffix list specification.
// E.g. domain tokens ["images", "google", "co", "in"] will match the suffix tokens ["co", "in"], but not ["com", "in"]
    function domainMatchesSuffix(domainTokens, suffixTokens) {
        suffixTokens = suffixTokens.slice(0); //clone array because we don't want to change original array

        var suffixTokensLen = suffixTokens.length,
            domainTokensLen = domainTokens.length;

        // if suffix at 0th position starts with "!", remove the "!" (and then match normally)
        if (suffixTokens[0].charAt(0) === "!") {
            suffixTokens[0] = suffixTokens[0].substring(1);
        }

        // start matching tokens from the end of both arrays
        for (var i = suffixTokensLen - 1; i >= 0; --i) {
            if (suffixTokens[i] === "*") {
                continue;
            }

            //if any token in the domain does not match its corresponding suffix token, then return false
            if (domainTokens[i + domainTokensLen - suffixTokensLen] !== suffixTokens[i]) {
                return false;
            }
        }
        return true;
    }

    function getSettings(locationObj) {
        var settings = {
            miscGlobalSettings: defaultSettings.miscGlobalSettings,
            browserShortcuts: defaultSettings.browserShortcuts,
            generalShortcuts: defaultSettings.generalShortcuts,
            expandedUrlData: getExpandedUrlData(locationObj)
        };
        var userSettings = getUserSettings();
        return $.extend(true, settings, userSettings);
    }

    function getUserSettings() {
        // TODO: implement this
        return {};
    }

    function getExpandedUrlData(locationObj) {

        if (!locationObj) {
            return null;
        }

        var domain = getMainDomain(locationObj);
        var urlData = getUrlDataUsingDomainKey(domain, locationObj);

        if (!urlData) {
            var masterDomainKey = getMasterDomainKey(domain);
            if (masterDomainKey) {
                urlData = getUrlDataUsingDomainKey(masterDomainKey, locationObj);
            }
        }

        if (urlData) {
            stringifyFunctions(urlData);
            expandUrlData(urlData);
            return urlData;
        }
        else {
            // TODO: Url data not found; anything else to be done?
            return null;
        }
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

// Stringifies any property in the obj that is a function (including in the nested/inner objects within it).
// (Functions must be stringified before they can be passed to the content script, because only JSON type messages are
// allowed between the background and content scripts)
    function stringifyFunctions(obj) {

        // retruns the strigified version of the function passed
        var _stringifyFn = function(fn) {
            return "(" + fn.toString() + ")";
        };

        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === "object") {
                    stringifyFunctions(obj[key]);
                }
                else if (typeof obj[key] === "function") {
                    obj[key] = _stringifyFn(obj[key])
                }
            }
        }
    }

    function getUrlDataUsingDomainKey(domainKey, locationObj) {

        var urlDataArr = defaultSettings.urlData_combined[domainKey];

        if (!urlDataArr) {
            return false;
        }

        while (typeof urlDataArr === "string") {
            urlDataArr = defaultSettings.urlData_combined[urlDataArr];
        }

        if (!Array.isArray(urlDataArr)) {
            urlDataArr = [urlDataArr];
        }

        var urlDataArrLen = urlDataArr.length;
        for (var i = 0; i < urlDataArrLen; ++i) {

            var urlData = urlDataArr[i],
                regexpsToTest = getCombinedRegexps(urlData),
                currentUrl = locationObj.href,
                protocolSeparator = "://", // to strip the leading http:// or https:// etc.
                strippedUrlBeginIndex = currentUrl.indexOf(protocolSeparator) + protocolSeparator.length,
                strippedUrl = currentUrl.substring(strippedUrlBeginIndex),
                regexpsLen =  regexpsToTest.length;

            for (var j = 0, regexp; j < regexpsLen; ++j) {

                regexp = regexpsToTest[j];
                if (regexp.test(strippedUrl)) {
                    return urlData;
                }
            }

        }
        return false;
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

// returns an array combining these two sets of regexps:
// 1) regexps corresponding to the 'urlPatterns' property of the urlData object
// 2) regexps directly specified using the 'urlRegexps' property of the urlData object
    function getCombinedRegexps(urlData) {
        var urlPatterns = urlData.urlPatterns,
            urlRegexps = urlData.urlRegexps,
            combinedRegexps = [];

        if (urlPatterns) {
            if (!Array.isArray(urlPatterns)) {
                urlPatterns = [urlPatterns];
            }

            var urlPatternsLen = urlPatterns.length;
            for (var i = 0, regexp; i < urlPatternsLen; ++i) {

                regexp = urlPatternToRegexp(urlPatterns[i]);
                combinedRegexps.push(regexp);

            }
        }

        if (urlRegexps) {

            combinedRegexps = combinedRegexps.concat(urlRegexps);
        }

        return combinedRegexps;

    }


    /**
     * Returns the regexp object corresponding the to the url pattern supplied.
     * @param {String} urlPattern This is a string that can contain '*'s and @'s as "wildcards":
     - A '@' matches any combination of *one or more* alphanumeric characters,  dashes, underscores and commas
     - A '*' matches any combination of *one or more* characters of *ANY* type.)
     * @return {RegExp}
     */
    function urlPatternToRegexp(urlPattern) {

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

})(_u.helper);