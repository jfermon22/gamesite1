import mongoose from 'mongoose';
const Schema = mongoose.Schema;

var partySchema = new Schema({
  partyId: 'String',
  game: {
    type: 'String',
    required: true
  },
  teams: [String],
  users: [{
    name: String,
    team: Number,
    points: Number
  }],
  dateAdded: {
    type: 'Date',
    default: Date.now,
    required: true
  },
});

// return the index of the user, else -1
partySchema.methods.getUserIndex = function(username) {
  return this.users.findIndex(users => users.name == username);
};

//add a user to model,
partySchema.methods.addUser = function(username) {
  //verify user already added
  if (this.getUserIndex(username) != -1) return false;

  var newUser = {
    name: username,
    team: -1,
    points: 0
  };

  return this.users.push(newUser);
};

//Update the team of the user
partySchema.methods.updateUserTeam = function(username, team) {
  if (team >= this.teams.length || team < 0 || isNaN(team)) return false;

  var idx = this.getUserIndex(username);

  if (idx == -1) return false;

  this.users[idx].team = team;

  return true;
};

partySchema.methods.addUserScore = function(username, score) {
  if (score < 0 || isNaN(score)) return false;

  var idx = this.getUserIndex(username);

  if (idx == -1) return false;

  this.users[idx].score += score;
};

export default mongoose.model('Party', partySchema);
