import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid2 } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from "../../http";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddCertification() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
            qrCodeUrl: "", // Optional QR code URL

        },
        validationSchema: yup.object({
            name: yup.string()
                .trim()
                .min(3, 'Name must be at least 3 characters')
                .max(100, 'Name must be at most 100 characters')
                .required('Name is required'),
            description: yup.string()
                .max(255, 'Description must be at most 255 characters'),
            qrCodeUrl: yup.string()
                .url('Must be a valid URL').max(255),

        }),
        onSubmit: (data) => {
            http.post("/api/sustainabilitycertification", data)
                .then(() => {
                    toast.success("Certification added successfully");
                    navigate("/sustainabilitycertifications");
                })
                .catch((error) => {
                    console.error(error);
                    toast.error("Failed to add certification");
                });
        },
    });

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Certification
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 item xs={12}>
                        <TextField
                            fullWidth
                            margin="dense"
                            label="Certification Name"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.name && Boolean(formik.errors.name)}
                            helperText={formik.touched.name && formik.errors.name}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            multiline
                            minRows={2}
                            label="Description"
                            name="description"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.description && Boolean(formik.errors.description)}
                            helperText={formik.touched.description && formik.errors.description}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            label="QR Code URL (optional)"
                            name="qrCodeUrl"
                            value={formik.values.qrCodeUrl}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.qrCodeUrl && Boolean(formik.errors.qrCodeUrl)}
                            helperText={formik.touched.qrCodeUrl && formik.errors.qrCodeUrl}
                        />

                    </Grid2>
                </Grid2>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" type="submit">
                        Add Certification
                    </Button>
                </Box>
            </Box>
            <ToastContainer />
        </Box>
    );
}

export default AddCertification;
