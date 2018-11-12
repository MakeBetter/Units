
// Module to determine the "registrable domain" in a given URL, based on the public suffix
// list (`public_suffix_list.txt`)

_u.mod_getRegistrableDomain = (function(mod_commonHelper) {
    "use strict";

    /*-- Public interface --*/
    var thisModule ={
        getRegistrableDomain: getRegistrableDomain,
        publicSuffixMap: null
    };

    var xhr = new XMLHttpRequest();

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
        thisModule.publicSuffixMap =  getPublicSuffixMap(xhr.response);
    };

    xhr.open('GET', 'background_scripts/data/public_suffix_list.txt', true);
    xhr.send();


    /**
     * Returns the topmost "registrable" domain, based on the public suffix list, converted to all lowercase
     * letters for the sake of consistency, since domain names are case insensitive
     * @param url
     * @returns {*}
     */
    function getRegistrableDomain(url) {
        var registrableDomain = _getRegistrableDomain(url);
        if (typeof registrableDomain === "string") {
            return registrableDomain.toLowerCase();
        }
        else {
            return registrableDomain;
        }
    }

    /**
     * Returns the "registrable" domain, based on the public suffix list
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
    function _getRegistrableDomain(url) {
        var domain = mod_commonHelper.getHostname(url),
            domainTokens = domain.split("."),   // "data.gov.ac" -> ["data", "gov", "ac"]
            domainTokensLen = domainTokens.length,
            tld = domainTokens[domainTokensLen -1],
            suffixesArr = thisModule.publicSuffixMap[tld]; // this will be an array of arrays.  e.g: for the tld "ac", this will be:
        //  [["ac"], ["com", "ac"], ["edu", "ac"], ["gov", "ac"],...]

        if (!suffixesArr) {
            //TODO: see if this needs to be handled in any other way
            return domain;
        }

        var registrableDomain = null,
            suffixesArrLen = suffixesArr.length,
            suffixTokens,
            i;

        // first check for the "exception rules" i.e. rules starting with "!" because they have the highest precedence
        for (i = 0; i < suffixesArrLen; ++i) {
            suffixTokens = suffixesArr[i];

            if (suffixTokens[0].charAt(0) === "!") {
                if (domainMatchesSuffix(domainTokens, suffixTokens)) {
                    registrableDomain = domainTokens.slice(domainTokensLen - suffixTokens.length).join('.'); // for exception rules, the public suffix is obtained by removing the leftmost label/ token.
                    return registrableDomain;
                }
            }
        }

        // Now check for all the other rules (except the exception rules)
        // Match the domain tokens decrementing the number of tokens to be matched in each iteration. Stop at the first match
        // found since that would be the match with the most tokens.
        for (var numTokensToMatch = domainTokensLen; numTokensToMatch >0; numTokensToMatch--) {
            for (i = 0; i < suffixesArrLen; ++i) {
                suffixTokens = suffixesArr[i];
                if (numTokensToMatch !== suffixTokens.length || suffixTokens[0].charAt(0) === '!') {
                    continue;
                }

                // check if suffixArray[i] matches the last numTokensToMatch tokens of the domain
                if (domainMatchesSuffix(domainTokens, suffixTokens)) {
                    registrableDomain = domainTokens.slice(domainTokensLen - numTokensToMatch - 1).join('.');
                    return registrableDomain;
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


    return thisModule;

})(_u.mod_commonHelper);
