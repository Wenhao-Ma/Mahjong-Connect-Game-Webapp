import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class Messages extends Component {
  componentDidUpdate() {
    const messageList = document.getElementsByClassName("messages")[0];
    messageList.scrollTo(0, messageList.scrollHeight);
  }

  render() {
    const myId = this.props.auth.user.id;
    const oneMessage = this.props.messages.map((message, index) => {
      return (
        <Message
          key={index}
          msgType={message.type}
          msgUser={message.username}
          content={message.content}
          isMe={(myId === message.uid)}
        />
      )
    });
    return (<div className="messages" ref="messages">{oneMessage}</div>)
  }
}

class Message extends Component {
  render() {
    if (this.props.msgType === 'system') {
      return (
        <div className="one-message system-message">
          {this.props.msgUser} {(this.props.content === 'enter') ? 'enters the room' : 'leaves the room'}
        </div>
      )
    } else {
      return (
        <div className={(this.props.isMe) ? 'me one-message' : 'other one-message'}>
          {this.props.msgUser} <div className="message-content">{this.props.content}</div>
        </div>
      )
    }
  }
}


Messages.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(Messages)