import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Grid2 as Grid } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from "../../http";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddVoucher() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            voucherName: "",
            voucherTypeEnum: "",
            pointsCost: "",
            expirationDate: "",
        },
        validationSchema: yup.object({
            voucherName: yup.string()
                .trim()
                .min(3, 'Voucher name must be at least 3 characters')
                .max(100, 'Voucher name must be at most 100 characters')
                .required('Voucher name is required'),
            voucherTypeEnum: yup.string()
                .oneOf(['PriceDeduction', 'FreeShipping'], 'Invalid voucher type')
                .required('Voucher type is required'),
            pointsCost: yup.number()
                .min(1, 'Points cost must be at least 1')
                .max(9999, 'Points cost must be at most 9999')
                .required('Points cost is required'),
            expirationDate: yup.date()
                .min(new Date(), 'Expiration date cannot be in the past')
                .nullable(),
        }),
        onSubmit: (data) => {
            // Trim string fields
            data.voucherName = data.voucherName.trim();

            http.post("/voucher", data)
                .then((res) => {
                    toast.success("Voucher added successfully!");
                    navigate("/voucher");
                })
                .catch((err) => {
                    console.error("Failed to add voucher:", err);
                    toast.error("Failed to add voucher. Please try again.");
                });
        }
    });

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Add Voucher
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6, lg: 8 }}>
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Voucher Name"
                            name="voucherName"
                            value={formik.values.voucherName}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.voucherName && Boolean(formik.errors.voucherName)}
                            helperText={formik.touched.voucherName && formik.errors.voucherName}
                        />
                        <TextField
                            select
                            fullWidth
                            margin="dense"
                            label="Voucher Type"
                            name="voucherTypeEnum"
                            value={formik.values.voucherTypeEnum}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.voucherTypeEnum && Boolean(formik.errors.voucherTypeEnum)}
                            helperText={formik.touched.voucherTypeEnum && formik.errors.voucherTypeEnum}
                        >
                            <MenuItem value="PriceDeduction">Price Deduction</MenuItem>
                            <MenuItem value="FreeShipping">Free Shipping</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            margin="dense"
                            type="number"
                            label="Points Cost"
                            name="pointsCost"
                            value={formik.values.pointsCost}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.pointsCost && Boolean(formik.errors.pointsCost)}
                            helperText={formik.touched.pointsCost && formik.errors.pointsCost}
                        />
                        <TextField
                            fullWidth
                            margin="dense"
                            type="date"
                            label="Expiration Date"
                            name="expirationDate"
                            value={formik.values.expirationDate}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.expirationDate && Boolean(formik.errors.expirationDate)}
                            helperText={formik.touched.expirationDate && formik.errors.expirationDate}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
                <Box sx={{ mt: 2 }}>
                    <Button variant="contained" type="submit">
                        Add
                    </Button>
                </Box>
            </Box>

            <ToastContainer />
        </Box>
    );
}

export default AddVoucher;
