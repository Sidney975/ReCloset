import React, { useEffect, useState, useContext } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import { Redeem, CheckCircle } from '@mui/icons-material';
import http from "../../http";
import UserContext from "../../contexts/UserContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ClaimVoucher() {
  const { user, setUser } = useContext(UserContext);
  const [vouchers, setVouchers] = useState([]);
  const [claimedVouchers, setClaimedVouchers] = useState([]);

  const fetchVouchers = () => {
    http.get('/voucher')
      .then((res) => {
        const visibleVouchers = res.data
          .filter((voucher) => !voucher.hidden) // Exclude hidden vouchers
          .map((voucher) => ({
            ...voucher,
            voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
          }));
        setVouchers(visibleVouchers);
      })
      .catch((err) => {
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
        toast.error('Failed to fetch claimed vouchers.');
      });
  };

  const claimVoucher = (voucherId, voucherCost) => {
    http.post(`/voucher/${voucherId}/claim`)
      .then((res) => {
        toast.success(res.data.message);
        setClaimedVouchers((prev) => [...prev, voucherId]);
        if (user && user.id) {
          http.put(`/user/update/${user.id}/${-voucherCost}`, {})
            .then(() => {
              setUser({ ...user, loyaltyPoints: user.loyaltyPoints - voucherCost });
              toast.success("Loyalty points updated!");
            })
            .catch((err) => {
              toast.error("Failed to update loyalty points.");
            });
        }
      })
      .catch((err) => {
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
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          my: 2,
          textAlign: 'center',
          fontWeight: 700,
          color: '#333',
        }}
      >
        🎟️ Available Vouchers
      </Typography>
      {user && (
        <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
          Your Points: <strong>{user.loyaltyPoints}</strong>
        </Typography>
      )}
      <Grid container spacing={3} justifyContent="center">
        {vouchers.map((voucher) => (
          <Grid item xs={12} sm={6} md={4} key={voucher.voucherId}>
            <Card
              sx={{
                borderRadius: '20px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                background: voucher.voucherTypeEnum === "Free Shipping" 
                  ? 'linear-gradient(to right, #34D399, #10B981)' 
                  : 'linear-gradient(to right, #F59E0B, #D97706)',
                position: 'relative',
                overflow: 'hidden',
                color: '#fff',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.03)',
                  boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
                },
              }}
            >
              {/* Perforated Effect */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  boxShadow: '-2px 0px 5px rgba(0,0,0,0.1)',
                  transform: 'translateY(-50%)',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  right: '-8px',
                  width: '16px',
                  height: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '50%',
                  boxShadow: '2px 0px 5px rgba(0,0,0,0.1)',
                  transform: 'translateY(-50%)',
                }}
              />

              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {voucher.voucherName}
                </Typography>
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.5)', my: 1 }} />
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={voucher.voucherTypeEnum}
                    color={voucher.voucherTypeEnum === "Free Shipping" ? "success" : "warning"}
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {voucher.voucherTypeEnum === "Price Deduction"
                      ? `${voucher.discountValue < 1 ? voucher.discountValue * 100 + "%" : "$" + voucher.discountValue}`
                      : "Free Shipping"}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Cost: <strong>{voucher.pointsCost} points</strong>
                </Typography>
                <Typography variant="body2">
                  Expiration: {new Date(voucher.expirationDate).toLocaleDateString()}
                </Typography>
              </CardContent>

              <CardActions sx={{ justifyContent: 'center', mt: 2 }}>
                {user ? (
                  <Button
                    variant="contained"
                    startIcon={claimedVouchers.includes(voucher.voucherId) ? <CheckCircle /> : <Redeem />}
                    color={claimedVouchers.includes(voucher.voucherId) ? 'success' : 'primary'}
                    onClick={() => claimVoucher(voucher.voucherId, voucher.pointsCost)}
                    disabled={claimedVouchers.includes(voucher.voucherId)}
                    sx={{ borderRadius: '8px', px: 3, backgroundColor: '#fff', color: '#333', fontWeight: 600 }}
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
