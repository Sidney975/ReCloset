import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { Box, Typography, TextField, Button } from '@mui/material';
import { toast } from 'react-toastify';
import http from '../../http';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      userId: '',
      email: '',
      password: '',
    },
    validationSchema: yup.object({
      userId: yup.string().required('Username is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    }),
    onSubmit: (values) => {
      setLoading(true);
      http.post('/user/register', { ...values, role: 'Customer' })  // Default role
        .then(() => {
          toast.success('Registration successful');
          setTimeout(() => navigate('/login'), 1500); // Redirect to login after success
        })
        .catch((err) => {
          console.error('Registration Error:', err);
          toast.error('Registration failed');
        })
        .finally(() => setLoading(false));
    },
  });

  return (
    <Box sx={{ width: '300px', margin: 'auto', mt: 5 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 3 }}>Register</Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Username"
          name="userId"
          value={formik.values.userId}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.userId && Boolean(formik.errors.userId)}
          helperText={formik.touched.userId && formik.errors.userId}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          name="email"
          type="email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
      </form>

      {/* Link to Login Page */}
      <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
        Already have an account? <Link to="/login" style={{ color: '#1976D2', textDecoration: 'none' }}>Login here</Link>
      </Typography>
    </Box>
  );
}

export default Register;
