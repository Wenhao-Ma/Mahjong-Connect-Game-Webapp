import React, {Component} from 'react';
import {connect} from 'react-redux';
import axios from 'axios';
import Navbar2 from '../layout/Navbar2';
import PropTypes from 'prop-types';

let boardId;

class Scoreboard extends Component {

  constructor(props) {
    super(props);
    this.state = {
      users: []
    };

    this.getScoreBoard = this.getScoreBoard.bind(this);
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/login');
      return;
    }
    this.getScoreBoard();
    this._ismount = true;
    boardId = setInterval(this.getScoreBoard, 5000);
  }

  componentWillUnmount() {
    this._ismount = false;
    clearInterval(boardId);
  }

  getScoreBoard() {
    axios
      .get('/lobby/scoreboard')
      .then(res => {
        if (this._ismount) {
          this.setState({
            users: res.data
          });
        }
      })
      .catch(err => console.log(err));
  }

  render() {
    const users = this.state.users;
    const label_style1 = {
      color: "#e6e6ff",
      fontFamily: "Comic Sans MS, Comic Sans, cursive",
      fontWeight: "bold",
      fontSize: "25px"
    };
    const content_style = {
      color: "#ddffcc",
      fontFamily: "Comic Sans MS, Comic Sans, cursive",
      fontWeight: "bold",
      fontSize: "25px"
    };
    const userHTML = users.map((user, index) => {
      return (

        <tr key={index}>
          <th className="table-id" scope="row" style={label_style1}>{index + 1}</th>
          <td className="table-username" style={content_style}><img
            src={document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999') + '/users/get-avatar/' + user._id}
            alt="avatar" className="scoreboard-photo"/> {user.username}</td>
          <td className="table-score" style={content_style}>{user.score}</td>
          <td className="table-game" style={content_style}>{user.games}</td>
        </tr>

      );
    });

    return (
      <div>
        <Navbar2/>
        <div className="container upup container_upupstyle">
          <table className="table">
            <thead>
            <tr>
              <th className="table-id label_style">#</th>
              <th className="table-username label_style">USER NAME</th>
              <th className="table-score label_style">SCORE</th>
              <th className="table-game label_style">GAMES PLAYED</th>
            </tr>
            </thead>
            <tbody>
            {userHTML}
            </tbody>
          </table>
        </div>
      </div>

    )
  }
}

Scoreboard.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Scoreboard);