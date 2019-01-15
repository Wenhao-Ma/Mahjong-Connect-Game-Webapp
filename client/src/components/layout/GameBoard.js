import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import Clock from "./Clock";
import io from "socket.io-client";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {gameFinish, updateRoom, getShuffle} from "../../actions/roomActions";

let socket;
let number;
let color = ["#FF3333", "#00CC00", "#FFCC00", "#0033FF"];
let colorToUser = {
  "rgb(255, 51, 51)": 0,
  "rgb(0, 204, 0)": 1,
  "rgb(255, 204, 0)": 2,
  "rgb(0, 51, 255)": 3
};
let curUser = [];
let start = false;

class GameBoard extends Component {
  constructor(props) {
    super(props);

    socket = io.connect(document.location.href.replace(/.*?:\/\/(.*?):.*/, "http://$1:9999"));

    this.state = {
      X: 0,
      Y: 0,
      types: 0,
      table: null,
      arr: null,
      p1: null,
      p2: null,
      e1: null,
      e2: null,
      img1: null,
      img2: null,
      id: null,
      left: null,
      score: 0,
      finished: false
    };

    this.shuffle = this.shuffle.bind(this);
    this.onClick = this.onClick.bind(this);
  }

  componentDidMount() {
    const roomId = this.props.roomId;
    const userId = this.props.auth.user.id;

    if (this.props.mode === 0) {
      socket.on("start" + roomId, data => {
        var soundUrl = require("../../sounds/game_start.mp3");
        var audio = new Audio(soundUrl);
        audio.play();
        this.handleGameStart(data, roomId, userId);
      });
    }
    if (this.props.mode === 1) {
      socket.on("start" + roomId + "-" + userId, data => {
        var soundUrl = require("../../sounds/game_start.mp3");
        var audio = new Audio(soundUrl);
        audio.play();
        this.handleGameStart(data, roomId, userId);
      });
    }

    socket.on("finish" + roomId, data => {
      var soundUrl = require("../../sounds/game_end.mp3");
      var audio = new Audio(soundUrl);
      audio.play();
      start = false;
      const players = this.props.room.players;
      const tableOfRank = this.generateTableOfRank(players);
      this.props.gameFinish(data, userId, this.state.finished);
      this.setState({
        X: 0,
        Y: 0,
        types: 0,
        table: tableOfRank,
        arr: null,
        p1: null,
        p2: null,
        e1: null,
        e2: null,
        img1: null,
        img2: null,
        id: null,
        left: null,
        finished: true
      });
    });
  }

  getImg(players) {
    let rank = 1;
    return players.map((player, i) => {
      if (player && !player.isEmpty) {
        return (
          <tr key={i} className="rankingTable">
            <td className="rankingTable">

              <img
                src={
                  document.location.href.replace(
                    /.*?:\/\/(.*?):.*/,
                    "http://$1:9999"
                  ) +
                  "/users/get-avatar/" +
                  players[i].user
                }
                alt="rank"
                className="rankingProfile"
              />
              &nbsp;&nbsp;
            </td>
            <td className="rankingTable">
              <p className="rankingFont">&nbsp;&nbsp; Rank {rank++}</p>
            </td>
            <td className="rankingTable">
              <p className="rankingFont">&nbsp;&nbsp; {players[i].username}</p>
            </td>
            <td className="rankingTable">
              <p className="rankingFont">&nbsp;&nbsp; Score:{players[i].score}</p>
            </td>
          </tr>
        );
      }
      return null;
    });
  }

  generateTableOfRank(players) {
    // generate ranking of players after game finishes
    players.sort(function (playerA, playerB) {
      let scoreA = playerA.score;
      let scoreB = playerB.score;
      if (scoreA > scoreB) return -1;
      if (scoreA < scoreB) return 1;
      return 0;
    });

    return this.getImg(players);
  }

  handleGameStart(data, roomId, userId) {
    start = true;

    const players = this.props.room.players;

    players.forEach((player, index) => {
      if (player && !player.isEmpty) {
        curUser[index] = player.user;
        if (player.user === userId) number = index;
      }
    });

    const arr = data.blocks;
    const X = data.col;
    const Y = data.row;
    const table = this.generateTable(arr, X, Y);
    this.setState({
      X: X,
      Y: Y,
      types: data.types,
      arr: arr,
      table: table,
      id: data._id,
      left: data.left,
      score: 0
    });

    socket.on("clickItem" + data._id, data => {
      if (this.props.mode === 0) {
        this.clickBlock(data);
      }
      if (this.props.mode === 1) {
        if (number === data.pos[0].user) {
          this.clickBlock(data);
        }
      }
    });

    socket.on("crossItem" + data._id, data => {
      var soundUrl = require("../../sounds/Gum_Bubble_Pop.mp3");
      var audio = new Audio(soundUrl);
      audio.play();
      if (this.props.mode === 0) {
        this.deleteBlock(data);
      }
      if (this.props.mode === 1) {
        if (userId === data.user_id) {
          this.deleteBlock(data);
        }
      }
    });

    socket.on("shuffle" + data._id, data => {
      var soundUrl = require("../../sounds/shuffle.mp3");
      var audio = new Audio(soundUrl);
      audio.play();
      const X = data[0].length;
      const Y = data.length;
      const newTable = this.generateTable(data, X, Y);
      this.clearBorder(data);
      this.setState({
        arr: data,
        table: newTable,
        p1: null,
        p2: null,
        e1: null,
        e2: null,
        img1: null,
        img2: null
      });
    });

    socket.on("update-score" + roomId + "-" + number, data => {
      this.props.updateRoom(data);
      const newScore = data.players[number].score;
      this.setState({score: newScore});
    });
  }

  clickBlock(data) {
    data.pos.forEach(p => {
      const div = document.getElementById(p.y + "," + p.x);
      if (div && p.display) {
        div.style.borderStyle = "solid";
        div.style.borderColor = color[p.user];
      } else if (div) {
        div.style.borderStyle = "none";
        div.style.borderColor = "#fff";
      }
    });
  }

  deleteBlock(data) {
    let left = this.state.left;
    const arr = this.state.arr;
    data.pos.forEach(p => {
      arr[p.y][p.x] = 0;
      const div = document.getElementById(p.y + "," + p.x);
      if (div) {
        left--;
        div.parentElement.innerHTML = "";
      }
    });
    this.setState({
      arr: arr,
      left: left
    });
    if (left === 0) socket.emit("finish", this.props.roomId);
  }

  shuffle() {
    const board_id = this.state.id;
    socket.emit("shuffle", board_id);
  }

  clearBorder(arr) {
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr[0].length; j++) {
        if (arr[i][j] !== 0) {
          const div = document.getElementById(i + "," + j);
          if (div) {
            div.style.borderStyle = "none";
            div.style.borderColor = "#fff";
          }
        }
      }
    }
  }

  componentWillUnmount() {
    socket.disconnect();
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
                  <td className="ele" key={j}>
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
    if (val === 0) return <div></div>;

    const gameboardPhoto = {
      width: "42px",
      height: "42px",
      backgroundSize: "100%",
      backgroundImage: "url(" + require("../../img/" + val + ".png") + ")"
    };
    return (
      <div
        id={i + "," + j}
        style={gameboardPhoto}
        onClick={this.onClick}
        className="ele-div"
      >
        {val}
      </div>
    );
  }

  getPath(p1, p2) {
    if (p1.x > p2.x) {
      let t = p1;
      p1 = p2;
      p2 = t;
    } else if (p1.x === p2.x) {
      if (p1.y > p2.y) {
        let t = p1;
        p1 = p2;
        p2 = t;
      }
    }
    // 1st condition
    if (
      (this.onlineY(p1, p2) || this.onlineX(p1, p2)) &&
      this.hasLine(p1, p2)
    ) {
      // status = 'type 1';
      return [p1, p2];
    }
    // 2nd condition
    if (
      !this.isEmpty({x: p1.x, y: p1.y + 1}) &&
      !this.isEmpty({x: p1.x, y: p1.y - 1}) &&
      !this.isEmpty({x: p1.x - 1, y: p1.y}) &&
      !this.isEmpty({x: p1.x + 1, y: p1.y})
    ) {
      // status = 'type 2';
      return null;
    }
    if (
      !this.isEmpty({x: p2.x, y: p2.y + 1}) &&
      !this.isEmpty({x: p2.x, y: p2.y - 1}) &&
      !this.isEmpty({x: p2.x - 1, y: p2.y}) &&
      !this.isEmpty({x: p2.x + 1, y: p2.y})
    ) {
      // status = 'type 2';
      return null;
    }
    // 3rd condition
    let pt0, pt1, pt2, pt3;
    if (this.onlineX(p1, p2)) {
      for (let i = 0; i < this.state.Y; i++) {
        if (i === p1.y) {
          continue;
        }
        pt0 = p1;
        pt1 = {x: p1.x, y: i};
        pt2 = {x: p2.x, y: i};
        pt3 = p2;

        if (!this.isEmpty(pt1) || !this.isEmpty(pt2)) {
          continue;
        }
        if (
          this.hasLine(pt0, pt1) &&
          this.hasLine(pt1, pt2) &&
          this.hasLine(pt2, pt3)
        ) {
          return [pt0, pt1, pt2, pt3];
        }
      }
    }

    if (this.onlineY(p1, p2)) {
      for (let j = 0; j < this.state.X; j++) {
        if (j === p1.x) {
          continue;
        }
        pt0 = p1;
        pt1 = {x: j, y: p1.y};
        pt2 = {x: j, y: p2.y};
        pt3 = p2;

        if (!this.isEmpty(pt1) || !this.isEmpty(pt2)) {
          continue;
        }
        if (
          this.hasLine(pt0, pt1) &&
          this.hasLine(pt1, pt2) &&
          this.hasLine(pt2, pt3)
        ) {
          return [pt0, pt1, pt2, pt3];
        }
      }
    }
    // 4th condition
    for (let k = 0; k < this.state.Y; k++) {
      pt0 = p1;
      pt1 = {x: p1.x, y: k};
      pt2 = {x: p2.x, y: k};
      pt3 = p2;

      if (this.equal(pt0, pt1)) {

        if (!this.isEmpty(pt2)) {
          continue;
        }
        if (this.hasLine(pt1, pt2) && this.hasLine(pt2, pt3)) {
          return [pt1, pt2, pt3];
        } else {
          continue;
        }
      }

      else if (this.equal(pt2, pt3)) {

        if (!this.isEmpty(pt1)) {
          continue;
        }
        if (this.hasLine(pt0, pt1) && this.hasLine(pt1, pt2)) {
          return [pt0, pt1, pt2];
        } else {
          continue;
        }
      }

      if (!this.isEmpty(pt1) || !this.isEmpty(pt2)) {
        continue;
      }
      if (
        this.hasLine(pt0, pt1) &&
        this.hasLine(pt1, pt2) &&
        this.hasLine(pt2, pt3)
      ) {
        return [pt0, pt1, pt2, pt3];
      }
    }

    for (let k = 0; k < this.state.X; k++) {
      pt0 = p1;
      pt1 = {x: k, y: p1.y};
      pt2 = {x: k, y: p2.y};
      pt3 = p2;
      if (this.equal(pt0, pt1)) {
        if (!this.isEmpty(pt2)) {
          continue;
        }
        if (this.hasLine(pt1, pt2) && this.hasLine(pt2, pt3)) {
          return [pt1, pt2, pt3];
        }
      }
      if (this.equal(pt2, pt3)) {
        if (!this.isEmpty(pt1)) {
          continue;
        }
        if (this.hasLine(pt0, pt1) && this.hasLine(pt1, pt2)) {
          return [pt0, pt1, pt2];
        }
      }
      if (!this.isEmpty(pt1) || !this.isEmpty(pt2)) {
        continue;
      }

      if (
        this.hasLine(pt0, pt1) &&
        this.hasLine(pt1, pt2) &&
        this.hasLine(pt2, pt3)
      ) {
        return [pt0, pt1, pt2, pt3];
      }
    }
    //status='type4';
    return null;
  }

  equal(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
  }

  onlineX(p1, p2) {
    return p1.y === p2.y;
  }

  onlineY(p1, p2) {
    return p1.x === p2.x;
  }

  isEmpty(p) {
    return this.state.arr[p.y][p.x] === 0;
  }

  hasLine(p1, p2) {
    if (p1.x === p2.x && p1.y === p2.y) {
      return true;
    }
    if (this.onlineY(p1, p2)) {
      let i = p1.y > p2.y ? p2.y : p1.y;
      i = i + 1;
      let max = p1.y > p2.y ? p1.y : p2.y;
      for (; i < max; i++) {
        let p = {x: p1.x, y: i};
        if (!this.isEmpty(p)) {
          break;
        }
      }
      return i === max;
    } else if (this.onlineX(p1, p2)) {
      let j = p1.x > p2.x ? p2.x : p1.x;
      j = j + 1;
      let max = p1.x > p2.x ? p1.x : p2.x;
      for (; j < max; j++) {
        let p = {x: j, y: p1.y};
        if (!this.isEmpty(p)) {
          break;
        }
      }
      return j === max;
    }
  }

  onClick(e) {
    if (e.target.tagName !== "DIV") return;
    e = e.target;
    const borderColor = e.style.borderColor;
    if (borderColor && borderColor !== "rgb(255, 255, 255)") {
      const preUserIndex = colorToUser[borderColor];
      const preUser = curUser[colorToUser[borderColor]];
      const players = this.props.room.players;
      if (
        !players[preUserIndex].isEmpty &&
        players[preUserIndex].user === preUser
      )
        return;
    }

    var {arr, img1, img2, p1, p2, e1, e2} = this.state;
    if (!img1) img1 = e;
    else img2 = e;

    e = e.parentNode;
    if (e.innerHTML === "") {
      p1 = p2 = e1 = e2 = null;
    }
    let r = e.parentNode.rowIndex + 1;
    let c = e.cellIndex + 1;
    if (p1 == null) {
      p1 = {x: c, y: r};
      e1 = e;

      const data = {
        id: this.state.id,
        pos: [
          {
            x: p1.x,
            y: p1.y,
            display: true,
            user: number
          }
        ]
      };

      socket.emit("click", data);

      this.setState({
        arr: arr,
        p1: p1,
        p2: p2,
        e1: e1,
        e2: e2,
        img1: img1,
        img2: img2
      });
    } else {
      p2 = {x: c, y: r};
      e2 = e;

      const data = {
        id: this.state.id,
        pos: [
          {
            x: p2.x,
            y: p2.y,
            display: true,
            user: number
          }
        ]
      };

      socket.emit("click", data);

      if (
        !this.equal(p1, p2) &&
        e.firstElementChild.innerHTML === e1.firstElementChild.innerHTML
      ) {
        const path = this.getPath(p1, p2);
        if (path != null) {
          arr[p1.y][p1.x] = arr[p2.y][p2.x] = 0;

          const out = {
            id: this.state.id,
            user_id: this.props.auth.user.id,
            pos: [
              {
                x: p2.x,
                y: p2.y,
                user: number
              },
              {
                x: p1.x,
                y: p1.y,
                user: number
              }
            ]
          };
          socket.emit("cross-out", out);

          const data = {
            id: this.state.id,
            pos: [
              {
                x: p2.x,
                y: p2.y,
                display: false,
                user: number
              },
              {
                x: p1.x,
                y: p1.y,
                display: false,
                user: number
              }
            ]
          };
          socket.emit("click", data);

          p1 = p2 = e1 = e2 = img1 = img2 = null;

          this.setState({
            arr: arr,
            p1: p1,
            p2: p2,
            e1: e1,
            e2: e2,
            img1: img1,
            img2: img2
          });
        } else {
          const data = {
            id: this.state.id,
            pos: [
              {
                x: p2.x,
                y: p2.y,
                display: false,
                user: number
              },
              {
                x: p1.x,
                y: p1.y,
                display: false,
                user: number
              }
            ]
          };

          socket.emit("click", data);

          p1 = p2 = e1 = e2 = img1 = img2 = null;

          this.setState({
            arr: arr,
            p1: p1,
            p2: p2,
            e1: e1,
            e2: e2,
            img1: img1,
            img2: img2
          });
        }
      } else {
        const data = {
          id: this.state.id,
          pos: [
            {
              x: p2.x,
              y: p2.y,
              display: true,
              user: number
            },
            {
              x: p1.x,
              y: p1.y,
              display: false,
              user: number
            }
          ]
        };
        socket.emit("click", data);

        img1 = img2;
        p1 = p2;
        e1 = e2;

        this.setState({
          arr: arr,
          p1: p1,
          p2: p2,
          e1: e1,
          e2: e2,
          img1: img1,
          img2: img2
        });
      }
    }
  }

  render() {
    return (
      <div>
        <div>
          <button
            className="btn btn-primary shuffle"
            onClick={this.shuffle}
            disabled={!start}
            hidden={!start}
          >
            Shuffle
          </button>
        </div>
        <div className="left-and-score">
          <b>Left:&nbsp;</b> {this.state.left}
          <br/>
          <b>Score:&nbsp;</b>
          {this.state.score}
          <Clock roomId={this.props.roomId} mode={this.props.mode}/>
        </div>
        <table
          className="game-table"
          id="board1"
          cellSpacing="0"
          cellPadding="0"
          border="1"
        >
          <tbody>{this.state.table}</tbody>
        </table>
      </div>
    );
  }
}

GameBoard.propTypes = {
  gameFinish: PropTypes.func.isRequired,
  updateRoom: PropTypes.func.isRequired,
  getShuffle: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  room: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  room: state.room
});

export default connect(
  mapStateToProps,
  {
    gameFinish,
    updateRoom,
    getShuffle
  }
)(withRouter(GameBoard));
