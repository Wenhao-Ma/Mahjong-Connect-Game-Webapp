import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createRoom } from '../../actions/roomActions';
import { withRouter } from 'react-router-dom';

const Mode2Num = {
  "Cooperative": 0,
  "Racing": 1
};
const Level2Num = {
  "Easy": 0,
  "Medium": 1,
  "Hard": 2
};

class CreateRoom extends Component {

  constructor() {
    super();
    this.state = {
      name: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();
    const numSelect = document.getElementById("num-player");
    const size = parseInt(numSelect[numSelect.selectedIndex].value);
    const modeSelect = document.getElementById("game-mode");
    const mode = parseInt(Mode2Num[modeSelect[modeSelect.selectedIndex].value]);
    const levelSelect = document.getElementById("game-level");
    const level = parseInt(Level2Num[levelSelect[levelSelect.selectedIndex].value]);
    const room = {
      name: this.state.name,
      size: size,
      mode: mode,
      level: level
    };
    this.props.createRoom(room, this.props.history);
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <form className="create-game-form" onSubmit={this.onSubmit}>
        <div className="container text-center">
          <h4><b>CREATE NEW GAME</b></h4>
          <div className="form-group">
            <input
              className="form-control mr-sm-2"
              type="text"
              placeholder="Game name"
              name="name"
              onChange={this.onChange}
            />
          </div>
          <div className="form-row">
            <div className="form-group col-md-3">
              <label>Player</label>
              <select className="form-control" id="num-player">
                <option>1</option>
                <option>2</option>
                <option>3</option>
                <option>4</option>
              </select>
            </div>
            <div className="form-group col-md-5">
              <label>Mode</label>
              <select className="form-control" id="game-mode">
                <option>Cooperative</option>
                <option>Racing</option>
              </select>
            </div>
            <div className="form-group col-md-4">
              <label>Level</label>
              <select className="form-control" id="game-level">
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <button className="btn btn-info" type="submit">Create</button>
          </div>
        </div>
      </form>
    );
  }
}

CreateRoom.propTypes = {
  createRoom: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { createRoom })(withRouter(CreateRoom));

