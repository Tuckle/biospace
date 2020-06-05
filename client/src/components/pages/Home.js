import React, {useDebugValue, useEffect, useState} from 'react';
import {fetchUrl} from "../res/urls";
import {
    List, ListItem, Divider,
    Box, Typography
} from "@material-ui/core";
import Button from '@material-ui/core/Button';
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
        return <div>
            <Typography>{name}</Typography>
            <List style={styles.list}>
                {inputArray
                    .sort((a, b) => a[keys] < b[keys] ? 1 : -1)
                    .map((item, i) => (
                    <ListItem>
                        <Box width={200} style={{textAlign: 'center'}} border={1}>
                            <Typography>{item["id"]} - id</Typography>
                            <Typography>{item["keys"]} - keywords</Typography>
                            <Typography>{item[keys]} - {keys}</Typography>
                            <Route render={({history}) => (
                                <Button
                                    onClick={() => {
                                        history.push('/s/' + item['id'])
                                    }}
                                >
                                    Open
                                </Button>
                            )}/>
                        </Box>
                    </ListItem>
                ))}
            </List>
        </div>
    }

    return (
        <div className="Home">
            {/*<p>This would be my home page</p>*/}
            {/*<Button variant="outlined">click home</Button>*/}
            {getPopular(popular, "Popular", "popularity")}
            {getPopular(lastAccessed, "Recent", "accessed")}
        </div>
    );
}

const styles = {
    list: {
        display: 'flex',
        flexDirection: 'row',
        padding: 0,
        marginTop: 30,
        marginLeft: 5,
        marginRight: 5
    }
};

export default Home;
