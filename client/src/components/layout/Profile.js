import React, {Component} from 'react';
import {withRouter} from "react-router-dom";
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import axios from "axios";

class Profile extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: "loading...",
      email: "loading...",
      score: "loading...",
      games: "loading...",
      first_name: "loading...",
      last_name: "loading...",
      show_detail: false
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal() {
    this.setState({show_detail: true});
  }

  handleCloseModal() {
    this.setState({show_detail: false});
  }

  componentDidMount() {
    if (!this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/login');
      return;
    }

    axios
      .get('/lobby/profile')
      .then(res => {
        const username = res.data.username,
          email = res.data.email,
          score = res.data.score,
          games = res.data.games,
          first_name = res.data.firstname,
          last_name = res.data.lastname;

        this.setState({
          username: username,
          email: email,
          score: score,
          games: games,
          first_name: first_name,
          last_name: last_name,
        });

      })
      .catch(err => console.log(err.response));
  }

  render() {
    return (
      <div>
        <div className="container mb-4">
          <div className="profile-card">
            <div className="text-center">
              <img
                src={document.location.href.replace(/.*?:\/\/(.*?):.*/, 'http://$1:9999') + '/users/get-avatar/' + this.props.auth.user.id}
                alt="avatar" className="user-photo"/>
            </div>
            <p><i><b>Username: </b></i> {this.state.username}
              <i>({this.state.first_name + " " + this.state.last_name})</i></p>
            <p><i><b>Email: </b></i> {this.state.email}</p>
            <p><i><b>Played Games: </b></i> {this.state.games}</p>
            <p><i><b>Score: </b></i> {this.state.score}</p>
          </div>
        </div>
      </div>
    );
  }
}

Profile.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth
});


export default connect(mapStateToProps)(withRouter(Profile));