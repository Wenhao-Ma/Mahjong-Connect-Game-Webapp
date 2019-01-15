const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  username: {
    type: String,
    required: true
  },
  firstname: {
    type: String,
    // required: true
    default: 'NA'
  },
  lastname: {
    type: String,
    // required: true
    default: 'NA'
  },
  // registered user must be activated
  isActivate: {
    type: Boolean,
    default: false
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: "default.png"
  },
  data: {
    type: Date,
    default: Date.now()
  },
  score: {
    type: Number,
    default: 0
  },
  games: {
    type: Number,
    default: 0
  }
});

module.exports = User = mongoose.model('users', UserSchema);