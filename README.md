Units - Enhanced navigation on the web.
===== 


Setup
-----

- `gem install compass`
- `cd <path-to-project's-base-directory>`
- `compass compile`


Notes
-----

- If this is your first time working on a Chrome extension, refer to Google's
documentation on building Chrome extensions.

- A Chrome extension's code typically comprises of one or more *background scripts* and/or
*content scripts.*

- Most of the code for this extension is within the `content_scripts`
folder. 

- `content_scripts/mod_main.js` is the *main module* that loads the other modules, and so is a
 good starting point to understand the flow of the program.

- `manifest.json` defines the order in which the various `.js` files run

- `_u` is used as the top level namespace.

- files with the prefix `mod_` define independent modules.

- `_readme_module_template.js` describes the template to create modules.

