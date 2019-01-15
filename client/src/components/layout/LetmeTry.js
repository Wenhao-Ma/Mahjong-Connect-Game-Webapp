import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import axios from "axios";

const querystring = require('querystring');

class LetmeTry extends Component {

    componentDidMount() {
        let pp = querystring.parse(this.props.location.search);
        let data = {};
        data.email = pp["?email"];
        data["salt"] = pp["salt"];
        axios
        .post('/users/validate', data)
        .then(() => this.props.history.push('/mg/login'))
        .catch(() => this.props.history.push('/mg/register'))
    }

    render() {
        return (
            <div>
            </div>
        )
    }
}

const mapStateToProps = state => ({});
export default connect(mapStateToProps, {})(withRouter(LetmeTry));