import React, { Component } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import jwt_decode from 'jwt-decode';
import setAuthtoken from './utils/setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authActions';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Email from './components/layout/Email';
import LetmeTry from './components/layout/LetmeTry';
import Lobby from './components/layout/Lobby';
import Game from './components/layout/Game';
import EditProfile from './components/layout/EditProfile';
import ScoreBoard from './components/layout/ScoreBoard';
import './App.css';

// Check for token
if (localStorage.jwtToken) {
  // Set auth token header auth
  setAuthtoken(localStorage.jwtToken);
  // Decode token and get user info and exp
  const decoded = jwt_decode(localStorage.jwtToken);
  // Set user that isAuthenticated
  store.dispatch(setCurrentUser(decoded));

  // Check for expired token
  const currentTime = Date.now() / 1000;
  if (decoded.exp < currentTime) {
    // Logout user
    store.dispatch(logoutUser());
    // Redirect to login
    window.location.href = '/mg/login';
  }
}

class App extends Component {
  render() {
    return (
      <Provider store={ store }>
        <Router>
          <div className="App">
            <Route exact path="/" component={() => <Redirect to="/mg/login" />}/>
            <Route exact path="/mg/login" component={Login} />
            <Route exact path="/mg/edit_profile" component={EditProfile} />
            <Route exact path="/mg/register" component={Register} />
            <Route path="/mg/waitforvalid" component={Email} />
            <Route path="/mg/register/validate/*" component={LetmeTry} />
            <Route exact path="/mg/lobby" component={Lobby} />
            <Route exact path="/mg/lobby/scoreboard" component={ScoreBoard} />
            <Route path="/mg/game/:room_id" component={Game} />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
