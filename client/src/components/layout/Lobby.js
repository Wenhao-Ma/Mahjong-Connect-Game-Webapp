import React, {Component} from 'react';
import Navbar2 from './Navbar2';
import Rooms from './Rooms';
import Profile from './Profile';
import CreateRoom from './CreateRoom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {Button} from "react-bootstrap";
import Modal from 'react-modal';


class Lobby extends Component {
  constructor(){
    super();
    this.state = {
      showModal_init: true,
      showModal: false
    };

    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal(){
    this.setState({ showModal: true});
  }

  handleCloseModal(){
    this.setState({ showModal: false, showModal_init: false});
  }


  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/login');
    }
  }

  render() {
    const modalstyle ={
      left:"0px",
      right:"0px",
      top:"0px",
      bottom:"0px"
    };
    return (
      <div>
        <Navbar2 />
        <div className="grid-lobby mt-5">
          <div className="lobby">
            <h1 className="lobby-header">LOBBY</h1>
            <Rooms/>
          </div>

          <div>
            <Profile/>
            <CreateRoom/>
          </div>
        </div>
        <img
          src={require("../../img/266-question.png")}
          onClick={this.handleOpenModal}
          className="question"
          alt="question"
        />
        <Modal
          isOpen={this.state.showModal}
          contentLabel="Minimal Modal Example"
          style={modalstyle}
          ariaHideApp={false}
        >
          <div className="bgstyle">
            </div>
          <Button className="btn btn-primary" onClick={this.handleCloseModal}>Understand</Button>
        </Modal>
      </div>
    );
  }
}

Lobby.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});

export default connect(mapStateToProps)(Lobby);
