'use strict';

module.exports = function (grunt) {
    // Show elapsed time at the end
    // require('time-grunt')(grunt);
    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        nodeunit: {
            files: []
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            lib: {
                src: [
                    'attribute.js',
                    'cfg.js',
                    'iotdb.js',
                    'meta.js',
                    'model.js',
                    'model_maker.js',
                    'queue.js',
                    'thing_array.js',
                    'helpers/*.js',
                    'bin/iotdb',
                ]
            },
            test: {
                src: []
            }
        },
        watch: {
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            lib: {
                files: '<%= jshint.lib.src %>',
                tasks: ['jshint:lib']
            },
            test: {
                files: '<%= jshint.test.src %>',
                tasks: ['jshint:test']
            }
        },
        jsbeautifier: {
            files: [
                '*.js',
                'libs/*.js',
                'stores/*.js',
                'transmogrifiers/*.js',
            ],
            options: {
                js: {
                    jslint_happy: true,
                    indentChar: ' ',
                    indentSize: 4
                }
            },
        }
    });

    // Default task.
    grunt.registerTask('default', ['jsbeautifier', 'jshint']);

};
