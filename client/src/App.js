import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import PresentationPage from "./components/pages/PresentationPage";
import Home from "./components/pages/Home";
import ModalSearch from "./components/pages/SearchModal";
import LoginModal from "./components/pages/LoginModal";
import ViewKeywords from "./components/pages/Visualize";
import {makeStyles} from '@material-ui/core/styles';
import {
    AppBar, Toolbar, Typography,
    Button, IconButton, Menu, MenuItem,
    InputBase, TextField, Checkbox
} from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

function App() {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Router>
            <div className="App">
                <AppBar position="static">
                    <Toolbar>
                        <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu"
                                    aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                            <MenuIcon/>
                        </IconButton>
                        <Menu
                            id="simple-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>
                                <Link to="/">Root</Link>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <Link to="/home">Home</Link>
                            </MenuItem>
                            <MenuItem onClick={handleClose}>
                                <LoginModal />
                            </MenuItem>
                        </Menu>
                        <Typography variant="h6" className={classes.title}>
                            BioSpace
                        </Typography>
                        <Switch>
                            <Route path="/home">
                                <ModalSearch/>
                            </Route>
                        </Switch>
                    </Toolbar>
                </AppBar>
                <Switch>
                    <Route path="/home">
                        <Home/>
                    </Route>
                    <Route path="/s">
                        <ViewKeywords/>
                    </Route>
                    <Route path="/">
                        <PresentationPage />
                    </Route>
                </Switch>
            </div>
        </Router>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
    },
}));

export default App;
