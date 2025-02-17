import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tabs,
  Tab,
  Input,
  Button
} from '@mui/material';
import { Search, Clear, Edit, AccountBalanceWallet, CalendarToday } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import http from "../../http";
import dayjs from 'dayjs';
import UserContext from '../../contexts/UserContext';
import AdminContext from '../../contexts/AdminContext';
import global from '../../global';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Vouchers() {
  const { user } = useContext(UserContext);
  const { admin } = useContext(AdminContext);
  const [voucherList, setVoucherList] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState("normal"); // "normal" or "hidden"

  // Fetch vouchers from the API
  const getVouchers = () => {
    http.get('/voucher')
      .then((res) => {
        const vouchers = res.data.map(voucher => ({
          ...voucher,
          voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
        }));
        setVoucherList(vouchers);
      })
      .catch(err => {
        console.error("Failed to fetch vouchers:", err);
      });
  };

  const searchVouchers = () => {
    http.get(`/voucher?search=${search}`)
      .then((res) => {
        const vouchers = res.data.map(voucher => ({
          ...voucher,
          voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
        }));
        setVoucherList(vouchers);
      })
      .catch(err => {
        console.error("Failed to search vouchers:", err);
      });
  };

  useEffect(() => {
    getVouchers();
  }, []);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

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

  // Filter vouchers based on the tab selected.
  const filteredVouchers = voucherList.filter(voucher =>
    tab === "normal" ? !voucher.hidden : voucher.hidden
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ my: 3, textAlign: 'center', fontWeight: 'bold' }}>
        Voucher Management
      </Typography>

      {/* Search Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, justifyContent: 'center' }}>
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
        {admin && (
          <Link to="/addvoucher" style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <Button variant="contained" color="primary" sx={{ fontWeight: 'bold' }}>
              Add Voucher
            </Button>
          </Link>
        )}
      </Box>

      {/* Tabs for Normal and Hidden Vouchers */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
        <Tabs 
          value={tab} 
          onChange={(e, newValue) => setTab(newValue)}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="Normal Vouchers" value="normal" />
          <Tab label="Hidden Vouchers" value="hidden" />
        </Tabs>
      </Box>

      {/* Voucher Cards in Two Columns */}
      <Grid container spacing={3}>
        {filteredVouchers.map((voucher) => (
          <Grid item xs={12} sm={6} lg={4} key={voucher.VoucherId || voucher.id}>
            <Card sx={{ backgroundColor: '#f9f9f9', boxShadow: 3, position: 'relative' }}>
              {admin && (
                <Link to={`/editvoucher/${voucher.voucherId || voucher.id}`} style={{ position: 'absolute', top: 8, right: 8, color: 'inherit' }}>
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
                <Typography variant="body2">
                  Cost: {voucher.pointsCost} Points
                </Typography>
                <Typography variant="body2">
                  Discount: {voucher.discountValue}{" "}
                  {voucher.voucherTypeEnum === "Price Deduction" &&
                    voucher.discountValue < 1
                    ? "(Percentage)"
                    : voucher.voucherTypeEnum === "Price Deduction" &&
                      voucher.discountValue >= 1
                    ? "(Flat)"
                    : ""}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <AccountBalanceWallet sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Created: {dayjs(voucher.createdAt).format(global.datetimeFormat)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CalendarToday sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Expires: {voucher.expirationDate ? dayjs(voucher.expirationDate).format(global.datetimeFormat) : "No Expiration"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ToastContainer />
    </Box>
  );
}

export default Vouchers;
