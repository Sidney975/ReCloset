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


{/* Jerald's Imports */ }
import Checkout from './pages/Order/Checkout';
import ViewPayments from './pages/Payment/ViewPayment';
import AddPayment from './pages/Payment/AddPayment';
import EditPayment from './pages/Payment/EditPayment';
import ViewOrder from './pages/Order/ViewOrder';
import OrderDetails from './pages/Order/OrderDetail';

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
import AdminDashboard from "./pages/Admin/AdminDashboard";


{/* Sophie's Imports */ }
import Products from './pages/Product/Products';
import AddProduct from './pages/Product/AddProduct';
import EditProduct from './pages/Product/EditProduct';
import Certifications from './pages/Product/Certifications';
import AddCertification from './pages/Product/AddCertification';
import AdminProducts from './pages/Product/AdminProduct';

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
      <Router>
        <ThemeProvider theme={MyTheme}>
          {admin && (
            <AdminAppBar />
          )
          }
          {!admin && (
            <CustomerAppBar />
          )}

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

              {/* Sarah's Routes */}
              {/* Login Routes */}
              <Route path={"/register"} element={<Register />} />
              <Route path={"/login"} element={<Login />} />
              <Route path={"/form"} element={<MyForm />} />
              <Route path="/change-password" element={<ChangePassword />} />
              {/* Admin Pages */}
              <Route path={"/registeradmin"} element={<RegisterAdmin />} />
              <Route path={"/loginadmin"} element={<LoginAdmin />} />
              <Route path={"/profile"} element={<Profile />} />
              <Route path={"/edit-profile"} element={<EditProfile />} />
              <Route path={"/admindashboard"} element={<AdminDashboard />} />
              

              {/* Sophie's Route */}
              {/* Product Pages */}
              <Route path="/adminProducts" element={<AdminProducts/>} />
              <Route path="/products" element={<Products />} />
              <Route path="/addproduct" element={<AddProduct />} />
              <Route path="/editproduct/:id" element={<EditProduct />} />
              <Route path="/sustainabilitycertifications" element={<Certifications />} />
              <Route path="/addcertification" element={<AddCertification />} />

              {/* Fallback Route */}
              <Route path="*" element={<p>404 - Page Not Found</p>} />
            </Routes>
          </Container>
        </ThemeProvider>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
