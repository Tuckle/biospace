import React, {useState} from 'react';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import {
    Menu, MenuItem, IconButton, Typography
} from "@material-ui/core";

function TableViewIcon({value, setValue}) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    function setVisualisation(val) {
        handleClose()
        setValue(val)
    }

    const showIcon = (name=null) => {
        return <IconButton edge="start" color="inherit" aria-label="menu"
                           aria-controls="table-menu" aria-haspopup="true" onClick={handleClick}>
            {
                value === 1 ? (<TextFieldsIcon />) : value === 2 ? <SettingsEthernetIcon /> : <InsertDriveFileIcon />
            }
            {
                name ? value === 1 ? "table" : value === 2 ? "chart" : "graph" : null
            }
        </IconButton>
    }

    return (
        <div style={{paddingLeft: 10}}>
            {showIcon()}
            <Menu
                id="table-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {value !== 0 ? <MenuItem onClick={() => {setVisualisation(0)}}>
                    <InsertDriveFileIcon/>
                    <Typography style={styles.menuItemText}>Papers</Typography>
                </MenuItem> : null}
                {value !== 1 ? <MenuItem onClick={() => {setVisualisation(1)}}>
                    <TextFieldsIcon/>
                    <Typography style={styles.menuItemText}>Fields</Typography>
                </MenuItem> : null}
                {value !== 2 ? <MenuItem onClick={() => {setVisualisation(2)}}>
                    <SettingsEthernetIcon/>
                    <Typography style={styles.menuItemText}>Connections</Typography>
                </MenuItem> : null}
            </Menu>
        </div>
    );
}

const styles = {
    menuItemText: {
        marginLeft: 5
    }
};

export default TableViewIcon;
