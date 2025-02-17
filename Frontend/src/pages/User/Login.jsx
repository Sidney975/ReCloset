import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { Box, Typography, TextField, Button } from "@mui/material";
import { toast } from "react-toastify";
import UserContext from "../../contexts/UserContext";
import AdminContext from "../../contexts/AdminContext";
import http from "../../http";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const { setAdmin } = useContext(AdminContext);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      usernameOrEmail: "",
      password: "",
    },
    validationSchema: yup.object({
      usernameOrEmail: yup.string().required("Username or Email is required"),
      password: yup.string().required("Password is required"),
    }),
    onSubmit: (values) => {
      setLoading(true);
      http
        .post("/user/login", values)
        .then((res) => {
          localStorage.setItem("accessToken", res.data.accessToken);
          toast.success("Login successful");

          // Fetch user details after login
          http
            .get("/user/auth", {
              headers: { Authorization: `Bearer ${res.data.accessToken}` },
            })
            .then((authRes) => {
              const user = authRes.data.user;

              if (user.role === "Admin") {
                setAdmin(user); // ✅ Set admin context
                setUser(null); // ✅ Ensure user context is cleared
                localStorage.setItem("adminData", JSON.stringify(user));
                navigate("/admin/dashboard", { replace: true }); // ✅ Redirect Admin
              } else {
                setUser(user); // ✅ Set user context
                setAdmin(null); // ✅ Ensure admin context is cleared
                localStorage.setItem("userData", JSON.stringify(user));
                navigate("/", { replace: true }); // ✅ Redirect Customer
              }
            })
            .catch(() => {
              toast.error("Failed to fetch user data");
            });
        })
        .catch(() => {
          toast.error("Invalid credentials");
        })
        .finally(() => setLoading(false));
    },
  });

  return (
    <Box sx={{ width: "300px", margin: "auto", mt: 5 }}>
      <Typography variant="h5" sx={{ textAlign: "center", mb: 3 }}>
        Login
      </Typography>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          label="Username or Email"
          name="usernameOrEmail"
          value={formik.values.usernameOrEmail}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.usernameOrEmail && Boolean(formik.errors.usernameOrEmail)}
          helperText={formik.touched.usernameOrEmail && formik.errors.usernameOrEmail}
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
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <Typography variant="body2" sx={{ textAlign: "center", mt: 2 }}>
        Don't have an account? <Link to="/register">Register here</Link>
      </Typography>
    </Box>
  );
}

export default Login;
