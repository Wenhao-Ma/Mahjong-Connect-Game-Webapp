const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const RoomSchema = new Schema({
  name: {
    type: String
  },
  size: {
    type: Number
  },
  players: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      username: {
        type: String
      },
      isReady: {
        type: Boolean,
        default: false
      },
      score: {
        type: Number
      },
      isEmpty: {
        type: Boolean,
        default: false
      }
    }
  ],
  // 0: not full, not started
  // 1: full, not stated
  // 2: started
  status: {
    type: Number
  },
  // 0: cooperative
  // 1: racing
  mode: {
    type: Number
  },
  // 0: easy
  // 1: medium
  // 2: hard
  level: {
    type: Number
  }
});

module.exports = Room = mongoose.model('rooms', RoomSchema);