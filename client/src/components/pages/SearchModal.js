import React from 'react';
import {Route} from 'react-router-dom';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {Button, Checkbox, TextField} from '@material-ui/core';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import {getUrl} from "../res/urls";

const icon = <CheckBoxOutlineBlankIcon fontSize="small"/>;
const checkedIcon = <CheckBoxIcon fontSize="small"/>;
const myKeys = [
    {key: 'bioinformatics', count: 100},
    {key: 'biomaterial', count: 100},
    {key: 'tissue engineering', count: 100},
    {key: 'biotechnology', count: 100},
]

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
    },
}));


function ModalSearch({closed = true}) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(!closed);
    const [selected, setSelected] = React.useState([]);

    let keys = JSON.parse(localStorage.getItem("keywordsList") || "[]");
    if (!keys.length) {
        keys = fetch(getUrl("graph/keywords"))
            .then(res => res.json())
            .then((data) => {
                localStorage.setItem("keywordsDict", JSON.stringify(data["info"]));
                let keywordsList = Array();
                for (let key in data["info"]) {
                    keywordsList.push({"key": key, "count": data["info"][key]})
                }
                keys = keywordsList;
                localStorage.setItem("keywordsList", JSON.stringify(keywordsList));
            })
            .catch(console.log)
    }
    keys = keys.sort((a, b) => (a.count < b.count) ? 1 : -1);
    keys = keys.slice(0, 1000);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const goToSpace = ({history, searchString}) => {
        fetch(
            getUrl("space"), {
                method: 'post',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "keys": searchString,
                })
            })
            .then(function (response) {
                return response.json()
            })
            .then(function (data) {
                if (data['id']) {
                    history.push('/s/' + data['id'])
                }
            })
    };

    const body = (
        <div className={classes.paper}>
            <p id="simple-modal-description">
                Pick keywords
            </p>
            <Autocomplete
                multiple
                id="keywords-select"
                options={keys}
                disableCloseOnSelect
                getOptionLabel={(option) => option.key}
                renderOption={(option, {selected}) => (
                    <React.Fragment>
                        <Checkbox
                            icon={icon}
                            checkedIcon={checkedIcon}
                            style={{marginRight: 8}}
                            checked={selected}
                        />
                        {option.key}
                    </React.Fragment>
                )}
                style={{width: 500}}
                renderInput={(params) => (
                    <TextField {...params} variant="outlined" label="Keywords" placeholder="Bio"/>
                )}
                onChange={(event, value) => {
                    setSelected(value.map((d) => d.key).sort())
                }}
            />
            <Route render={({history}) => (
                <Button
                    onClick={() => {
                        const searchString = selected.join(',');
                        goToSpace({history, searchString});
                    }}
                >
                    Search
                </Button>
            )}/>
        </div>
    );

    return (
        <div>
            <Button onClick={handleOpen}>
                Search
            </Button>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="simple-modal-title"
                aria-describedby="simple-modal-description"
                className={classes.modal}
            >
                {body}
            </Modal>
        </div>
    );
}

export default ModalSearch;
