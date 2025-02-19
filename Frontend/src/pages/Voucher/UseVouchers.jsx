import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider
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
        toast.error("Failed to fetch claimed vouchers.");
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
              <Card sx={styles.voucherCard}>
                {/* Left side with details */}
                <CardContent sx={styles.cardContent}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {voucher.voucherName}
                  </Typography>
                  <Divider sx={styles.divider} />
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
                    Minimum Cost: $<strong>{voucher.minimumValue}</strong>
                  </Typography>
                  <Typography variant="body2">
                    Collected At: {new Date(voucher.collectedAt).toLocaleDateString()}
                  </Typography>
                </CardContent>

                {/* Right side for aesthetics and status */}
                <Box sx={styles.rightSection}>
                  {voucher.redeemedAt ? (
                    <Chip label="Redeemed" color="success" sx={styles.redeemedChip} />
                  ) : (
                    <Typography variant="h6" sx={styles.validLabel}>
                      ✅ Valid
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      <ToastContainer />
    </Box>
  );
}

/** Styled Components */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "#f4f4f4",
  },
  mainContent: {
    flex: 1,
    padding: "50px",
    overflowY: "auto",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#333",
  },
  gridContainer: {
    display: "flex",
    justifyContent: "center",
  },
  voucherCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "20px",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
    padding: "16px",
    background: "linear-gradient(to right, #f59e0b, #d97706)",
    color: "#fff",
    position: "relative",
    overflow: "hidden",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
    },
  },
  cardContent: {
    flex: 1,
  },
  rightSection: {
    width: "100px",
    textAlign: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: "10px",
    padding: "10px",
  },
  validLabel: {
    fontWeight: "bold",
    color: "#fff",
  },
  redeemedChip: {
    fontWeight: "bold",
    fontSize: "14px",
    padding: "5px 10px",
  },
  divider: {
    borderColor: "rgba(255, 255, 255, 0.5)",
    my: 1,
  },
};

export default UseVoucher;
