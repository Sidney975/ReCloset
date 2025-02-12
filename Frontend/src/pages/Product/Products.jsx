import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Input, IconButton, Button, Container } from '@mui/material';
import { Search, Clear, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import http from "../../http";
import CartContext from '../../contexts/CartContext';
import UserContext from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Products() {
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState('');
    const [warehouses, setWarehouses] = useState([]);
    const [nearestWarehouse, setNearestWarehouse] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(UserContext);

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
        if (!user) {
            toast.error("You must be logged in to add items to the cart.");
            return;
        }
        addToCart(product);
        toast.success("Item added to cart!");
    };

    // Get User's Current Location
    const getUserLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const userLoc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(userLoc);

                    // Ensure warehouses are loaded before finding the nearest one
                    if (warehouses.length === 0) {
                        await getWarehouses(); // Wait for warehouse data
                    }

                    console.log("User location:", userLoc);
                    console.log("Warehouses loaded:", warehouses);

                    findNearestWarehouse(userLoc.lat, userLoc.lng);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };

    // Find the nearest warehouse using Google Maps Distance Matrix API
    const findNearestWarehouse = async (lat, lng) => {
        if (!warehouses.length) {
            console.error("No warehouses available.");
            return;
        }

        const origin = `${lat},${lng}`;

        try {
            const response = await http.get(`/api/warehouse/nearest-warehouse?origin=${origin}`);
            const data = response.data;

            if (!data.rows || data.rows.length === 0) {
                console.error("No valid warehouse distances found.");
                return;
            }

            const distances = data.rows[0].elements.map((el, index) => ({
                distance: el.distance?.value || Infinity,
                warehouse: warehouses[index],
            }));

            distances.sort((a, b) => a.distance - b.distance);

            // Get the closest warehouse
            const nearest = distances[0].warehouse;
            setNearestWarehouse(nearest);

            // Fetch only products from this warehouse
            fetchProductsByWarehouse(nearest.WarehouseId);

            setShowMap(true);
        } catch (error) {
            console.error("Error fetching distance matrix:", error);
        }
    };

    // Fetch products from the nearest warehouse
    const fetchProductsByWarehouse = (warehouseId) => {
        http.get(`/api/product?warehouseId=${warehouseId}`).then((res) => {
            setProductList(res.data); // Only show products from this warehouse
        }).catch((err) => {
            console.error("Error fetching products from nearest warehouse:", err);
        });
    };

    return (
        <Box sx={{ backgroundColor: '#f4f4f4', minHeight: '100vh' }}>
            <Container>
                <Typography variant="h3" sx={{ my: 4, textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
                    Explore the Future of Sustainable Fashion
                </Typography>

                {/* Filter by Warehouse Section */}
                <Box sx={{ mb: 4, p: 3, backgroundColor: '#fff', borderRadius: 3, boxShadow: 2, textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                        Check out our nearest warehouse!
                    </Typography>
                    <Button variant="contained" color="primary" onClick={getUserLocation}>
                        Go
                    </Button>
                </Box>

                {/* Show Map with Directions */}
                {showMap && nearestWarehouse && userLocation && (
                    <Box sx={{ textAlign: 'center', my: 4 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                            Directions to {nearestWarehouse.LocationName}
                        </Typography>
                        <iframe
                            width="100%"
                            height="400"
                            src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestWarehouse.Latitude},${nearestWarehouse.Longitude}`}
                            allowFullScreen
                        ></iframe>
                    </Box>
                )}

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