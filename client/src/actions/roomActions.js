import axios from "axios";

export const updateRoom = (room) => dispatch => {
  dispatch(setCurrentRoom(room));
};

export const enterRoom = (roomId, userId, history, socket) => dispatch => {
  socket.on('enter-room'+userId, (data) => {
    if (!data.err) {
      dispatch(setCurrentRoom(data.room));
      history.push('/mg/game/'+roomId);
    } else {
      alert(data.err);
    }
  });
  socket.emit('enter-room', [roomId, userId]);
};

export const leaveRoom = (roomId, userId, history, socket) => dispatch => {
    socket.emit('leave-room', [roomId, userId]);
    dispatch(setCurrentRoom({}));
    history.push('/mg/lobby');
};

export const gameFinish = (data, userId, finished) => dispatch => {
  data["finished"] = finished;
  axios
    .post('/lobby/update-score/' + userId, data);
  dispatch(setCurrentRoom(data));
};

export const createRoom = (roomData, history) => dispatch => {
  axios
    .post('/lobby/create-room', roomData)
    .then(res => {
      const room = res.data;
      const roomId = room._id;
      dispatch(setCurrentRoom(room));
      history.push('/mg/game/'+roomId);
    })
    .catch(err => alert(err.response.data));
};

export const getShuffle = (roomId) => dispatch => {
  axios
    .post('/game/shuffle/' + roomId)
    .then(res => {
      dispatch(shuffleBoard(res.data));
    })
    .catch(err => console.log(err.response));
};

export const shuffleBoard = (board) => ({
  type: "BOARD_SUFFLED",
  board: board
});

export const setCurrentRoom = (room) => ({
  type: "ROOM_ACTION",
  room: room
});