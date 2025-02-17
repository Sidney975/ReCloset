import './App.css';
import React, { useState, useEffect, useContext } from 'react';
import { Container } from '@mui/material';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from './themes/MyTheme';
import HomePage from './pages/Homepage';
import CustomerAppBar from './AppBar/CustomerAppBar';
import AdminAppBar from './AppBar/AdminAppBar';
// Import CartProvider
import { CartProvider } from './contexts/CartContext';

{/* Jerald's Imports */ }
import Checkout from './pages/Order/Checkout';
import ViewPayments from './pages/Payment/ViewPayment';
import AddPayment from './pages/Payment/AddPayment';
import EditPayment from './pages/Payment/EditPayment';
import ViewOrder from './pages/Order/ViewOrder';
import OrderDetails from './pages/Order/OrderDetail';
import AdminOrder from './pages/Order/AdminOrder';
import FashionConsultant from './pages/FashionAssistantStyly';

{/* Sarah's Imports */ }
import MyForm from './pages/User/MyForm';
import Login from './pages/User/Login';
import Register from './pages/User/Register';
import RegisterAdmin from './pages/Admin/RegisterAdmin';
import LoginAdmin from './pages/Admin/LoginAdmin';
import Profile from './pages/User/Profile';
import EditProfile from './pages/User/EditProfile';
import ChangePassword from './pages/User/ChangePassword';
import http from './http';
import UserContext from './contexts/UserContext';
import AdminContext from './contexts/AdminContext';
// Admin Dashboard Components
import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageUsers from "./pages/Admin/ManageUsers";
import ManageOrders from "./pages/Admin/ManageOrders";
import AdminProfile from "./pages/Admin/AdminProfile";
import EditAdminProfile from "./pages/Admin/EditAdminProfile";
import ChangeAdminPassword from "./pages/Admin/ChangePasswordAdmin";

{/* Sophie's Imports */ }
import Products from './pages/Product/Products';
import ProductDetail from './pages/Product/ProductDetail';
import AddProduct from './pages/Product/AddProduct';
import EditProduct from './pages/Product/EditProduct';
import Certifications from './pages/Product/Certifications';
import AddCertification from './pages/Product/AddCertification';
import AdminProducts from './pages/Product/AdminProduct';

{/* Sidney's Imports */ }
import Vouchers from './pages/Voucher/Vouchers';
import AddVoucher from './pages/Voucher/AddVouchers';
import EditVoucher from './pages/Voucher/EditVouchers';
import ClaimVoucher from './pages/Voucher/ClaimVoucher';
import UseVoucher from './pages/Voucher/UseVouchers';
import DeliveryAdmin from './pages/Delivery/Delivery';

function App() {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/user/auth').then((res) => {
        setUser(res.data.user);
      });
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      http.get('/admin/auth').then((res) => {
        setAdmin(res.data.admin);
      });
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <AdminContext.Provider value={{ admin, setAdmin }}>
        <CartProvider>
          <Router>
            <ThemeProvider theme={MyTheme}>
              {admin ? <AdminAppBar /> : <CustomerAppBar />}

              <ToastContainer />
              <Container>
                <Routes>
                  {/* Jerald's Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/Login" element={<Login />} />
                  <Route path="/Register" element={<Register />} />
                  <Route path="/Checkout" element={<Checkout />} />
                  <Route path="/Payments" element={<ViewPayments />} />
                  <Route path="/AddPayment" element={<AddPayment />} />
                  <Route path="/EditPayment/:id" element={<EditPayment />} />
                  <Route path="/ViewOrder" element={<ViewOrder />} />
                  <Route path="/OrderDetails/:orderId" element={<OrderDetails />} />
                  <Route path="/admin/orders" element={<AdminOrder />} />
                  <Route path="/FashionConsultant" element={<FashionConsultant />} />
                  
                  {/* Sarah's Routes */}
                  <Route path="/register" element={<Register />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/form" element={<MyForm />} />
                  <Route path="/change-password" element={<ChangePassword />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/edit-profile" element={<EditProfile />} />
                  
                  {/* Admin Pages */}
                  <Route path="/admin/login" element={<LoginAdmin />} />
                  <Route path="/admin/register" element={<RegisterAdmin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<ManageUsers />} />
                  <Route path="/admin/products" element={<AdminProducts />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                  <Route path="/admin/edit-profile" element={<EditAdminProfile />} />
                  <Route path="/admin/change-password" element={<ChangeAdminPassword />} />

                  {/* Sophie's Routes */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:productId" element={<ProductDetail />} />
                  <Route path="/addproduct" element={<AddProduct />} />
                  <Route path="/editproduct/:id" element={<EditProduct />} />
                  <Route path="/sustainabilitycertifications" element={<Certifications />} />
                  <Route path="/addcertification" element={<AddCertification />} />

                  <Route path="women’s-clothing" element={<Products />} />

                  {/* Sidney's Routes */}
                  <Route path="/voucher" element={<Vouchers />} />
                  <Route path="/addvoucher" element={<AddVoucher />} />
                  <Route path="/claimvoucher" element={<ClaimVoucher />} />
                  <Route path="/usevoucher" element={<UseVoucher />} />
                  <Route path="/editvoucher/:id" element={<EditVoucher />} />
                  <Route path="/admin/delivery" element={<DeliveryAdmin />} />

                  {/* Fallback Route */}
                  <Route path="*" element={<p>404 - Page Not Found</p>} />
                </Routes>
              </Container>
            </ThemeProvider>
          </Router>
        </CartProvider>
      </AdminContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
