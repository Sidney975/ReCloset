import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardMedia, Typography, Container, Grid, IconButton } from '@mui/material';
import { FavoriteBorder } from '@mui/icons-material';
import http from '../../http';

function Wishlist() {
    const [product, setProduct] = useState(null);

    useEffect(() => {
        fetchProduct();
    }, []);

    const fetchProduct = async () => {
        try {
            const response = await http.get('/api/product/2');
            setProduct(response.data);
        } catch (error) {
            console.error("Error fetching product:", error);
        }
    };

    return (
        <Container>
            <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', marginBottom: 4 }}>
                Wishlist
            </Typography>
            <Grid container justifyContent="center">
                {product ? (
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ borderRadius: 3, boxShadow: 4, transition: '0.3s', '&:hover': { boxShadow: 8, transform: 'scale(1.02)' } }}>
                            <CardMedia
                                component="img"
                                height="200"
                                image={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}
                                alt={product.name}
                                sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                            />
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                    {product.name}
                                </Typography>
                                <Typography sx={{ color: '#00796b', fontWeight: 'bold', mb: 1 }}>
                                    ${product.price.toFixed(2)}
                                </Typography>
                                <Typography sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                    {product.description}
                                </Typography>
                            </CardContent>
                            <IconButton color="secondary" sx={{ marginLeft: 2, marginBottom: 2 }}>
                                <FavoriteBorder />
                            </IconButton>
                        </Card>
                    </Grid>
                ) : (
                    <Typography>Loading product...</Typography>
                )}
            </Grid>
        </Container>
    );
}

export default Wishlist;



// import React, { useState, useEffect, useContext } from "react";
// import { Box, Typography, Grid, Card, CardContent, CardMedia, Button, IconButton } from "@mui/material";
// import { Delete } from "@mui/icons-material";
// import { useNavigate } from "react-router-dom";
// import UserContext from "../../contexts/UserContext";
// import http from "../../http";
// import { toast } from "react-toastify";

// const Wishlist = () => {
//     const { user } = useContext(UserContext);
//     const navigate = useNavigate();
//     const [wishlist, setWishlist] = useState([]);
//     const [unavailableProducts, setUnavailableProducts] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         // if (user === null) {
//         //     navigate("/login");
//         //     return;
//         // }
//         fetchWishlist();
//     }, [user]);

//     const fetchWishlist = async () => {
//         try {
//             const res = await http.get("/api/wishlist");
//             setWishlist(res.data);
//             checkWishlistStatus();
//         } catch (error) {
//             console.error(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const checkWishlistStatus = async () => {
//         try {
//             const res = await http.get("/api/wishlist/check");
//             setUnavailableProducts(res.data.unavailableProducts);
//         } catch (error) {
//             console.error(error);
//         }
//     };

//     const removeFromWishlist = async (productId) => {
//         try {
//             await http.delete(`/api/wishlist/${productId}`);
//             setWishlist(wishlist.filter(item => item.productId !== productId));
//             setUnavailableProducts(unavailableProducts.filter(p => p.ProductId !== productId));
//             toast.success("Removed from wishlist!");
//         } catch (error) {
//             toast.error("Error removing from wishlist.");
//         }
//     };

//     if (loading) return <Typography>Loading...</Typography>;

//     return (
//         <Box sx={{ minHeight: "100vh", padding: 4, width: "100%" }}>
//             <Typography variant="h3" sx={{ textAlign: "center", fontWeight: "bold", mb: 4 }}>
//                 Your Wishlist
//             </Typography>

//             <Grid container spacing={3}>
//                 {wishlist.map((item) => {
//                     const isUnavailable = unavailableProducts.some(p => p.ProductId === item.productId);

//                     return (
//                         <Grid item xs={12} sm={6} md={4} key={item.productId}>
//                             <Card sx={{ borderRadius: 3, boxShadow: 4, position: 'relative' }}>
//                                 {isUnavailable && (
//                                     <Box sx={{
//                                         backgroundColor: "rgba(0,0,0,0.6)",
//                                         position: "absolute",
//                                         width: "100%",
//                                         height: "100%",
//                                         color: "white",
//                                         display: "flex",
//                                         alignItems: "center",
//                                         justifyContent: "center",
//                                         flexDirection: "column"
//                                     }}>
//                                         <Typography>Oops! This item is sold.</Typography>
//                                         <Button onClick={() => removeFromWishlist(item.productId)} color="secondary">
//                                             Remove from Wishlist?
//                                         </Button>
//                                     </Box>
//                                 )}
//                                 <CardMedia component="img" height="200" image={item.product.image} alt={item.product.name} />
//                                 <CardContent>
//                                     <Typography variant="h6">{item.product.name}</Typography>
//                                     <Typography>${item.product.price.toFixed(2)}</Typography>
//                                     <IconButton color="error" onClick={() => removeFromWishlist(item.productId)}>
//                                         <Delete />
//                                     </IconButton>
//                                 </CardContent>
//                             </Card>
//                         </Grid>
//                     );
//                 })}
//             </Grid>
//         </Box>
//     );
// };

// export default Wishlist;
