import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Grid2 as Grid } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import http from "../../http";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [voucher, setVoucher] = useState({
        voucherName: "",
        voucherTypeEnum: "",
        pointsCost: "",
        expirationDate: ""
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get(`/voucher/${id}`).then((res) => {
            setVoucher(res.data);
            setLoading(false);
        }).catch(err => {
            console.error("Failed to fetch voucher:", err);
        });
    }, [id]);

    const formik = useFormik({
        initialValues: voucher,
        enableReinitialize: true,
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
                .nullable()
                .required('Expiration date is required')
        }),
        onSubmit: (data) => {
            http.put(`/voucher/${id}`, data)
                .then((res) => {
                    toast.success("Voucher updated successfully!");
                    navigate("/vouchers");
                })
                .catch(err => {
                    console.error("Failed to update voucher:", err);
                    toast.error("Failed to update voucher. Please try again.");
                });
        }
    });

    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const deleteVoucher = () => {
        http.delete(`/voucher/${id}`)
            .then((res) => {
                toast.success("Voucher deleted successfully!");
                navigate("/voucher");
            })
            .catch(err => {
                console.error("Failed to delete voucher:", err);
                toast.error("Failed to delete voucher. Please try again.");
            });
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Voucher
            </Typography>
            {
                !loading && (
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
                                Update
                            </Button>
                            <Button variant="contained" sx={{ ml: 2 }} color="error" onClick={handleOpen}>
                                Delete
                            </Button>
                        </Box>
                    </Box>
                )
            }

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>
                    Delete Voucher
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this voucher?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="inherit" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="contained" color="error" onClick={deleteVoucher}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </Box>
    );
}

export default EditVoucher;
