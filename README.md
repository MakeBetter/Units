Units
=====

Make navigation, accessibility (and more) on the web, better.






Developers (who want to contribute to this this project, fork it, etc):
----------

- If this is your first time working on a Chrome extension, refer to Google's
documentation on building extensions for Chrome.

- A Chrome extension's code generally comprises of "background scripts" and/or
"content scripts."

- Most of the source code for the Units extension exists within the `content_scripts`
folder. The `mod_main.js` file within it is a good starting point to understand
the flow of the program.

- While `mod_main.js` is the "main" module, the modules it depends
 on must initialize before it can run. (See below)

- `manifest.json` defines the order in which the various `.js` files run,
via their ordering within the `content_scripts` and `background` properties.
(Based on the ordering of javascript files within `content_scripts`, `mod_main.js`
executes only after the modules it depends on have initialized.)

- `_u` is used as the top level namespace.

- Refer to _readme_module_template.js which describes how modules are created
