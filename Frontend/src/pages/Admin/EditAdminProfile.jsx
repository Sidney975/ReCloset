import React, { useContext } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../../http";
import { ToastContainer, toast } from "react-toastify";
import AdminContext from "../../contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";

const EditAdminProfile = () => {
  const { admin, setAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  // 🛑 Prevents crash if admin is null
  if (!admin) {
    return <Typography>Loading...</Typography>;
  }

  const formik = useFormik({
    initialValues: {
      username: admin?.username || "",
      email: admin?.email || "",
      first_name: admin?.first_name || "",
      last_name: admin?.last_name || "",
      phone_number: admin?.phone_number || "",
      address: admin?.address || "",
    },
    validationSchema: yup.object({
      username: yup.string().trim().min(3, "Username must be at least 3 characters").max(50, "Username must be at most 50 characters").required("Username is required"),
      email: yup.string().trim().email("Enter a valid email").max(50, "Email must be at most 50 characters").required("Email is required"),
      first_name: yup.string().trim().max(50, "First name must be at most 50 characters").required("First name is required"),
      last_name: yup.string().trim().max(50, "Last name must be at most 50 characters").required("Last name is required"),
      phone_number: yup.string().matches(/^[89]\d{7}$/, "Phone number must start with 8 or 9 and be 8 digits long").required("Contact number is required"),
      address: yup.string().trim().max(100, "Address must be at most 100 characters").required("Address is required"),
    }),
    onSubmit: (data) => {
      http
        .put(`/admin/update/${admin.id}`, data) // ✅ Fixed backticks here
        .then(() => {
          toast.success("Profile updated successfully!");
          setAdmin({ ...admin, ...data });
          navigate("/admin/profile");
        })
        .catch(() => {
          toast.error("Failed to update profile.");
        });
    },
  });

  return (
    <Box sx={styles.container}>
      <AdminSidebar activeTab="edit-profile" />
      <Box sx={styles.content}>
        <Paper sx={styles.formContainer} elevation={3}>
          <Typography variant="h5" sx={styles.title}>
            Edit Admin Profile
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={styles.form}>
            <TextField fullWidth margin="dense" label="First Name" name="first_name" value={formik.values.first_name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.first_name && Boolean(formik.errors.first_name)} helperText={formik.touched.first_name && formik.errors.first_name} />
            <TextField fullWidth margin="dense" label="Last Name" name="last_name" value={formik.values.last_name} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.last_name && Boolean(formik.errors.last_name)} helperText={formik.touched.last_name && formik.errors.last_name} />
            <TextField fullWidth margin="dense" label="Phone Number" name="phone_number" value={formik.values.phone_number} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.phone_number && Boolean(formik.errors.phone_number)} helperText={formik.touched.phone_number && formik.errors.phone_number} />
            <TextField fullWidth margin="dense" label="Address" name="address" value={formik.values.address} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.address && Boolean(formik.errors.address)} helperText={formik.touched.address && formik.errors.address} />
            <Button fullWidth variant="contained" sx={styles.saveButton} type="submit">Save</Button>
            <Button fullWidth variant="outlined" sx={styles.cancelButton} onClick={() => navigate("/admin/profile")}>Cancel</Button>
          </Box>
        </Paper>
      </Box>
      <ToastContainer />
    </Box>
  );
};

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
    },
  },
  cancelButton: {
    marginTop: "10px",
    borderColor: "#007bff",
    color: "#007bff",
  },
};

export default EditAdminProfile;
