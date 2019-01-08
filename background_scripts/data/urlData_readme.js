/*

This file documents additional information on the technique of matching
a URL to the data associated with it (`urlData`) than is described in
the documentation present at `urlData.js`.

- Each `urlData` object identifies CUs and SUs (defined below) correponding to
its webpage, and their associated keyboard shortcuts.


*** CUs and SUs ***

 * CU (Content Unit):
A set of repeating "units" that make up a webpage. Examples:
    - On a search engine's results, each search result is a CU. 
    - On a feed, each item on the feed is a CU.
Each CU is a logical unit of content, attention and navigation.

* SU (Secondary Unit):
 Links, buttons, fields etc on a page. 
    - These can occur within a CU (e.g: links such as 'like', 'share')
    - Or be applicable to the whole page, such as 'logout', the main search field, etc).
 

Note: Here, "URL" is used to mean the part of the URL excluding the "http(s)://", etc.


Some points to note:

1) In most cases, a master domain is a "registrable" domain, based on
`public_suffix_list.txt` (taken from publicsuffix.org). 

There can be exceptions to this. e.g: "blogspot.com". Now, per the public suffix list,
blogspot.com is itself a public suffix (like .com), and sub-domains of blogspot.com
(such as foo.blogspot.com) are considered registrable domains.
However, since all blogspot sub-domains have a similar markup format, we can group them using the 
same master key ("blogspot.com")
This is enabled by using a regexp making all blogspot subdomains in `specialDomain_masterDomain_map`.

2) The value mapped to any master domain is an array. For an array with only one `urlData` object, the object may
directly be specified instead of the array.

A URL is mapped to a `urlData` object as follows. For any url, from among the array of `urlData` objects mapped
to its domain, the `urlData` object containing the first matching wildcard pattern/regexp is used.
(And so the "urlData" objects should be ordered accordingly. Eg: The urlData associated with a default/catch-all
regexp should be the last one specified.)

The regexps associated with a `urlData` object are specified using the `urlRegexp` property. Wildcard-like patterns
can also be specified using the `urlPatterns` property, as explained below:
They allow using *'s and @'s as "wildcards":
 - A '*' matches any combination of ZERO or more characters of ANY type, including slashes and periods.
 - A '**' matches any combination of ONE or more characters of ANY type, including slashes and periods.
- A '@' matches any combination of ONE or more characters that are NOT slashes or periods.

3) Only the part of the url after http(s):// is considered for matching with the provided patterns/regexps.

4) As is convention, a domain name is considered case insensitive, but the rest of the URL isn't


5)
i) Anywhere a selector is specified, the extended set of jQuery selectors can be used as well.
ii) A selector can be specified as a string or an array of strings. When specified as an array, we consider them in order
till an element is found.

6) // Guide for standard ("std_") items in urlData:
This applies to SUs and actions (both within page and CU levels), whose names begin with the prefix "std_"
These items need not specify keyboard shortcuts ('kdbShortcuts' property) and brief description ('descr' property).
This is the recommended policy for these items. In this case, the default shortcuts and description shall be applied
to these items. However, if it specifically makes sense in a given case, these values (one or both) should be provided
and they will override the defaults. Note: any keyboard shortcuts, if specified, will *replace* the default ones (as
opposed to supplementing them.) This allows complete control over what keyboard shortcuts are applied to a page.
 */
