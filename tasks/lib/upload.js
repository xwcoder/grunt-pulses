var fs = require( 'fs' );
var path = require( 'path' );
var Emitter = require( 'events' ).EventEmitter;


var FTPClient = require( 'ftp' );
var util = require( './util' );
var sysUtil = require( 'util' );


var ftpClient = new FTPClient();
var emitter = new Emitter();

function isMatch( fileName, patterns ) {

  if ( !sysUtil.isArray( patterns ) ) {
    excludes = [ patterns ];
  }

  var  isMatch = false;

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

  for ( var i = 0, len = patterns.length; i < len; i++ ) {

    if ( matchOne( fileName, patterns[ i ] ) ) {

      isMatch = true;
      break;
    }
  }
  return isMatch;
}

module.exports = function ( grunt, options, done ) {

  var ftpConfig = grunt.file.readJSON( options.ftp );

  var filepaths = grunt.file.read( options.pListFile ).split( '\n' )
    .filter( function ( filepath ) {
      return filepath && filepath.trim();
    } );

  filepaths = util.unique( filepaths );

  filepaths.sort( function ( f1, f2 ) {

    if ( isMatch( f1, options.mapFiles ) &&
      !isMatch( f2, options.mapFiles ) ) {

        return 1;
      } else {
        return -1;
      }
  } );

  ftpClient.connect( ftpConfig );

  ftpClient.on( 'ready', function () {

    grunt.log.ok( 'ftp连接成功(' + ftpConfig.host + ')... ' );

    if ( ftpConfig.cwd ) {

      ftpClient.cwd( ftpConfig.cwd, function () {

        grunt.log.ok( 'cwd到(' + ftpConfig.cwd + ')... ' );

        upload();

      } );
    } else {
      upload();
    }

  } );

  function upload () {

    var i = 0, len = filepaths.length;
    var filepath = filepaths[ i++ ];

    emitter.on( 'success', function () {

      if ( i < len ) {
        uploadOne( filepaths[ i++ ] );
      } else {
        ftpClient.end();
        grunt.log.ok( '上传完毕, ftp断开连接成功...' );
        done();
      }
    } );

    uploadOne( filepath );
  }

  function uploadOne ( filepath ) {

    var realeseFilepath = path.join( options.dist, filepath );
    var dir = path.dirname( filepath );

    dir = path.join( dir, '/').replace(/\\/g,'/');
    filepath = filepath.replace(/\\/g,'/');

    ftpClient.mkdir( dir, true, function ( err ) {

      if ( err ) {
        grunt.log.error( err );
        ftpClient.end();
        done();
      }

      grunt.log.ok( filepath + '正在上传...' );

      ftpClient.put( fs.createReadStream( realeseFilepath ), filepath, function ( err ) {
        if ( err ) {
          grunt.log.error( err );
          ftpClient.end();
          done();
        }

        grunt.log.ok( filepath + ' 上传成功' );
        emitter.emit( 'success' );
      } );

    } );
  }
}
