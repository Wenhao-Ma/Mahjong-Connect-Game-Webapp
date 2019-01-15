import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Modal from 'react-modal'
import {Button} from 'react-bootstrap'
import { logoutUser } from '../../actions/authActions';

class Navbar2 extends Component {

  constructor () {
    super();
    this.state = {
      showModal: false,
      hover: false
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }
  onMouseEnter(){
    this.setState({hover: true});
  }

  onMouseLeave(){
    this.setState({hover: false});
  }

  onLogoutClick(e) {
    e.preventDefault();
    this.props.logoutUser();
    this.props.history.push('/mg/login');
  }

  render() {
    var customStyles = {
      content:{
        left:'20%',
        right:'auto'
      }
    };
    const authLinks = (
        <ul className="navbar-nav ml-auto">
          <li className="nav-item">
            <a href=" " className="nav-link navbarstyle1" onClick={this.onLogoutClick.bind(this)}>
              Log Out
            </a >
          </li>
        </ul>

    );
    return (
        <nav
            className="navbar navbar-expand-sm navbar-dark bg-dark mb-5 fixed-top"
            style={{display: this.state.hover}}
            onMouseOver={this.onMouseEnter}
            onMouseLeave={this.onMouseLeave}
        >

          <div className="container mt-0">
            <div className="navbar-brand">
            <Link className="nav-link navbarstyle" to="/mg/lobby">
              {' '}
              Mahjong Game
            </Link>
              
            </div>

            <div className="collapse navbar-collapse" id="mobile-nav">
              <ul className="navbar-nav mr-auto">
                <li className="nav-item">
                  <Link className="nav-link navbarstyle1" to="/mg/edit_profile">
                    {' '}
                    Profile
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link navbarstyle1" to="/mg/lobby">
                    {' '}
                    Lobby
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link navbarstyle1" to="/mg/lobby/scoreboard">
                    {' '}
                    ScoreBoard
                  </Link>
                </li>
                <li className="nav-item">
                  <div>
                    <Button className="btn-link guide-hover navbarstyle1" onClick={this.handleOpenModal}>Guide</Button>
                    <Modal
                        isOpen={this.state.showModal}
                        contentLabel="Minimal Modal Example"
                        ariaHideApp={false}
                        style={customStyles}
                    >

                      <div className="container modal-dialog modal-lg containerStyle">

                            <h2>How To Play Mahjong Game</h2>
                            <li>The initial board may look like this:</li>
                            < img alt="ins" src={require("../../img/ins_1.jpeg")} className="instruction_img"/>

                            <li>Cross out two same blocks which can be connected by a line without intersecting with a third block</li>
                            < img alt="ins" src={require("../../img/ins_2.jpeg")} className="instruction_img"/>
                            <li>There are four conditions to crossout:</li>
                            < img alt="ins" src={require("../../img/crossout_conditions.jpeg")} className="instruction_img"/>
                            <li>After crossing out, the scores on the top right will decrease</li>
                            < img alt="ins" src={require("../../img/ins_3.jpeg")} className="instruction_img"/>
                            < img alt="ins" src={require("../../img/ins_4.jpeg")} className="instruction_img"/>
                            <li>Players can use "shuffle" button on the right bottom</li>
                            < img alt="ins" src={require("../../img/ins_5.jpeg")} className="instruction_img1"/>
                            <li>The gameboard has now been shuffled</li>
                            < img alt="ins" src={require("../../img/ins_4.jpeg")} className="instruction_img"/>
                            <li>In commpetitive mode, if one player cross out the board, the game ends</li>


                      </div>
                      <Button className="btn btn-primary" onClick={this.handleCloseModal}>Start Now</Button>
                    </Modal>
                  </div>
                </li>
              </ul>

              {authLinks}
            </div>
          </div>
        </nav>
    );
  }
}

Navbar2.propTypes = {
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default withRouter(connect(mapStateToProps, { logoutUser })(Navbar2));