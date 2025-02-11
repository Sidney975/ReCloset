import React from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Corrected imports
import Login from './Login';
import RegisterAdmin from '../Admin/RegisterAdmin';
import LoginAdmin from '../Admin/LoginAdmin';

function Register() {
    const navigate = useNavigate();

    const formik = useFormik({
        initialValues: {
            username: "",
            password: "",
            email: ""
        },
        validationSchema: yup.object({
            username: yup.string().trim()
                .min(3, 'Name must be at least 3 characters')
                .max(50, 'Name must be at most 50 characters')
                .required('Name is required')
                .matches(/^[a-zA-Z '-,.]+$/, "Name only allows letters, spaces, and characters: ' - , ."),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
                .matches(/^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/, "Password must have at least 1 letter and 1 number"),
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required')
        }),
        onSubmit: (data) => {
            console.log("Form data before submit:", data);

            data.username = data.username.trim();
            data.password = data.password.trim();
            data.email = data.email.trim().toLowerCase();

            console.log("Cleaned form data:", data);

            http.post("/user/register", data)
                .then((res) => {
                    console.log("API Response:", res.data);
                    navigate("/login");
                })
                .catch(function (err) {
                    console.error("Error response:", err);
                    toast.error(`${err.response ? err.response.data.message : 'Unknown error occurred'}`);
                });
        }
    });

    return (
        <Box sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
        }}>
            <Typography variant="h5" sx={{ my: 2 }}>
                Register User
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }}
                onSubmit={formik.handleSubmit}>
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Name"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    helperText={formik.touched.username && formik.errors.username}
                />
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Password"
                    name="password" type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />
                <TextField
                    fullWidth margin="dense" autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Register
                </Button>
            </Box>
            <Button onClick={() => navigate("/login")} sx={{ mt: 2 }}>
                Login
            </Button>
            <Button onClick={() => navigate("/admin/login")} sx={{ mt: 2 }}>
                Login Admin
            </Button>
            <Button onClick={() => navigate("/admin/register")} sx={{ mt: 2 }}>
                Register Admin
            </Button>
            <ToastContainer />
        </Box>
    );
}

export default Register;
