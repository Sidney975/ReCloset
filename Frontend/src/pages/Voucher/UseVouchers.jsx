import React, { useEffect, useState, useContext } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Chip, Stack } from '@mui/material';
import http from "../../http";
import UserContext from '../../contexts/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function UseVoucher() {
  const { user } = useContext(UserContext);
  const [claimedVouchers, setClaimedVouchers] = useState([]);

  const fetchClaimedVouchers = () => {
    http.get('/voucher/claimed')
      .then((res) => {
        const vouchers = res.data.map(voucher => ({
          ...voucher,
          voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
        }));
        setClaimedVouchers(vouchers);
      })
      .catch((err) => {
        console.error('Failed to fetch claimed vouchers:', err);
        toast.error('Failed to fetch claimed vouchers.');
      });
  };

  const redeemVoucher = (voucherId) => {
    http.post(`/voucher/${voucherId}/redeem`)
      .then((res) => {
        toast.success(res.data.message);
        fetchClaimedVouchers();
      })
      .catch((err) => {
        console.error('Failed to redeem voucher:', err);
        toast.error(err.response?.data?.message || 'Failed to redeem voucher.');
      });
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

  useEffect(() => {
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
        Your Claimed Vouchers
      </Typography>
      <Grid container spacing={3}>
        {claimedVouchers.map((voucher) => (
          <Grid item xs={12} sm={6} md={4} key={voucher.voucherId}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
                display: 'flex',
                flexDirection: 'row',
              }}
            >
              <CardContent sx={{ flex: 1 }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  {voucher.voucherName}
                </Typography>
                <Chip
                  label={voucher.voucherTypeEnum}
                  color={voucher.voucherTypeEnum === "Free Shipping" ? "success" : "info"}
                  size="small"
                />
                
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
                  Cost: <strong>{voucher.pointsCost} points</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Collected At: {new Date(voucher.collectedAt).toLocaleDateString()}
                </Typography>
                {voucher.redeemedAt ? (
                  <Chip label="Redeemed" color="success" sx={{ mt: 1 }} />
                ) : null}
              </CardContent>
              {!voucher.redeemedAt && (
                <Stack
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    borderTopRightRadius: '16px',
                    borderBottomRightRadius: '16px',
                    px: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => redeemVoucher(voucher.voucherId)}
                    sx={{ transform: 'rotate(-90deg)', borderRadius: '8px', px: 2 }}
                  >
                    Redeem
                  </Button>
                </Stack>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      <ToastContainer />
    </Box>
  );
}

export default UseVoucher;