/*
The data in this file specifies sites where the extension should not run/run in partial mode.
Patterns for matching urls can be specified using either the 'url pattern' format allowing '@' and '*' wildcards,
or regexp objects the aforementioned patterns don't suffice. Details about the 'url pattern' format can be found
in the urlData.js file.
*/

var  exceptionSites = {

    // On these sites, only the "browser action" shortcuts are enabled, but the rest of the extension is disabled.
    partial: {
        urlPatterns: [/* 'mail.google.com', 'mail.google.com/*', 'gmail.com', 'gmail.com/*' */],
        urlRegexps: []
    },

    // On these sites, the extension is completely disabled.
    full: {
        urlPatterns: ['mail.google.com', 'mail.google.com/*', 'gmail.com', 'gmail.com/*'],
        urlRegexps: []
    }

}







