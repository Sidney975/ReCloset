import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Tab, Tabs, Container, Card, CardContent, CardMedia, Button, Fade } from '@mui/material';
import http from "../../http";
import DescriptionIcon from '@mui/icons-material/Description';
// import EcoIcon from '@mui/icons-material/Eco';
import StraightenIcon from '@mui/icons-material/Straighten';


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

                {/* Tabs with Better UI */}
                <Box sx={{ mt: 4 }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="Product Detail Tabs"
                        sx={{
                            mb: 2,
                            bgcolor: '#f7f7f7',
                            borderRadius: 2,
                            p: 1,
                            '.MuiTabs-indicator': {
                                height: '4px',
                                borderRadius: 2
                            }
                        }}
                        TabIndicatorProps={{ style: { backgroundColor: '#00796b' } }}
                    >
                        <Tab 
                            label="Description" 
                            icon={<DescriptionIcon />} 
                            iconPosition="start" 
                            sx={{ textTransform: 'none', fontWeight: 'bold' }} 
                        />
                        <Tab 
                            label="Sustainability" 
                            icon={<DescriptionIcon />} 
                            iconPosition="start" 
                            sx={{ textTransform: 'none', fontWeight: 'bold' }} 
                        />
                        <Tab 
                            label="Size & Fit" 
                            icon={<StraightenIcon />} 
                            iconPosition="start" 
                            sx={{ textTransform: 'none', fontWeight: 'bold' }} 
                        />
                    </Tabs>

                    {/* Tab Content with Animation */}
                    <Box sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2, boxShadow: 2, bgcolor: '#ffffff' }}>
                        <Fade in={tabValue === 0} timeout={300} unmountOnExit>
                            <Typography>{product.description}</Typography>
                        </Fade>
                        <Fade in={tabValue === 1} timeout={300} unmountOnExit>
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
                        </Fade>
                        <Fade in={tabValue === 2} timeout={300} unmountOnExit>
                            <Box>
                                <Typography>{product.sizingChart || 'No size details available.'}</Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{
                                        mt: 2,
                                        textTransform: 'none',
                                        bgcolor: '#00796b',
                                        '&:hover': { bgcolor: '#005f56' }
                                    }}
                                    onClick={() => navigate(`/ar-tryon/${productId}`)}
                                >
                                    Try in AR
                                </Button>
                            </Box>
                        </Fade>
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default ProductDetail;