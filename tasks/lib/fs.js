var fs = require( 'fs' );
var util = require( './util' );
var iconvLite = require( 'iconv-lite' );

var _fs = {

  readListFile: function ( listFile ) {

    var filepaths = _fs.readFile( listFile, { encoding : 'utf-8' } ).split( '\n' )
                      .filter( function ( filepath ) {
                        return filepath && filepath.trim();
                      } ).map( function ( filepath ) {
                        return filepath.trim();
                      } );

    return util.unique( filepaths );
  },

  readFileString: function ( filepath ) {
    var buffer = _fs.readFile( filepath );

    var content = iconvLite.decode( buffer, 'utf-8' );

    if ( content.indexOf( '�' ) != -1 ) {
      content = iconvLite.decode( buffer, 'gbk' );
    }

    return content;
  },

  readFile: function ( filename, opts ) {
    return fs.readFileSync( filename, opts );
  },
  writeFile: function ( filename, data, opts ) {
    return fs.writeFileSync( filename, data, opts );
  },
  appendFile: function ( filename, data, options ) {
    return fs.appendFileSync(filename, data, options);
  },
  readJSON: function ( filepath, opts ) {
    var src = fs.readFileSync( filepath, opts );
    return JSON.parse( src );
  },
  unlink: function ( path ) {
    return fs.unlinkSync( path );
  },
  isDirectory: function ( path ) {
    return fs.statSync( path ).isDirectory();
  },
  readdir: function ( path ) {
    return fs.readdirSync( path );
  },
  open: function ( path, flag, mode ) {
    return fs.openSync( path, flag, mode );
  },
  close: function ( fd ) {
    return fs.closeSync( fd );
  }
};

module.exports = _fs;
