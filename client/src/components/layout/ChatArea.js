import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Messages from './Messages';
import ChatInput from './ChatInput';
import io from "socket.io-client";

let socket;

class ChatArea extends Component {
  constructor(props) {
    super(props);
    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));

    this.state = {
      messages: [],
      roomId: this.props.roomId
    };
  }

  componentDidMount() {
    const roomId = this.props.roomId;

    for (let i = 0; i < 4; i++) {
      socket.on('enter-room' + roomId + "-" + i, (data) => {
        const uid = data.players[i].user;
        const username = data.players[i].username;
        this.updateSysMsg(uid, username, "enter");
      });

      socket.on('leave-room' + roomId + "-" + i, (data) => {
        const uid = data.players[i].user;
        const username = data.players[i].username;
        this.updateSysMsg(uid, username, "leave");
      });
    }

    socket.on('message'+ roomId, (data) => {
      const uid = data.user;
      const username = data.username;
      const content = data.content;
      this.updateMsg(uid, username, content, data);
    });
  }

  updateSysMsg(uid, username, action, message) {
    let messages = this.state.messages;
    const newMsg = {
      type: 'system',
      username: username,
      uid: uid,
      content: action,
      message: message
    };
    messages = messages.concat(newMsg);
    this.setState({
      messages: messages
    });
  }

  updateMsg(uid, username, content) {
    let messages = this.state.messages;
    const newMsg = {
      type: 'chat',
      username: username,
      uid: uid,
      content: content,
    };
    messages = messages.concat(newMsg);
    this.setState({
      messages: messages
    });
  }


  componentWillUnmount() {
    socket.disconnect();
  }

  render() {
    return (
      <div ref="chat">
        <Messages messages={this.state.messages}/>
        <ChatInput roomId={this.state.roomId}/>
      </div>
    )
  }
}

ChatArea.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ChatArea)