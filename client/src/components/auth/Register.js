import React, {Component} from 'react';
import Navbar1 from '../layout/Navbar1';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {Link} from 'react-router-dom';
import classnames from 'classnames';
import {connect} from 'react-redux';
// import axios from "axios";
import {registerUser} from '../../actions/authActions';

class Register extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      email: '',
      password: '',
      password2: '',
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      email: this.state.email,
      username: this.state.username,
      password: this.state.password,
      password2: this.state.password2
    };
    /*
    axios
      .post('/users/send', user)
      .then(res => this.props.history.push('/mg/waitforvalid'))
      .catch(err => {
          //console.log(JSON.stringify(err));
          this.setState({errors: err.response.data});
        }
      );
    */
    this.props.registerUser(user, this.props.history);
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/lobby');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({errors: nextProps.errors});
    }
  }

  onChange(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  render() {
    const {errors} = this.state;
    return (
      <div>
        <Navbar1/>

        <form className="form" onSubmit={this.onSubmit}>
          <div className="container card py-4 shadow-lg">
            <h1 className="mb-5 font-weight-normal text-center">Register</h1>

            <div className="form-group">
              <input
                type="text"
                className={classnames('form-control form-control-lg', {'is-invalid': errors.username})}
                placeholder="Enter username"
                value={this.state.username}
                name="username"
                onChange={this.onChange}
              />
              {errors.username && (<div className="invalid-feedback">{errors.username}</div>)}
            </div>

            <div className="form-group">
              <input
                type="text"
                className={classnames('form-control form-control-lg', {'is-invalid': errors.email})}
                placeholder="Enter email"
                value={this.state.email}
                name="email"
                onChange={this.onChange}
              />
              {errors.email && (<div className="invalid-feedback">{errors.email}</div>)}
            </div>

            <div className="form-group">
              <input
                type="password"
                className={classnames('form-control form-control-lg', {'is-invalid': errors.password})}
                placeholder="Enter password"
                value={this.state.password}
                name="password"
                onChange={this.onChange}
              />
              {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
            </div>

            <div className="form-group">
              <input
                type="password"
                className={classnames('form-control form-control-lg', {'is-invalid': errors.password2})}
                placeholder="Confirm your password"
                value={this.state.password2}
                name="password2"
                onChange={this.onChange}
              />
              {errors.password2 && (<div className="invalid-feedback">{errors.password2}</div>)}
            </div>

            <div className="form-group">
              <button type="submit" className="btn btn-primary btn-block mt-4">REGISTER NOW</button>
            </div>
            <div className="form-group mt-4">
              <label>Sign in</label>
              <Link to="/mg/login" className="btn btn-info btn-block">Back</Link>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, {registerUser})(withRouter(Register));
