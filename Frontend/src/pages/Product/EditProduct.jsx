import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, Grid, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import http from "../../http";
import { useFormik } from 'formik';
import * as yup from 'yup';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [image, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        http.get(`/api/product/${id}`)
            .then((res) => {
                const { image, ...productData } = res.data;
                setImageFile(image);
                formik.setValues(productData);
                setLoading(false);
            })
            .catch((err) => console.error(err));
    }, [id]);

    const formik = useFormik({
        initialValues: {
            name: '',
            image: '',
            description: '',
            sustainabilityNotes: '',
            sizingChart: '',
            price: '',
            quality: false,
            brand: '',
            available: false,
            categoryId: '',
            warehouseId: '',
            certId: '',
        },
        enableReinitialize: true,
        validationSchema: yup.object({
            name: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(100, 'Name must be at most 100 characters')
                .required('Name is required'),
            image: yup.string().url('Image must be a valid URL')
                .max(255, 'Image URL must be at most 255 characters'),
            description: yup.string()
                .max(255, 'Description must be at most 255 characters'),
            sustainabilityNotes: yup.string()
                .max(255, 'Sustainability Notes must be at most 255 characters'),
            sizingChart: yup.string()
                .max(255, 'Sizing Chart must be at most 255 characters'),
            price: yup.number()
                .typeError('Price must be a number')
                .positive('Price must be positive')
                .required('Price is required'),
            quality: yup.boolean(),
            brand: yup.string()
                .max(50, 'Brand must be at most 50 characters'),
            available: yup.boolean(),
            categoryId: yup.number()
                .typeError('Category ID must be a number')
                .positive('Category ID must be positive')
                .integer('Category ID must be an integer')
                .required('Category ID is required'),
            warehouseId: yup.number()
                .typeError('Warehouse ID must be a number')
                .positive('Warehouse ID must be positive')
                .integer('Warehouse ID must be an integer')
                .required('Warehouse ID is required'),
            certId: yup.number()
                .typeError('Certification ID must be a number')
                .positive('Certification ID must be positive')
                .integer('Certification ID must be an integer')
                .nullable(),
        }),
        onSubmit: (data) => {
            if (image) {
                data.image = image;
            }
            data.name = data.name.trim();
            http.put(`/api/product/${id}`, data)
                .then(() => navigate("/adminproducts"))
                .catch((err) => console.error(err));
        },
    });

    const onFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 1024 * 1024) {
                toast.error('Maximum file size is 1MB');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);
            http.post('/file/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
                .then((res) => setImageFile(res.data.filename))
                .catch((err) => console.error(err));
        }
    };

    const [open, setOpen] = useState(false);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const deleteProduct = () => {
        http.delete(`/api/product/${id}`)
            .then(() => navigate("/adminproducts"))
            .catch((err) => console.error(err));
    };

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Edit Product
            </Typography>
            {!loading && (
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6} lg={8}>
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Name"
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
                                label="Sustainability Notes"
                                name="sustainabilityNotes"
                                value={formik.values.sustainabilityNotes}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.sustainabilityNotes && Boolean(formik.errors.sustainabilityNotes)}
                                helperText={formik.touched.sustainabilityNotes && formik.errors.sustainabilityNotes}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Sizing Chart"
                                name="sizingChart"
                                value={formik.values.sizingChart}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.sizingChart && Boolean(formik.errors.sizingChart)}
                                helperText={formik.touched.sizingChart && formik.errors.sizingChart}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Price"
                                name="price"
                                type="number"
                                value={formik.values.price}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.price && Boolean(formik.errors.price)}
                                helperText={formik.touched.price && formik.errors.price}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Brand"
                                name="brand"
                                value={formik.values.brand}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.brand && Boolean(formik.errors.brand)}
                                helperText={formik.touched.brand && formik.errors.brand}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Category ID"
                                name="categoryId"
                                type="number"
                                value={formik.values.categoryId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.categoryId && Boolean(formik.errors.categoryId)}
                                helperText={formik.touched.categoryId && formik.errors.categoryId}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Warehouse ID"
                                name="warehouseId"
                                type="number"
                                value={formik.values.warehouseId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.warehouseId && Boolean(formik.errors.warehouseId)}
                                helperText={formik.touched.warehouseId && formik.errors.warehouseId}
                            />
                            <TextField
                                fullWidth
                                margin="dense"
                                label="Certification ID (Optional)"
                                name="certId"
                                type="number"
                                value={formik.values.certId}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.certId && Boolean(formik.errors.certId)}
                                helperText={formik.touched.certId && formik.errors.certId}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} lg={4}>
                            <Box sx={{ textAlign: 'center', mt: 2 }}>
                                <Button variant="contained" component="label">
                                    Upload Image
                                    <input hidden accept="image/*" type="file" onChange={onFileChange} />
                                </Button>
                                {image && (
                                    <Box className="aspect-ratio-container" sx={{ mt: 2 }}>
                                        <img alt="product" src={`${import.meta.env.VITE_FILE_BASE_URL}${image}`} />
                                    </Box>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="contained" type="submit">
                            Update
                        </Button>
                        <Button variant="contained" color="error" sx={{ ml: 2 }} onClick={handleOpen}>
                            Delete
                        </Button>
                    </Box>
                </Box>
            )}

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
            <ToastContainer />
        </Box>
    );
}

export default EditProduct;
