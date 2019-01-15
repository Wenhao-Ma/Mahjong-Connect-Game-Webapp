const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const MahjongSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  room: {
    type: Schema.Types.ObjectId,
    ref: 'rooms'
  },
  row: {
    type: Number,
    default: 13
  },
  col: {
    type: Number,
    default: 15
  },
  // number of types of blocks
  types: {
    type: Number,
    default: 10
  },
  blocks: [],
  // number of left blocks
  left: {
    type: Number,
    default: 11 * 13
  }
});

module.exports = Mahjong = mongoose.model("mahjongs", MahjongSchema);
