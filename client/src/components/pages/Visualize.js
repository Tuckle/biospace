import React, {useEffect, useState} from 'react';
import {ForceGraph3D} from "react-force-graph";
import data from '../marvel/data';
import WidgetBot from "@widgetbot/react-embed";
import config from '../marvel/config';
import {getUrl} from "../res/urls";
import PropTypes from 'prop-types';
import {
    AppBar, Toolbar, Tabs,
    IconButton, Tab, Box, Typography
} from "@material-ui/core";
import {
    List, ListItem, Paper
} from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';

// graph event callbacks
const onClickGraph = function () {
    console.log(`Clicked the graph background`);
};

const onClickNode = function (nodeId) {
    console.log(`Clicked node ${nodeId}`);
};

const onDoubleClickNode = function (nodeId) {
    console.log(`Double clicked node ${nodeId}`);
};

const onRightClickNode = function (event, nodeId) {
    console.log(`Right clicked node ${nodeId}`);
};

const onMouseOverNode = function (nodeId) {
    console.log(`Mouse over node ${nodeId}`);
};

const onMouseOutNode = function (nodeId) {
    console.log(`Mouse out node ${nodeId}`);
};

const onClickLink = function (source, target) {
    console.log(`Clicked link between ${source} and ${target}`);
};

const onRightClickLink = function (event, source, target) {
    console.log(`Right clicked link between ${source} and ${target}`);
};

const onMouseOverLink = function (source, target) {
    console.log(`Mouse over in link between ${source} and ${target}`);
};

const onMouseOutLink = function (source, target) {
    console.log(`Mouse out link between ${source} and ${target}`);
};

const onNodePositionChange = function (nodeId, x, y) {
    console.log(`Node ${nodeId} is moved to new position. New position is x= ${x} y= ${y}`);
};

function TabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`scrollable-auto-tabpanel-${index}`}
            aria-labelledby={`scrollable-auto-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    {children}
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.any.isRequired,
    value: PropTypes.any.isRequired,
};

function a11yProps(index) {
    return {
        id: `scrollable-auto-tab-${index}`,
        'aria-controls': `scrollable-auto-tabpanel-${index}`,
    };
}


function ViewKeywords(props) {
    const space_id = decodeURI(window.location.href).split('/s/')[1];
    const [myData, setData] = useState(data);
    const [graphWidth, setGraphWidth] = useState(window.innerWidth / 3 * 2 - 10);

    const [tabValue, setTabValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        fetch(
            getUrl("space"), {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "id": space_id,
                })
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                const keys = data['keys']
                if (data['id']) {
                    fetch(getUrl("graph/sub?keys=") + keys)
                        .then(res => res.json())
                        .then((info) => {
                            info = info["info"];
                            let nodes = Array();
                            for (let key in info["nodes"]) {
                                let currentNode = info["nodes"][key];
                                currentNode["name"] = currentNode["id"];
                                nodes.push(currentNode);
                            }
                            let relations = Array();
                            for (let dst in info["relationships"]) {
                                for (let src in info["relationships"][dst]) {
                                    relations.push({
                                        source: src,
                                        target: dst,
                                        type: info["relationships"][dst][src]
                                    });
                                }
                            }
                            setData({
                                links: relations,
                                nodes: nodes
                            });
                        })
                        .catch(console.log)
                }
            })
    }, []);

    return (
        <div>
            <div style={{display: "flex"}}>
                <AppBar
                    position="static"
                    color="default"
                    style={{width: graphWidth}}>
                    <Toolbar variant="dense">
                        <IconButton edge="start" color="inherit" aria-label="menu">
                            <MenuIcon/>
                        </IconButton>
                    </Toolbar>
                </AppBar>
                <AppBar
                    position="static"
                    color="default"
                    style={{width: window.innerWidth - graphWidth}}>
                    <Tabs
                        value={tabValue}
                        onChange={handleChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        <Tab label="Item One" {...a11yProps(0)} />
                        <Tab label="Item Two" {...a11yProps(1)} />
                        <Tab label="Item Three" {...a11yProps(2)} />
                        <Tab label="Item Four" {...a11yProps(3)} />
                        <Tab label="Item Five" {...a11yProps(4)} />
                        <Tab label="Item Six" {...a11yProps(5)} />
                        <Tab label="Item Seven" {...a11yProps(6)} />
                    </Tabs>
                </AppBar>
            </div>
            <div style={{display: "flex"}}>
                <ForceGraph3D
                    graphData={myData}
                    linkWidth={2}
                    width={graphWidth}
                />
                <div>
                    <TabPanel index={0} value={tabValue}>
                        <WidgetBot
                            server="717755444646379600"
                            channel="717835175635058816"
                            shard="https://e.widgetbot.io"
                            width={window.innerWidth - graphWidth}
                            height={window.innerHeight}
                        />
                    </TabPanel>
                    <TabPanel index={1} value={tabValue}>
                        <Paper style={{overflow: "auto", maxHeight: window.innerHeight}}>
                            <Typography>IDs</Typography>
                            <List style={{overflow: "auto"}}>
                                {myData["nodes"].map((item, i) => (
                                    <ListItem>
                                        <Typography>{item["id"]}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </TabPanel>
                </div>
            </div>
        </div>
    );
}

export default ViewKeywords;
