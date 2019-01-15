import React, { Component } from 'react';
import GameBoard from "./GameBoard";
import OtherPlayer from "./OtherPlayer";
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import { connect } from 'react-redux';
import Player from "./Player";
import CharArea from "./ChatArea";

class Game extends Component {

  constructor(props) {
    super(props);

    const userId = this.props.auth.user.id;
    let index = 0;
    const room = this.props.room;

    if (!this.props.room.players) {
      this.props.history.push('/mg/lobby');
      return;
    }

    room.players.forEach((player, ind) => {
      if (player && !player.isEmpty && player.user.toString() === userId) {
        index = ind;
      }
    });

    this.state = {
      room: room._id,
      index: index,
      mode: room.mode
    };
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/login');
    }
  }

  render() {
    if (!this.props.room.players) {
      return null;
    }

    let i = 0;
    const player1 = (i === this.state.index ? i + 1 : i);
    i = player1 + 1;
    const player2 = (i === this.state.index ? i + 1 : i);
    i = player2 + 1;
    const player3 = (i === this.state.index ? i + 1 : i);

    return (
      <div className="grid-game effect">
        <div key={1} className="grid-game-item player1">
          <Player index={player1} roomId={this.state.room} mode={this.state.mode}/>
        </div>,
        <div key={2} className="grid-game-item player2">
          <Player index={player2} roomId={this.state.room} mode={this.state.mode}/>
        </div>,
        <div key={3} className="grid-game-item player3">
          <Player index={player3} roomId={this.state.room} mode={this.state.mode}/>
        </div>
        <OtherPlayer roomId={this.state.room}/>
        <div className="grid-game-item main-player">
          <GameBoard roomId={this.state.room} mode={this.state.mode}/>
        </div>
        <div className="grid-game-item chat-area">
          <CharArea roomId={this.state.room}/>
        </div>
      </div>
    );
  }
}

Game.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  room: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors,
  room: state.room
});

export default connect(mapStateToProps)(withRouter(Game))