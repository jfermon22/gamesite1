import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const partySchema = new Schema({
  partyId: 'String',
  game: {
    type: 'String',
    required: true,
  },
  teams: [String],
  users: [{
    name: String,
    team: Number,
    points: Number,
  }],
  dateAdded: {
    type: 'Date',
    default: Date.now,
    required: true,
  },
});

export default mongoose.model('Party', partySchema);
