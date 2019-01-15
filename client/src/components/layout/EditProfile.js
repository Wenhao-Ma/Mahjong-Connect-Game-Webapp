import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Navbar2 from '../layout/Navbar2';
import {Link} from 'react-router-dom';
import axios from 'axios';

class EditProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      firstname: '',
      lastname: '',
      facebookid: '',
      age: '',
      location: '',
      self_introduction: '',
      avatar: null,
      errors: {}
    };
    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(e) {
    if (e.target.name === 'avatar') {
      const file = e.target.files[0];
      this.setState({avatar: file});
    } else {
      this.setState({[e.target.name]: e.target.value});
    }
  }

  onSubmit(e) {
    e.preventDefault();
    if (this.state.avatar) {
      let avatar = new FormData();
      avatar.append("avatar", this.state.avatar);
      axios
        .post('/users/avatar', avatar, {headers: {'Content-Type': 'multipart/form-data'}})
        .catch(err => console.log(err));
    }

    const content = {
      username: this.state.username,
      firstname: this.state.firstname,
      lastname: this.state.lastname,
      avatar: this.state.avatar
    };
    axios
      .post('/users/edit_profile', content)
      .then(() => {
        this.props.history.push('/mg/lobby')
      })
      .catch(err => this.setState({errors: err.response.data}));
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
          firstname = res.data.firstname,
          lastname = res.data.lastname;
        this.setState({
          username: username,
          firstname: firstname,
          lastname: lastname,
        });
      })
      .catch(err => console.log(err.response));
  }


  render() {
    const {errors} = this.state;
    return (
      <div>
        <Navbar2/>
        <form className="form edit_profile_form" onSubmit={this.onSubmit}>
          <div className="container card py-4 shadow-lg justify-content-md-center">
            <h1 className="mb-5 font-weight-normal text-center edit_profile_h1">Edit profile</h1>
            <div className="row">
              <div className="col-6">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    className={classnames('form-control form-control-lg')}
                    placeholder="Enter username"
                    value={this.state.username}
                    name="username"
                    onChange={this.onChange}
                  />
                  {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}
                </div>

                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    className={classnames('form-control form-control-lg', {'is-invalid': errors.password})}
                    placeholder="firstname"
                    value={this.state.firstname}
                    name="firstname"
                    onChange={this.onChange}
                  />
                  {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
                </div>

                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    className={classnames('form-control form-control-lg', {'is-invalid': errors.password})}
                    placeholder="lastname"
                    value={this.state.lastname}
                    name="lastname"
                    onChange={this.onChange}
                  />
                  {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
                </div>
              </div>

              <div style={{width: "1px", border: "thin solid", color: "#d9d9d9", height: "300px", float: "left"}}/>
              <div className="col-5">
                <div className="form-group">
                  <label>Avatar:</label>
                  <a href="/#">
                    <input
                      type="file"
                      className={classnames('form-control form-control-lg', {'is-invalid': errors.password})}
                      placeholder="self_introduction"
                      name="avatar"
                      onChange={this.onChange}
                      style={{display: "none"}}
                      accept="image/jpg, image/jpeg, image/png"
                      id={"file-input-beaufy"}
                    />
                    <label htmlFor={"file-input-beaufy"}><br/><img src={require('../../img/upload.png')}
                                                                   style={{width: "80%"}} alt="upload"/></label>
                  </a>
                  {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
                </div>
                <div className="form-group mt-5">
                  {/*<label>Don't have an account?</label>*/}
                  <Link to="/mg/lobby" className="btn btn-info edit_profile_cancel">Cancel</Link>
                </div>
              </div>

              <div className="form-group">
                <button type="submit" className="btn btn-primary btn-block">Submit</button>
              </div>

            </div>
          </div>

        </form>
      </div>
    );
  }
}

EditProfile.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps)(EditProfile);



