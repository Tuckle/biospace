import React, {useEffect, useState, useCallback, useRef} from 'react';
import {withStyles, makeStyles, fade} from '@material-ui/core/styles';
import {
    Paper, Typography, Grid, InputBase, Link,
    IconButton, Checkbox
} from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import GetAppIcon from '@material-ui/icons/GetApp';
import {useSnackbar} from 'notistack';

function getPaperBlock(data, enqueueSnackbar, checkedDois, setCheckedDois) {
    function getAuthorsStr(inputAuthors) {
        let authors = null;
        if (inputAuthors.length > 0) {
            authors = inputAuthors.join(", ");
            if (authors.length > 100) {
                authors = authors.substr(0, 20)
            }
        }
    }

    return (
        <Grid item container component={Paper}>
            <Grid item xs={12}>
                <Typography display="block">
                    <Link href={data.link} target="_blank">
                        {data.title}
                    </Link>
                </Typography>
            </Grid>
            <Grid item xs={9} variant="overline" display="block">
                <Typography>{data.authors.join(", ").substr(0, 40)}</Typography>
            </Grid>
            <Grid item container xs={3} justify={"flex-end"} alignItems={"flex-start"} variant="overline"
                  display="block">
                <Typography>
                    {new Intl.DateTimeFormat("en-GB", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit"
                    }).format(data.date)}
                </Typography>
            </Grid>
            {
                data.abstract ?
                    <Grid item xs={12}>
                        <Typography variant="caption" display="block">{data.abstract}</Typography>
                    </Grid> : null
            }
            <Grid item container xs={6} alignItems={"center"}>
                <Typography variant="caption" display="block">{data.type}</Typography>
            </Grid>
            <Grid item container xs={6} justify={"flex-end"} alignItems={"flex-start"}>
                <IconButton edge="start" color="inherit"
                            onClick={(event) => {
                                window.open(data.download, "_blank");
                            }}>
                    <GetAppIcon/>
                </IconButton>
                <IconButton edge="start" color="inherit"
                            onClick={(event) => {
                                navigator.clipboard.writeText(data.doi);
                                enqueueSnackbar("Copied doi: " + data.doi);
                            }}>
                    <FileCopyIcon/>
                </IconButton>
                <Checkbox
                    checked={checkedDois.indexOf(data.doi) !== -1}
                    onChange={(event) => {
                        let arr = [...checkedDois];
                        const doi = data.doi;
                        const index = checkedDois.indexOf(doi);
                        if (index !== -1 && !event.target.checked) {
                            arr.splice(index, 1);
                            setCheckedDois(arr);
                        } else if(index === -1 && event.target.checked) {
                            arr.push(doi);
                            setCheckedDois(arr);
                        }
                    }}
                    inputProps={{ 'aria-label': 'uncontrolled-checkbox' }} />
            </Grid>
        </Grid>
    );
}

function GridVisualisation({data, checkedDois, setCheckedDois}) {
    const {enqueueSnackbar} = useSnackbar();

    return (
        <div style={{
            paddingTop: 20,
            width: window.innerWidth * 0.5,
            maxHeight: window.innerHeight * 0.5,
            overflow: "auto"
        }}>
            {
                data.length ? (<Grid container spacing={3}>
                    {data.map((paperInfo) => getPaperBlock(paperInfo, enqueueSnackbar, checkedDois, setCheckedDois))}
                </Grid>) : null
            }
        </div>
    );
}

export default GridVisualisation;
