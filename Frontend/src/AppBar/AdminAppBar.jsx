import React, { useState, useContext } from "react";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  IconButton,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AdminContext from "../contexts/AdminContext";

const AdminAppBar = () => {
  const navigate = useNavigate();
  const { admin, setAdmin } = useContext(AdminContext);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAdmin(null);
    navigate("/loginadmin");
  };

  return (
    <>
      {/* Top Navigation Bar */}
      <MuiAppBar
        position="static"
        sx={{ backgroundColor: "white", color: "black", boxShadow: 1, width: "100%" }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Link to="/" style={{ textDecoration: "none", color: "black", fontWeight: "bold" }}>
                <Typography variant="h6" sx={{ fontSize: "1.5rem" }}>
                  <span style={{ fontWeight: "lighter" }}>RE</span>
                  <span style={{ fontWeight: "bold" }}>CLOSET</span>
                </Typography>
              </Link>
            </Box>

            {/* Admin Icons */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {admin && (
                <IconButton component={Link} to="/admin-dashboard" sx={{ color: "black", "&:hover": { color: "gray" } }}>
                  <AccountCircleIcon />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>{admin.username}</Typography>
                </IconButton>
              )}
              <IconButton onClick={logout} sx={{ color: "black", "&:hover": { color: "gray" } }}>
                <LogoutIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Logout</Typography>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </MuiAppBar>

      {/* Navigation Tabs */}
      <Box sx={{ display: "flex", justifyContent: "center", bgcolor: "#a67c52", py: 1, width: "100%" }}>
        <NavItem to="/admin-dashboard" label="Dashboard" />
        <NavItem to="/adminProducts" label="Products" />
        <NavItem to="/admin-orders" label="Orders" />
        <NavItem to="/vouchers" label="Vouchers" />
        <NavItem to="/delivery" label="Delivery" />
        <NavItem to="/users" label="Users" />
      </Box>
    </>
  );
};

/** ✅ **Reusable Navigation Item** */
const NavItem = ({ to, label }) => (
  <Link
    to={to}
    style={{
      textDecoration: "none",
      color: "white",
      margin: "0 15px",
      fontWeight: "bold",
      padding: "10px 15px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => (e.target.style.backgroundColor = "#8d6238")}
    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
  >
    {label}
  </Link>
);

export default AdminAppBar;
