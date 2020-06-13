import React, {useState} from 'react';
import BubbleChartIcon from '@material-ui/icons/BubbleChart';
import MultilineChartIcon from '@material-ui/icons/MultilineChart';
import TableChartRoundedIcon from '@material-ui/icons/TableChartRounded';
import {
    Menu, MenuItem, IconButton, Typography,
    Tooltip, Fade
} from "@material-ui/core";

function GraphViewIcon({value, setValue}) {
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
        return <Tooltip title="Change view" arrow TransitionComponent={Fade}><IconButton edge="start" color="inherit" aria-label="menu"
                           aria-controls="bubble-menu" aria-haspopup="true" onClick={handleClick}>
            {
                value === 1 ? <TableChartRoundedIcon /> : value === 2 ? <MultilineChartIcon /> : <BubbleChartIcon />
            }
            {
                name ? value === 1 ? "table" : value === 2 ? "chart" : "graph" : null
            }
        </IconButton></Tooltip>
    }

    return (
        <div>
            {showIcon()}
            <Menu
                id="bubble-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
            >
                {value !== 0 ? <MenuItem onClick={() => {setVisualisation(0)}}>
                    <BubbleChartIcon/>
                    <Typography style={styles.menuItemText}>Graph</Typography>
                </MenuItem> : null}
                {value !== 1 ? <MenuItem onClick={() => {setVisualisation(1)}}>
                    <TableChartRoundedIcon/>
                    <Typography style={styles.menuItemText}>Table</Typography>
                </MenuItem> : null}
                {value !== 2 ? <MenuItem onClick={() => {setVisualisation(2)}}>
                    <MultilineChartIcon/>
                    <Typography style={styles.menuItemText}>Chart</Typography>
                </MenuItem> : null}
            </Menu>
        </div>
    );
}

const styles = {
    menuItemText: {
        marginLeft: 3
    }
};

export default GraphViewIcon;
