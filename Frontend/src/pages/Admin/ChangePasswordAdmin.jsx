import React, { useContext, useState } from "react";
import { Box, Typography, TextField, Button, IconButton, InputAdornment, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import http from "../../http";
import { ToastContainer, toast } from "react-toastify";
import AdminContext from "../../contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";

const ChangeAdminPassword = () => {
    const { admin } = useContext(AdminContext);
    const navigate = useNavigate();

    if (!admin) {
        return <Typography sx={styles.errorMessage}>Please log in to change your password.</Typography>;
    }

    // **State for password visibility toggle**
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const togglePasswordVisibility = () => setShowPassword(!showPassword);
    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    const formik = useFormik({
        initialValues: {
            newPassword: "",
            confirmPassword: "",
        },
        validationSchema: yup.object({
            newPassword: yup.string().trim()
                .min(8, "Password must be at least 8 characters")
                .max(50, "Password must be at most 50 characters")
                .required("Password is required"),
            confirmPassword: yup.string()
                .oneOf([yup.ref("newPassword"), null], "Passwords must match")
                .required("Confirm Password is required"),
        }),
        onSubmit: (data) => {
            http.put(`/admin/update/${admin.id}`, { password: data.newPassword })
                .then(() => {
                    toast.success("Password updated successfully!");
                    navigate("/admin/profile");
                })
                .catch(() => {
                    toast.error("Failed to update password.");
                });
        }
    });

    return (
        <Box sx={styles.container}>
            {/* Sidebar */}
            <AdminSidebar activeTab="change-password" />

            {/* Content */}
            <Box sx={styles.content}>
                <Paper sx={styles.formContainer} elevation={3}>
                    <Typography variant="h5" sx={styles.title}>Change Password</Typography>
                    <Box component="form" onSubmit={formik.handleSubmit} sx={styles.form}>
                        {/* New Password Field */}
                        <TextField
                            fullWidth margin="dense" label="New Password" name="newPassword"
                            type={showPassword ? "text" : "password"} // Toggle password visibility
                            value={formik.values.newPassword} onChange={formik.handleChange}
                            error={formik.touched.newPassword && Boolean(formik.errors.newPassword)}
                            helperText={formik.touched.newPassword && formik.errors.newPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={togglePasswordVisibility} edge="end">
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        {/* Confirm Password Field */}
                        <TextField
                            fullWidth margin="dense" label="Confirm New Password" name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"} // Toggle confirm password visibility
                            value={formik.values.confirmPassword} onChange={formik.handleChange}
                            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={toggleConfirmPasswordVisibility} edge="end">
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <Button fullWidth variant="contained" sx={styles.saveButton} type="submit">Submit</Button>
                        <Button fullWidth variant="outlined" sx={styles.cancelButton} onClick={() => navigate("/admin/profile")}>Cancel</Button>
                    </Box>
                </Paper>
            </Box>
            <ToastContainer />
        </Box>
    );
};

// ✅ **Improved Styles**
const styles = {
    container: {
        display: "flex",
        height: "100vh",
        backgroundColor: "#f8f9fa",
    },
    content: {
        flex: 1,
        padding: "50px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        width: "100%",
        maxWidth: "500px",
        padding: "30px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    title: {
        fontSize: "22px",
        fontWeight: "bold",
        marginBottom: "20px",
        textAlign: "center",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },
    saveButton: {
        marginTop: "15px",
        backgroundColor: "#007bff",
        color: "#fff",
        "&:hover": {
            backgroundColor: "#0056b3",
        }
    },
    cancelButton: {
        marginTop: "10px",
        borderColor: "#007bff",
        color: "#007bff",
    },
    errorMessage: {
        textAlign: "center",
        marginTop: "20px",
        fontSize: "18px",
        color: "red",
    },
};

export default ChangeAdminPassword;
