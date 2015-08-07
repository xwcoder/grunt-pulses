/*
 * grunt-pulses
 * https://github.com/xwcoder/grunt-pulses
 *
 * Copyright (c) 2015 creep
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function (grunt) {

  var fs = require( './lib/fs' );
  var compress = require( './lib/compress' );
  var upload = require( './lib/upload' );
  var readline = require( 'readline' );

  var util = require( './lib/util' );

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('pulses', 'compile build dist tool', function () {

    var targetName = this.target;
    if ( !/^min/.test( targetName) && !/^ftp/.test( targetName ) ) {
      grunt.log.error( 'pulses target must be start with "min" or "ftp"' );
      return false;
    }

    var options = this.options( {
      banner: '',
      confirm: true
    } );

    if ( /^min/.test( targetName) ) {

      try {
       compress( grunt, options, this.files );
      } catch (e) {
        grunt.log.error(e);
      }

    } else if ( /^ftp/.test( targetName ) ) {

      var done = this.async();

      var filepaths = grunt.file.read( options.pListFile ).split( '\n' ).filter( function ( filepath ) {
        return filepath && filepath.trim();
      } );

      filepaths = util.unique( filepaths );

      grunt.log.writeln( '上线文件清单：' );
      grunt.log.writeln( filepaths.join( '\n' ) );

      if ( options.confirm ) {

        process.stdin.setEncoding('utf8');
        var rl = readline.createInterface( {
          input : process.stdin,
          output : process.stdout
        } );

        rl.question( '确认上线以上文件到吗(y/n)?', function ( data ) {

          data = data.trim();

          rl.close();

          if ( data == 'y' ) {
            upload( grunt, options, done);
          } else {
            done();
          }
        } );

      } else {
        upload( grunt, options, done);
      }
    }

  });

};
