import React, {useState, useEffect} from 'react';
import {
    InputBase, IconButton, Fade, Tooltip, Input,
    Modal, FormControl, InputLabel, FormHelperText,
    Select, MenuItem, Checkbox, ListItemText,
    Grid, Button,
    Table, TableBody, TableCell,
    TableRow, TableHead, TableContainer,
    Paper, Typography
} from "@material-ui/core";
import DateFnsUtils from "@date-io/date-fns";
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import FilterListIcon from '@material-ui/icons/FilterList';
import {makeStyles} from "@material-ui/core/styles";
import TableVisualisation from "../visualisations/TableVisualisation";

const useStyles = makeStyles((theme) => ({
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 10, 3),
    },
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }
}));

function FilterDataModal({data, setFilterRules, allData}) {
    const classes = useStyles();
    const [open, setOpen] = useState(false);
    const [paperTypes, setPaperTypes] = useState([]);
    const [allPaperTypes, setAllPaperTypes] = useState(["s1", "s2", "s3"]);
    const [fields, setFields] = useState([]);
    const [queryText, setQueryText] = useState("");
    const [allFields, setAllFields] = useState(["f1", "f2", "f3"]);
    const [fromDate, setFromDate] = useState(new Date('2014-08-18T21:11:54'));
    const [untilDate, setUntilDate] = useState(new Date());
    const [initialDates, setInitialDates] = useState([]);

    const updateDefaults = () => {
        try {
            let types = {};
            allData["nodes"].forEach((item) => {
                if ("t" in item) {
                    if (!(item["t"] in types) && !(item["t"] in ["1", "0"])) {
                        types[item["t"]] = true
                    }
                }
            })
            setAllPaperTypes(Object.keys(types));
            let myFields = {};
            allData["nodes"].filter((item) => {
                return item["type"] === "field"
            }).forEach((item) => {
                myFields[item["id"]] = true
            })
            setAllFields(Object.keys(myFields));
        } catch (e) {
            console.log(e);
        }
    }

    useEffect(() => {
        // setup variables - all paper types, etc..
        updateDefaults()
        setInitialDates([new Date(fromDate.getTime()), new Date(untilDate.getTime())]);
    }, []);

    useEffect(() => {
        // when data changes, update infos
        updateDefaults()
    }, [allData]);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleChangeTypes = (event) => {
        setPaperTypes(event.target.value);
    };

    const handleChangeFields = (event) => {
        setFields(event.target.value);
    };

    const getFilter = () => {
        let filterData = {};
        if (queryText.length > 0) {
            filterData["title"] = queryText.substr(0, queryText.length).split(' ')
                .filter((item) => {return item.length > 0}).map((item) => {
                    return item.toLowerCase();
                });
        }
        if (paperTypes.length > 0) {
            filterData["types"] = [...paperTypes];
        }
        if (fields.length > 0) {
            filterData["keys"] = [...fields];
        }
        if (fromDate.getTime() !== initialDates[0].getTime() ||
            untilDate.getTime() !== initialDates[1].getTime()) {
            filterData["dates"] = [new Date(fromDate.getTime()), new Date(untilDate.getTime())];
        }
        return filterData;
    };

    const saveFilter = () => {
        const filterRules = getFilter();
        setFilterRules(filterRules);
    };

    const body = (
        <div className={classes.paper}>
            <Grid container justify={"center"}>
                <FormControl>
                    <FormControl>
                        <InputLabel htmlFor="key-search">Search</InputLabel>
                        <Input
                            id="key-search"
                            aria-describedby="search"
                            inputProps={{'aria-label': 'search'}}
                            onChange={(event) => {
                                setQueryText(event.target.value)
                            }}
                        />
                    </FormControl>
                    {allPaperTypes.length > 0 ? (
                        <FormControl style={{marginTop: 5}}>
                            <InputLabel shrink id="paper-type-label">Item type</InputLabel>
                            <Select
                                labelId="paper-type-label"
                                id="paper-type"
                                multiple
                                value={paperTypes}
                                onChange={handleChangeTypes}
                                input={<Input/>}
                                renderValue={(selected) => selected.join(', ')}
                                // MenuProps={MenuProps}
                            >
                                {allPaperTypes.map((name) => (
                                    <MenuItem key={name} value={name}>
                                        <Checkbox checked={paperTypes.indexOf(name) > -1}/>
                                        <ListItemText primary={name}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    ) : null}
                    <FormControl>
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
                                    onChange={setFromDate}
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
                                    onChange={setUntilDate}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </Grid>
                        </MuiPickersUtilsProvider>
                    </FormControl>
                    {allFields.length > 0 ? <FormControl style={{paddingTop: 1}}>
                        <InputLabel shrink id="paper-type-label">Fields</InputLabel>
                        <Select
                            labelId="paper-type-label"
                            id="paper-type"
                            multiple
                            value={fields}
                            onChange={handleChangeFields}
                            input={<Input/>}
                            renderValue={(selected) => selected.join(', ')}
                            // MenuProps={MenuProps}
                        >
                            {allFields.map((name) => (
                                <MenuItem key={name} value={name}>
                                    <Checkbox checked={fields.indexOf(name) > -1}/>
                                    <ListItemText primary={name}/>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl> : null}
                    <FormControl style={{marginTop: 5}}>
                        <Button variant="contained" onClick={saveFilter}>Save</Button>
                    </FormControl>
                </FormControl>
            </Grid>
            <div style={{maxHeight: 300, marginTop: 10}}>
                <TableVisualisation
                    data={data}
                    maxHeight={300}
                    width={window.innerWidth * 0.7}
                />
            </div>
        </div>
    );

    return (
        <>
            <Tooltip title="Filter" arrow TransitionComponent={Fade}>
                <IconButton edge="start" color="inherit" aria-label="menu"
                            onClick={handleOpen}>
                    <FilterListIcon/>
                </IconButton>
            </Tooltip>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="filter-graph-data"
                aria-describedby="filter-graph-data-description"
                className={classes.modal}
            >
                {body}
            </Modal>
        </>
    );
}

export default FilterDataModal;
