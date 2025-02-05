import React, { useState, useEffect, useContext } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Container, Box, InputBase, IconButton, Drawer, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RecyclingIcon from '@mui/icons-material/Recycling';
import AdminContext from '../contexts/AdminContext';
import LogoutIcon from '@mui/icons-material/Logout';

const AdminAppBar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { admin, setAdmin } = useContext(AdminContext);

  console.log(admin);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAdmin(null);
    window.location = "/";
  };
  return (
    <>
      <MuiAppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 1, width: '100%' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Logo */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'black', fontWeight: 'bold' }}>
                <Typography variant="h6" sx={{ fontSize: '1.5rem' }}>
                  <span style={{ fontWeight: 'lighter' }}>RE</span><span style={{ fontWeight: 'bold' }}>CLOSET</span>
                </Typography>
              </Link>
            </Box>

            {/* Search Bar
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid gray', borderRadius: '5px', px: 1, mx: 2, width: '500px' }}>
              <InputBase placeholder="Find what you're looking for" sx={{ ml: 1, flex: 1 }} />
              <IconButton type="submit" sx={{ p: '5px', color: 'black' }}>
                <SearchIcon />
              </IconButton>
            </Box> */}

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {admin != null && (
                <>
                  <IconButton component={Link} to="/profile" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                    <AccountCircleIcon />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>{admin.username}</Typography>
                  </IconButton>
                </>
              )
              }
              <IconButton onClick={logout} sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <LogoutIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Logout</Typography>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Navigation Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#a67c52', py: 1, width: '100%' }}>
          <Link
            to="/adminProducts"
            style={{
              textDecoration: 'none',
              color: 'white',
              margin: '0 15px',
              fontWeight: 'bold',
              padding: '10px 15px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8d6238'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Product
          </Link>
          <Link
            to="*"
            style={{
              textDecoration: 'none',
              color: 'white',
              margin: '0 15px',
              fontWeight: 'bold',
              padding: '10px 15px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8d6238'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Orders
          </Link>
          <Link
            to="/vouchers"
            style={{
              textDecoration: 'none',
              color: 'white',
              margin: '0 15px',
              fontWeight: 'bold',
              padding: '10px 15px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8d6238'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Vouchers
          </Link>
          <Link
            to="/delivery"
            style={{
              textDecoration: 'none',
              color: 'white',
              margin: '0 15px',
              fontWeight: 'bold',
              padding: '10px 15px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8d6238'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Delivery
          </Link>
          <Link
            to="/users"
            style={{
              textDecoration: 'none',
              color: 'white',
              margin: '0 15px',
              fontWeight: 'bold',
              padding: '10px 15px',
              transition: 'background-color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8d6238'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Users
          </Link>
        </Box>
      </MuiAppBar>
    </>
  );
};

export default AdminAppBar;