import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import io from "socket.io-client";

let socket;

class ChatInput extends Component {
  constructor(props) {
    super(props);

    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));

    this.state = {
      message: '',
    }
  }

  handleChange(e) {
    this.setState({message: e.target.value})
  }

  handleClick(e) {
    e.preventDefault();
    this.sendMessage()
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      this.sendMessage()
    }
    return false;
  }

  sendMessage(e) {
    const message = this.state.message;
    if (message) {
      const obj = {
        userId: this.props.auth.user.id,
        username: this.props.auth.user.username,
        roomId: this.props.roomId,
        content : message
      };
      socket.emit('message', obj);
      this.setState({message: ''});
    }
  }

  render() {
    return (
      <div className="input-box">
        <div className="input">
          <input type="text" maxLength="140" value={this.state.message}
                 onKeyPress={this.handleKeyPress.bind(this)} onChange={this.handleChange.bind(this)}/>
        </div>
        <div className="button">
          <button type="button" onClick={this.handleClick.bind(this)}>-></button>
        </div>
      </div>
    )
  }
}

ChatInput.propTypes = {
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = state => ({
  auth: state.auth,
});

export default connect(mapStateToProps)(ChatInput)