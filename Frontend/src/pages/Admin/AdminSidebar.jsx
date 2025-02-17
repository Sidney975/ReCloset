import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Box, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import { AccountCircle, Edit, Lock, Dashboard } from "@mui/icons-material";
import AdminContext from "../../contexts/AdminContext";

const AdminSidebar = ({ activeTab }) => {
    const navigate = useNavigate();
    const { admin } = useContext(AdminContext);

    if (!admin) {
        return <div>Loading...</div>; 
    }

    return (
        <Box sx={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Admin Panel</h2>
            <List>
                
                <ListItem button selected={activeTab === "profile"} onClick={() => navigate("/admin/profile")}>
                    <ListItemIcon><AccountCircle /></ListItemIcon>
                    <ListItemText primary="My Profile" />
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
    width: "250px",
    height: "100vh",
    backgroundColor: "#fff",
    boxShadow: "2px 0px 5px rgba(0, 0, 0, 0.1)",
    padding: "20px",
  },
  listItem: {
    cursor: "pointer",
    padding: "10px",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
};


export default AdminSidebar;
