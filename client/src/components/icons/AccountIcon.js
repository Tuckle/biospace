import React, {useState} from 'react';
import LoginModal from "../pages/LoginModal";
import AccountCircle from '@material-ui/icons/AccountCircle';
import {
    Menu, MenuItem, IconButton, Typography, Toolbar
} from "@material-ui/core";

function AccountIcon({value, setValue}) {
    const [anchorAccount, setAnchorAccount] = React.useState(null);
    const handleAccountClick = (event) => {
        setAnchorAccount(event.currentTarget);
    };

    const handleAccountClose = () => {
        setAnchorAccount(null);
    };

    return (
        <div>
            <IconButton
                aria-label="account of current user"
                aria-controls="account-menu"
                aria-haspopup="true"
                onClick={handleAccountClick}
                color="inherit"
            >
                <AccountCircle/>
            </IconButton>
            <Menu
                id="account-menu"
                anchorEl={anchorAccount}
                keepMounted
                open={Boolean(anchorAccount)}
                onClose={handleAccountClose}
            >
                <MenuItem onClick={handleAccountClose}>
                    <LoginModal/>
                </MenuItem>
            </Menu>
        </div>
    );
}

export default AccountIcon;
