import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Input, IconButton, Button } from '@mui/material';
import { Search, Clear, Edit } from '@mui/icons-material';
import http from "../../http";

function AdminCerts() {
    const [certList, setCertList] = useState([]);
    const [search, setSearch] = useState('');

    const getCerts = () => {
        http.get('/api/sustainabilitycertification').then((res) => {
            setCertList(res.data);
        });
    };

    const searchCerts = () => {
        http.get(`/api/sustainabilitycertification?search=${search}`).then((res) => {
            setCertList(res.data);
        }).catch((err) => {
            console.error("Search error:", err);
        });
    };

    useEffect(() => {
        getCerts();
    }, []);

    const onSearchChange = (e) => setSearch(e.target.value);
    const onSearchKeyDown = (e) => { if (e.key === "Enter") searchCerts(); };
    const onClickSearch = () => searchCerts();
    const onClickClear = () => { setSearch(''); getCerts(); };

    return (
        <Box sx={{ p: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Manage Certifications
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                <Input value={search} placeholder="Search Certifications..." onChange={onSearchChange} onKeyDown={onSearchKeyDown} sx={{ flex: 1 }} />
                <IconButton color="primary" onClick={onClickSearch}><Search /></IconButton>
                <IconButton color="secondary" onClick={onClickClear}><Clear /></IconButton>
                <Link to="/admin/addcertification">
                    <Button variant="contained" color="success">Add Certification</Button>
                </Link>
            </Box>

            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: 'darkgreen', color: 'white' }}>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Id</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Certification Name</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>QR Code</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {certList.map((cert) => (
                            <TableRow key={cert.certId} hover>
                                <TableCell>{cert.certId}</TableCell>
                                <TableCell>{cert.name}</TableCell>
                                <TableCell>{cert.description}</TableCell>
                                <TableCell>
                                    {cert.qrCodeUrl && (
                                        <img src={`${import.meta.env.VITE_FILE_BASE_URL}${cert.qrCodeUrl}`} alt={cert.name} width="50" height="50" style={{ borderRadius: 8 }} />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Link to={`/admin/editcertification/${cert.certId}`}>
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

export default AdminCerts;
