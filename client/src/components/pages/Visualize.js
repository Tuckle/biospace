import React, {useEffect, useState} from 'react';
import data from '../marvel/data';
import WidgetBot from "@widgetbot/react-embed";
import {getUrl} from "../res/urls";
import PropTypes from 'prop-types';
import {
    AppBar, Toolbar, Tabs,
    IconButton, Tab, Box, Typography
} from "@material-ui/core";
import {
    List, ListItem, Paper
} from "@material-ui/core";
import FilterListIcon from '@material-ui/icons/FilterList';
import SearchIcon from '@material-ui/icons/Search';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import {FaDiscord} from "react-icons/all";
import {Icon, InlineIcon} from '@iconify/react';
import discordIcon from '@iconify/icons-simple-icons/discord';
import MainRouteIcon from "../icons/MainRouteIcon";
import GraphViewIcon from "../icons/GraphViewIcon";
import AccountIcon from "../icons/AccountIcon";
import GraphVisualisation from "../visualisations/GraphVisualisation";
import TableVisualisation from "../visualisations/TableVisualisation";
import {fetchGraphData, convertToGraphData} from "../res/data";

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

    const [graphViewValue, setGraphViewValue] = useState(1);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    useEffect(() => {
        fetchGraphData(space_id, setData)
    }, []);

    return (
        <div>
            <div style={{display: "flex"}}>
                <AppBar
                    position="static"
                    color="default"
                    style={{width: graphWidth}}>
                    <Toolbar variant="dense">
                        <MainRouteIcon home/>
                        <GraphViewIcon value={graphViewValue} setValue={setGraphViewValue}/>
                        <div style={styles.rightGraphToolbar}>
                            <IconButton edge="start" color="inherit" aria-label="menu">
                                <FilterListIcon/>
                            </IconButton>
                            <IconButton edge="start" color="inherit" aria-label="menu">
                                <SearchIcon/>
                            </IconButton>
                            <IconButton edge="start" color="inherit" aria-label="menu">
                                <AddCircleOutlineIcon/>
                            </IconButton>
                        </div>
                        <AccountIcon/>
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
                        <Tab label={<Icon icon={discordIcon}/>} {...a11yProps(0)} />
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
                {graphViewValue === 1 ? <TableVisualisation
                        data={myData}
                        width={graphWidth}
                    /> :
                    graphViewValue === 2 ? <Typography>Chart</Typography> :
                        <GraphVisualisation
                            data={myData}
                            width={graphWidth}
                        />}
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

const styles = {
    rightGraphToolbar: {
        marginLeft: 'auto'
    }
};

export default ViewKeywords;
