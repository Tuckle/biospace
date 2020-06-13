import React, {useEffect, useState, useCallback, useRef} from 'react';
import {ForceGraph3D} from "react-force-graph";
import {
    Typography, Menu, MenuItem,
    IconButton, Icon
} from "@material-ui/core";
import {useSnackbar} from 'notistack';
import {convertId} from "../res/data";
import FilterCenterFocusIcon from '@material-ui/icons/FilterCenterFocus';
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import FileCopyIcon from "@material-ui/icons/FileCopy";

function GraphVisualisation({data, position, width = 500}) {
    const fgRef = useRef();
    const {enqueueSnackbar} = useSnackbar();
    const [coordinates, setCoordinates] = useState([20, 20]);
    const [openNodeMenu, setOpenNodeMenu] = useState(false);
    const [currentNode, setCurrentNode] = useState(null);

    useEffect(() => {
        setCoordinates([position.x, position.y]);
    }, [openNodeMenu])

    const closeNodeMenu = () => {
        setOpenNodeMenu(false);
    };

    const focusNode = useCallback(node => {
        // Aim at node from outside it
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        fgRef.current.cameraPosition(
            {x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio}, // new position
            node, // lookAt ({ x, y, z })
            3000  // ms transition duration
        );
    }, [fgRef]);

    function showNodeMenu(node) {
        return (
            <Menu
                id="simple-menu"
                anchorEl={openNodeMenu}
                keepMounted
                open={Boolean(openNodeMenu)}
                onClose={closeNodeMenu}
                style={{
                    position: "absolute",
                    left: coordinates[0],
                    top: coordinates[1]
                }}
                getContentAnchorEl={null}
            >
                <MenuItem
                            onClick={(event) => {
                                let id = convertId(currentNode.id);
                                navigator.clipboard.writeText(id);
                                closeNodeMenu()
                                enqueueSnackbar("Copied doi: " + id);
                            }}>
                    <FileCopyIcon/>
                    <Typography>Copy url</Typography>
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        let url = convertId(currentNode.id);
                        closeNodeMenu()
                        window.open(url, "_blank");
                    }}>
                    <OpenInBrowserIcon/>
                    <Typography>Open url</Typography>
                </MenuItem>
                <MenuItem
                    onClick={(event) => {
                        closeNodeMenu()
                        focusNode(currentNode);
                    }}>
                    <FilterCenterFocusIcon/>
                    <Typography>Focus node</Typography>
                </MenuItem>
            </Menu>
        );
    }

    const handleClick = useCallback(node => {
        setCurrentNode(node);
        setOpenNodeMenu(true);
    }, [fgRef]);

    return (
        <div>
            <ForceGraph3D
                ref={fgRef}
                graphData={data}
                linkWidth={2}
                width={width}
                onNodeClick={handleClick}
            />
            {showNodeMenu()}
        </div>
    );
}

const styles = {};

export default GraphVisualisation;
