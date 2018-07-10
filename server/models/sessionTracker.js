import mongoose from 'mongoose';
const Schema = mongoose.Schema;

var sessionTrackerSchema = new Schema({
  currentId: { type: Number, required: true },
  dateLastIncremented: { type: 'Date', default: Date.now, required: true },
});

export default mongoose.model('SessionTracker', sessionTrackerSchema);
