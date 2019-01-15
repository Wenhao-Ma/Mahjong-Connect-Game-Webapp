import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import io from "socket.io-client"
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

let socket;
let finish = false;

class Clock extends Component {

  constructor(props) {

    super(props);
    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));
    this.state = {
      timer: 80,
    }
  }

  componentDidMount() {
    const roomId = this.props.roomId;
    const userId = this.props.auth.user.id;

    if (this.props.mode === 0) {
      socket.on("start" + roomId, data => {
        finish = false;
        this.startTimer();
      });
    }
    if (this.props.mode === 1) {
      socket.on("start" + roomId + "-" + userId, data => {
        finish = false;
        this.startTimer();
      });
    }

    socket.on("finish"+roomId, () => {
      finish = true;
      this.setInterval(0);
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.state.timer === 0) {
        this.clear();
        if (!finish) {
          const roomId = this.props.roomId;
          socket.emit("finish", roomId);
        }
        finish = true;
      } else {
        this.setInterval(this.state.timer - 1);
      }

    }, 1000);
    this.setInterval(this.props.value || 80);
  }

  clear() {
    clearInterval(this.timer);
  }

  setInterval(timer) {
    this.setState({timer: timer});
  }

  componentWillUnmount() {
    this.clear();
    socket.disconnect();
  }

  render() {
    return (
      <div><b>Time:</b> {this.state.timer}</div>
    )
  }
}

Clock.propTypes = {
  room: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  room: state.room,
  auth: state.auth
});

export default connect(mapStateToProps)(withRouter(Clock))