const User = require("../models/User");
const Room = require("../models/Room");
const Mahjong = require("../models/Mahjong");

const getReady = (room_id, user_id, io) => {
  Room
    .findById(room_id)
    .then(room => {
      // Ignore if game has started
      if (room.status === 2)
        return;

      // get ready
      let ind = 0;
      let start = true;
      room.players.forEach((player, index) => {
        if (!player.isEmpty && player.user.toString() === user_id) {
          player.score = 0;
          player.isReady = true;
          ind = index;
        }
        else if (!player.isEmpty && player.isReady === false)
          start = false;
      });

      // all user are ready => game start
      if (start) {
        room.status = 2;
      }

      room
        .save()
        .then(room => {
          io.emit('get-ready'+room_id+"-"+ind, room);
          if (start) {
            gameStart(room, io);
          }
        });
    })
};


const gameStart = (room, io) => {
  const level = room.level;
  const board = initBoard(level);
  const room_id = room._id;
  const mode = room.mode;
  if (mode === 0) {
    const newMahjong = new Mahjong({
      room: room_id,
      row: board.row,
      col: board.col,
      types: board.types,
      blocks: board.block,
      left: (board.row - 2) * (board.col - 2)
    });
    newMahjong
      .save()
      .then(newMahjong => {
        io.emit('start'+room_id, newMahjong);
      });
  }
  if (mode === 1) {
    room.players.forEach((player) => {
      if (player && !player.isEmpty) {
        const newMahjong = new Mahjong({
          user: player.user,
          room: room_id,
          row: board.row,
          col: board.col,
          types: board.types,
          blocks: board.block,
          left: (board.row - 2) * (board.col - 2)
        });
        newMahjong
          .save()
          .then(newMahjong => {
            io.emit('start'+room_id+"-"+player.user, newMahjong);
          });
      }
    });
  }
};


const unReady = (room_id, user_id, io) => {
  Room
    .findById(room_id)
    .then(room => {
      if (room) {
        // Ignore if game has started
        if (room.status === 2)
          return;

        // un ready
        let ind = 0;
        room.players.forEach((player, index) => {
          if (player.user.toString() === user_id) {
            player.score = 0;
            player.isReady = false;
            ind = index;
          }
        });

        room.save();
        io.emit('unready'+room_id+"-"+ind, room);
      }
    });
};

const crossout = (board_id, data, io) => {
  Mahjong.findById(board_id)
    .then(mahjong => {
      const room_id = mahjong.room;
      const user_id = data.user_id;

      const p1 = {
        x: data.pos[0].x,
        y: data.pos[0].y
      };
      const p2 = {
        x: data.pos[1].x,
        y: data.pos[1].y
      };

      mahjong.blocks[p1.y][p1.x] = 0;
      mahjong.blocks[p2.y][p2.x] = 0;

      mahjong.blocks.set(p1.y, mahjong.blocks[p1.y]);
      mahjong.blocks.set(p2.y, mahjong.blocks[p2.y]);

      mahjong.left -= 2;

      mahjong.save().then(mahjong => {
        io.emit('crossItem' + board_id, data);
      });

      Room.findById(room_id)
        .then(room => {
          const players = room.players;
          let ind = 0;
          players.forEach((player, index) => {
            if (player && !player.isEmpty && player.user.toString() === user_id) {
              player.score += 2;
              ind = index;
            }
          });
          room.save().then(room => io.emit("update-score"+room_id+"-"+ind, room));
        })
    });
};

function initBoard(level) {
  let X, Y;
  let types;
  if (level === 0) {
    X = 12;
    Y = 8;
    types = 13;
  }
  else if (level === 1) {
    X = 14;
    Y = 10;
    types = 14;
  }
  else if (level === 2) {
    X = 16;
    Y = 12;
    types = 15;
  }

  const arr = new Array(Y);
  for (let i = 0; i < Y; i++) {
    arr[i] = new Array(X);
    for (let j = 0; j < X; j++) {
      arr[i][j] = 0;
    }
  }
  const total = (X - 2) * (Y - 2);
  // generate random array tmp
  const tmp = new Array(total);
  for (let i = 0; i < total; i++) {
    tmp[i] = 0;
  }
  for (let i = 0; i < total; i++) {
    if (tmp[i] === 0) {
      const t = Math.floor(Math.random() * types) + 1;
      tmp[i] = t;
      while (true) {
        const c = Math.floor(Math.random() * (total - i)) + i;
        if (tmp[c] === 0) {
          tmp[c] = t;
          break;
        }
      }
    }
  }
  // copy temp to arr
  let c = 0;
  for (let i = 1; i < Y - 1; i++) {
    for (let j = 1; j < X - 1; j++) {
      arr[i][j] = tmp[c++];
    }
  }
  return {
    row: Y,
    col: X,
    types: types,
    block: arr,
    left: (X - 2) * (Y - 2)
  };
}

const shuffle = (board_id, io) => {
  Mahjong.findById(board_id)
    .then(mahjong => {
      let leftVal = findLocation(mahjong.blocks);
      leftVal = shuffleLeftVal(leftVal);
      mahjong.blocks = shuffleBoard(mahjong.blocks, leftVal);
      for (let i = 0; i < mahjong.blocks.length; i++) {
        mahjong.blocks.set(i, mahjong.blocks[i]);
      }
      mahjong.save().then(mahjong => {
        io.emit("shuffle" + board_id, mahjong.blocks);
      });
    })
    .catch(err => console.log(err));
};

function findLocation(arr) {
  let leftVal = [];
  let k = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] !== 0) {
        leftVal[k] = arr[i][j];
        k++;
      }
    }
  }
  return leftVal;
}

function shuffleLeftVal(arr) {
  let length = arr.length;
  let randomIndex = 0;
  let temp = 0;
  while (length) {
    randomIndex = Math.floor(Math.random() * (length--));
    temp = arr[randomIndex];
    arr[randomIndex] = arr[length];
    arr[length] = temp;
  }
  return arr;
}

function shuffleBoard(arr, leftVal) {
  let k = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr[0].length; j++) {
      if (arr[i][j] !== 0) {
        arr[i][j] = leftVal[k];
        k++;
      }
    }
  }
  return arr;
}

const gameFinish = (room_id, io) => {
  Mahjong.find({room: room_id})
    .then(mahjongs => {
      mahjongs.forEach(mahjong => mahjong.remove());
    })
    .catch(err => console.log(err));

  Room.findById(room_id)
    .then(room => {
      if (room) {
        const players = room.players;
        players.forEach((player) => {
          player.isReady = false;
        });
        room.status = players.length === room.size ? 1 : 0;

        room.save().then(room => io.emit('finish' + room_id, room));
      } else {
        io.emit('finish' + room_id, "error");
      }
    })
    .catch(err => console.log(err));
};

module.exports = {
  getReady: getReady,
  unReady: unReady,
  crossout: crossout,
  gameFinish: gameFinish,
  shuffle: shuffle
};