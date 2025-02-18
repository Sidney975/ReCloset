import "./App.css";
import React, { useState, useEffect, useContext } from "react";
import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import MyTheme from "./themes/MyTheme";
import HomePage from "./pages/Homepage";
import CustomerAppBar from "./AppBar/CustomerAppBar";
import AdminAppBar from "./AppBar/AdminAppBar";
import { CartProvider } from "./contexts/CartContext";

// Jerald's Imports
import Checkout from './pages/Order/Checkout';
import ViewPayments from './pages/Payment/ViewPayment';
import AddPayment from './pages/Payment/AddPayment';
import EditPayment from './pages/Payment/EditPayment';
import ViewOrder from './pages/Order/ViewOrder';
import OrderDetails from './pages/Order/OrderDetail';
import AdminOrder from './pages/Order/AdminOrder';
import FashionConsultant from './pages/FashionAssistantStyly';
import Chatbot from "./components/Chatbot";

// Sarah's Imports
import MyForm from "./pages/User/MyForm";
import Login from "./pages/User/Login";
import Register from "./pages/User/Register";
import Profile from "./pages/User/Profile";
import EditProfile from "./pages/User/EditProfile";
import ChangePassword from "./pages/User/ChangePassword";
import http from "./http";
import UserContext from "./contexts/UserContext";
import AdminContext from "./contexts/AdminContext";

// Admin Components
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageOrders from "./pages/Admin/ManageOrders";
import AdminProfile from "./pages/Admin/AdminProfile";
import EditAdminProfile from "./pages/Admin/EditAdminProfile";
import ChangeAdminPassword from "./pages/Admin/ChangePasswordAdmin";

// Sophie's Imports
import Products from './pages/Product/Products';
import ProductDetail from './pages/Product/ProductDetail';
import AddProduct from './pages/Product/AddProduct';
import EditProduct from './pages/Product/EditProduct';
import Certifications from './pages/Product/Certifications';
import AddCertification from './pages/Product/AddCertification';
import AdminProducts from './pages/Product/AdminProduct';
import UpcyclingRequests from './pages/Product/UpcyclingRequests';
import ArTryOn from './pages/Product/ARTryOn';

// Sidney's Imports
import Vouchers from "./pages/Voucher/Vouchers";
import AddVoucher from "./pages/Voucher/AddVouchers";
import EditVoucher from "./pages/Voucher/EditVouchers";
import ClaimVoucher from "./pages/Voucher/ClaimVoucher";
import UseVoucher from "./pages/Voucher/UseVouchers";
import DeliveryAdmin from "./pages/Delivery/Delivery";

function AppContent() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const location = useLocation(); // ✅ Get current page

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      http
        .get("/user/auth", { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
          if (res.data.user.role === "Admin") {
            setAdmin(res.data.user);
            setUser(null);
            localStorage.setItem("adminData", JSON.stringify(res.data.user));
          } else {
            setUser(res.data.user);
            setAdmin(null);
            localStorage.setItem("userData", JSON.stringify(res.data.user));
          }
        })
        .catch(() => {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("adminData");
          localStorage.removeItem("userData");
        });
    }
  }, []);

  // ✅ Show AdminAppBar only when in the admin section
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AdminContext.Provider value={{ admin, setAdmin }}>
        <CartProvider>
          <ThemeProvider theme={MyTheme}>
            {isAdminPage && admin ? <AdminAppBar /> : <CustomerAppBar />}

            <ToastContainer />
            <Container>
              <Routes>
                {/* Jerald's Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/Checkout" element={<Checkout />} />
                <Route path="/Payments" element={<ViewPayments />} />
                <Route path="/AddPayment" element={<AddPayment />} />
                <Route path="/EditPayment/:id" element={<EditPayment />} />
                <Route path="/ViewOrder" element={<ViewOrder />} />
                <Route path="/OrderDetails/:orderId" element={<OrderDetails />} />
                <Route path="/admin/orders" element={<AdminOrder />} />
                <Route path="/FashionConsultant" element={<FashionConsultant />} />

                {/* Sidney's Routes */}
                <Route path="/admin/voucher" element={<Vouchers />} />
                <Route path="/addvoucher" element={<AddVoucher />} />
                <Route path="/claimvoucher" element={<ClaimVoucher />} />
                <Route path="/usevoucher" element={<UseVoucher />} />
                <Route path="/editvoucher/:id" element={<EditVoucher />} />
                <Route path="/admin/delivery" element={<DeliveryAdmin />} />

                {/* Sophie's Routes */}
                <Route path="/product/men" element={<Products />} />
                <Route path="/product/women" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/addproduct" element={<AddProduct />} />
                <Route path="/editproduct/:id" element={<EditProduct />} />
                <Route path="/upcycling-requests" element={<UpcyclingRequests />} />
                <Route path="/sustainabilitycertifications" element={<Certifications />} />
                <Route path="/addcertification" element={<AddCertification />} />
                <Route path="/ar-tryon/:productId" element={<ArTryOn />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                
                {/* Sarah's Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
                <Route path="/admin/edit-profile" element={<EditAdminProfile />} />
                <Route path="/admin/change-password" element={<ChangeAdminPassword />} />

                {/* Fallback Route */}
                <Route path="*" element={<p>404 - Page Not Found</p>} />
              </Routes>
              <Chatbot />
            </Container>
          </ThemeProvider>
        </CartProvider>
      </AdminContext.Provider>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;