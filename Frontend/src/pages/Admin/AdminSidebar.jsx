import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { AccountCircle, Edit, Lock } from "@mui/icons-material";

const AdminSidebar = ({ activeTab }) => {
  const navigate = useNavigate();

  return (
    <Box sx={styles.sidebar}>
      <h2 style={styles.sidebarTitle}>Admin Profile</h2>
      <List>
        <ListItem button selected={activeTab === "profile"} onClick={() => navigate("/admin/profile")}>
          <ListItemIcon><AccountCircle /></ListItemIcon>
          <ListItemText primary="Admin Profile" />
        </ListItem>
        <ListItem button selected={activeTab === "edit-profile"} onClick={() => navigate("/admin/edit-profile")}>
          <ListItemIcon><Edit /></ListItemIcon>
          <ListItemText primary="Edit Profile" />
        </ListItem>
        <ListItem button selected={activeTab === "change-password"} onClick={() => navigate("/admin/change-password")}>
          <ListItemIcon><Lock /></ListItemIcon>
          <ListItemText primary="Change Password" />
        </ListItem>
      </List>
    </Box>
  );
};

const styles = {
  sidebar: {
    width: "260px",
    backgroundColor: "#fff",
    boxShadow: "2px 0 10px rgba(0, 0, 0, 0.1)",
    padding: "25px 20px",
    height: "100vh",
  },
  sidebarTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "25px",
    textAlign: "center",
  },
};

export default AdminSidebar;
