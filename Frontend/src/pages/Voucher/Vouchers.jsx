import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Grid, Card, CardContent, Input, IconButton, Button, Chip } from '@mui/material';
import { Search, Clear, Edit, AccountBalanceWallet, AccessTime, CalendarToday } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import http from "../../http";
import dayjs from 'dayjs';
import UserContext from '../../contexts/UserContext';
import global from '../../global';

function Vouchers() {
    const [voucherList, setVoucherList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    const onSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const getVouchers = () => {
        http.get('/voucher').then((res) => {
            const vouchers = res.data.map(voucher => ({
                ...voucher,
                voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
            }));
            setVoucherList(vouchers);
        }).catch(err => {
            console.error("Failed to fetch vouchers:", err);
        });
    };

    const searchVouchers = () => {
        http.get(`/voucher?search=${search}`).then((res) => {
            const vouchers = res.data.map(voucher => ({
                ...voucher,
                voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
            }));
            setVoucherList(vouchers);
        }).catch(err => {
            console.error("Failed to search vouchers:", err);
        });
    };

    useEffect(() => {
        getVouchers();
        console.log(user)
    }, []);

    const onSearchKeyDown = (e) => {
        if (e.key === "Enter") {
            searchVouchers();
        }
    };

    const onClickSearch = () => {
        searchVouchers();
    };

    const onClickClear = () => {
        setSearch('');
        getVouchers();
    };

    const convertEnumToString = (value) => {
        switch (value) {
            case 0:
                return "Price Deduction";
            case 1:
                return "Free Shipping";
            default:
                return "Unknown";
        }
    };

    return (
        <Box>
            <Typography variant="h4" sx={{ my: 3, textAlign: 'center', fontWeight: 'bold' }}>
                Voucher Management
            </Typography>

            {/* Search and Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Input
                        value={search}
                        placeholder="Search Vouchers"
                        onChange={onSearchChange}
                        onKeyDown={onSearchKeyDown}
                        sx={{ width: 300, mr: 1 }}
                    />
                    <IconButton color="primary" onClick={onClickSearch}>
                        <Search />
                    </IconButton>
                    <IconButton color="secondary" onClick={onClickClear}>
                        <Clear />
                    </IconButton>
                </Box>
                {user && user.isAdmin && (
                    <Link to="/addvoucher">
                        <Button variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
                            Add Voucher
                        </Button>
                    </Link>
                )}
            </Box>

            {/* Vouchers List */}
            <Grid container spacing={3}>
                {voucherList.map((voucher) => (
                    <Grid item xs={12} md={6} lg={4} key={voucher.id}>
                        <Card sx={{ backgroundColor: '#f9f9f9', boxShadow: 3, position: 'relative' }}>
                            {user && user.isAdmin && (
                                <Link to={`/editvoucher/${voucher.id}`} style={{ position: 'absolute', top: 8, right: 8 }}>
                                    <IconButton color="primary">
                                        <Edit />
                                    </IconButton>
                                </Link>
                            )}
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                                    {voucher.voucherName}
                                </Typography>
                                <Chip
                                    label={voucher.voucherTypeEnum}
                                    color={voucher.voucherTypeEnum === "Free Shipping" ? "success" : "info"}
                                    sx={{ mb: 2 }}
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                    <AccountBalanceWallet sx={{ mr: 1 }} />
                                    <Typography>Cost: {voucher.pointsCost} Points</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                    <AccessTime sx={{ mr: 1 }} />
                                    <Typography>
                                        Created: {dayjs(voucher.createdAt).format(global.datetimeFormat)}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }} color="text.secondary">
                                    <CalendarToday sx={{ mr: 1 }} />
                                    <Typography>
                                        Expires: {voucher.expirationDate
                                            ? dayjs(voucher.expirationDate).format(global.datetimeFormat)
                                            : "No Expiration"}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

export default Vouchers;
