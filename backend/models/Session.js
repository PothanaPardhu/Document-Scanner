const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timeToStart: {
    type: Number, // Time taken to start a task in seconds
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  simplificationUsageCount: {
    type: Number,
    default: 0
  },
  timeActive: {
    type: Number, // Total time active in the session in seconds
    default: 0
  },
  inactivityTime: {
    type: Number, // Total inactivity time in seconds
    default: 0
  },
  sessionDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Session', SessionSchema);
