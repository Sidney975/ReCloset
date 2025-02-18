import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, IconButton, Button, TextField } from '@mui/material';
import { Search, Clear, Edit } from '@mui/icons-material';
import http from "../../http";
import { useFormik } from 'formik';
import * as yup from 'yup';

function AddCertification() {
    const navigate = useNavigate();
    
    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
            qrCodeUrl: '',
        },
        validationSchema: yup.object({
            name: yup.string().required('Certification name is required'),
            description: yup.string(),
            qrCodeUrl: yup.string().url('Invalid URL format'),
        }),
        onSubmit: (data) => {
            http.post('/api/sustainabilitycertification', data).then(() => {
                navigate('/admin/sustainabilitycertifications');
            }).catch((error) => {
                console.error("API Error:", error);
            });
        },
    });

    return (
        <Box>
            <Typography variant="h5">Add Certification</Typography>
            <form onSubmit={formik.handleSubmit}>
                <TextField fullWidth label="Certification Name" name="name" value={formik.values.name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} margin="dense" />
                <TextField fullWidth label="Description" name="description" value={formik.values.description} onChange={formik.handleChange} margin="dense" />
                <TextField fullWidth label="QR Code URL" name="qrCodeUrl" value={formik.values.qrCodeUrl} onChange={formik.handleChange} margin="dense" />
                <Button type="submit" variant="contained" sx={{ mt: 2 }}>Submit</Button>
            </form>
        </Box>
    );
}

export default AddCertification;
