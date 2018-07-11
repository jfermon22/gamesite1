import { Router } from 'express';
import * as PartyController from '../../controllers/party.controller';

const router = new Router();

// CREATE party
router.route('/parties').post(PartyController.addParty);

router.route('/parties/:partyId')
  .get(PartyController.getParty)
  .delete(PartyController.deleteParty);
// .put(PartyController.updateParty);

// CREATE a new user in a party
router.route('/parties/:partyId/users/')
  .post(PartyController.addUser);

export default router;
