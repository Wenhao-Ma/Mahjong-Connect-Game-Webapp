const User = require("../models/User");
const Room = require("../models/Room");
const Mahjong = require("../models/Mahjong");

const enterRoom = (room_id, user_id, io) => {
  const res = {err:'', room:''};
  Room
    .findById(room_id)
    .then(room => {
      if (room.status === 1) {
        res.err = "Room is full";
        io.emit('enter-room' + user_id, res);
        return;
      }

      if (room.status === 2) {
        res.err = "Game has started";
        io.emit('enter-room' + user_id, res);
        return;
      }
      // check to see if player exists
      if (room.players.filter(
        player => !player.isEmpty && player.user.toString() === user_id
      ).length === 1
      ) {
        res.err = "Player already exists";
        io.emit('enter-room' + user_id, res);
        return;
      }

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
          let index = 0;
          for (let i = 0; i < room.size; i++) {
            if (!room.players[i] || room.players[i].isEmpty) {
              room.players[i] = newPlayer;
              index = i;
              break;
            }
          }

          let size = 0;
          room.players.forEach(player => {
            if (player && !player.isEmpty) size++;
          });
          if (size === room.size) room.status = 1;

          room.save().then(room => {
            res.room = room;
            io.emit('enter-room' + user_id, res);
            io.emit('enter-room' + room_id + "-" + index, room);
          });
        })
        .catch(err => {
          res.err = err;
          io.emit('enter-room' + user_id, res);
        });
    })
    .catch(err => {
      res.err = "Room doesn't exist";
      io.emit('enter-room' + user_id, res);
    });
};


const leaveRoom = (room_id, user_id, io) => {
  Room.findById(room_id)
    .then(room => {
      // check to see if player exists
      if (room.players
        .filter(player => !player.isEmpty && player.user.toString() === user_id)
        .length !== 0) {
        // get index of player in players array
        let leaveIndex = 0;
        room.players.forEach((player, index) => {
          if (!player.isEmpty && player.user.toString() === user_id)
            leaveIndex = index;
        });

        room.players[leaveIndex].isEmpty = true;

        if (room.status === 1)
          room.status = 0;

        let len = 0;
        room.players.forEach((player) => {
          if (player && !player.isEmpty)
            len++;
        });
        if (len === 0) {
          room.status = 0;

          Mahjong.find({room: room_id})
            .then(mahjongs => {
              mahjongs.forEach(mahjong => mahjong.remove());
            })
            .catch(err => console.log(err));
        }

        room.save()
          .then(room => {
            io.emit('leave-room' + room_id + "-" + leaveIndex, room);
          })
          .catch(err => console.log(err));
      }
    })
    .catch(err => console.log(err));
};


module.exports = {
  enterRoom: enterRoom,
  leaveRoom: leaveRoom
};