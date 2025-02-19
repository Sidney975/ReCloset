import React, { useContext } from "react";
import { Box, Typography, TextField, Button, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../../http";
import { ToastContainer, toast } from "react-toastify";
import UserContext from "../../contexts/UserContext";
import Sidebar from "./Sidebar";

const EditProfile = () => {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      firstName: user?.firstname || "",
      lastName: user?.lastname || "",
      address: user?.address || "",
      phoneNumber: user?.phonenumber || "",
    },
    validationSchema: yup.object({
      firstName: yup
        .string()
        .trim()
        .max(50, "First name must be at most 50 characters")
        .required("First name is required"),
      lastName: yup
        .string()
        .trim()
        .max(50, "Last name must be at most 50 characters")
        .required("Last name is required"),
      address: yup
        .string()
        .trim()
        .max(100, "Address must be at most 100 characters")
        .required("Address is required"),
      phoneNumber: yup
        .string()
        .matches(
          /^[89]\d{7}$/,
          "Phone number must start with 8 or 9 and be 8 digits long"
        )
        .required("Contact number is required"),
    }),

    onSubmit: (data) => {
      http
        .put(`user/update-profile`, data)
        .then(() => {
          toast.success("Profile updated successfully!");
          setUser({ ...user, ...data });
          navigate("/profile");
        })
        .catch(() => {
          toast.error("Failed to update profile.");
        });
    },
  });

  return (
    <Box sx={styles.container}>
      <Sidebar activeTab="edit-profile" />
      <Box sx={styles.content}>
        <Paper sx={styles.formContainer} elevation={3}>
          <Typography variant="h5" sx={styles.title}>
            Edit Profile
          </Typography>
          <Box component="form" onSubmit={formik.handleSubmit} sx={styles.form}>
            <TextField
              fullWidth
              margin="dense"
              label="First Name"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
            />

            <TextField
              fullWidth
              margin="dense"
              label="Last Name"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.address && Boolean(formik.errors.address)}
              helperText={formik.touched.address && formik.errors.address}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Contact Number"
              name="phoneNumber"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)
              }
              helperText={
                formik.touched.phoneNumber && formik.errors.phoneNumber
              }
              inputProps={{ maxLength: 8 }} // Restrict input length to 8 digits
            />
            <Button
              fullWidth
              variant="contained"
              sx={styles.saveButton}
              type="submit"
            >
              Save
            </Button>
            <Button
              fullWidth
              variant="outlined"
              sx={styles.cancelButton}
              onClick={() => navigate("/profile")}
            >
              Cancel
            </Button>
          </Box>
        </Paper>
      </Box>
      <ToastContainer />
    </Box>
  );
};

// ✅ *Styles*
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

export default EditProfile;