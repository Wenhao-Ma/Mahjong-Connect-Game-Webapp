import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Email extends Component {
    
    render() {
        return (
            <div className = "container">
                <div className = "text-center">
                    A varification link has been sent to your email.
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({});
export default connect(mapStateToProps, {})(withRouter(Email));
