import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateRoom, leaveRoom} from "../../actions/roomActions";
import io from "socket.io-client";

let socket;
let started = false;
let leave = false;

class OtherPlayer extends Component {

  constructor(props) {
    super(props);

    const userId = this.props.auth.user.id;
    const room = this.props.room;

    let index = 0;
    room.players.forEach((player, ind) => {
      if (player && !player.isEmpty && player.user.toString() === userId) {
        index = ind;
      }
    });

    this.state = {
      room: this.props.room,
      index: index
    };

    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));

    leave = false;
    this.leave = this.leave.bind(this);
    this.getReady = this.getReady.bind(this);
    this.handleWindowClose = this.handleWindowClose.bind(this);
  }

  getReady(e) {
    const userId = this.props.auth.user.id;
    const roomId = this.props.roomId;

    const flag = e.target.innerHTML === 'Ready';
    const btn = e.target;
    btn.classList.toggle("btn-success");
    btn.classList.toggle("btn-danger");
    if (btn.innerHTML === 'Ready') {
      btn.innerHTML = 'Unready';
    } else {
      btn.innerHTML = 'Ready';
    }
    if (flag)
      socket.emit('get-ready', [roomId, userId]);
    else
      socket.emit('unready', [roomId, userId]);
  }

  leave() {
    const userId = this.props.auth.user.id;
    const roomId = this.props.roomId;
    started = false;
    leave = true;
    this.props.leaveRoom(roomId, userId, this.props.history, socket);
  }

  componentDidMount() {
    const roomId = this.props.roomId;
    const index = this.state.index;
    leave = false;
    //
    // window.onbeforeunload = (e) => {
    //   // return socket.emit('leave-room', [roomId, userId]);
    //   return "Are you sure you want to leave this page?"
    // };

    window.onbeforeunload = this.handleWindowClose;

    socket.on('get-ready'+roomId+"-"+index, (data) => {
      this.props.updateRoom(data);
    });

    socket.on('unready'+roomId+"-"+index, (data) => {
      this.props.updateRoom(data);
    });

    socket.on("finish" + roomId, () => {
      started = false;
    });

    socket.on("start" + roomId, () => {
      started = true;
    });

  }

  handleWindowClose() {
    const userId = this.props.auth.user.id;
    const roomId = this.props.roomId;
    this.props.leaveRoom(roomId, userId, this.props.history, socket);
    started = false;
  }

  componentWillUnmount() {
    if (!leave)
      this.handleWindowClose();
    leave = true;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.room) {
      this.setState({room: nextProps.room});
    }
    if (nextProps.room.status === 2) {
      if (!started) {
        started = true;
        const btn = document.getElementsByClassName("ready");
        btn[0].classList.add("btn-success");
        btn[0].classList.remove("btn-danger");
        btn[0].innerHTML = 'Ready';
      }
    }
  }

  render() {
    return (
      <div className="grid-game-item top-right">
        <button className="btn btn-info quit mt-2" onClick={this.leave}>Quit</button>
        <br/>
        <button
          className="btn btn-success ready mt-2"
          onClick={this.getReady}
          disabled={this.state.room.status === 2}
        >Ready
        </button>
      </div>
    );
  }

}

OtherPlayer.propTypes = {
  leaveRoom: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  room: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  room: state.room
});

export default withRouter(connect(mapStateToProps, {leaveRoom, updateRoom})(OtherPlayer))