const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const MessageSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  username: {
    type: String
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'rooms'
  },
  content: {
    type: String
  },
  time: {
    type: Date,
    default: Date.now()
  },
});

module.exports = Message = mongoose.model('messages', MessageSchema);