module.exports = function(grunt) {

    grunt.initConfig({
        concat: {
            doc: {
                files: {
                    'API.md': [
                        'doc/*.md'
                    ]
                }
            },
            base: {
                files: {
                    'build/fools.js': [
                        'src/index.js',
                        'src/range.js',
                        'src/all.js',
                        'src/rate.js',
                        'src/loop.js',
                        'src/pairs.js',
                        'src/rate.js',
                        'src/each.js',
                        'src/pipe.js',
                        'src/gauntlet.js',
                        'src/frameOfReference.js',
                        'src/until.js',
                        'src/fork.js']
                }
            }
        },
        umd: {
            fork: {
                src: 'build/fools.js',
                dest: 'fools.js', // optional, if missing the src will be used
                template: 'unit', // optional; a template from templates subdir can be specified by name (e.g. 'umd');
                // if missing the templates/umd.hbs file will be used
                objectToExport: 'Fools', // optional, internal object that will be exported
                amdModuleId: 'Fools', // optional, if missing the AMD module will be anonymous
                globalAlias: 'Fools', // optional, changes the name of the global variable
                deps: { // optional
                    'default': ['_'],
                    cjs: ['lodash']
                }
            }
        }

    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-umd');

// the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['concat:base', 'umd:fork']);
};
