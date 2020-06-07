import React, {useState} from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
import AccountCircle from '@material-ui/icons/AccountCircle';
import DonutLargeIcon from '@material-ui/icons/DonutLarge';
import {
    Toolbar, Menu, MenuItem, IconButton
} from "@material-ui/core";

function MainRouteIcon ({home=false, className=""}) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton edge="start" className={className} color="inherit" aria-label="menu"
                        aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
                <DonutLargeIcon/>
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
                {home ? <MenuItem onClick={handleClose}>
                    <Link to="/home">Home</Link>
                </MenuItem> : null}
            </Menu>
        </div>
    );
}

export default MainRouteIcon;
