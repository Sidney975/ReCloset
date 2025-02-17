import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import AdminContext from "../../contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";
import http from "../../http";

const AdminProfile = () => {
  const { admin, setAdmin } = useContext(AdminContext);
  const navigate = useNavigate();

  // ✅ Fetch admin profile dynamically
  useEffect(() => {
    if (!admin) {
      http
        .get("/user/auth", {
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
        })
        .then((res) => {
          setAdmin(res.data.user); // ✅ Store admin data in context
        })
        .catch(() => {
          navigate("/login"); // 🔄 Redirect if authentication fails
        });
    }
  }, [admin, navigate, setAdmin]);

  if (!admin) {
    return <div style={styles.message}>Loading admin details...</div>;
  }

  return (
    <Box sx={styles.container}>
      <AdminSidebar activeTab="profile" />
      <Box sx={styles.profileContent}>
        <Typography variant="h5" sx={styles.sectionTitle}>
          Admin Profile
          <IconButton onClick={() => navigate("/admin/edit-profile")} sx={styles.editButton}>
            <Edit />
          </IconButton>
        </Typography>
        <Box sx={styles.profileDetails}>
          <Typography sx={styles.label}><strong>Username:</strong> {admin.userId}</Typography>
          <Typography sx={styles.label}><strong>Email:</strong> {admin.email}</Typography>
          <Typography sx={styles.label}><strong>First Name:</strong> {admin.firstName || "Not provided"}</Typography>
          <Typography sx={styles.label}><strong>Last Name:</strong> {admin.lastName || "Not provided"}</Typography>
          <Typography sx={styles.label}><strong>Phone Number:</strong> {admin.phoneNumber || "Not provided"}</Typography>
          <Typography sx={styles.label}><strong>Address:</strong> {admin.address || "Not provided"}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f4f4f4", // Light gray background for contrast
  },
  profileContent: {
    flex: 1,
    padding: "50px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333", // Darker text for readability
  },
  profileDetails: {
    backgroundColor: "#fff", // White card background
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
  },
  label: {
    fontSize: "16px",
    color: "#444",
    marginBottom: "10px",
  },
  editButton: {
    cursor: "pointer",
    color: "#007bff",
  },
  message: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "18px",
    color: "red",
  },
};

export default AdminProfile;
