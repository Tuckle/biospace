import React, {useEffect, useState, useCallback, useRef} from 'react';
import {withStyles, makeStyles, fade} from '@material-ui/core/styles';
import {
    Table, TableBody, TableCell,
    TableRow, TableHead, TableContainer,
    Paper, Typography, Grid, InputBase, Link
} from "@material-ui/core";
import {filterByType} from "../res/data";
import TableViewIcon from "../icons/TableViewIcon";
import SearchIcon from '@material-ui/icons/Search';

const StyledTableCell = withStyles((theme) => ({
    head: {
        backgroundColor: theme.palette.common.black,
        color: theme.palette.common.white,
    },
    body: {
        fontSize: 14,
    },
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.action.hover,
        },
    },
}))(TableRow);

const StyledPaper = withStyles((theme) => ({
    root: {
        // backgroundColor: '#212121'
    }
}))(Paper);

function getPapersCellsFrom(data) {
    console.log(data["nodes"][3]);
    return filterByType(data, "paper")["nodes"].map((row) => (
        <StyledTableRow key={row.id}>
            <StyledTableCell component="th" scope="row">
                <Link href={row.url} target="_blank">
                    {row.name ? row.name : "-"}
                </Link>
            </StyledTableCell>
            <StyledTableCell>
                {row.date ? row.date.toString().substr(0, 10) : row.year ? row.year : '-'}
            </StyledTableCell>
            <StyledTableCell align="right">{row.c ? row.c : '-'}</StyledTableCell>
            <StyledTableCell align="right">{row.r ? row.r : '-'}</StyledTableCell>
            <StyledTableCell align="right">{row.t ? row.t in ["1", "0"] ? 'paper' : row.t : '-'}</StyledTableCell>
            <StyledTableCell align="right">-</StyledTableCell>
        </StyledTableRow>
    ))
}

function getFieldsCellsFrom(data) {
    return filterByType(data, "field")["nodes"].map((row) => (
        <StyledTableRow key={row.id}>
            <StyledTableCell component="th" scope="row">{row.id}</StyledTableCell>
            <StyledTableCell
                align="right">{(data["links"] || []).filter(item => item.target.id === row.id).length}</StyledTableCell>
            <StyledTableCell align="right">-</StyledTableCell>
        </StyledTableRow>
    ))
}

function getConnectionsCellsFrom(data) {
    console.log(data["links"][0])
    return data["links"].map((row) => (
        <StyledTableRow key={row.source.id + row.target.id}>
            <StyledTableCell component="th" scope="row">{row.source.name}</StyledTableCell>
            {/*<StyledTableCell>-</StyledTableCell>*/}
            <StyledTableCell align="right">{row.target.id}</StyledTableCell>
        </StyledTableRow>
    ))
}

function TableVisualisation({data, width = 500, maxHeight = window.innerHeight}) {
    const classes = useStyles();
    const [tableType, setTableType] = useState(0);

    const headerNames = {
        0: [["Title", {}], ["Date", {align: "right"}],
            ["Citations", {align: "right"}],
            ["References", {align: "right"}],
            ["Type", {align: "right"}],
            ["Options", {align: "right"}]],
        1: [["Name", {}], ["Connections", {align: "right"}], ["Opt", {align: "right"}]],
        2: [["From", {}], ["To", {}]]
    };

    const tableCells = {
        0: getPapersCellsFrom,
        1: getFieldsCellsFrom,
        2: getConnectionsCellsFrom
    }

    return (
        <TableContainer component={Paper} style={{width: width, maxHeight: maxHeight}}>
            <Grid container
                  spacing={3}
                  justify={"space-between"}
                  alignItems={"center"}
            >
                <Grid item xs={3}>
                    <TableViewIcon
                        value={tableType}
                        setValue={setTableType}
                    />
                </Grid>
                <Grid item xs={3}>
                    <div className={classes.search}>
                        <div className={classes.searchIcon}>
                            <SearchIcon/>
                        </div>
                        <InputBase
                            placeholder="Search…"
                            classes={{
                                root: classes.inputRoot,
                                input: classes.inputInput,
                            }}
                            inputProps={{'aria-label': 'search'}}
                        />
                    </div>
                </Grid>
            </Grid>
            <Table stickyHeader aria-label="data-table">
                <TableHead>
                    {headerNames[tableType].map((header) => (
                        <StyledTableCell align={header[1]["align"]}>{header[0]}</StyledTableCell>
                    ))}
                </TableHead>
                <TableBody>
                    {tableCells[tableType](data)}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: fade(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: fade(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(1),
            width: 'auto',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 2),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
}));

export default TableVisualisation;
