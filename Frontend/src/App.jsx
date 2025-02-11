import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import MyTheme from "./themes/MyTheme";
import HomePage from "./pages/Homepage";
import CustomerAppBar from "./AppBar/CustomerAppBar";
import AdminAppBar from "./AppBar/AdminAppBar";

// Contexts
import http from "./http";
import UserContext from "./contexts/UserContext";
import AdminContext from "./contexts/AdminContext";

// Admin Dashboard Components
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageOrders from "./pages/Admin/ManageOrders";
import ManageProducts from "./pages/Admin/ManageProducts";

// User Components
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import Profile from "./pages/User/Profile";
import EditProfile from "./pages/User/EditProfile";
import ChangePassword from "./pages/User/ChangePassword";

// Admin Components
import RegisterAdmin from "./pages/Admin/RegisterAdmin";
import LoginAdmin from "./pages/Admin/LoginAdmin";
import AdminProfile from "./pages/Admin/AdminProfile";
import EditAdminProfile from "./pages/Admin/EditAdminProfile";
import ChangeAdminPassword from "./pages/Admin/ChangePasswordAdmin";

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http
        .get("/user/auth")
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem("accessToken"); // Remove token if invalid
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http
        .get("/admin/auth")
        .then((res) => setAdmin(res.data.admin))
        .catch(() => {
          localStorage.removeItem("accessToken"); // Remove token if invalid
          setAdmin(null);
        });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AdminContext.Provider value={{ admin, setAdmin }}>
        <Router>
          <ThemeProvider theme={MyTheme}>
            {admin ? <AdminAppBar /> : <CustomerAppBar />}
            <ToastContainer />
            <Container>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/admin/register" element={<RegisterAdmin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/dashboard/*" element={<AdminDashboard />}>
                  <Route path="users" element={<ManageUsers />} />
                  <Route path="orders" element={<ManageOrders />} />
                  <Route path="products" element={<ManageProducts />} />
                </Route>
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route
                  path="/admin/edit-profile"
                  element={<EditAdminProfile />}
                />
                <Route
                  path="/admin/change-password"
                  element={<ChangeAdminPassword />}
                />

                {/* Fallback Route */}
                <Route path="*" element={<p>404 - Page Not Found</p>} />
              </Routes>
            </Container>
          </ThemeProvider>
        </Router>
      </AdminContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
