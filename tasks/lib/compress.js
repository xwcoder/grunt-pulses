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

module.exports = function ( grunt, options, mapFiles ) {

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

    var buffer = fs.readFile( filepath );

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

    var content = fs.readFileAsString( filepath );

    var minContent = new CleanCSS( {
        keepSpecialComments : 0, //* for keeping all (default), 1 for keeping first one only, 0 for removing all
        noAdvanced : true, //set to true to disable advanced optimizations - selector & property merging, reduction, etc.
        compatibility : true, //Force compatibility mode to ie7 or ie8. Defaults to not set.
    } ).minify( content );

    //var minContent = new CleanCSS( {
    //  keepSpecialComments : 0, //* for keeping all (default), 1 for keeping first one only, 0 for removing all
    //    noAdvanced : true, //set to true to disable advanced optimizations - selector & property merging, reduction, etc.
    //    compatibility : true, //Force compatibility mode to ie7 or ie8. Defaults to not set.
    //} ).minify( content );

    //if ( minContent.errors.length ) {
    //  grunt.log.error( minContent.errors );
    //}

    //if ( minContent.warnings.length ) {
    //  grunt.log.error( minContent.warnings );
    //}

    //minContent = options.banner + minContent.styles;
    minContent = options.banner + minContent;

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
      modifyMapFile( modifyPaths );
    } else { //没有替换文件则声称plist
      log();
    }
  }

  //生成plist文件，并答应log
  function log () {

    minFilepaths.sort( function ( f1, f2 ) {

      var ext1 = path.extname( f1 ).toLowerCase();
      var ext2 = path.extname( f2 ).toLowerCase();

      if ( ( ext1 == '.js' && ext2 != '.js' )
        || ( ext1 == '.css' && ext2 != '.js' && ext2 != '.css' ) ) {
          return -1;
        }

      if ( ( ext1 == '.js' && ext2 == '.js' )
        || ( ext1 == '.css' && ext2 == '.css' )
        || ( ext1 != '.js' && ext1 != '.css' && ext2!= '.js' && ext2 != '.css' ) ) {
          return 0;
        }

      return 1;
    } );

    var jsReg = /^js\//;
    var cssReg = /^css\//;
    var imgReg = /^img\//;

    var urls = minFilepaths.map( function ( filepath ) {

      if ( jsReg.test( filepath ) ) {
        return url.resolve( 'http://js.tv.itc.cn', filepath.replace( jsReg, '' ) );
      }

      if ( cssReg.test( filepath ) ) {
        return url.resolve( 'http://css.tv.itc.cn', filepath.replace( cssReg, '' ) );
      }

      if ( imgReg.test( filepath ) ) {
        return url.resolve( 'http://css.tv.itc.cn', filepath.replace( imgReg, '' ) );
      }
    } );

    var content = minFilepaths.join( '\n' );
    var urlContent = urls.join( '\n' );

    console.log( 'compress:' );
    console.log( content + '\n\n' + urlContent + '\n' );

    if ( options.logFile ) {
      grunt.file.write( options.logFile, content + '\n\n' + urlContent );
      grunt.log.ok( '生成日志文件:' + options.logFile );
    }

    if ( options.pListFile ) {
      grunt.file.write( options.pListFile, content );
      grunt.log.ok( '生成上线清单文件:' + options.pListFile );
    }
  }

  function modifyMapFile ( minFilepaths ) {

    var minFilepathNames = minFilepaths.map( function ( filepath ) {
      filepath = filepath.replace( /^js\//, '' );
      if ( filepath.indexOf( '/' ) == -1 ) {
        filepath = '/' + filepath;
      }
      return filepath;
    } );

    //构造替换正则
    var regs = minFilepathNames.map( function ( filepath ) {

      if ( filepath.split( '_' ).length > 2 ) {
        filepath = filepath.split( '_' ).slice( 0, -1 ).join( '_' );
        filepath = filepath.replace( '/', '\\\/' ) + '((_\\w+)|(_\\d+))?\\.js';
      } else {
        filepath = filepath.replace('/', '\\\/').replace(/_\w+\.js/, '((_\\w+)|(\\d+))?\\.js');
      }
      return new RegExp( filepath, 'g' );
    } );

    var modifiedMapFilepaths = [];

    mapFiles.forEach( function ( file ) {

      file.src.forEach( function ( mapFilepath ) {

        var content = fs.readFileAsString( mapFilepath );

        var isModyfied = false;

        minFilepathNames.forEach( function ( minFilepath, index ) {
          var reg = regs[ index ];
          reg.lastIndex = 0;
          if ( reg && reg.test( content ) ) {
            isModyfied = true;
            content = content.replace( reg, minFilepath );
          }
        } );

        if ( isModyfied ) {
          modifiedMapFilepaths.push( mapFilepath );
          grunt.file.write( mapFilepath, content );
        }

      } );
    } );

    compress( modifiedMapFilepaths );
  }

  var minFilepaths = [];
  compress( fs.readListFile( options.listFile ) );
};
