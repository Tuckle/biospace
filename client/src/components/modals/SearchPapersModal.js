import React, {useState, useEffect} from 'react';
import {
    InputBase, IconButton, Fade, Tooltip, Input,
    Modal, FormControl, InputLabel, FormHelperText,
    Select, MenuItem, Checkbox, ListItemText,
    Grid, Button, Collapse, Paper, FormControlLabel, Switch,
    Typography
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import SearchIcon from "@material-ui/icons/Search";
import makeStyles from "@material-ui/core/styles/makeStyles";
import GridVisualisation from "../visualisations/GridVisualisation";
import {searchScienceDirect} from "../apis/ScienceDirect";
import {addDois} from "../res/data";
import {useSnackbar} from 'notistack';

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 10, 3)
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

function SearchPapersModal({data, allData}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [open, setOpen] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [papers, setPapers] = useState([]);
    const [pageNumber, setPageNumber] = useState(0);
    const [queryText, setQueryText] = useState("");
    const [checkedDois, setCheckedDois] = useState([]);
    const [showMore, setShowMore] = useState(false);
    const [fromDate, setFromDate] = useState(new Date('1999-08-18T21:11:54'));
    const [untilDate, setUntilDate] = useState(new Date());
    const [query, setQuery] = useState({});
    const [allFields, setAllFields] = useState([]);
    const [fields, setFields] = useState([]);

    const addPapers = (inputPapers) => {
        if (inputPapers && inputPapers.length > 0) {
            let myPapers = [...papers];
            myPapers = myPapers.concat(inputPapers);
            setPapers(myPapers);
        }
    };

    const updateFields = () => {
        try {
            let myFields = {};
            allData["nodes"].filter((item) => {
                return item["type"] === "field"
            }).forEach((item) => {
                myFields[item["id"]] = true
            })
            setAllFields(Object.keys(myFields));
            // setFields(allFields);
        } catch (e) {

        }
    }

    useEffect(() => {
        updateFields()
    }, [])

    useEffect(() => {
        updateFields()
    }, [allData])

    const getQuery = () => {
        let myQuery = {"text": queryText.valueOf(), ...query};
        myQuery["page"] = pageNumber;
        return myQuery;
    };

    function setQueryField(name, value) {
        let myQuery = {...query};
        myQuery[name] = value;
        setQuery(myQuery);
    }

    function setDate() {
        setQueryField("date-range", [fromDate, untilDate]);
    }

    const searchPapers = (clear = true) => {
        if (clear) {
            setPapers([]);
            setPageNumber(0);
        }
        const myQuery = getQuery();
        searchScienceDirect(myQuery, addPapers);
    };

    const getMorePapers = () => {
        setPageNumber(pageNumber + 1);
        searchPapers(false);
    };

    const addSelected = () => {
        if (checkedDois.length > 0) {
            let dois = [...checkedDois];
            addDois(checkedDois, (data) => {
                    Object.keys(data).forEach((key, index) => {
                        let ind = dois.indexOf(key);
                        if (ind !== -1) {
                            dois.splice(ind, 1);
                        }
                    })
                    setCheckedDois(dois);
                    if (dois.length === 0) {
                        enqueueSnackbar("Successfully added all selected.")
                    } else {
                        enqueueSnackbar("Added all dois, except those that remained selected.");
                    }
                }, fields,
                () => {
                    enqueueSnackbar("Failed to add any selected");
                })
        }
    };

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChangeFields = (event) => {
        setFields(event.target.value);
    };

    const changeShowAdvanced = () => {
        setShowAdvanced(!showAdvanced);
    };

    const body = (
        <div className={classes.paper}>
            <Grid container justify={"center"}>
                <FormControl style={{width: window.innerWidth * 0.35}}>
                    <FormControl>
                        <InputLabel htmlFor="search-text">Search</InputLabel>
                        <Input
                            id="search-text"
                            aria-describedby="search"
                            inputProps={{'aria-label': 'search'}}
                            onChange={(event) => {
                                setQueryText(event.target.value)
                            }}
                        />
                    </FormControl>
                    <FormControlLabel control={
                        <Switch checked={showAdvanced} onChange={changeShowAdvanced}/>
                    } label={"Show Advanced"}/>
                    <Collapse in={showAdvanced}>
                        <FormControl fullWidth>
                            <MuiPickersUtilsProvider utils={DateFnsUtils}>
                                <Grid container justify="space-around">
                                    <KeyboardDatePicker
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        id="date-picker-inline"
                                        label="From date"
                                        value={fromDate}
                                        onChange={(date) => {
                                            if (date) {
                                                setFromDate(date)
                                                setDate()
                                            }
                                        }}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                    <KeyboardDatePicker
                                        disableToolbar
                                        variant="inline"
                                        format="MM/dd/yyyy"
                                        margin="normal"
                                        id="until-date-picker-inline"
                                        label="Until date"
                                        value={untilDate}
                                        onChange={(date) => {
                                            if (date) {
                                                setUntilDate(date)
                                                setDate()
                                            }
                                        }}
                                        KeyboardButtonProps={{
                                            'aria-label': 'change date',
                                        }}
                                    />
                                </Grid>
                            </MuiPickersUtilsProvider>
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="authors-text">Authors</InputLabel>
                            <Input
                                id="authors-text"
                                aria-describedby="authors"
                                inputProps={{'aria-label': 'search'}}
                                onChange={(event) => {
                                    setQueryField("authors", event.target.value);
                                }}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="affiliations-text">Affiliations</InputLabel>
                            <Input
                                id="affiliations-text"
                                aria-describedby="affiliations"
                                inputProps={{'aria-label': 'search'}}
                                onChange={(event) => {
                                    setQueryField("affiliations", event.target.value);
                                }}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="title-text">Title</InputLabel>
                            <Input
                                id="title-text"
                                aria-describedby="title"
                                inputProps={{'aria-label': 'search'}}
                                onChange={(event) => {
                                    setQueryField("title", event.target.value);
                                }}
                            />
                        </FormControl>
                        <FormControl fullWidth>
                            <InputLabel htmlFor="references-text">Reference</InputLabel>
                            <Input
                                id="references-text"
                                aria-describedby="references"
                                inputProps={{'aria-label': 'search'}}
                                onChange={(event) => {
                                    setQueryField("references", event.target.value);
                                }}
                            />
                        </FormControl>
                        {allFields.length > 0 ? <FormControl fullWidth style={{paddingTop: 1}}>
                            <InputLabel shrink id="paper-type-label">Connect to</InputLabel>
                            <Select
                                labelId="paper-type-label"
                                id="paper-type"
                                multiple
                                value={fields}
                                onChange={handleChangeFields}
                                input={<Input/>}
                                renderValue={(selected) => selected.join(', ')}
                            >
                                {allFields.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={fields.indexOf(name) > -1}/>
                                        <ListItemText primary={name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl> : null}
                    </Collapse>
                    <FormControl>
                        <Button variant="contained" color="primary" onClick={searchPapers}>Search</Button>
                    </FormControl>
                </FormControl>
            </Grid>
            <GridVisualisation data={papers} checkedDois={checkedDois} setCheckedDois={setCheckedDois}/>
            <Grid container justify={"flex-end"} spacing={2}>
                {
                    checkedDois.length > 0 ? <Grid item>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={addSelected}
                        >
                            Add Selected
                        </Button>
                    </Grid> : null
                }
                <Grid item>
                    <Button
                        variant="outlined"
                        onClick={getMorePapers}
                    >
                        More
                    </Button>
                </Grid>
            </Grid>
        </div>
    );

    return (
        <>
            <Tooltip title="Search Papers" arrow TransitionComponent={Fade}>
                <IconButton edge="start" color="inherit" aria-label="menu"
                            onClick={handleOpen}>
                    <SearchIcon/>
                </IconButton>
            </Tooltip>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="search-graph-data"
                aria-describedby="search-graph-data-description"
                className={classes.modal}
            >
                {body}
            </Modal>
        </>
    );
}

export default SearchPapersModal;
