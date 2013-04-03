/*
commonHelper.js - contains helper functions that are shared between the content scripts and the background scripts.
*/


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