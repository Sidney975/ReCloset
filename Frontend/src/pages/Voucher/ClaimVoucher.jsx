import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
} from '@mui/material';
import { Redeem, CheckCircle } from '@mui/icons-material';
import http from "../../http";
import UserContext from '../../contexts/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClaimVoucher() {
  const { user } = useContext(UserContext);
  const [vouchers, setVouchers] = useState([]);
  const [claimedVouchers, setClaimedVouchers] = useState([]);

  const fetchVouchers = () => {
    http.get('/voucher')
      .then((res) => {
        const vouchers = res.data.map((voucher) => ({
          ...voucher,
          voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
        }));
        setVouchers(vouchers);
        console.log(vouchers);
      })
      .catch((err) => {
        console.error('Failed to fetch vouchers:', err);
        toast.error('Failed to fetch vouchers.');
      });
  };

  const fetchClaimedVouchers = () => {
    http.get('/voucher/claimed')
      .then((res) => {
        const claimedIds = res.data.map((claimed) => claimed.voucherId);
        setClaimedVouchers(claimedIds);
      })
      .catch((err) => {
        console.error('Failed to fetch claimed vouchers:', err);
        toast.error('Failed to fetch claimed vouchers.');
      });
  };

  const claimVoucher = (voucherId) => {
    http.post(`/voucher/${voucherId}/claim`)
      .then((res) => {
        toast.success(res.data.message);
        setClaimedVouchers((prev) => [...prev, voucherId]);
      })
      .catch((err) => {
        console.error('Failed to claim voucher:', err);
        toast.error(err.response?.data?.message || 'Failed to claim voucher.');
      });
  };

  const convertEnumToString = (value) => {
    switch (value) {
      case 0:
        return 'Price Deduction';
      case 1:
        return 'Free Shipping';
      default:
        return 'Unknown';
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchClaimedVouchers();
  }, []);

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          my: 2,
          textAlign: 'center',
          fontWeight: 600,
          background: '#000000',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Available Vouchers
      </Typography>
      <Grid container spacing={3}>
        {vouchers.map((voucher) => (
          <Grid item xs={12} sm={6} md={4} key={voucher.voucherId}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {voucher.voucherName}
                </Typography>
                <Chip
                  label={voucher.voucherTypeEnum}
                  color={voucher.voucherTypeEnum === "Free Shipping" ? "success" : "info"}
                  size="small"
                />
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  Cost: <strong>{voucher.pointsCost} points</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Expiration Date: {new Date(voucher.expirationDate).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
                {user ? (
                  <Button
                    variant="contained"
                    startIcon={claimedVouchers.includes(voucher.voucherId) ? <CheckCircle /> : <Redeem />}
                    color={claimedVouchers.includes(voucher.voucherId) ? 'success' : 'primary'}
                    onClick={() => claimVoucher(voucher.voucherId)}
                    disabled={claimedVouchers.includes(voucher.voucherId)}
                    sx={{ borderRadius: '8px', px: 3 }}
                  >
                    {claimedVouchers.includes(voucher.voucherId) ? 'Claimed' : 'Claim'}
                  </Button>
                ) : (
                  <Typography color="error">Login to claim vouchers</Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ToastContainer />
    </Box>
  );
}

export default ClaimVoucher;
