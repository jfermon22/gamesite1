import { Router } from 'express';
import * as PartyController from '../../controllers/party.controller';

const router = new Router();

// CREATE party
router.route('/').post(PartyController.addParty);

router.route('/:partyId')
  .get(PartyController.getParty)
  .delete(PartyController.deleteParty);
// .put(PartyController.updateParty);

// CREATE a new user in a party
router.route('/:partyId/users/')
  .post(PartyController.addUser);

export default router;
