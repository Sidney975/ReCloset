import '../../App.css'; 
import React, { useState, useEffect, useContext } from 'react';
import { Container } from '@mui/material';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import MyTheme from '../../themes/MyTheme';

// App Bars
import CustomerAppBar from '../../AppBar/CustomerAppBar';
import AdminAppBar from '../../AppBar/AdminAppBar';

// Homepage
import HomePage from '../../pages/Homepage';

// Contexts
import http from '../../http';
import UserContext from '../../contexts/UserContext';
import AdminContext from '../../contexts/AdminContext';

/* --- User Imports --- */
import Login from '../../pages/User/Login';
import Register from '../../pages/User/Register';
import Profile from '../../pages/User/Profile';
import EditProfile from '../../pages/User/EditProfile';
import ChangePassword from '../../pages/User/ChangePassword';
import MyForm from '../../pages/User/MyForm';

/* --- Admin Imports --- */
import RegisterAdmin from '../../pages/Admin/RegisterAdmin';
import LoginAdmin from '../../pages/Admin/LoginAdmin';
import AdminDashboard from '../../pages/Admin/AdminDashboard';

/* --- Payment & Order Imports --- */
import Checkout from '../../pages/Order/Checkout';
import ViewPayments from '../../pages/Payment/ViewPayment';
import AddPayment from '../../pages/Payment/AddPayment';
import EditPayment from '../../pages/Payment/EditPayment';
import ViewOrder from '../../pages/Order/ViewOrder';
import OrderDetails from '../../pages/Order/OrderDetail';

/* --- Product Imports --- */
import Products from '../../pages/Product/Products';
import AddProduct from '../../pages/Product/AddProduct';
import EditProduct from '../../pages/Product/EditProduct';
import Certifications from '../../pages/Product/Certifications';
import AddCertification from '../../pages/Product/AddCertification';
import AdminProducts from '../../pages/Product/AdminProduct';

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
        <Router>
          <ThemeProvider theme={MyTheme}>
            {admin ? <AdminAppBar /> : <CustomerAppBar />}

            <ToastContainer />
            <Container>
              <Routes>
                {/* Customer Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payments" element={<ViewPayments />} />
                <Route path="/add-payment" element={<AddPayment />} />
                <Route path="/edit-payment/:id" element={<EditPayment />} />
                <Route path="/orders" element={<ViewOrder />} />
                <Route path="/order-details/:orderId" element={<OrderDetails />} />

                {/* User Routes */}
                <Route path="/form" element={<MyForm />} />
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />

                {/* Admin Routes */}
                <Route path="/admin/register" element={<RegisterAdmin />} />
                <Route path="/admin/login" element={<LoginAdmin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/orders" element={<AdminOrders />} /> {/* Ensure this file exists */}

                {/* Product Pages */}
                <Route path="/products" element={<Products />} />
                <Route path="/add-product" element={<AddProduct />} />
                <Route path="/edit-product/:id" element={<EditProduct />} />
                <Route path="/certifications" element={<Certifications />} />
                <Route path="/add-certification" element={<AddCertification />} />

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
