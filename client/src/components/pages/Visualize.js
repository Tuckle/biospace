import React, {useEffect, useState} from 'react';
import data from '../marvel/data';
import WidgetBot from "@widgetbot/react-embed";
import PropTypes from 'prop-types';
import {
    AppBar, Toolbar, Tabs,
    IconButton, Tab, Box, Typography
} from "@material-ui/core";
import {
    List, ListItem, Paper,
    Tooltip, Fade
} from "@material-ui/core";
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import MainRouteIcon from "../icons/MainRouteIcon";
import GraphViewIcon from "../icons/GraphViewIcon";
import AccountIcon from "../icons/AccountIcon";
import AddSpaceIcon from "../icons/AddSpaceIcon";
import GraphVisualisation from "../visualisations/GraphVisualisation";
import TableVisualisation from "../visualisations/TableVisualisation";
import ChartVisualisation from "../visualisations/ChartVisualisation";
import {fetchGraphData, filterByRules} from "../res/data";
import FilterDataModal from "../modals/FilterDataModal";
import SearchPapersModal from "../modals/SearchPapersModal";
import ScriptTag from 'react-script-tag';
import { FacebookProvider, Group, CustomChat } from 'react-facebook';
import ReactCursorPosition, {INTERACTIONS} from 'react-cursor-position';

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
    const [allData, setAllData] = useState(data);
    const [myData, setData] = useState(data);
    const [graphWidth, setGraphWidth] = useState(window.innerWidth / 3 * 2);

    const [tabValue, setTabValue] = useState(0);

    const [graphViewValue, setGraphViewValue] = useState(0);

    const handleChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const setGraphData = (data) => {
        setData(data);
        setAllData(data);
    };

    const filterGraphData = (rules) => {
        let result = filterByRules(
            JSON.parse(JSON.stringify(allData))
            , rules);
        setData(result);
    };

    useEffect(() => {
        fetchGraphData(space_id, setGraphData)
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
                        <Toolbar variant="dense" style={styles.rightGraphToolbar}>
                            <FilterDataModal
                                data={myData}
                                setFilterRules={filterGraphData}
                                allData={allData}
                            />
                            <SearchPapersModal
                                data={myData}
                                allData={allData}
                            />
                            <AddSpaceIcon data={myData} />
                        </Toolbar>
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
                        <Tab label={"Info"} {...a11yProps(0)} />
                        <Tab label="Discord" {...a11yProps(1)} />
                        <Tab label="Facebook" {...a11yProps(2)} />
                        <Tab label="Reddit" {...a11yProps(3)} />
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
                    graphViewValue === 2 ? <ChartVisualisation
                            myData={myData}
                            width={graphWidth}
                        /> :
                        <ReactCursorPosition
                            activationInteractionMouse={INTERACTIONS.HOVER} //default
                            hoverDelayInMs={250} //default: 0
                            hoverOffDelayInMs={150} //default: 0>
                        >
                            <GraphVisualisation
                                data={myData}
                                width={graphWidth}
                            />
                        </ReactCursorPosition>}
                <div>
                    <TabPanel index={0} value={tabValue}>
                        <Paper style={{overflow: "auto", maxHeight: window.innerHeight}}>
                            {/*<Typography>IDs</Typography>*/}
                            {/*<List style={{overflow: "auto"}}>*/}
                            {/*    {myData["nodes"].map((item, i) => (*/}
                            {/*        <ListItem>*/}
                            {/*            <Typography>{item["id"]}</Typography>*/}
                            {/*        </ListItem>*/}
                            {/*    ))}*/}
                            {/*</List>*/}
                        </Paper>
                    </TabPanel>
                    <TabPanel index={1} value={tabValue}>
                        <WidgetBot
                            server="717755444646379600"
                            channel="717835175635058816"
                            shard="https://e.widgetbot.io"
                            width={window.innerWidth - graphWidth}
                            height={window.innerHeight}
                        />
                    </TabPanel>
                    <TabPanel index={2} value={tabValue}>
                        <FacebookProvider appId="657162925011369" chatSupport>
                            <Group
                                href="https://www.facebook.com/groups/geneticbiohacking/"
                                width={window.innerWidth - graphWidth}
                                showSocialContext={true}
                                showMetaData={true}
                                skin="light"
                            />
                        </FacebookProvider>
                    </TabPanel>
                    <TabPanel index={3} value={tabValue}>
                        <ScriptTag src="https://redditjs.com/subreddit.js" />
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
