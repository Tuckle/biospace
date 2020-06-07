import React, {useDebugValue, useEffect, useState} from 'react';
import {fetchUrl} from "../res/urls";
import {
    Box, Typography,
    Grid, GridList, GridListTile, GridListTileBar, IconButton
} from "@material-ui/core";
import OpenInBrowserIcon from '@material-ui/icons/OpenInBrowser';
import {Route} from "react-router-dom";

function Home() {
    const [lastAccessed, setLastAccessed] = useState([]);
    const [popular, setPopular] = useState([]);

    function getSpaces(by, func) {
        fetchUrl("get_spaces", {
            "by": by
        }, (data) => {
            data = Object.keys(data).map((key) => data[key]);
            func(data)
        })
    }

    useEffect(() => {
            getSpaces("popularity", setPopular)
            getSpaces("accessed", setLastAccessed)
        }, []
    )

    function getPopular(inputArray, name, keys) {
        if (!inputArray.length) {
            return null;
        }
        return <div style={{margin: 10}}>
            <Typography>{name}</Typography>
            <div style={styles.rootList}>
                <GridList style={styles.list}>
                    {inputArray
                        .sort((a, b) => a[keys] < b[keys] ? 1 : -1)
                        .map((item, i) => (
                            <GridListTile
                                style={styles.listItem}
                            >
                                <img
                                    src="https://i.pinimg.com/originals/d9/f7/05/d9f70593f3d861704c83c34faff90705.png"/>
                                <GridListTileBar
                                    title={item["id"]}
                                    actionIcon={
                                        <IconButton>
                                            <Route render={({history}) => (
                                                <OpenInBrowserIcon
                                                    onClick={() => {
                                                        history.push('/s/' + item['id'])
                                                    }}
                                                >
                                                    Open
                                                </OpenInBrowserIcon>
                                            )}/>
                                        </IconButton>
                                    }
                                />
                            </GridListTile>
                        ))}
                </GridList>
            </div>
        </div>
    }

    return (
        <div className="Home">
            {getPopular(popular, "Popular", "popularity")}
            {getPopular(lastAccessed, "Recent", "accessed")}
        </div>
    );
}

const styles = {
    list: {
        flexWrap: 'nowrap',
        // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
        transform: 'translateZ(0)'
    },
    listItem: {
        margin: 5,
        maxWidth: 200
    },
    rootList: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-around'
    }
};

export default Home;
