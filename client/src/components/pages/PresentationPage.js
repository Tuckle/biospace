import React from 'react';
import Button from '@material-ui/core/Button';
import {Redirect, Route} from 'react-router-dom';

function PresentationPage(props) {
    const loggedIn = localStorage.getItem("loggedIn")
    if (loggedIn) {
        return (
            <Route render={(props) => (
                <Redirect to={{pathname: "/home", state: {from: props.location}}} />
            )}
            />
        );
    }

    return (
        <div className="Home">
            <p>Welcome to BioSpace!</p>
        </div>
    );
}

export default PresentationPage;
