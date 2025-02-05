import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button } from '@mui/material';
import { Search, Clear, Edit, Delete } from '@mui/icons-material';
import http from '../../http';

function Certifications() {
    const [certificationList, setCertificationList] = useState([]);
    const [search, setSearch] = useState('');

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getCertifications = () => {
        http.get('/api/sustainabilitycertification')
            .then((res) => {
                setCertificationList(res.data);
            })
            .catch((error) => {
                console.error('Error fetching certifications:', error);
            });
    };

    const searchCertifications = () => {
        console.log(`Searching for: ${search}`);
        http.get(`/api/sustainabilitycertification?search=${search}`)
            .then((res) => {
                console.log("Search results:", res.data);
                setCertificationList(res.data);
            })
            .catch((error) => {
                console.error('Error searching certifications:', error);
            });
    };

    const onSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            console.log("Enter key pressed");
            searchCertifications();
        }
    };

    const onClickSearch = () => {
        searchCertifications();
    };

    const onClickClear = () => {
        setSearch('');
        getCertifications();
    };

    const handleDeleteCertification = (id) => {
        http.delete(`/api/sustainabilitycertification/${id}`)
            .then(() => {
                getCertifications();
            })
            .catch((error) => {
                console.error('Error deleting certification:', error);
            });
    };

    useEffect(() => {
        getCertifications();
    }, []);

    return (
        <Box>
            <Typography variant="h5" sx={{ my: 2 }}>
                Sustainability Certifications
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Input
                    value={search}
                    placeholder="Search"
                    onChange={onSearchChange}
                    onKeyDown={onSearchKeyDown}
                />
                <IconButton color="primary" onClick={onClickSearch}>
                    <Search />
                </IconButton>
                <IconButton color="primary" onClick={onClickClear}>
                    <Clear />
                </IconButton>
                <Box sx={{ flexGrow: 1 }} />
                <Link to="/addcertification">
                    <Button variant="contained">Add Certification</Button>
                </Link>
            </Box>

            <Grid container spacing={2}>
                {certificationList.map((certification) => (
                    <Grid item key={certification.certId} xs={12} md={6} lg={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6">{certification.name}</Typography>
                                <Typography color="text.secondary" sx={{ mb: 1 }}>
                                    {certification.description}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Link to={`/editcertification/${certification.certId}`}>
                                        <IconButton color="primary" sx={{ padding: '4px' }}>
                                            <Edit />
                                        </IconButton>
                                    </Link>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleDeleteCertification(certification.certId)}
                                        sx={{ padding: '4px' }}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Certifications;
