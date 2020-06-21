import React, {useState} from 'react';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {
    Menu, MenuItem, IconButton, Typography,
    Tooltip, Fade
} from "@material-ui/core";
import AddDoisModal from "../modals/AddDoisModal";
import AddProjectModal from "../modals/AddProjectModal";

function AddSpaceIcon({data}) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="Add" arrow TransitionComponent={Fade}>
                <IconButton edge="start" color="inherit" aria-label="menu"
                            aria-controls="bubble-menu" aria-haspopup="true" onClick={handleClick}>
                    <AddCircleOutlineIcon/>
                </IconButton>
            </Tooltip>
            <Menu
                id="bubble-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                <AddProjectModal data={data} handleClose={handleClose}/>
                <AddDoisModal data={data} handleClose={handleClose}/>
            </Menu>
        </div>
    );
}

const styles = {
    menuItemText: {
        marginLeft: 3
    }
};

export default AddSpaceIcon;
