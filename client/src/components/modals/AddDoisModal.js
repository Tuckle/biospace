import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {addDois} from "../res/data";
import {
    Button, Checkbox, TextField, Typography,
    FormHelperText, InputLabel, Input, FormControl, Select, MenuItem, ListItemText
} from '@material-ui/core';
import {useSnackbar} from "notistack";

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


function AddDoisModal({data, handleClose, closed = true}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [open, setOpen] = React.useState(!closed);

    const [doiList, setDoiList] = useState("");
    const [allFields, setAllFields] = useState([]);
    const [fields, setFields] = useState([]);

    const handleOpen = () => {
        setOpen(true);
        handleClose()
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    const addDoiList = () => {
        const dois = doiList.split('\n').map((item, index) => {
            if (item.startsWith('doi://')) {
                return item.substring(6, item.length)
            }
            if (item.startsWith('http')) {
                return item.split('doi.org/', 1)[1]
            }
            return item
        })
        let myDois = [...dois];
        addDois(dois, (data) => {
            Object.keys(data).forEach((key, index) => {
                let ind = dois.indexOf(key);
                if (ind !== -1) {
                    dois.splice(ind, 1);
                }
            })
            if (myDois.length > 0) {
                setDoiList(myDois.join("\n"))
                enqueueSnackbar("Successfully added all DOIs except those remaining in text box.")
            } else {
                setDoiList("")
                enqueueSnackbar("Successfully added all DOIs.")
                handleCloseModal()
            }
        }, fields)
    }

    const updateFields = () => {
        try {
            let myFields = {};
            data["nodes"].filter((item) => {
                return item["type"] === "field"
            }).forEach((item) => {
                myFields[item["id"]] = true
            })
            setAllFields(Object.keys(myFields));
            // setFields(allFields);
        } catch (e) {

        }
    }

    const handleChangeFields = (event) => {
        setFields(event.target.value);
    };

    useEffect(() => {
        updateFields()
    }, [])

    useEffect(() => {
        updateFields()
    }, [data])

    const body = (
        <div className={classes.paper}>
            <FormControl style={{width: window.innerWidth * 0.45}}>
                <FormControl>
                    <InputLabel htmlFor="dois">DOIs</InputLabel>
                    <Input
                        id="dois"
                        value={doiList}
                        type="text"
                        placeholder="Enter one doi per line"
                        aria-describedby="Enter one doi per line"
                        multiline
                        rows={6}
                        onChange={(event) => {
                            setDoiList(event.target.value)
                        }}/>
                </FormControl>
                {allFields.length > 0 ? <FormControl fullWidth style={{paddingTop: 1}}>
                    <InputLabel shrink id="connect-to-label">Connect to</InputLabel>
                    <Select
                        labelId="connect-to-label"
                        id="connect-to"
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
                <FormControl>
                    <Button onClick={addDoiList}>Add</Button>
                </FormControl>
            </FormControl>
        </div>
    );

    return (
        <MenuItem onClick={handleOpen}>
            <Typography>Add DOIs</Typography>
            <Modal
                open={open}
                onClose={handleCloseModal}
                aria-labelledby="add-dois-title"
                aria-describedby="add-dois-description"
                className={classes.modal}
            >
                {body}
            </Modal>
        </MenuItem>
    );
}

export default AddDoisModal;
