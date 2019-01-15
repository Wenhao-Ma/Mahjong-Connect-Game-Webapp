const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

const isEmpty = require('../../validation/is-empty');

// load User, Room, Message model
const User = require('../../models/User');
const Room = require('../../models/Room');
const Message = require("../../models/Message");

// @route   GET /lobby/
// @desc    Get all rooms
// @access  Private
router.get(
  '/',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Room.find()
      .then(rooms => {
        res.json(rooms);
      })
      .catch(err => res.status(400).json(err));
  }
);

// @route   GET /lobby/scoreboard
// @desc    Get scoreboard
// @access  Private
router.get(
  '/scoreboard',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    // find top 10 players based on score and played games
    User.find().limit(10).sort({score: -1, games: 1})
      .then(users => {
        res.json(users);
      })
      .catch(err => res.status(400).json("error"));
  }
);

// @route   POST /lobby/update-score/:user_id
// @desc    update score for user when finished
// @access  Private
router.post(
  '/update-score/:user_id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    let finished = req.body.finished;
    const players = req.body.players;
    players.forEach((player) => {
      if (req.params.user_id === player.user && !finished) {
        User.findOne({username: player.username}).then(
          user => {
            user.score += player.score;
            user.games += 1;
            user.save();
          })
      }
    })
  }
)

// @route   GET /lobby/:room_id
// @desc    Get one room based on room_id
// @access  Private
router.get(
  '/room/:room_id',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    Room.findById(req.params.room_id)
      .then(room => {
        res.json(room);
      })
      .catch(err => res.status(400).json("room not exist"));
  }
);


// @route   GET /lobby/profile
// @desc    Get user's profile
// @access  Private
router.get(
  '/profile',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {
    User.findById(req.user.id)
      .then(user => {
        res.json(user);
      })
      .catch(err => res.status(400).json(err));
  }
);


// @route   Post /lobby/create-room
// @desc    Create a game room
// @access  Private
router.post(
  '/create-room',
  passport.authenticate('jwt', {session: false}),
  (req, res) => {

    if (isEmpty(req.body.name))
      return res.status(400).json("name is empty");

    const size = req.body.size;
    const mode = req.body.mode;
    const level = req.body.level;
    if (size < 1 || size > 4)
      return res.status(400).json("size is invalid");
    if (mode < 0 || mode > 1)
      return res.status(400).json("mode is invalid");
    if (level < 0 || level > 2)
      return res.status(400).json("level is invalid");

    const newRoom = Room({
      name: req.body.name,
      size: size,
      mode: mode,
      level: level,
      status: 0,
      players: new Array(req.body.size)
    });

    const user_id = req.user.id;

    User.findById(user_id)
      .then(user => {
        const name = user.username;
        const newPlayer = {
          user: user_id,
          username: name,
          isReady: false,
          score: 0,
          isEmpty: false
        };
        for (let i = 0; i < newRoom.size; i++) {
          if (!newRoom.players[i] || newRoom.players[i].isEmpty) {
            newRoom.players[i] = newPlayer;
            break;
          }
        }

        if (1 === newRoom.size) newRoom.status = 1;

        newRoom.save().then(room => {
          res.json(room);
        });
      })
      .catch(err => res.status(400).json("user error"));
  }
);

const checkRoom = () => {
  Room
    .find({})
    .then(rooms => {
      rooms.forEach(room => {
        let size = 0;
        room.players.forEach(player => {
          if (player && !player.isEmpty) size++;
        });
        if (size === 0) {
          const room_id = room._id;
          Message.find({room: room_id})
            .then(messages => {
              messages.forEach(message => {
                message.remove();
              })
            });
          room.remove();
        }
      })
    });
};

setInterval(checkRoom, 60 * 1000);

module.exports = router;