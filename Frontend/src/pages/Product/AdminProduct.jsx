import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, IconButton, Button } from '@mui/material';
import { Search, Clear, Edit } from '@mui/icons-material';
import http from "../../http";

function AdminProducts() {
    const [productList, setProductList] = useState([]);
    const [search, setSearch] = useState('');
    const [categories, setCategories] = useState({});
    const [certifications, setCertifications] = useState({});

    const getProducts = () => {
        http.get('/api/product').then((res) => {
            setProductList(res.data);
        });
    };

    const getCategories = () => {
        http.get('/api/category').then((res) => {
            const categoryMap = res.data.reduce((acc, category) => {
                acc[category.categoryId] = category.name;
                return acc;
            }, {});
            setCategories(categoryMap);
        });
    };

    const getCertifications = () => {
        http.get('/api/sustainabilitycertification').then((res) => {
            const certMap = res.data.reduce((acc, cert) => {
                acc[cert.certId] = cert.name;
                return acc;
            }, {});
            setCertifications(certMap);
        });
    };

    const searchProducts = () => {
        http.get(`/api/product?search=${search}`).then((res) => {
            setProductList(res.data);
        }).catch((err) => {
            console.error("Search error:", err);
        });
    };

    useEffect(() => {
        getProducts();
        getCategories();
        getCertifications();
    }, []);

    const onSearchChange = (e) => setSearch(e.target.value);
    const onSearchKeyDown = (e) => { if (e.key === "Enter") searchProducts(); };
    const onClickSearch = () => searchProducts();
    const onClickClear = () => { setSearch(''); getProducts(); };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Manage Products
            </Typography>

            {/* Search Bar */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Input value={search} placeholder="Search Products..." onChange={onSearchChange} onKeyDown={onSearchKeyDown} sx={{ flex: 1 }} />
                <IconButton color="primary" onClick={onClickSearch}><Search /></IconButton>
                <IconButton color="secondary" onClick={onClickClear}><Clear /></IconButton>
                <Link to="/admin/addproduct">
                    <Button variant="contained" color="success">Add Product</Button>
                </Link>
                <Link to="/admin/upcycling-requests">
                    <Button variant="contained" color="warning">View Upcycling Requests</Button>
                </Link>
            </Box>

            {/* Product List Table */}
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'darkgreen', color: 'white' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Quality</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Warehouse</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Sustainability Cert</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productList.map((product) => (
                            <TableRow key={product.productId} hover>
                                <TableCell>
                                    {product.image && (
                                        <img src={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`} alt={product.name} width="50" height="50" style={{ borderRadius: 8 }} />
                                    )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.quality ? "High" : "Low"}</TableCell>
                                <TableCell>{categories[product.categoryId]}</TableCell>
                                <TableCell>{product.warehouseId}</TableCell>
                                <TableCell>{certifications[product.certId] || "None"}</TableCell>
                                <TableCell align="right">
                                    <Link to={`/admin/editproduct/${product.productId}`}>
                                        <IconButton color="primary">
                                            <Edit />
                                        </IconButton>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default AdminProducts;
