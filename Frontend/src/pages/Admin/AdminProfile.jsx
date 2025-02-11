import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import AdminContext from "../../contexts/AdminContext";
import AdminSidebar from "./AdminSidebar";

const AdminProfile = () => {
  const { admin } = useContext(AdminContext);
  const navigate = useNavigate();

  if (!admin) {
    return <div style={styles.message}>Please log in to view your profile.</div>;
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
          <Typography sx={styles.label}><strong>Username:</strong> {admin.username}</Typography>
          <Typography sx={styles.label}><strong>Email:</strong> {admin.email}</Typography>
          <Typography sx={styles.label}><strong>First Name:</strong> {admin.first_name || "Not provided"}</Typography>
          <Typography sx={styles.label}><strong>Last Name:</strong> {admin.last_name || "Not provided"}</Typography>
          <Typography sx={styles.label}><strong>Phone Number:</strong> {admin.phone_number || "Not provided"}</Typography>
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
  },
  profileContent: {
    flex: 1,
    padding: "50px",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  profileDetails: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
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
};

export default AdminProfile;
