import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route
} from "react-router-dom";
import './App.css';
import PresentationPage from "./components/pages/PresentationPage";
import Home from "./components/pages/Home";
import ModalSearch from "./components/pages/SearchModal";
import ViewKeywords from "./components/pages/Visualize";
import {makeStyles} from '@material-ui/core/styles';
import {
    AppBar, Toolbar, Typography,
} from '@material-ui/core';
import MainRouteIcon from "./components/icons/MainRouteIcon";
import AccountIcon from "./components/icons/AccountIcon";
import {SnackbarProvider} from 'notistack';

function App() {
    const classes = useStyles();

    const getMainAppBar = () => (
        <AppBar
            position="static"
            color="default"
        >
            <Toolbar variant="dense">
                <MainRouteIcon/>
                <Typography variant="h6" className={classes.title}>
                    BioSpace
                </Typography>
                <Switch>
                    <Route path="/home">
                        <ModalSearch/>
                    </Route>
                </Switch>
                <AccountIcon/>
            </Toolbar>
        </AppBar>
    );

    return (
        <SnackbarProvider maxSnack={3}>
            <Router>
                <div className="App">
                    <Switch>
                        <Route path="/home">
                            {getMainAppBar()}
                            <Home/>
                        </Route>
                        <Route path="/s">
                            <ViewKeywords/>
                        </Route>
                        <Route path="/">
                            {getMainAppBar()}
                            <PresentationPage/>
                        </Route>
                    </Switch>
                </div>
            </Router>
        </SnackbarProvider>
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
