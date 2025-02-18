import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tab, Tabs, Container, Card, CardContent, CardMedia, Button } from '@mui/material';
import http from "../../http";

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const navigate = useNavigate()

    useEffect(() => {
        // Fetch product details by ID
        http.get(`/api/product/${productId}`).then((res) => {
            setProduct(res.data);
        });
    }, [productId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (!product) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Container>
            <Box sx={{ my: 4 }}>
                <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
                    <CardMedia
                        component="img"
                        height="400"
                        image={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}
                        alt={product.name}
                        sx={{ borderRadius: 3 }}
                    />
                    <CardContent>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                            {product.name}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#00796b', mb: 1 }}>
                            ${product.price.toFixed(2)}
                        </Typography>
                        <Typography sx={{ mb: 1 }}>Brand: {product.brand}</Typography>
                        <Typography sx={{ mb: 1 }}>Category: {product.categoryName}</Typography>
                        <Typography>Warehouse: {product.warehouseName}</Typography>
                    </CardContent>
                </Card>

                <Box sx={{ mt: 4 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="Product Detail Tabs"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Description" />
                        <Tab label="Sustainability Details" />
                        <Tab label="Size & Measurements" />
                    </Tabs>
                    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 3 }}>
                        {tabValue === 0 && <Typography>{product.description}</Typography>}
                        {tabValue === 1 && (
                            <Box>
                                <Typography sx={{ mb: 1 }}>
                                    {product.sustainabilityNotes || 'No sustainability notes available.'}
                                </Typography>
                                <Typography>
                                    Certification: {product.sustainabilityCertificationName || 'Not certified'}
                                </Typography>
                                {product.sustainabilityCertificationQRCode && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography>Scan the QR Code:</Typography>
                                        <img
                                            src={`${import.meta.env.VITE_FILE_BASE_URL}${product.sustainabilityCertificationQRCode}`}
                                            alt="Certification QR Code"
                                            style={{ width: '150px', height: '150px' }}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                        {tabValue === 2 && (
                            <>
                                <Typography>{product.sizingChart || 'No size details available.'}</Typography>
                            
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/ar-tryon/${productId}`)}
                                >
                                    Try in AR
                                </Button>

                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default ProductDetail;