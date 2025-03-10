import React, { useEffect, useState, useContext } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  CircularProgress,
  Alert,
  TextField,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card, CardMedia, CardContent, Grid, Divider
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useUserIP from "../../hooks/useUserIp"; // Import IP detection hook
import http from "../../http";
import CartContext from "../../contexts/CartContext";
import UserContext from "../../contexts/UserContext";

function CheckoutPage() {
  const { user, setUser } = useContext(UserContext);
  const { userIP, userLocation, error: ipError } = useUserIP(); // Get IP & location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState(0);
  const [hasDefaultPreference, setHasDefaultPreference] = useState(false);
  const [loadingDefaultPreference, setLoadingDefaultPreference] = useState(true);
  const [billingCountry, setBillingCountry] = useState(null); // Stores the billing country of the selected payment
  const [isSuspicious, setIsSuspicious] = useState(false); // Flag if IP doesn't match billing address
  const navigate = useNavigate();
  const steps = ["Delivery Address", "Payment Information", "Review Order"];
  const { cartItems, clearCart } = useContext(CartContext);

  // Voucher popup and applied voucher states
  const [voucherPopupOpen, setVoucherPopupOpen] = useState(false);
  const [claimedVouchers, setClaimedVouchers] = useState([]);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [manualVoucherCode, setManualVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [alteredPrice, setAlteredPrice] = useState(0);

  //Address Handling
  const [recipientName, setRecipientName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("");
  const [postcode, setPostcode] = useState("");
  const [country, setCountry] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");

  const finalPrice = appliedVoucher ? alteredPrice : total;
  const pointsEarned = Math.floor(total * 10);

  useEffect(() => {
    // Load cart from localStorage
    setTotal(
      cartItems.reduce((sum, item) => sum + item.itemPrice * item.quantity, 0)
    );

    // Fetch payment methods
    async function fetchPaymentMethods() {
      try {
        const response = await http.get("/Payment");
        const methods = Array.isArray(response.data) ? response.data : [];
        console.log("Payment Methods:", methods);
        const activeMethods = methods.filter(
          (method) => method.status === "Active"
        );
        setPaymentMethods(activeMethods);
        const defaultMethod = activeMethods.find((method) => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.paymentId);
          fetchBillingCountry(defaultMethod.paymentId); // Fetch billing country for default payment
        }
        setHasDefaultPreference(methods.some((method) => method.isDefault));
      } catch (err) {
        setError("Failed to load payment methods.");
      } finally {
        setLoadingDefaultPreference(false);
      }
    }

    fetchPaymentMethods();
  }, []);

  // Fetch billing country when a payment method is selected
  const fetchBillingCountry = async (paymentId) => {
    try {
      const response = await http.get(`/Payment/${paymentId}`); // Calls GetPaymentById API
      var CombinebillingAddress =
        response.data.billingAddress +
        " " +
        response.data.country +
        " " +
        response.data.billingZip;
      setBillingCountry(CombinebillingAddress);
    } catch (err) {
      toast.error("Failed to retrieve billing address.");
    }
  };

  useEffect(() => {
    if (userLocation?.country && billingCountry) {
      console.log(
        `User IP Country: ${userLocation.country}, Billing Country: ${billingCountry}`
      );
      console.log(
        `Pass IP check: ${billingCountry.includes(userLocation.country)}`
      );
      setIsSuspicious(!billingCountry.includes(userLocation.country));
    }
  }, [userLocation, billingCountry]);

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method before placing your order.");
      return;
    }

    const finalTotal = appliedVoucher ? alteredPrice : total;
    const pointsEarned = Math.floor(total * 10);
    const payload = {
      deliveryOption: 1,
      paymentId: selectedPaymentMethod,
      orderItems: cartItems.map((item) => ({
        productId: item.productId, // Ensure productId is included
        productName: item.productName,
        productCategory: item.productCategory,
        quantity: item.quantity,
        itemPrice: item.itemPrice,
        timeBought: new Date().toISOString().split('T')[0], // Send only the date
      })),
      voucherId: appliedVoucher ? appliedVoucher.voucherId : null,
      totalPrice: finalTotal,
      recipientName,
      streetAddress,
      suburb,
      state,
      postcode,
      country,
      deliveryInstructions
    };

    try {
      setLoading(true);

      // Step 4: Redeem Voucher if Applied
      const orderResponse = await http.post("/checkout", payload).catch((err) => { console.log(err) });


      const orderId = orderResponse.data.orderId;
      console.log(" Order created with ID:", orderId);

      const shippitResponse = await http.post(`/api/shippit/send/${orderId}`);

      if (!shippitResponse.data.shipmentId) {
        throw new Error("Failed to send order to Shippit.");
      }

      const { shipmentId, trackingNumber } = shippitResponse.data;
      console.log("Shipment created with ID:", shipmentId);

      const deliveryPayload = {
        orderId,
        shipmentId,
        trackingNumber,
        carrier: "Shippit",
        shipmentStatus: "Processing",
      };

      await http.post("/api/delivery", deliveryPayload);
      // If a voucher was applied, call the redeem API to mark it as used

      if (appliedVoucher) {
        await http.post(`/voucher/${appliedVoucher.voucherId}/redeem`);
        toast.success("Voucher redeemed successfully!");
      }

      // Step 5: Clear Cart & Redirect

      console.log(`points earned: ${pointsEarned}`);
      console.log(`user: ${user}`);
      console.log(`user id: ${user.id}`);

      // Assuming you have the current user in your context:
      if (user && user.id) {
        await http.put(`/user/update/${user.id}/${pointsEarned}`, {});
        toast.success(`Loyalty points updated! You earned ${pointsEarned} points.`);
      }
      
      clearCart();
      // Step 1: Fetch each product and format data for update
      const updatePromises = cartItems.map(async (item) => {
        try {
          const productResponse = await http.get(`/api/Product/${item.productId}`); // Get full product details

          // Format the response into the required ProductDto format
          const formattedProduct = {
            name: productResponse.data.name,
            image: productResponse.data.image,
            Gender: productResponse.data.gender,
            description: productResponse.data.description,
            sustainabilityNotes: productResponse.data.sustainabilityNotes,
            sizingChart: productResponse.data.sizingChart,
            price: productResponse.data.price,
            quality: productResponse.data.quality,
            brand: productResponse.data.brand,
            available: false, // Mark as unavailable
            categoryId: productResponse.data.categoryId,
            warehouseId: productResponse.data.warehouseId,
            certId: productResponse.data.certId
          };

          // Send update request
          await http.put(`/api/Product/${item.productId}`, formattedProduct);
        } catch (error) {
          console.error(`Failed to update product ${item.productId}`, error);
          toast.error(`Failed to update ${item.productName}`);
          throw new Error(`Update failed for ${item.productId}`); // Force promise rejection
        }
      });

      // Step 2: Ensure all product updates succeed before proceeding
      await Promise.all(updatePromises);
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (err) {
      toast.error("Failed to complete checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };





  // Voucher fetching function
  const fetchVouchers = async () => {
    try {
      const claimedResponse = await http.get("/voucher/claimed");
      console.log(claimedResponse.data);

      // Filter vouchers that have not been redeemed
      const activeClaimed = claimedResponse.data.filter(
        (v) => v.redeemedAt == null && v.minimumValue <= total
      );
      console.log(activeClaimed);
      setClaimedVouchers(activeClaimed);

      const allResponse = await http.get("/voucher");
      const allVouchers = allResponse.data;

      // Remove vouchers that don't meet the minimum value requirement
      const claimedIds = claimedResponse.data.map((v) => v.VoucherId);
      const avail = allVouchers.filter(
        (v) => !claimedIds.includes(v.VoucherId) && v.minimumValue <= total
      );
      setAvailableVouchers(avail);
    } catch (err) {
      toast.error("Failed to load vouchers.");
    }
  };

  // Fetch vouchers when popup is opened
  useEffect(() => {
    if (voucherPopupOpen) {
      fetchVouchers();
    }
  }, [voucherPopupOpen]);

  useEffect(() => {
    console.log("Claimed Vouchers updated:", claimedVouchers);
  }, [claimedVouchers]);

  const handleApplyVoucher = async (voucher) => {
    try {
      const response = await http.post("/voucher/apply", {
        VoucherId: voucher.voucherId,
        OriginalPrice: total,
      });
      // Expecting the API response to have an alteredPrice field
      console.log("Apply Voucher Response:", response.data);
      setAlteredPrice(response.data.alteredPrice);
      setAppliedVoucher(voucher);
      setVoucherPopupOpen(false);
    } catch (err) {
      toast.error("Failed to apply voucher.");
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setAlteredPrice(total);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Checkout Page
      </Typography>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Stepper Navigation */}
        <Box sx={{ flex: 2 }}>
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Delivery Step */}
          {step === 0 && (
            <Box>
              <Typography variant="h6">Delivery Address</Typography>
              <TextField
                label="Full Name"
                fullWidth
                margin="normal"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
              <TextField
                label="Address"
                fullWidth
                margin="normal"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
              <TextField
                label="City"
                fullWidth
                margin="normal"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
              />
              <TextField
                label="State"
                fullWidth
                margin="normal"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
              <TextField
                label="Postal Code"
                fullWidth
                margin="normal"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
              <TextField
                label="Country"
                fullWidth
                margin="normal"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/")}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={() => setStep(step + 1)} disabled={recipientName === "" || streetAddress === "" || suburb === "" || state === "" || postcode === "" || country === ""}>
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Payment Step */}
          {step === 1 && (
            <Box>
              {isSuspicious && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Suspicious activity detected! The selected payment method's billing
                  country ({billingCountry}) does not match your detected IP location (
                  {userLocation?.country}).
                </Alert>
              )}

              <Typography variant="h6">Payment Information</Typography>
              {loadingDefaultPreference ? (
                <CircularProgress sx={{ display: "block", margin: "auto", mt: 2 }} />
              ) : paymentMethods.length === 0 ? (
                <Box>
                  <Alert severity="error">No payment methods detected.</Alert>
                  <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate("/addpayment")}>
                    Add Payment Method
                  </Button>
                </Box>
              ) : (
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    setSelectedPaymentMethod(e.target.value);
                    fetchBillingCountry(e.target.value);
                  }}
                >
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.paymentId}
                      value={method.paymentId}
                      control={<Radio />}
                      label={`${method.paymentMethod} ending in ${method.maskedCardNumber}`}
                    />
                  ))}
                </RadioGroup>
              )}

              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button onClick={() => setStep(step - 1)}>Back</Button>
                <Button
                  variant="contained"
                  onClick={() => setStep(step + 1)}
                  disabled={paymentMethods.length === 0 || isSuspicious}
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Review Step */}
          {step === 2 && (
            <Box>
              <Box sx={{ maxWidth: 500, margin: "auto", padding: 2 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Review Order
                </Typography>

                {/* Scrollable Box */}
                <Paper
                  elevation={3}
                  sx={{
                    maxHeight: 300, // Adjust height as needed
                    overflowY: "auto",
                    padding: 2,
                    borderRadius: 2,
                    backgroundColor: "#f9f9f9", // Light background for a better look
                  }}
                >
                  <Grid container spacing={2}>
                    {cartItems.map((item) => (
                      <Grid item xs={12} key={item.productId}>
                        <Card sx={{ display: "flex", alignItems: "center", padding: 1 }}>
                          <CardMedia
                            component="img"
                            sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                            image={item.image ? `${import.meta.env.VITE_FILE_BASE_URL}${item.image}` : "/default-product.jpg"}
                            alt={item.productName}
                          />
                          <CardContent sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="bold">
                              {item.productName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ${item.itemPrice.toFixed(2)} x {item.quantity}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>

                <Divider sx={{ my: 2 }} />

                <Typography variant="h6" align="right" sx={{ fontWeight: "bold" }}>
                  Subtotal: ${total.toFixed(2)}
                </Typography>
              </Box>
              {appliedVoucher && (
                <Box sx={{ mt: 2, p: 1, border: "1px solid #ccc", borderRadius: 1 }}>
                  <Typography variant="subtitle1">
                    Applied Voucher: {appliedVoucher.voucherName}
                  </Typography>
                  <Typography variant="body2">
                    Discount:{" "}
                    {appliedVoucher.VoucherTypeEnum === 0 &&
                      appliedVoucher.DiscountValue < 1
                      ? `${(appliedVoucher.DiscountValue * 100).toFixed(0)}%`
                      : appliedVoucher.VoucherTypeEnum === 0
                        ? `$${appliedVoucher.DiscountValue}`
                        : "Free Shipping"}
                  </Typography>
                  <Typography variant="body2">
                    New Total: ${alteredPrice.toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button onClick={() => setStep(step - 1)}>Back</Button>
                {/* Button to open voucher popup */}
                <Button variant="outlined" onClick={() => setVoucherPopupOpen(true)}>
                  Apply Voucher
                </Button>
                <Button variant="contained" onClick={handlePlaceOrder}>
                  Place Order
                </Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Order Summary Sidebar */}
        <Paper sx={{ maxWidth: 300, margin: "auto", p: 2 }}>
          {/* Fixed Title */}
          <Typography variant="h6" align="center" gutterBottom>
            Order Summary
          </Typography>

          {/* Scrollable Items */}
          <Box
            sx={{
              maxHeight: 275, // Adjust height as needed
              overflowY: "auto",
              paddingRight: 1, // Prevents scrollbar overlapping content
            }}
          >
            <Grid container spacing={2}>
              {cartItems.map((item) => (
                <Grid item xs={12} key={item.productId}>
                  <Card sx={{ display: "flex", alignItems: "center", padding: 1 }}>
                    <CardMedia
                      component="img"
                      sx={{ width: 80, height: 80, objectFit: "cover", borderRadius: 1 }}
                      image={item.image ? `${import.meta.env.VITE_FILE_BASE_URL}${item.image}` : "/default-product.jpg"}
                      alt={item.productName}
                    />
                    <CardContent sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        {item.productName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${item.itemPrice.toFixed(2)} x {item.quantity}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Fixed Subtotal */}
          <Typography variant="h6" align="center" sx={{ fontWeight: "bold" }}>
            Subtotal: ${total.toFixed(2)}
          </Typography>
          {appliedVoucher && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="subtitle1" align="center">
                Applied Voucher: {appliedVoucher.voucherName}
              </Typography>
              <Typography variant="subtitle1" align="center" color="green">
                New Total: ${alteredPrice.toFixed(2)}
              </Typography>
            </Box>
          )}
          <Typography variant="subtitle1" align="center" sx={{ mt: 1 }}>
            Points Earned: {pointsEarned}
          </Typography>
        </Paper>
      </Box>

      {/* Voucher Popup Dialog */}
      <Dialog
        open={voucherPopupOpen}
        onClose={() => setVoucherPopupOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Apply Voucher</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">My Vouchers</Typography>
          {claimedVouchers.length === 0 ? (
            <Typography>No claimed vouchers.</Typography>
          ) : (
            claimedVouchers.map((voucher) => (
              <Box
                key={voucher.VoucherId}
                sx={{
                  p: 1,
                  border: "1px solid #ccc",
                  borderRadius: 1,
                  my: 1,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="body1">
                    {voucher.voucherName}
                  </Typography>
                  <Typography variant="body2">
                    Discount: {voucher.discountValue}{" "}
                    {voucher.voucherTypeEnum === 0 &&
                      voucher.discountValue < 1
                      ? "(Percentage)"
                      : voucher.voucherTypeEnum === 0 &&
                        voucher.discountValue >= 1
                        ? "(Flat)"
                        : "(Free Shipping)"}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => {
                    setAppliedVoucher(voucher);
                    handleApplyVoucher(voucher);
                    setVoucherPopupOpen(false);
                  }}
                >
                  Apply
                </Button>
              </Box>
            ))
          )}

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Enter Voucher Code
          </Typography>
          <TextField
            fullWidth
            placeholder="Enter voucher code"
            value={manualVoucherCode}
            onChange={(e) => setManualVoucherCode(e.target.value)}
            margin="dense"
          />
          <Button
            variant="contained"
            onClick={async () => {
              const voucher = availableVouchers.find(
                (v) =>
                  v.VoucherCode.toLowerCase() ===
                  manualVoucherCode.toLowerCase()
              );
              if (!voucher) {
                toast.error("Voucher code not found or already claimed.");
                return;
              }
              try {
                await http.post(`/voucher/${voucher.VoucherId}/claim`);
                toast.success("Voucher claimed successfully!");
                setManualVoucherCode("");
                fetchVouchers();
              } catch (err) {
                toast.error("Failed to claim voucher.");
              }
            }}
            sx={{ mt: 1 }}
          >
            Apply Voucher Code
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoucherPopupOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CheckoutPage;