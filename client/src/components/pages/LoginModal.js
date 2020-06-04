import React from 'react';
import {Route} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {getUrl} from "../res/urls";
import {
    Button, Checkbox, TextField,
    FormHelperText, InputLabel, Input, FormControl
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 10, 3),
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}));


function LoginModal({closed = true}) {
    const loggedIn = localStorage.getItem("loggedIn");
    const classes = useStyles();
    const [open, setOpen] = React.useState(!closed);
    // true to login, false to register
    const [loginOrRegister, setLoginOrRegister] = React.useState(true);
    const [email, setEmail] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [name, setName] = React.useState("");

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const switchLoginOrRegister = () => {
        setLoginOrRegister(!loginOrRegister);
    };

    const doLogin = () => {
        fetch(
            getUrl("users/login"), {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password
                })
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                if (data["email"] === email) {
                    localStorage.setItem("userInfo", JSON.stringify(data))
                    localStorage.setItem("loggedIn", "true")
                    setOpen(false)
                }
            })
    };

    const doRegister = () => {
        fetch(
            getUrl("users/register"), {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "email": email,
                    "password": password,
                    "name": name
                })
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                if (data["email"] === email) {
                    localStorage.setItem("userInfo", JSON.stringify(data))
                    localStorage.setItem("loggedIn", "true")
                    setOpen(false)
                }
            })
    };

    const logoutBody = (
        <div className={classes.paper}>
            <FormControl>
                <FormHelperText>Are you sure you want to logout?</FormHelperText>
                <Route render={({history}) => (
                    <Button onClick={() => {
                        localStorage.removeItem("loggedIn")
                        setOpen(false)
                        history.push('/')
                    }}
                    >
                        Yes
                    </Button>
                )}/>
            </FormControl>
        </div>
    );
    const loginBody = (
        <div className={classes.paper}>
            <FormControl>
                <FormControl>
                    <InputLabel htmlFor="email">Email address</InputLabel>
                    <Input id="email" type="email" aria-describedby="Enter institution email address"
                           onChange={(event) => {
                               setEmail(event.target.value)
                           }}
                    />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="pass">Password</InputLabel>
                    <Input id="pass" type="password" aria-describedby="Enter password"
                           onChange={(event) => {
                               setPassword(event.target.value)
                           }}/>
                </FormControl>
                {
                    !loginOrRegister ? <FormControl>
                        <InputLabel htmlFor="name">Full name</InputLabel>
                        <Input id="name" aria-describedby="Enter full name"
                               onChange={(event) => {
                                   setName(event.target.value)
                               }}/>
                    </FormControl> : null
                }
                <FormControl>
                    <FormHelperText onClick={switchLoginOrRegister}>
                        {
                            loginOrRegister ? "Don't have an account? Click here to register.." : "I have an account, click here to login.."
                        }
                    </FormHelperText>
                </FormControl>
                <FormControl>
                    <Button onClick={loginOrRegister ? doLogin : doRegister}>{
                        loginOrRegister ? "Login" : "Register"
                    }</Button>
                </FormControl>
            </FormControl>
        </div>
    );

    return (
        <div>
            <text onClick={handleOpen}>{!loggedIn ? "Login" : "Logout"}</text>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="login-modal-title"
                aria-describedby="login-modal-description"
                className={classes.modal}
            >
                {loggedIn ? logoutBody : loginBody}
            </Modal>
        </div>
    );
}

export default LoginModal;
