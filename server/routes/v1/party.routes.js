import {
  Router
} from 'express';
import * as PartyController from '../../controllers/party.controller';

const router = new Router();

// Root parties router
router.route( '/' )
  .post( PartyController.addParty );

// party ID router
router.route( '/:partyId' )
  .get( PartyController.getParty )
  .delete( PartyController.deleteParty );
//.put( PartyController.updateParty );

// Users router
router.route( '/:partyId/users/' )
  .post( PartyController.addUser );


// Teams router
router.route( '/:partyId/teams/' )
  .post( PartyController.addTeams )


// Users router
router.route( '/:partyId/users/:userName' )
  .put( PartyController.updateUser );

// Users router
router.route( '/:partyId/data/' )
  .post( PartyController.addData );

export default router;
