// io.origins(['http://localhost:3000', 'http://34.207.88.22:3000']);
const gameSocket = require('./gameSocket');
const roomSocket = require('./roomSocket');
const chatSocket = require('./chatSocket');
const server = require('../server');
const io = require('socket.io').listen(server);

const socketInitialize = () => {
  io.on('connection', (socket) => {
    // here you can start emitting events to the client
    socket.on('click', (data) => {
      io.emit('clickItem'+data.id, data);
    });

    socket.on('cross-out', (data) => {
      const board_id = data.id;
      gameSocket.crossout(board_id, data, io);
    });

    socket.on('shuffle', (data) => {
      const board_id = data;
      gameSocket.shuffle(board_id, io);
    });

    socket.on('enter-room', (data) => {
      const room_id = data[0];
      const user_id = data[1];
      roomSocket.enterRoom(room_id, user_id, io);
    });

    socket.on('leave-room', (data) => {
      const room_id = data[0];
      const user_id = data[1];
      roomSocket.leaveRoom(room_id, user_id, io);
    });

    socket.on('get-ready', (data) => {
      const room_id = data[0], user_id = data[1];
      gameSocket.getReady(room_id, user_id, io);
    });

    socket.on('unready', (data) => {
      const room_id = data[0], user_id = data[1];
      gameSocket.unReady(room_id, user_id, io);
    });

    socket.on('finish', (data) => {
      const room_id = data;
      gameSocket.gameFinish(room_id, io);
    });

    socket.on('message', (data) => {
      const room_id = data.roomId;
      const user_id = data.userId;
      const username = data.username;
      const content = data.content;
      chatSocket.sendMessage(room_id, user_id, username, content ,io);
    })
  });
  // console.log('listening on port ', 8888);
};

module.exports = socketInitialize;

