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

        //编译目录
        dist: 'dist',
        logFile: 'dist/log.txt',

        //压缩服务生成的上传清单
        pListFile: 'dist/plist.txt',

        //不做版本号替换的文件
        excludes: [ /(^|\/)kao\./, /(^|\/)dict\./, /(^|\/)inc\./, /(^|\/)gg\.seed\./, /(^|\/)hdpv\./ ],

        // 字典文件正则, 用于上线时先上线普通文件，最后上线字典文件
        mapFiles : [ /(^|\/)kao\./, /(^|\/)dict\./, /(^|\/)inc\./, /(^|\/)gg\.seed\./, /(^|\/)swfobject\./ ],
      },

      min: {
        options: {
          listFile: 'dist/list.txt',
          //不做压缩的文件(uglify2不支持压缩es6语法)
          xmin: [/^js\/src/],
        },
        files: {
          //字典文件
          src: ['js/kao.js', 'js/dict.js', 'js/gg.seed.js', 'js/base/plugin/swfobject.js', 'js/**/inc.js', '!js/test/**/*.js']
        }
      },

      ftp_test: {
        options: {
          //上线前是否需要确认, 默认是true
          confirm: true,
          ftp: 'dist/ftp_test.json'
        }
      },

      ftp_dist: {
        confirm: true,
        ftp: 'dist/ftp_dist.json'
      }
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
