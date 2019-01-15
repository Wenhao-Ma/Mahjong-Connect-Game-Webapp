import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {leaveRoom} from "../../actions/roomActions";
import {updateRoom} from "../../actions/roomActions";
import io from "socket.io-client";

let justFinish = false;
let socket;

class Player extends Component {

  constructor(props) {
    super(props);

    const room = this.props.room;
    const index = this.props.index;
    if (room && room.players[index] && !room.players[index].isEmpty) {
      this.state = {
        username: room.players[index].username,
        score: room.players[index].score,
        isReady: room.players[index].isReady,
        arr: null,
        table: null,
        id: null
      };
    }
    this.state = {
      username: "",
      score: 0,
      isReady: false,
      arr: null,
      table: null,
      id: null
    };

    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999'));
  }

  componentDidMount() {
    const room = this.props.room;
    const roomId = this.props.roomId;
    const index = this.props.index;
    let userId;
    if (room.players[index] && !room.players[index].isEmpty) {
      userId = this.props.room.players[index].user;
      justFinish = false;
    }

    socket.on('enter-room' + roomId + "-" + index, (data) => {
      userId = data.players[index].user;
      if (this.props.mode === 1) {
        socket.on("start" + roomId + "-" + userId, (data) => {
          justFinish = false;
          this.handleGameStart(data, userId);
        })
      }
      justFinish = false;
      this.props.updateRoom(data);
      this.setState({username: data.players[index].username});
    });

    socket.on('leave-room' + roomId + "-" + index, (data) => {
      justFinish = false;
      this.props.updateRoom(data);
      this.setState({
        username: "",
        score: ""
      });
    });

    socket.on('get-ready' + roomId + "-" + index, (data) => {
      justFinish = false;
      this.props.updateRoom(data);
      this.setState({isReady: true});
    });

    socket.on('unready' + roomId + "-" + index, (data) => {
      justFinish = false;
      this.props.updateRoom(data);
      this.setState({isReady: false});
    });

    socket.on("finish" + roomId, () => {
      justFinish = true;
    });

    socket.on("update-score" + roomId + "-" + index, (data) => {
      justFinish = false;
      this.props.updateRoom(data);
      this.setState({score: data.players[index].score});
    });

    if (this.props.mode === 0) {
      socket.on("start" + roomId, (data) => {
        justFinish = false;
        this.handleGameStart(data, userId);
      });
    }
    if (this.props.mode === 1 && userId) {
      socket.on("start" + roomId + "-" + userId, (data) => {
        justFinish = false;
        this.handleGameStart(data, userId);
      })
    }
  }

  componentWillUnmount() {
    socket.disconnect();
  }

  handleGameStart(data, userId) {
    const room = this.props.room;
    const index = this.props.index;
    const player = room.players[index];

    if (!player || player.isEmpty) {
      return;
    }

    const arr = data.blocks;
    const X = data.col;
    const Y = data.row;
    const table = this.generateTable(arr, X, Y);
    this.setState({
      arr: arr,
      table: table,
      id: data._id,
      score: 0
    });

    socket.on("crossItem" + data._id, (data) => {
      if (this.props.mode === 0) {
        this.deleteBlock(data);
      }
      if (this.props.mode === 1) {
        if (userId === data.user_id) {
          this.deleteBlock(data);
        }
      }
    });

    socket.on("shuffle" + data._id, (data) => {
      const X = data[0].length;
      const Y = data.length;
      const newTable = this.generateTable(data, X, Y);
      this.setState({
        arr: data,
        table: newTable,
      });
    });
  }

  deleteBlock(data) {
    const arr = this.state.arr;
    data.pos.forEach((p) => {
      arr[p.y][p.x] = 0;

      const div = document.getElementById(this.props.index + "," + p.y + "," + p.x);
      if (div) {
        div.parentElement.innerHTML = '';
      }
    });
    this.setState({arr: arr});
  }

  generateTable(arr, X, Y) {
    // generate table
    return arr.map((row, i) => {
      if (i > 0 && i < Y - 1)
        return (
          <tr key={i}>
            {row.map((col, j) => {
              if (j > 0 && j < X - 1)
                return (
                  <td className="ele-other" key={j}>
                    {this.getDiv(arr[i][j], i, j)}
                  </td>
                );
              return null;
            })}
          </tr>
        );
      return null;
    });
  }

  getDiv(val, i, j) {
    if (val === 0)
      return <div> </div>;
    const gameboardPhoto = {
      width: "10px",
      height: "10px",
      backgroundSize: "100%",
      backgroundImage: 'url(' + require('../../img/' + val + '.png') + ')'
    };
    return (
      <div
        id={this.props.index + "," + i + "," + j}
        style={gameboardPhoto}
        className="test-ele">
      </div>)
  }


  getUserInfo() {
    const room = this.props.room;
    const index = this.props.index;
    const player = room.players[index];

    if (player && !player.isEmpty) {
      let display;
      if (room.status === 2) {
        display = "score: " + this.state.score;
        return (
          <div className="container">
            <table
              className="game-table"
              id="board1"
              cellSpacing="0"
              cellPadding="0"
              border="1"
            >
              <tbody>
              {this.state.table}
              </tbody>
            </table>
            <i className="player-name">{player.username}</i><br/>
            <b className="player-info">{display}</b>
          </div>
        );
      }
      else {
        let score;
        display = player.isReady ? "Ready" : " ";
        if (justFinish)
          score = "score: " + this.state.score;
        return (
          <div className="container">
            <div className="text-center mb-1">
              <img
                src={document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999') + '/users/get-avatar/' + player.user}
                alt="avatar" className="small-photo"/>
            </div>
            <i className="player-name">{player.username}</i><br/>
            <b className="player-info">{display}</b>
            <b className="player-info">{score}</b>
          </div>
        );
      }
    }
    else {
      return (<div className="container"> </div>);
    }
  }

  render() {
    return (
      this.getUserInfo()
    );
  }
}

Player.propTypes = {
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

export default connect(mapStateToProps, {leaveRoom, updateRoom})(withRouter(Player))