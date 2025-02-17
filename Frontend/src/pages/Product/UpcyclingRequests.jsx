import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogContent } from '@mui/material';
import http from "../../http";

function UpcyclingRequests() {
    const [requests, setRequests] = useState([]);
    const [approvedRequests, setApprovedRequests] = useState(new Set()); // Track approved requests
    const [selectedImage, setSelectedImage] = useState(null); // Track the selected image for popup


    const fetchRequests = () => {
        http.get('/api/product/upcyclingrequests').then(res => {
            setRequests(res.data);
        });
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = (id) => {
        http.post(`/api/product/upcyclingrequests/${id}/approve`).then(() => {
            setApprovedRequests(prev => new Set(prev).add(id)); // Mark as approved in state
            fetchRequests();
            alert("Product approved successfully!");
        });
    };

    const handleReject = (id) => {
        http.post(`/api/product/upcyclingrequests/${id}/reject`).then(() => {
            fetchRequests();
            alert("Product rejected successfully!");
        });
    };

    const handleImageClick = (image) => {
        setSelectedImage(image);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };
    
    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>Upcycling Requests</Typography>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'darkgreen', color: 'white' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Image</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {requests.map((product) => (
                            <TableRow key={product.productId} hover>
                                <TableCell>
                                    {product.image && (
                                        <img
                                            src={`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`}
                                            alt={product.name}
                                            width="50"
                                            height="50"
                                            style={{ borderRadius: 8, cursor: 'pointer' }}
                                            onClick={() => handleImageClick(`${import.meta.env.VITE_FILE_BASE_URL}${product.image}`)}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell>
                                    {approvedRequests.has(product.productId) ? (
                                        <Typography sx={{ color: 'green', fontWeight: 'bold' }}>Approved</Typography>
                                    ) : (
                                        <>
                                            <Button variant="contained" color="success" onClick={() => handleApprove(product.productId)}>Approve</Button>
                                            <Button variant="contained" color="error" sx={{ ml: 2 }} onClick={() => handleReject(product.productId)}>Reject</Button>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Image Zoom Popup */}
            <Dialog open={Boolean(selectedImage)} onClose={handleCloseModal} maxWidth="lg">
                <DialogContent>
                    {selectedImage && (
                        <div
                            style={{
                                width: '500px', height: '500px', overflow: 'hidden', cursor: 'zoom-in',
                                position: 'relative', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0,0,0,0.5)'
                            }}
                        >
                            <img
                                src={selectedImage}
                                alt="Enlarged"
                                style={{
                                    width: '100%', height: '100%', objectFit: 'contain',
                                    transition: 'transform 0.3s ease-in-out'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.5)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </Box>
    );
}

export default UpcyclingRequests;
