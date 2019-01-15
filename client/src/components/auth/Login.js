import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import classnames from 'classnames';
import Navbar1 from '../layout/Navbar1';
import {Link} from 'react-router-dom';
import {loginUser} from '../../actions/authActions';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: '',
      password: '',
      errors: {}
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/mg/lobby');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push('/mg/lobby');
    }

    if (nextProps.errors) {
      this.setState({errors: nextProps.errors});
    }
  }

  onSubmit(e) {
    e.preventDefault();

    const userData = {
      email: this.state.email,
      password: this.state.password
    };

    this.props.loginUser(userData);
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
            <h1 className="mb-5 font-weight-normal text-center">Please sign in</h1>
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
                placeholder="Password"
                value={this.state.password}
                name="password"
                onChange={this.onChange}
              />
              {errors.password && (<div className="invalid-feedback">{errors.password}</div>)}
            </div>
            <div className="form-group">
              <button type="submit" className="btn btn-primary btn-block">Sign in</button>
            </div>
            <div className="form-group mt-5">
              <label>Don't have an account?</label>
              <Link to="/mg/register" className="btn btn-info btn-block">Register</Link>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  errors: state.errors
});

export default connect(mapStateToProps, {loginUser})(Login);




