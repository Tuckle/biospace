import React, {useEffect, useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import {
    Button, Checkbox, TextField, Typography,
    FormHelperText, InputLabel, Input, FormControl, Select, MenuItem, ListItemText
} from '@material-ui/core';
import {fetchUrl} from "../res/urls";
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


function AddProjectModal({data, handleClose, closed = true}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const [open, setOpen] = React.useState(!closed);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [allFields, setAllFields] = useState([]);
    const [fields, setFields] = useState([]);

    const handleOpen = () => {
        setOpen(true);
        handleClose()
    };

    const handleCloseModal = () => {
        setOpen(false);
    };

    const addProject = () => {
        fetchUrl("add_project", {
            "title": title,
            "description": description,
            "keys": fields
        }, (data) => {
            enqueueSnackbar("Successfully added project " + title)
            setTitle("")
            setDescription("")
            handleCloseModal()
        }, () => {
            enqueueSnackbar("Failed to add project")
        })
    };

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
            <FormControl style={{width: window.innerWidth * 0.6}}>
                <FormControl>
                    <InputLabel htmlFor="title">Title</InputLabel>
                    <Input id="title" type="text" aria-describedby="Enter project title"
                           onChange={(event) => {
                               setTitle(event.target.value)
                           }}
                    />
                </FormControl>
                <FormControl>
                    <InputLabel htmlFor="desc">Description</InputLabel>
                    <Input
                        id="desc"
                        type="text"
                        aria-describedby="Enter project description"
                        multiline
                        rows={5}
                        onChange={(event) => {
                            setDescription(event.target.value)
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
                    <Button onClick={addProject}>Add</Button>
                </FormControl>
            </FormControl>
        </div>
    );

    return (
        <MenuItem onClick={handleOpen}>
            <Typography>Add Project</Typography>
            <Modal
                open={open}
                onClose={handleCloseModal}
                aria-labelledby="add-project-title"
                aria-describedby="add-project-description"
                className={classes.modal}
            >
                {body}
            </Modal>
        </MenuItem>
    );
}

export default AddProjectModal;
