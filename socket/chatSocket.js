const Message = require("../models/Message");

const sendMessage = (room_id, user_id, username, content, io) => {
  const newMsg = Message({
    user: user_id,
    username: username,
    room: room_id,
    content: content
  });
  newMsg.save().then(newMsg => {
    io.emit("message" + room_id, newMsg);
  });
};

module.exports = {
  sendMessage: sendMessage
};