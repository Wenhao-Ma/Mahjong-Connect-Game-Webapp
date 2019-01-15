import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class Navbar1 extends Component {
  render() {
    return (
      <nav className="navbar navbar-expand-sm navbar-dark bg-dark mb-5 fixed-top">
        <div className="container mt-0">
          <div className="navbar-brand navbarstyle">
            Mahjong Game
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#mobile-nav">
            <span className="navbar-toggler-icon"/>
          </button>
          <div className="collapse navbar-collapse" id="mobile-nav">
            <ul className="navbar-nav ml-auto">
              <li className="nav-item">
                <Link className="nav-link navbarstyle1" to="/mg/register">
                  Sign Up
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link navbarstyle1" to="/mg/login">
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar1;
