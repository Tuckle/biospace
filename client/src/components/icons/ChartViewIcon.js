import React, {useState} from 'react';
import InsertDriveFileIcon from '@material-ui/icons/InsertDriveFile';
import TextFieldsIcon from '@material-ui/icons/TextFields';
import SettingsEthernetIcon from '@material-ui/icons/SettingsEthernet';
import {
    Menu, MenuItem, IconButton, Typography, Button
} from "@material-ui/core";

function ChartViewIcon({charts, value, setValue}) {
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

    const showIcon = (name = null) => {
        return <Button aria-controls="simple-menu" aria-haspopup="true" onClick={handleClick}>
            <Typography
                style={styles.menuItemText}>
                {charts[value][1]}
            </Typography>
        </Button>
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
                {charts.map((item, index) => {
                    if (index === value) return null;
                    return (
                        <MenuItem onClick={() => {
                            setVisualisation(index)
                        }}>
                            <Typography style={styles.menuItemText}>{item[1]}</Typography>
                        </MenuItem>
                    )
                })}
            </Menu>
        </div>
    );
}

const styles = {
    menuItemText: {
        marginLeft: 5
    }
};

export default ChartViewIcon;
