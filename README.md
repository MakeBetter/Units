Units - Enhanced navigation on the web
===== 


Setup
-----

- `gem install compass`
- `cd <project's-base-directory>`
- `compass compile`
- Install the base folder as an _Unpacked Extension_ on Chrome (refer: [https://developer.chrome.com/extensions](https://developer.chrome.com/extensions))


Usage
-----

- Open a supported webpage such as [https://www.google.com/search?q=hello+world](https://www.google.com/search?q=hello+world)
- Press `J` a few times to move down through the search results.
- Press `K` to move up results.
- Press `O` to open a result on a new tab (or `Enter` to open it on the same tab).
- Additional features are described at ------ [https://***insert-link***](https://***insert-link***)------


Adding support for additional websites
--------------------------------------

--- ADD TEXT ---

Notes
-----

- A Chrome extension's code typically comprises of one or more *background scripts* and/or 
*content scripts.* (refer: [Chrome's documentation on developing extensions 
(https://developer.chrome.com/extensions))

- Most of the code for this extension is within the `content_scripts`
folder. 

- `content_scripts/mod_main.js` is the *main module* that loads the other modules, and so is a
 good starting point to understand the flow of the program.

- `manifest.json` defines the order in which the various `.js` files run

- `_u` is used as the top level namespace.

- Files with the prefix `mod_` define independent modules.

- `_readme_module_template.js` describes the template to create modules.

