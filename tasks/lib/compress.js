var fs = require( './fs' );
var path = require( 'path' );
var crypto = require( 'crypto' );
var url = require( 'url' );

var UglifyJS = require( 'uglify-js' );
var CleanCSS = require( 'clean-css' );
var iconvLite = require( 'iconv-lite' );
var mkdirp = require( 'mkdirp' );

var util = require( './util' );
var sysUtil = require( 'util' );

module.exports = function ( options, grunt, mapFiles ) {

  //是否不修改版本号
  function isExclude ( filename, excludes ) {

    if ( !util.isArray( excludes ) ) {
      excludes = [ excludes ];
    }

    var isExclude = false;
    var matchOne = function ( filename, rule ) {
      if ( util.isString( rule ) ) {
        return filename == rule;
      } else if ( sysUtil.isRegExp( rule ) ) {
        return rule.test( filename );
      } else if ( util.isFunction( rule ) ) {
        return !!rule( filename );
      }
      return false;
    };

    for ( var i = 0, len = excludes.length; i < len; i++ ) {
      if ( matchOne( filename, excludes[ i ] ) ) {
        isExclude = true;
        break;
      }
    }
    return isExclude;
  }

  function compressJS ( filepath ) {

    var buffer = ( filepath );

    var content = iconvLite.decode( buffer, 'utf-8' );

    if ( content.indexOf( '�' ) != -1 ) {
      content = iconvLite.decode( buffer, 'gbk' );
    }

    var minContent = UglifyJS.minify( content, {
      fromString: true,
        output: {
          ascii_only : true,
          max_line_len : null
        }
    } ).code;

    minContent = options.banner + minContent;

    //获得sha1签名
    var signature = crypto.createHash( 'sha1' ).update( buffer ).digest( 'hex' ).slice( 0, 6 );

    var minFilepath = filepath;

    if ( !isExclude( filepath, options.excludes ) ) {
     minFilepath = path.join( path.dirname( filepath ), path.basename( filepath, '.js') + '_' + signature + '.js' );
    }

    grunt.file.write( path.join( options.dist, minFilepath ), minContent );

    return minFilepath;
  }

  function compressCSS ( filepath ) {

    var content = fs.readFileString( filepath );

    var minContent = new CleanCSS( {
      keepSpecialComments : 0, //* for keeping all (default), 1 for keeping first one only, 0 for removing all
        noAdvanced : true, //set to true to disable advanced optimizations - selector & property merging, reduction, etc.
        compatibility : true, //Force compatibility mode to ie7 or ie8. Defaults to not set.
    } ).minify( content );

    if ( minContent.errors.length ) {
      grunt.log.error( minContent.errors );
    }

    if ( minContent.warnings.length ) {
      grunt.log.error( minContent.warnings );
    }

    minContent = options.banner + minContent.styles;

    grunt.file.write( path.join( options.dist, filepath ), minContent );
    return filepath;
  }

  function compressOther ( filepath ) {
    grunt.file.copy( filepath, path.join( options.dist, filepath ) );
    return filepath;
  }

  function compressOne ( filepath ) {

    var minFilepath = '';

    if ( util.isScript( filepath ) ) {

      minFilepath = compressJS( filepath );

    } else if ( util.isCss( filepath ) ) {

      minFilepath = compressCSS( filepath );

    } else {
      minFilepath = compressOther( filepath );
    }

    return minFilepath;
  }

  //待处理文件列表
  var filepaths = fs.readListFile( options.listFile );
  var minFilepaths = [];

  function compress ( filepaths ) {

    var modifyPaths = [];

    filepaths.forEach( function ( filepath ) {

      var minFilepath = compressOne( filepath );

      if ( minFilepaths.indexOf( minFilepath ) == -1 ) {
        minFilepaths.push( minFilepath );
      }

      if ( minFilepath != filepath && modifyPaths.indexOf( minFilepath ) == -1 ) {
        modifyPaths.push( minFilepath );
      }

    } );

    if ( modifyPaths.length ) {
      modifyMapFile();
    }
  }

  compress( filepaths );
};
