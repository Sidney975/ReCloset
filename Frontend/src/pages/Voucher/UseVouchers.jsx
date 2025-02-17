import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Button
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import http from "../../http";
import UserContext from "../../contexts/UserContext";
import Sidebar from "../User/Sidebar";

function UseVoucher() {
  const { user } = useContext(UserContext);
  const [claimedVouchers, setClaimedVouchers] = useState([]);

  useEffect(() => {
    fetchClaimedVouchers();
  }, []);

  const fetchClaimedVouchers = () => {
    http.get("/voucher/claimed")
      .then((res) => {
        const vouchers = res.data.map((voucher) => ({
          ...voucher,
          voucherTypeEnum: convertEnumToString(voucher.voucherTypeEnum),
        }));
        setClaimedVouchers(vouchers);
      })
      .catch((err) => {
        console.error("Failed to fetch claimed vouchers:", err);
        toast.error("Failed to fetch claimed vouchers.");
      });
  };

  const redeemVoucher = (voucherId) => {
    http.post(`/voucher/${voucherId}/redeem`)
      .then((res) => {
        toast.success(res.data.message);
        fetchClaimedVouchers();
      })
      .catch((err) => {
        console.error("Failed to redeem voucher:", err);
        toast.error(
          err.response?.data?.message || "Failed to redeem voucher."
        );
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

  return (
    <Box sx={styles.container}>
      {/* Left Sidebar */}
      <Sidebar activeTab="vouchers" />

      {/* Main Content Area */}
      <Box sx={styles.mainContent}>
        <Typography variant="h5" sx={styles.pageTitle}>
          My Vouchers
        </Typography>

        <Grid container spacing={3} sx={styles.gridContainer}>
          {claimedVouchers.map((voucher) => (
            <Grid item xs={12} sm={6} key={voucher.voucherId}>
              <Card sx={styles.card}>
                <CardContent sx={styles.cardContent}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {voucher.voucherName}
                  </Typography>
                  <Chip
                    label={voucher.voucherTypeEnum}
                    color={
                      voucher.voucherTypeEnum === "Free Shipping"
                        ? "success"
                        : "info"
                    }
                    size="small"
                  />
                  <Typography
                    variant="body2"
                    sx={{ mt: 1, color: "text.secondary" }}
                  >
                    Cost: <strong>{voucher.pointsCost} points</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Collected At:{" "}
                    {new Date(voucher.collectedAt).toLocaleDateString()}
                  </Typography>
                  {voucher.redeemedAt && (
                    <Chip label="Redeemed" color="success" sx={{ mt: 1 }} />
                  )}
                </CardContent>

                {/* Redeem Button (only if not redeemed) */}
                {!voucher.redeemedAt && (
                  <Stack sx={styles.stackRight}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => redeemVoucher(voucher.voucherId)}
                      sx={{
                        transform: "rotate(-90deg)",
                        borderRadius: "8px",
                        px: 2,
                      }}
                    >
                      Redeem
                    </Button>
                  </Stack>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <ToastContainer />
    </Box>
  );
}

/** Inline Styles */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f4f4f4", // Similar to your profile page background
  },
  mainContent: {
    flex: 1,
    padding: "50px",
    overflowY: "auto", // If you need scrolling
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  gridContainer: {
    // Additional styling if needed
  },
  card: {
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s",
    "&:hover": {
      transform: "scale(1.02)",
    },
    display: "flex",
    flexDirection: "row",
  },
  cardContent: {
    flex: 1,
  },
  stackRight: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderTopRightRadius: "16px",
    borderBottomRightRadius: "16px",
    px: 2,
  },
};

export default UseVoucher;
