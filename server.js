const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const users = require('./routes/api/users');
const lobby = require('./routes/api/lobby');

const app = express();

const gameSocket = require('./socket/gameSocket');
const roomSocket = require('./socket/roomSocket');
const chatSocket = require('./socket/chatSocket');

app.use(function(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  // res.header('Access-Control-Allow-Credentials', true);
  // res.header("Access-Control-Allow-Headers", "Origin, X-Requested-  With, Content-Type, Accept");
  next();
});

app.use(express.static('client/build'));

// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// DB config
const db = require('./config/key').mongoURI;

// Connect to MongoDB
mongoose
    .connect(db, {useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

//Passport middlewire
app.use(passport.initialize());


//passport config
require('./config/passport')(passport);

// Use Routes
app.use('/users', users);
app.use('/lobby', lobby);

const port = process.env.PORT || 9999;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));


const io = require('socket.io').listen(server);

io.set('origins', '*:*');

io.on('connection', (socket) => {
  // here you can start emitting events to the client
  socket.on('click', (data) => {
    io.emit('clickItem' + data.id, data);
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
    chatSocket.sendMessage(room_id, user_id, username, content, io);
  })
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

module.exports = server;

