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
import CartContext from '../contexts/CartContext';
import { Badge, ListItemAvatar, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomerAppBar = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { admin, setAdmin } = useContext(AdminContext);
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);

  console.log("User = ", user);
  console.log("Admin = ", admin);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setAdmin(null);
    localStorage.removeItem("CartItems");
    window.location = "/";
  };

  // Calculate total cart quantity
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calculate total price
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

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
              )}
              {user == null && (
                <>
                  <IconButton component={Link} to="/login" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                    <AccountCircleIcon />
                    <Typography variant="body2" sx={{ ml: 0.5 }}>Login</Typography>
                  </IconButton>
                </>
              )}
              <IconButton component={Link} to="/wishlist" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <FavoriteBorderIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Wishlist</Typography>
              </IconButton>
              <IconButton component={Link} to="/trade-in" sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <RecyclingIcon />
                <Typography variant="body2" sx={{ ml: 0.5 }}>Trade-In</Typography>
              </IconButton>
              <IconButton onClick={() => setCartOpen(true)} sx={{ color: 'black', '&:hover': { color: 'gray' } }}>
                <Badge badgeContent={cartItemCount} color="error">
                  <ShoppingCartIcon />
                </Badge>
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
            to="/claimvoucher"
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
            Voucher
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
        <Box sx={{ width: 320, p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold' }}>Your Cart</Typography>
          <Divider sx={{ my: 2 }} />

          <List sx={{ flexGrow: 1 }}>
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <ListItem key={item.productId} sx={{ display: 'flex', alignItems: 'center' }}>
                  <ListItemAvatar>
                    <Avatar src={item.image || "/default-product.jpg"} alt={item.name} />
                  </ListItemAvatar>

                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* First Row: Title & Price */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{item.name}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'black' }}>
                        Qty: {(item.quantity)}
                      </Typography>
                    </Box>

                    {/* Second Row: Quantity & Counter */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <IconButton onClick={() => updateQuantity(item.productId, -1)} sx={{ color: 'black' }}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 1 }}>{item.quantity}</Typography>
                      <IconButton onClick={() => updateQuantity(item.productId, 1)} sx={{ color: 'black' }}>
                        <AddIcon />
                      </IconButton>
                      <IconButton onClick={() => removeFromCart(item.productId)} sx={{ color: 'red', textAlign: 'right', ml: 'auto' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'gray', mt: 2 }}>
                Your cart is empty.
              </Typography>
            )}
          </List>

          {/* Display Total Price */}
          <Typography variant="h6" sx={{ textAlign: 'center', fontWeight: 'bold', mt: 2 }}>
            Total: ${totalPrice.toFixed(2)}
          </Typography>

          {/* Clear Cart Button */}
          <Button
            variant="contained"
            sx={{ backgroundColor: 'red', color: 'white', '&:hover': { backgroundColor: 'darkred' }, fontWeight: 'bold', mt: 2 }}
            disabled={cartItems.length === 0}
            onClick={() => clearCart()}
          >
            Clear Cart
          </Button>

          {/* Checkout Button */}
          <Button
            variant="contained"
            sx={{ backgroundColor: '#a67c52', color: 'white', '&:hover': { backgroundColor: '#8d6238' }, fontWeight: 'bold', mt: 2 }}
            disabled={cartItems.length === 0}
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