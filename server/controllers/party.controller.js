import Party from '../models/party';
import errHandler from '../util/errorhandler';

const HttpStatus = require('http-status-codes');

const KEY_LENGTH = 3;
const KEY_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GAMES = ['fishbowl'];

/**
 * creates a query to find a party
 * @param partyId
 * @returns Query
 */
function findOneParty(partyId) {
  return Party.findOne({
    partyId,
  });
}

function verifyGameType(game) {
  const result = {
    valid: true,
    message: 'Success',
    receivedData: game,
  };

  if (game == null) {
    result.valid = false;
    result.message = "received property 'game' is null";
  } else if (GAMES.indexOf(game) === -1) {
    result.valid = false;
    result.message = "received property 'game' is not recognized game";
  }

  return result;
}

function verifyUserName(username) {
  const result = {
    valid: true,
    message: 'Success',
    receivedData: username,
  };

  if (username == null) {
    result.valid = false;
    result.message = "received property 'name' is null";
  } else if (typeof username !== 'string') {
    result.valid = false;
    result.message = `received property 'username' is invalid type: ${typeof username}`;
  } else if (username.length <= 0 || username.length >= 10) {
    result.valid = false;
    result.message = `received property 'username' is invalid length: ${username.length}`;
  }

  return result;
}

function convertSessionIdtoPartyId(sessionId, keys, idLength) {
  const idDigits = [];

  // populate the array to default values for length
  const defaultVal = keys.charAt(0);
  for (let iii = 0; iii < idLength; iii++) idDigits[iii] = defaultVal;

  // check that session ID is within limits.
  const nKeys = keys.length;
  if (sessionId < 0 || sessionId >= Math.pow(nKeys, idLength)) {
    // not within valid limits, populate with -1 and return
    while (idLength--) idDigits[idLength] = -1;

    return idDigits;
  }

  // compute values and populate digits
  for (let jjj = 0; jjj < idLength; jjj++) {
    idDigits[jjj] = keys.charAt(sessionId % nKeys);
    sessionId = Math.floor(sessionId / nKeys);
  }

  return idDigits.join('');
}

function responseException(resp, code, message) {
  this.res = resp;
  this.code = code;
  this.message = message;
}
/**
 * Get all parties
 * @param req
 * @param res
 * @returns void
 */
export function getParties(req, res) {
  Party.find().sort('-dateAdded').exec((err, parties) => {
    if (err) errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
    else res.send(parties);
  });
}

/**
 * Add a party
 * @param req
 * @param res
 * @returns void
 */
export function addParty(req, res) {
  const result = verifyGameType(req.body.game);
  if (!result.valid) {
    errHandler(res, HttpStatus.FORBIDDEN, result);
    return;
  }

  const newParty = new Party();
  newParty.game = req.body.game;

  const promise = Party.create(newParty);

  promise.then((party) => {
    const nKeys = KEY_DIGITS.length;

    // take the last 7 characters of party._id and normalize to max num allowed
    const hexId = party._id.toString().slice(-8);
    const rawId = parseInt(hexId, 16) % Math.pow(nKeys,
      KEY_LENGTH);

    // convert the decimal Id to a party code
    const code = convertSessionIdtoPartyId(rawId, KEY_DIGITS,
      KEY_LENGTH);

    // update the party reference to contain the code
    party.partyId = code;

    // save the party tp the database
    return party.save();
  }).then(
    // then statement for party save
    updatedParty => res.status(HttpStatus.CREATED).send(
      updatedParty
    )
  ).catch((reason) => {
    errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, reason);
  });
}

/**
 * Get a single party
 * @param req
 * @param res
 * @returns void
 */
export function getParty(req, res) {
  const reqPartyId = req.params.partyId;

  findOneParty(reqPartyId)
    .then((party) => {
      if (party == null) {
        errHandler(res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found`);
      } else res.send(party);
    }, error => errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, error));
}

/**
 * Delete a party
 * @param req
 * @param res
 * @returns void
 */
export function deleteParty(req, res) {
  const reqPartyId = req.params.partyId;

  findOneParty(reqPartyId)
    .then((party) => {
      if (party == null) {
        errHandler(res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found`);
      } else party.remove(() => res.status(HttpStatus.NO_CONTENT).send());
    }, error => errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, error));
}

/**
 * Adds a new user to a party if the user
 * doesn't already exist in the party
 * @param req
 * @param res
 * @returns void
 */
export function addUser(req, res) {
  const reqPartyId = req.params.partyId;
  const newUserName = req.body.name;

  // validate username
  const result = verifyUserName(newUserName);
  if (!result.valid) {
    errHandler(res, HttpStatus.BAD_REQUEST, result);
    return;
  }

  const newUser = {
    name: newUserName,
    team: -1,
    points: 0,
  };

  findOneParty(reqPartyId)
    .then((party) => {
      if (party == null) {
        throw new responseException(res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found`);
      } else {
        // party was found,so return it
        return Party.update({
          _id: party._id,
          'users.name': {
            $ne: newUser.name,
          },
        }, {
          $addToSet: {
            users: newUser,
          },
        });
      }
    })
    .then((rawResult) => {
      if (!rawResult.nModified) {
        errHandler(res, HttpStatus.CONFLICT,
          `name: ${newUser.name} exists in party`);
      } else {
        res.status(HttpStatus.CREATED).send(rawResult);
      }
    })
    .catch((err) => {
      if (err instanceof responseException) {
        errHandler(err.res, err.code, err.message);
      } else {
        errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      }
    });
}
