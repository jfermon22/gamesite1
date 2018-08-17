var express = require( 'express' );
var router = express.Router();

router.get( '/', function( req, res ) {
  res.status( 200 )
    .json( {
      message: 'Connected!'
    } );
} );

router.get( '/v1', function( req, res ) {
  res.status( 200 )
    .json( {
      message: 'welcome to api: ver 1'
    } );
} );

export default router;
