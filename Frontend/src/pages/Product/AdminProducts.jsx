// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Box, Typography, Grid2, Card, CardContent, Input, IconButton, Button } from '@mui/material';
// import { Search, Clear, Edit } from '@mui/icons-material';
// import http from '../http';

// function AdminProducts() {
//     const [productList, setProductList] = useState([]);
//     const [search, setSearch] = useState('');

//     const onSearchChange = (e) => {
//         setSearch(e.target.value);
//     };

//     const getProducts = () => {
//         http.get('/api/product').then((res) => {
//             setProductList(res.data); // Correctly set product list
//         });
//     };

//     const searchProducts = () => {
//         console.log(`Searching for: ${search}`);
//         http.get(`/api/product?search=${search}`).then((res) => {
//             console.log("Search results:", res.data);
//             setProductList(res.data);
//         }).catch((err) => {
//             console.error("Search error:", err);
//         });
//     };
    

//     useEffect(() => {
//         getProducts();
//     }, []);

//     const onSearchKeyDown = (e) => {
//         if (e.key === "Enter") {
//             console.log("Enter key pressed");
//             searchProducts();
//         }
//     };

//     const onClickSearch = () => {
//         searchProducts();
//     }

//     const onClickClear = () => {
//         setSearch('');
//         getProducts();
//     };

//     return (
//         <Box>
//             <Typography variant="h5" sx={{ my: 2 }}>
//                 Products
//             </Typography>

//             <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Input value={search} placeholder="Search"
//                     onChange={onSearchChange}
//                     onKeyDown={onSearchKeyDown} />
//                 <IconButton color="primary"
//                     onClick={onClickSearch}>
//                     <Search />
//                 </IconButton>
//                 <IconButton color="primary"
//                     onClick={onClickClear}>
//                     <Clear />
//                 </IconButton>
//                 <Box sx={{ flexGrow: 1 }} />
//                 <Link to="/addproduct">
//                     <Button variant="contained">Add Product</Button>
//                 </Link>
//             </Box>

//             <Grid2 container spacing={2}>
//             {productList.map((product, i) => {
//                         return (
//                             <Grid2 size={{xs:12, md:6, lg:4}} key={product.productId}>
//                                 <Card>
//                                     {
//                                         product.image && (
//                                             <Box className="aspect-ratio-container">
//                                                 <img alt="product"
//                                                     src={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}>
//                                                 </img>
//                                             </Box>
//                                         )
//                                     }
//                                     <CardContent>
//                                         <Box sx={{ display: 'flex', mb: 1 }}>
//                                             <Typography variant="h6" sx={{ flexGrow: 1 }}>
//                                                 {product.name}
//                                             </Typography>
//                                                     <Link to={`/editproduct/${product.productId}`}>
//                                                         <IconButton color="primary" sx={{ padding: '4px' }}>
//                                                             <Edit />
//                                                         </IconButton>
//                                                     </Link>
//                                         </Box>
//                                         <Typography sx={{ color: 'text.secondary', mb: 1 }}>
//                                             {product.price.toFixed(2)}
//                                         </Typography>
//                                         <Typography sx={{ whiteSpace: 'pre-wrap', color: 'text.secondary', mb: 1 }}>
//                                             {product.description}
//                                         </Typography>
//                                         <Typography sx={{ color: 'text.secondary' }}>
//                                             Category ID: {product.categoryId} | Warehouse ID: {product.warehouseId}
//                                         </Typography>
//                                     </CardContent>
//                                 </Card>
//                             </Grid2>
//                         );
//                     })
//                 }
//             </Grid2>
//         </Box>
//     );
// }
// export default AdminProducts;
