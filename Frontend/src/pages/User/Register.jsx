import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { 
  Box, Typography, TextField, Button, IconButton, InputAdornment 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { toast } from 'react-toastify';
import http from '../../http';

function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      userId: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: yup.object({
      userId: yup.string().required('Username is required'),
      email: yup.string().email('Invalid email').required('Email is required'),
      password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
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
        {/* Password Field with Toggle Visibility */}
        <TextField
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        {/* Confirm Password Field with Toggle Visibility */}
        <TextField
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          fullWidth
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                  {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
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
