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

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('pulses', 'compile build dist tool', function () {

    //console.log( this.target.startsWith );
    var targetName = this.target;
    if ( !/^min/.test( targetName) && !/^ftp/.test( targetName ) ) {
      grunt.log.error( 'pulses target must be start with "min" or "ftp"' );
      return false;
    }

    var options = this.options( {
      banner: ''
    } );

    if ( /^min/.test( targetName) ) {
      //grunt.file.copy( 'js/base/plugin/swfobject.js', 'dist/js/base/plugin/swfobject.js' );
      compress( options, grunt, this.files );
    } else if ( /^ftp/.test( targetName ) ) {
    
    }

    // Merge task-specific and/or target-specific options with these defaults.
    //var options = this.options({
    //  punctuation: '.',
    //  separator: ', '
    //});

    // Iterate over all specified file groups.
    //this.files.forEach(function (file) {
    //  // Concat specified files.
    //  var src = file.src.filter(function (filepath) {
    //    // Warn on and remove invalid source files (if nonull was set).
    //    if (!grunt.file.exists(filepath)) {
    //      grunt.log.warn('Source file "' + filepath + '" not found.');
    //      return false;
    //    } else {
    //      return true;
    //    }
    //  }).map(function (filepath) {
    //    // Read file source.
    //    return grunt.file.read(filepath);
    //  }).join(grunt.util.normalizelf(options.separator));

    //  // Handle options.
    //  src += options.punctuation;

    //  // Write the destination file.
    //  grunt.file.write(file.dest, src);

    //  // Print a success message.
    //  grunt.log.writeln('File "' + file.dest + '" created.');
    //});
  });

};
