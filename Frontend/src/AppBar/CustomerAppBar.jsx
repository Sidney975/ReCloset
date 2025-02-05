import React, { useState, useEffect, useContext } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, Container, Box, InputBase, IconButton, Drawer, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import RecyclingIcon from '@mui/icons-material/Recycling';
import LogoutIcon from '@mui/icons-material/Logout';
import http from '../http';
import UserContext from '../contexts/UserContext';
import AdminContext from '../contexts/AdminContext';

const CustomerAppBar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  // Inside your component
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { admin, setAdmin } = useContext(AdminContext);

  // Sample cart items
  const cartItems = [
    { id: 1, name: 'Vintage Denim Jacket', price: '$45' },
    { id: 2, name: 'Eco-Friendly T-Shirt', price: '$20' },
    { id: 3, name: 'Recycled Leather Bag', price: '$75' },
  ];


  console.log(user);
  console.log(admin);
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
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

            {/* Search Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid gray', borderRadius: '5px', px: 1, mx: 2, width: '500px' }}>
              <InputBase placeholder="Find what you're looking for" sx={{ ml: 1, flex: 1 }} />
              <IconButton type="submit" sx={{ p: '5px', color: 'black' }}>
                <SearchIcon />
              </IconButton>
            </Box>

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user != null && (
                <IconButton component={Link} to="/profile" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                  <AccountCircleIcon />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>{user.username}</Typography>
                </IconButton>
              )
              }
              {user == null && (
                <>
                  <IconButton component={Link} to="/login" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                    <AccountCircleIcon />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>Login</Typography>
                  </IconButton>
                </>
              )}
              {/* <IconButton component={Link} to="/login" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <AccountCircleIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Login</Typography>
              </IconButton> */}
              <IconButton component={Link} to="/wishlist" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <FavoriteBorderIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Wishlist</Typography>
              </IconButton>
              <IconButton component={Link} to="/trade-in" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <RecyclingIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Trade-In</Typography>
              </IconButton>
              <IconButton onClick={() => setCartOpen(true)} sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <ShoppingCartIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Cart</Typography>
              </IconButton>
              {user != null && (
                <IconButton onClick={logout} sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                  <LogoutIcon />
                  <Typography variant="body2" sx={{ ml: 0.5 }}>Logout</Typography>
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* Navigation Tabs */}
        {/* Navigation Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#a67c52', py: 1, width: '100%' }}>
          <Link
            to="/products"
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
            Home
          </Link>
          <Link
            to="/women’s-clothing"
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
            Women’s Clothing
          </Link>
          <Link
            to="/men’s-clothing"
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
            Men’s Clothing
          </Link>
          <Link
            to="/repair"
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
            Repair
          </Link>
          <Link
            to="/consultations"
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
            Consultations
          </Link>
          <Link
            to="/about-us"
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
            About Us
          </Link>
        </Box>
      </MuiAppBar>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)}>
        <Box sx={{ width: 300, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>Your Cart</Typography>
          <Divider sx={{ my: 2 }} />

          <List sx={{ flexGrow: 1 }}>
            {cartItems.map((item) => (
              <ListItem key={item.id}>
                <ListItemText primary={item.name} secondary={item.price} />
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            sx={{
              backgroundColor: '#a67c52',
              color: 'white',
              '&:hover': { backgroundColor: '#8d6238' },
              fontWeight: 'bold',
              mt: 2
            }}
            onClick={() => {
              navigate('/checkout');
              setCartOpen(false);
            }}
          >
            Checkout
          </Button>
        </Box>
      </Drawer>
    </>
  );
};

export default CustomerAppBar;
