module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: [ "content_scripts/jquery-2.0.3.min.js",
                    "content_scripts/underscore-dependencies.js",
                    "content_scripts/backbone-events.js",
                    "content_scripts/mousetrap-modified.js",

                    "content_scripts/initializeNamespace.js",
                    "content_scripts/mod_pubSub.js",
                    "content_scripts/mod_globals.js",
                    "content_scripts/mod_domEvents.js",
                    "content_scripts/mod_commonHelper.js",
                    "content_scripts/CONSTS.js",
                    "content_scripts/initializeTopLevelContainer.js",

                    "content_scripts/mod_smoothScroll.js",
                    "content_scripts/mod_contentHelper.js",
                    "content_scripts/mod_directionalNav.js",
                    "content_scripts/mod_mutationObserver.js",
                    "content_scripts/mod_chromeAltHack.js",
                    "content_scripts/mod_keyboardLib.js",

                    "content_scripts/mod_quickSearchSelectedText.js",
                    "content_scripts/mod_help.js",
                    "content_scripts/mod_basicPageUtils.js",
                    "content_scripts/mod_filterCUs.js",
                    "content_scripts/mod_CUsMgr.js",
                    "content_scripts/mod_easyScrollKeys.js",
                    "content_scripts/mod_urlSpecificShortcuts.js",
                    "content_scripts/mod_selectLink.js",
                    "content_scripts/mod_zenMode.js",

                    "content_scripts/settings.js",
                    "content_scripts/mod_main.js"],

                dest: 'js/units.js'
            }
        },
        uglify: {
            my_target: {
                files: {
                    'js/units.min.js': ['js/units.js']
                }
            }
        }
    });

    // Load the plugin that provides the task.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};
