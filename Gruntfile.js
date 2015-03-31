/*
 * grunt-pulses
 * https://github.com/xwcoder/grunt-pulses
 *
 * Copyright (c) 2015 creep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  require( 'time-grunt' )( grunt );
  // load all npm grunt tasks
  require('load-grunt-tasks')(grunt);

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON( 'package.json' ),
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>'
      ],
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      }
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp']
    },

    // Configuration to be run (and then tested).
    pulses: {
      options: {
        banner: '/* <%= pkg.name %> <%= grunt.template.today( "yyyy-mm-dd HH:MM:ss" ) %> */\n',
      },

      min: {
        options: {
          listFile: 'dist/list.txt',
          pListFile: 'dist/plist.txt',
          dist: 'dist',
          excludes: [ /(^|\/)kao\./, /(^|\/)dict\./, /(^|\/)inc\./, /(^|\/)gg\.seed\./, /(^|\/)hdpv\./ ],
        },
        files: {
          src: ['js/kao.js', 'js/dict.js', 'js/gg.seed.js', 'js/base/plugin/swfobject.js', 'js/**/inc.js', '!js/test/**/*.js']
        }
      },

      ftp_test: {

      },

      ftp_dist: {

      },
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js']
    }

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'pulses', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
