import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Input, IconButton, Container } from '@mui/material';
import { Search, Clear, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import http from '../../http';

function Products() {
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getProducts();
    }, []);

    const getProducts = () => {
        http.get('/api/product').then((res) => {
            setProductList(res.data);
        }).catch((err) => {
            console.error("Error fetching products:", err);
        });
    };

    const searchProducts = () => {
        http.get(`/api/product?search=${search}`).then((res) => {
            setProductList(res.data);
        }).catch((err) => {
            console.error("Search error:", err);
        });
    };

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchProducts();
        }
    };

    const onClickSearch = () => {
        searchProducts();
    };

    const onClickClear = () => {
        setSearch('');
        getProducts();
    };

    console.log("products:", productList);
    const handleCartClick = (e, product) => {
        e.preventDefault(); // Prevent navigating to product page
    
        let cartItems = JSON.parse(localStorage.getItem("CartItems")) || [];
    
        // Check if the product is already in the cart
        const existingItem = cartItems.find(item => item.productId === product.productId);
    
        if (!existingItem) {
            // Ensure full product details are stored
            const newCartItem = {
                productId: product.productId,  // ✅ Ensure productId is stored
                name: product.name,            // ✅ Store product name
                price: product.price,          // ✅ Store product price
                image: product.image,          // ✅ Store product image
                quantity: 1                    // ✅ Default quantity 1
            };
    
            cartItems.push(newCartItem);
    
            localStorage.setItem("CartItems", JSON.stringify(cartItems));
            alert("Item added to cart!");
        } else {
            alert("Item is already in the cart!");
        }
    };
    
    

    return (
        <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <Container>
                <Typography variant="h3" sx={{ my: 4, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                    Explore the Future of Sustainable Fashion
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Input value={search} placeholder="Search the latest trends..."
                        onChange={onSearchChange}
                        onKeyDown={onSearchKeyDown}
                        sx={{ width: '50%', padding: '10px', borderRadius: '8px', backgroundColor: 'white' }} />
                    <IconButton color="primary" onClick={onClickSearch}>
                        <Search />
                    </IconButton>
                    <IconButton color="secondary" onClick={onClickClear}>
                        <Clear />
                    </IconButton>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {productList.map((product) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={product.productId}>
                            <Card sx={{ borderRadius: 3, boxShadow: 4, transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' } }}>
                                <Link to={`/product/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {product.image && (
                                        <CardMedia
                                            component="img"
                                            height="280"
                                            image={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}
                                            alt={product.name}
                                            sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                                        />
                                    )}
                                </Link>
                                <CardContent>
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                        {product.name}
                                    </Typography>
                                    <Typography sx={{ color: '#00796b', fontWeight: 'bold', mb: 1 }}>
                                        ${product.price.toFixed(2)}
                                    </Typography>
                                    <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 1 }}>
                                        {product.description.length > 80 ? `${product.description.substring(0, 80)}...` : product.description}
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <IconButton color="primary" onClick={(e) => handleCartClick(e, product)}>
                                            <ShoppingCart />
                                        </IconButton>
                                        <IconButton color="secondary">
                                            <FavoriteBorder />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 8, textAlign: 'center', backgroundColor: '#00796b', padding: 4, borderRadius: 3, color: 'white' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                        Why We Are the Sustainable Choice
                    </Typography>
                    <Typography variant="body1" sx={{ maxWidth: 700, mx: 'auto' }}>
                        Our mission is to reduce waste, promote ethical sourcing, and make sustainable fashion accessible to all. 
                        Every purchase you make contributes to a greener planet. 
                        Join us in making a difference, one stylish choice at a time.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Products;
