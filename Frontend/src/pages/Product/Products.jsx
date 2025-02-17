import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, Input, IconButton, Button, Container, Paper } from '@mui/material';
import { Search, Clear, FavoriteBorder, ShoppingCart } from '@mui/icons-material';
import http from "../../http";
import CartContext from '../../contexts/CartContext';
import UserContext from '../../contexts/UserContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

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
        getWarehouses();
    }, []);

    const getProducts = () => {
        http.get('/api/product').then((res) => {
            setProductList(res.data);
        }).catch((err) => {
            console.error("Error fetching products:", err);
        });
    };

    const getWarehouses = async () => {
        try {
            const res = await http.get('/api/warehouse');
            setWarehouses(res.data);
        } catch (error) {
            console.error("Error fetching warehouses:", error);
        }
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

                    // Ensure warehouses are loaded before calling findNearestWarehouse
                    if (warehouses.length === 0) {
                        await getWarehouses();
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
            console.log("API Response:", response.data);  // 🔍 Debugging step

            if (!response.data.rows || response.data.rows.length === 0) {
                console.error("No valid warehouse distances found.");
                return;
            }

            // Extract distances from API response
            const distances = response.data.rows[0].elements.map((el, index) => {
                return {
                    distance: el.distance?.value || Infinity,
                    warehouse: warehouses.find(w =>
                        response.data.destination_addresses[index].toLowerCase().includes(w.street.toLowerCase().replace(/\d+/g, '').trim())
                    ) || null
                };
            });

            console.log("Matching warehouses:", distances);

            // Sort warehouses by distance (shortest first)
            distances.sort((a, b) => a.distance - b.distance);

            const nearest = distances[0].warehouse;  // 🛑 Make sure this is correct!

            console.log("Nearest warehouse:", nearest);  // 🔍 Debugging step

            if (!nearest) {
                console.error("Nearest warehouse is undefined.");
                return;
            }

            setNearestWarehouse(nearest);
            fetchProductsByWarehouse(nearest.warehouseId);  // Make sure property name is correct!

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
        <Box sx={{ minHeight: '100vh', padding: 4, width: '100%' }}>
            <Container>
                <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 'bold', color: '#333', mb: 4 }}>
                    Explore the Future of Sustainable Fashion
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, boxShadow: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Search for Products
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Input
                                    fullWidth
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && searchProducts()}
                                    sx={{ flexGrow: 1, mr: 1 }}
                                />
                                <IconButton color="primary" onClick={searchProducts}><Search /></IconButton>
                                <IconButton color="secondary" onClick={() => { setSearch(''); getProducts(); }}><Clear /></IconButton>
                            </Box>
                        </Paper>

                        <Grid container spacing={3}>
                            {productList.map((product) => (
                                <Grid item xs={12} sm={6} md={4} lg={4} key={product.productId}>
                                    <Card sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        height: '430px',  // Shorten card height
                                        maxHeight: '430px', // Restrict max height
                                        borderRadius: 3,
                                        boxShadow: 4,
                                        transition: '0.3s',
                                        '&:hover': { boxShadow: 8, transform: 'scale(1.02)' }
                                    }}>
                                        <Link to={`/product/${product.productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            {product.image && (
                                                <CardMedia
                                                    component="img"
                                                    height="200"
                                                    image={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}
                                                    alt={product.name}
                                                    sx={{ borderTopLeftRadius: 3, borderTopRightRadius: 3 }}
                                                />
                                            )}
                                        </Link>
                                        <CardContent sx={{ flexGrow: 1, overflow: 'hidden', paddingBottom: 1}}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                                                {product.name}
                                            </Typography>
                                            <Typography sx={{ color: '#00796b', fontWeight: 'bold', mb: 1 }}>
                                                ${product.price.toFixed(2)}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: 'text.secondary',
                                                    fontSize: '0.85rem',
                                                    display: '-webkit-box',
                                                    WebkitBoxOrient: 'vertical',
                                                    WebkitLineClamp: 2,  // Limit to 2 lines
                                                    overflow: 'hidden'
                                                }}
                                            >
                                                {product.description}
                                            </Typography>
                                        </CardContent>

                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, mt: 'auto' }}>
                                            <IconButton color="primary" onClick={(e) => handleCartClick(e, product)}>
                                                <ShoppingCart />
                                            </IconButton>
                                            <IconButton color="secondary">
                                                <FavoriteBorder />
                                            </IconButton>
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>

                    {/* Map Section */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                Nearest Warehouse
                            </Typography>
                            {showMap && nearestWarehouse && userLocation ? (
                                <>
                                    <iframe
                                        width="100%"
                                        height="300"
                                        src={`https://www.google.com/maps/embed/v1/directions?key=${GOOGLE_MAPS_API_KEY}&origin=${userLocation.lat},${userLocation.lng}&destination=${nearestWarehouse.latitude},${nearestWarehouse.longitude}`}
                                        allowFullScreen
                                        style={{ borderRadius: 10 }}
                                    ></iframe>

                                    {/* 🚀 New Section: Display Warehouse Details */}
                                    <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 2 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                            Warehouse Details
                                        </Typography>
                                        <Typography><strong>Name:</strong> {nearestWarehouse.locationName}</Typography>
                                        <Typography><strong>Address:</strong> {nearestWarehouse.street}, {nearestWarehouse.city}, {nearestWarehouse.state}, {nearestWarehouse.postalCode}, {nearestWarehouse.country}</Typography>
                                        <Typography><strong>Contact:</strong> {nearestWarehouse.contactNo}</Typography>
                                    </Box>
                                </>
                            ) : (
                                <Button variant="contained" color="primary" fullWidth onClick={getUserLocation}>
                                    Find Nearest Warehouse
                                </Button>
                            )}

                        </Paper>
                    </Grid>
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