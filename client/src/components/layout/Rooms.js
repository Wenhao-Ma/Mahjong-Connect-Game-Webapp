import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {enterRoom} from "../../actions/roomActions";
import {withRouter} from 'react-router-dom';
import axios from 'axios'
import io from "socket.io-client";

let socket;
let popId;
const Num2Mode = ["Cooperative", "Racing"];
const Num2Level = ["Easy", "Medium", "Hard"];

class Rooms extends Component {

  constructor() {
    super();
    this.state = {
      rooms: []
    };

    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));

    this.enterRoom = this.enterRoom.bind(this);
    this.populateRooms = this.populateRooms.bind(this);
  }

  enterRoom(e) {
    const roomId = e.target.parentElement.firstElementChild.getAttribute('value');
    const userId = this.props.auth.user.id;
    this.props.enterRoom(roomId, userId, this.props.history, socket);
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/login');
      return;
    }
    this._ismount = true;
    this.populateRooms();
    popId = setInterval(this.populateRooms, 5000);
  }

  componentWillUnmount() {
    this._ismount = false;
    clearInterval(popId);
  }


  populateRooms() {
    axios
      .get('/lobby/')
      .then(res => {
        if (this._ismount)
          this.setState({
            rooms: res.data
          });
      })
      .catch(err => console.log(err));
  }


  getStatus(st) {
    if (st === 0)
      return 'Waiting';
    if (st === 1)
      return 'Full';
    if (st === 2)
      return 'Started';
    return '';
  }

  getButton(st) {
    if (st === 0) {
      return <button onClick={this.enterRoom}>Join</button>;
    } else {
      return <button disabled>Join</button>
    }
  }

  getPlayersNum(room) {
    let count = 0;
    room.players.forEach(player => {
      if (player && !player.isEmpty)
        count++;
    });
    return count;
  }

  render() {
    const rooms = this.state.rooms;

    const roomHTML = rooms.map((room, index) => {
      return (
        <tr key={index}>
          <th className="table-id" scope="row">{index + 1}</th>
          <td className="table-name">{room.name}</td>
          <td className="table-player">{this.getPlayersNum(room)}/{room.size}</td>
          <td className="table-mode">{Num2Mode[room.mode]}</td>
          <td className="table-level">{Num2Level[room.level]}</td>
          <td className="table-status">{this.getStatus(room.status)}</td>
          <td className="table-join"><input type="hidden" value={room._id}/> {this.getButton(room.status)}</td>
        </tr>
      );
    });

    return (
      <table className="table">
        <thead>
        <tr>
          <th className="table-id" scope="col">#</th>
          <th className="table-name" scope="col">GAME NAME</th>
          <th className="table-player" scope="col">PLAYERS</th>
          <th className="table-mode" scope="col">MODE</th>
          <th className="table-level" scope="col">LEVEL</th>
          <th className="table-status" scope="col">STATUS</th>
          <th className="table-join" scope="col">
            <button className="btn" onClick={this.populateRooms}><i className="fas fa-redo-alt"/></button>
          </th>
        </tr>
        </thead>
        <tbody>
        {roomHTML}
        </tbody>
      </table>
    )
  }
}

Rooms.propTypes = {
  enterRoom: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, {enterRoom})(withRouter(Rooms));