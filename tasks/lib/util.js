var path = require( 'path' );

var isType = function ( type ) {
  return function ( obj ) {
    return {}.toString.call( obj ) == '[object ' + type + ']';
  }
};

var isObject = isType( 'Object' );
var isString = isType( 'String' );
var isArray = isType( 'Array' );
var isFunction = isType( 'Function' );

var util = {

  isFunction: isFunction,

  isArray: isArray,

  isObject: isObject,

  isString: isString,

  unique : function ( array ) {
    var ret = [];
    for ( var i = 0; i < array.length; i++ ) {
      var item = array[ i ];
      if ( ret.indexOf( item ) === -1 ) {
        ret.push( item );
      }
    }

    return ret;
  },

  isScript : function ( filename ) {
    return path.extname( filename ) == '.js';
  },

  isCss : function ( filename ) {
    return path.extname( filename ) == '.css';
  },

  isImage : function ( filename ) {
    var extName = path.extname( filename ).toLowerCase();
    var imageExtNames = [ 'png', 'ico', 'jpg', 'gif', 'jpeg' ];
    return imageExtNames( extName ) != -1;
  }
};

module.exports = util;
