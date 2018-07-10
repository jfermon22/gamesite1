import {
  Router
} from 'express';
import * as PartyController from '../controllers/party.controller';
const router = new Router();

// CREATE party
router.route('/parties').post(PartyController.addParty);

// READ a party
router.route('/parties/:partyId').get(PartyController.getParty);

// UPDATE a party
//router.route('/parties/:partyId').put(PartyController.updateParty);

// DELETE a party
router.route('/parties/:partyId').delete(PartyController.deleteParty);

// CREATE a new user in a party
router.route('/parties/:partyId/users/')
  .post(PartyController.addUserToParty);

export default router;
