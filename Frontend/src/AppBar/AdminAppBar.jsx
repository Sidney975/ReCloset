import React, { useContext } from "react";
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
import UserContext from "../contexts/UserContext";  

const AdminAppBar = () => {
  const navigate = useNavigate();
  const { admin, setAdmin } = useContext(AdminContext);
  const { setUser } = useContext(UserContext);  
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminData");
    localStorage.removeItem("userData");

    setAdmin(null);
    setUser(null);

    navigate("/login", { replace: true });
};


  return (
    <>
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
                <IconButton component={Link} to="/admin/profile" sx={{ color: "black", "&:hover": { color: "gray" } }}>
                  <AccountCircleIcon />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>{admin.userId}</Typography>
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

      {/* ✅ Navigation Tabs Added Here */}
      <Box sx={{ display: "flex", justifyContent: "center", bgcolor: "#a67c52", py: 1, width: "100%" }}>
        {[
          { to: "/admin/dashboard", label: "Dashboard" },
          { to: "/admin/products", label: "Products" },
          { to: "/admin/orders", label: "Orders" },
          { to: "/admin/vouchers", label: "Vouchers" },
          // { to: "/admin/delivery", label: "Delivery" },
          { to: "/admin/users", label: "Users" }
        ].map((item, index) => (
          <NavItem key={index} to={item.to} label={item.label} />
        ))}
      </Box>
    </>
  );
};

/** ✅ *Reusable Navigation Item Component* */
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
