import React, { useContext, useEffect } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../../contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);

    useEffect(() => {
        console.log("Updated User:", user);
    }, [user]); 

    const formik = useFormik({
        initialValues: {
            email: "jeraldliu@gmail.com",
            password: "P@ssw0rd"
        },
        validationSchema: yup.object({
            email: yup.string().trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required'),
            password: yup.string().trim()
                .min(8, 'Password must be at least 8 characters')
                .max(50, 'Password must be at most 50 characters')
                .required('Password is required')
        }),
        onSubmit: (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            console.log(data)
            http.post("/user/login", data)
                .then((res) => {
                    console.log("Response received:", res); // Log response
                    console.log("Response data:", res.data); // Log response data
                    console.log("User data Only:", res.data.user);
                    if (!res.data) {
                        throw new Error("Response data is undefined");
                    }
                    // ✅ Ensure res.data exists before accessing properties
                    if (!res.data || !res.data.user || !res.data.accessToken) {
                        throw new Error("Invalid API response format");
                    }
                    localStorage.setItem("accessToken", res.data.accessToken);
                    setUser(res.data.user);
                    navigate("/");
                })
                .catch(function (err) {
                    console.error("Error response:", err);
                    toast.error(err.response?.data?.message || "Login failed");
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
                Login User
            </Typography>
            <Box component="form" sx={{ maxWidth: '500px' }}
                onSubmit={formik.handleSubmit}>
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
                <Button fullWidth variant="contained" sx={{ mt: 2 }}
                    type="submit">
                    Login
                </Button>
            </Box>
            <Button onClick={() => navigate("/register")} sx={{ mt: 2 }}>
                Register
            </Button>
            <Button onClick={() => navigate("/loginadmin")} sx={{ mt: 2 }}>
                Login Admin
            </Button>
            <Button onClick={() => navigate("/registeradmin")} sx={{ mt: 2 }}>
                Register Admin
            </Button>
            <ToastContainer />
        </Box>
    );
}

export default Login;