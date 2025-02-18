import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, MenuItem, Select, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, FormLabel, RadioGroup, FormControlLabel, Radio  } from '@mui/material';
import { Search, Clear, Edit } from '@mui/icons-material';
import http from "../../http";
import { useFormik } from 'formik';
import * as yup from 'yup';


function EditCertification() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cert, setCert] = useState(null);

    useEffect(() => {
        http.get(`/api/sustainabilitycertification/${id}`).then((res) => {
            setCert(res.data);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: cert || { name: '', description: '', qrCodeUrl: '' },
        enableReinitialize: true,
        onSubmit: (data) => {
            http.put(`/api/sustainabilitycertification/${id}`, data).then(() => {
                navigate('/admin/sustainabilitycertifications');
            });
        },
    });

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const deleteProduct = () => {
        http.delete(`/api/sustainabilitycertification/${id}`)
            .then(() => navigate("/admin/sustainabilitycertifications"))
            .catch((err) => console.error(err));
    };

    return cert ? (
        <Box>
            <Typography variant="h5">Edit Certification</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField fullWidth label="Certification Name" name="name" value={formik.values.name} onChange={formik.handleChange} margin="dense" />
                <TextField fullWidth label="Description" name="description" value={formik.values.description} onChange={formik.handleChange} margin="dense" />
                <TextField fullWidth label="QR Code URL" name="qrCodeUrl" value={formik.values.qrCodeUrl} onChange={formik.handleChange} margin="dense" />
                <Button type="submit" variant="contained" sx={{ ml: 2 }}>Update</Button>
                <Button variant="contained" color="error" sx={{ ml: 2 }} onClick={handleOpen}>
                    Delete
                </Button>
            </form>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Delete Product</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this product?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteProduct}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    ) : null;
}

export default EditCertification;