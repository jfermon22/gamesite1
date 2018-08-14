import Party from '../models/party';
import errHandler from '../util/errorHandler';

const HttpStatus = require( 'http-status-codes' );

const KEY_LENGTH = 3;
const KEY_DIGITS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const GAMES = [ 'fishbowl' ];

/**
 * creates a query to find a party
 * @param partyId
 * @returns Query
 */
function findOneParty( partyId ) {
  return Party.findOne( {
    partyId,
  } );
}

function verifyGameType( game ) {
  const result = {
    valid: true,
    message: 'Success',
    receivedData: game,
  };

  if ( game == null ) {
    result.valid = false;
    result.message = "received property 'game' is null";
  } else if ( GAMES.indexOf( game ) === -1 ) {
    result.valid = false;
    result.message =
      "received property 'game' is not recognized game";
  }

  return result;
}

function verifyUserName( username ) {
  const result = {
    valid: true,
    message: 'Success',
    receivedData: username,
  };

  if ( !username ) {
    result.valid = false;
    result.message = "received property 'name' is null";
  } else if ( typeof username !== 'string' ) {
    result.valid = false;
    result.message =
      `received property 'username' is invalid type: ${typeof username}`;
  } else if ( username.length <= 0 || username.length >= 10 ) {
    result.valid = false;
    result.message =
      `received property 'username' is invalid length: ${username.length}`;
  }

  return result;
}

function getUser( party, username ) {
  const result = {
    valid: true,
    message: 'Success',
    receivedData: {
      party,
      username
    },
  };

  if ( !username ) {
    result.valid = false;
    result.message = "received property 'name' is null";
  } else if ( !party ) {
    result.valid = false;
    result.message = "received property 'party' is null";
  } else if ( typeof username !== 'string' ) {
    result.valid = false;
    result.message =
      `received property 'username' is invalid type: ${typeof username}`;
  } else {
    for ( var iii = 0; iii < party.users.length; iii++ ) {
      if ( party.users[ iii ].name == username ) {
        result.message = party.users[ iii ];
        return result;
      }
    }

    result.valid = false;
    result.message =
      `received 'username' ${username} not found in party`
  }

  return result;
}

function verifyTeamNames( teams, nTeams ) {

  const result = {
    valid: true,
    message: 'Success',
    receivedData: teams,
  };

  if ( !teams ) {
    result.valid = false;
    result.message = 'team names in body of request is null'
    return result;
  } else if ( teams.length != nTeams ) {

    result.valid = false;
    result.message =
      `inappropriate number of teams defined:\
      ${teams.length}. Expected: ${nTeams}`
    return result;
  }

  for ( var iii = 0; iii < teams.length; iii++ ) {
    if ( teams[ iii ].length <= 0 || teams[ iii ].length >= 15 ) {
      result.valid = false;
      result.message =
        `inappropriate length of team name : ${teams[iii]}.\
            ${teams[iii].length}. Expected: 0-15`
      return result;
    }
  }

  return result;
}

function convertSessionIdtoPartyId( sessionId, keys, idLength ) {
  const idDigits = [];

  // populate the array to default values for length
  const defaultVal = keys.charAt( 0 );
  for ( let iii = 0; iii < idLength; iii++ ) idDigits[ iii ] =
    defaultVal;

  // check that session ID is within limits.
  const nKeys = keys.length;
  if ( sessionId < 0 || sessionId >= Math.pow( nKeys, idLength ) ) {
    // not within valid limits, populate with -1 and return
    while ( idLength-- ) idDigits[ idLength ] = -1;

    return idDigits;
  }

  // compute values and populate digits
  for ( let jjj = 0; jjj < idLength; jjj++ ) {
    idDigits[ jjj ] = keys.charAt( sessionId % nKeys );
    sessionId = Math.floor( sessionId / nKeys );
  }

  return idDigits.join( '' );
}

function responseException( resp, code, message ) {
  this.res = resp;
  this.code = code;
  this.message = message;
}

function updateUserHelper( username, score, team, party ) {
  var result = {
    valid: true,
    message: 'Success',
    receivedData: {
      username,
      score,
      team,
    },
  }

  //check if username is null
  if ( !username ) {
    result.valid = false;
    result.message = `username is null`
    return result;
  }

  //get user to update and check if valid
  result = getUser( party, username );

  if ( !result.valid ) {
    result.message =
      `user: ${username} not found in party: ${party._id}`
    return result;
  }

  //retrieve user from return value
  var user = result.message;

  //get team name index for user if not defined
  if ( team ) {
    if ( team < 0 || team >= party.teams.length ) {
      result.valid = false;
      result.message =
        `teamindex ${team} not valid: Expected: 0-${party.teams.length}`
      return result;
    }

    user.team = team;
  }

  if ( score ) {
    if ( score < 0 || score > Number.MAX_VALUE ) {
      result.valid = false;
      result.message =
        `score ${score} not valid: Expected: 0-${Number.MAX_VALUE}`
      return result;
    }

    user.points = score;
  }

  result.message = user;
  return result;
}
/**
 * Get all parties
 * @param req
 * @param res
 * @returns void
 */
/* export function getParties(req, res) {
  Party.find().sort('-dateAdded').exec((err, parties) => {
    if (err) errHandler(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
    else res.send(parties);
  });
}*/

/**
 * Add a party
 * @param req
 * @param res
 * @returns void
 */
export function addParty( req, res ) {
  const result = verifyGameType( req.body.game );
  if ( !result.valid ) {
    errHandler( res, HttpStatus.FORBIDDEN, result );
    return;
  }

  const newParty = new Party();
  newParty.game = req.body.game;

  const promise = Party.create( newParty );

  promise.then( ( party ) => {
      const nKeys = KEY_DIGITS.length;

      // take the last 7 characters of party._id and normalize to max num allowed
      const hexId = party._id.toString()
        .slice( -8 );
      const rawId = parseInt( hexId, 16 ) % Math.pow( nKeys,
        KEY_LENGTH );

      // convert the decimal Id to a party code
      const code = convertSessionIdtoPartyId( rawId, KEY_DIGITS,
        KEY_LENGTH );

      // update the party reference to contain the code
      party.partyId = code;

      // save the party tp the database
      return party.save();
    } )
    .then(
      // then statement for party save
      updatedParty => res.status( HttpStatus.CREATED )
      .send(
        updatedParty
      )
    )
    .catch( ( reason ) => {
      errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, reason );
    } );
}

/**
 * Get a single party
 * @param req
 * @param res
 * @returns void
 */
export function getParty( req, res ) {
  const reqPartyId = req.params.partyId;

  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        errHandler( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else res.send( party );
    }, error => errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR,
      error ) );
}

/**
 * Update a party
 * @param req
 * @param res
 * @returns void
 */
/*export function updateParty( req, res ) {
  const reqPartyId = req.params.partyId;
  const TEAMS_COUNT = 2;

  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else if ( party.teams.length != 0 ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `party: ${reqPartyId} has already defined teams: ${party.teams}`
        );
      } else if ( !req.body.teamNames ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          'team names in body of request is null' );
      } else if ( req.body.teamNames.length != TEAMS_COUNT ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `inappropriate number of teams defined:\
            ${req.body.teamNames.length}. Expected: ${TEAMS_COUNT}`
        );
      } else if ( req.body.teamNames[ 0 ].length <= 0 || req.body
        .teamNames[
          0 ].length >= 15 ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `inappropriate length of team name : ${req.body.teamNames[0]}.\
            ${req.body.teamNames[0].length}. Expected: 0-15`
        );
      } else if ( req.body.teamNames[ 1 ].length <= 0 || req.body
        .teamNames[
          1 ].length >= 15 ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `inappropriate length of team name : ${req.body.teamNames[1]}.\
            ${req.body.teamNames[1].length}. Expected: 0-15`
        );
      } else {
        // party was found,so update it
        const reqTeamNames = req.body.teamNames;
        return Party.update( {
          _id: party._id
        }, {
          $push: {
            teams: {
              $each: reqTeamNames
            }
          }
        } );
      }
    } )
    .then( ( rawResult ) => {
      if ( !rawResult.nModified ) {
        errHandler( res, HttpStatus.CONFLICT,
          `team names: ${reqTeamNames} not added to party` );
      } else {
        res.status( HttpStatus.OK )
          .send( rawResult );
      }
    } )
    .catch( ( err ) => {
      if ( err instanceof responseException ) {
        errHandler( err.res, err.code, err.message );
      } else {
        errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, err );
      }
    } );
}
*/
/**
 * Delete a party
 * @param req
 * @param res
 * @returns void
 */
export function deleteParty( req, res ) {
  const reqPartyId = req.params.partyId;

  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        errHandler( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else party.remove( () => res.status( HttpStatus.NO_CONTENT )
        .send() );
    }, error => errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR,
      error ) );
}

/**
 * Adds a new user to a party if the user
 * doesn't already exist in the party
 * @param req
 * @param res
 * @returns void
 */
export function addUser( req, res ) {
  const reqPartyId = req.params.partyId;
  const newUserName = req.body.name;

  // validate username
  const result = verifyUserName( newUserName );
  if ( !result.valid ) {
    errHandler( res, HttpStatus.BAD_REQUEST, result );
    return;
  }

  const newUser = {
    name: newUserName,
    team: -1,
    points: 0,
  };

  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else {
        // party was found,so return it
        return Party.update( {
          _id: party._id,
          'users.name': {
            $ne: newUser.name,
          },
        }, {
          $addToSet: {
            users: newUser,
          },
        } );
      }
    } )
    .then( ( rawResult ) => {
      if ( !rawResult.nModified ) {
        errHandler( res, HttpStatus.CONFLICT,
          `name: ${newUser.name} exists in party` );
      } else {
        res.status( HttpStatus.CREATED )
          .send( rawResult );
      }
    } )
    .catch( ( err ) => {
      if ( err instanceof responseException ) {
        errHandler( err.res, err.code, err.message );
      } else {
        errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, err );
      }
    } );
}
/**
 * Update teams in the party
 * @param req
 * @param res
 * @returns void
 */
export function addTeams( req, res ) {
  const reqPartyId = req.params.partyId;
  const TEAMS_COUNT = 2;

  findOneParty( reqPartyId )
    .then( ( party ) => {

      if ( party == null ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      }

      if ( party.teams.length != 0 ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `party: ${reqPartyId} has already defined teams: ${party.teams}`
        );
      } else {
        // party was found, so update it
        var result = verifyTeamNames( req.body.teamNames,
          TEAMS_COUNT );

        if ( !result.valid ) {
          throw new responseException( res, HttpStatus.BAD_REQUEST,
            result
          );
        }

        return Party.update( {
          _id: party._id
        }, {
          $push: {
            teams: {
              $each: req.body.teamNames
            }
          }
        } );
      }
    } )
    .then( ( rawResult ) => {
      if ( !rawResult.nModified ) {
        errHandler( res, HttpStatus.CONFLICT,
          `team names: ${reqTeamNames} not added to party` );
      } else {
        res.status( HttpStatus.OK )
          .send( rawResult );
      }
    } )
    .catch( ( err ) => {
      if ( err instanceof responseException ) {
        errHandler( err.res, err.code, err.message );
      } else {
        errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, err );
      }
    } );
}

/**
 * Update a user in the party
 * @param req
 * @param res
 * @returns void
 */
export function updateUser( req, res ) {
  const reqPartyId = req.params.partyId;
  const reqUserName = req.params.userName;

  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else {

        //call helper to get and updateuser values in model
        var result = updateUserHelper( reqUserName, req.body
          .score, req.body.team, party );

        //check the return to see if error occured
        if ( !result.valid ) {
          throw new responseException( res, HttpStatus.BAD_REQUEST,
            result.message );
        }

        //get the updated user data
        var updatedUser = result.message;

        // update the user
        return Party.update( {
          _id: party._id,
          'users._id': updatedUser._id
        }, {
          $set: {
            "users.$": updatedUser
          }
        } );
      }
    } )
    .then( ( rawResult ) => {
      if ( !rawResult.nModified ) {
        errHandler( res, HttpStatus.CONFLICT,
          `name: ${newUser.name} exists in party` );
      } else {
        res.status( HttpStatus.OK )
          .send( rawResult );
      }
    } )
    .catch( ( err ) => {
      if ( err instanceof responseException ) {
        errHandler( err.res, err.code, err.message );
      } else {
        errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, err );
      }
    } );
}

/**
 * Add data unique to the game
 * @param req
 * @param res
 * @returns void
 */
export function addData( req, res ) {
  findOneParty( reqPartyId )
    .then( ( party ) => {
      if ( party == null ) {
        throw new responseException( res, HttpStatus.BAD_REQUEST,
          `partyId: ${reqPartyId} not found` );
      } else {

        //call helper to get and updateuser values in model
        var result = updateUserHelper( reqUserName, req.body
          .score, req.body.team, party );

        //check the return to see if error occured
        if ( !result.valid ) {
          throw new responseException( res, HttpStatus.BAD_REQUEST,
            result.message );
        }

        //get the updated user data
        var updatedUser = result.message;

        // update the user
        return Party.update( {
          _id: party._id,
          'users._id': updatedUser._id
        }, {
          $set: {
            "users.$": updatedUser
          }
        } );
      }
    } )
    .then( ( rawResult ) => {
      if ( !rawResult.nModified ) {
        errHandler( res, HttpStatus.CONFLICT,
          `name: ${newUser.name} exists in party` );
      } else {
        res.status( HttpStatus.OK )
          .send( rawResult );
      }
    } )
    .catch( ( err ) => {
      if ( err instanceof responseException ) {
        errHandler( err.res, err.code, err.message );
      } else {
        errHandler( res, HttpStatus.INTERNAL_SERVER_ERROR, err );
      }
    } );
}
