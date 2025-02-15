import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import useUserIP from "../../hooks/useUserIp"; // Import IP detection hook
import http from "../../http";

function CheckoutPage() {
  const { userIP, userLocation, error: ipError } = useUserIP(); // Get IP & location
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([]);
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

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = JSON.parse(localStorage.getItem("CartItems")) || [];
    setCartItems(storedCart);
    setTotal(storedCart.reduce((sum, item) => sum + item.price * item.quantity, 0));

    // Fetch payment methods
    async function fetchPaymentMethods() {
      try {
        const response = await http.get("/Payment");
        const methods = Array.isArray(response.data) ? response.data : [];
        console.log("Payment Methods:", methods);
        const activeMethods = methods.filter((method) => method.status === "Active");
        setPaymentMethods(activeMethods);
        const defaultMethod = activeMethods.find((method) => method.isDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.paymentId);
          fetchBillingCountry(defaultMethod.paymentId); // Fetch billing country for default payment
        }

        // Check if any default payment method exists
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
      var CombinebillingAddress = response.data.billingAddress + " " + response.data.country + " " + response.data.billingZip ; // Set billing country from API
      setBillingCountry(CombinebillingAddress); // Set billing country from API
    } catch (err) {
      toast.error("Failed to retrieve billing address.");
    }
  };

  useEffect(() => {
    if (userLocation?.country && billingCountry) {
      console.log(`User IP Country: ${userLocation.country}, Billing Country: ${billingCountry}`);
      console.log(`Pass IP check: ${billingCountry.includes(userLocation.country)}`);

      // Block checkout if the selected card’s billing country does not contain the IP country
      setIsSuspicious(!billingCountry.includes(userLocation.country));
    }
  }, [userLocation, billingCountry]);

  const handlePlaceOrder = async () => {
    if (isSuspicious) {
      toast.error("Transaction blocked: Your IP location does not match the billing country of the selected payment method.");
      return;
    }

    if (!selectedPaymentMethod) {
      toast.error("Please select a payment method before placing your order.");
      return;
    }

    const payload = {
      deliveryOption: 1,
      paymentId: selectedPaymentMethod,
      orderItems: cartItems.map((item) => ({
        ProductId: item.productId,
        Quantity: item.quantity,
        ItemPrice: item.price,
      })),
    };

    try {
      setLoading(true);
      await http.post("/checkout", payload);
      toast.success("Order placed successfully!");
      localStorage.removeItem("CartItems");
      navigate("/");
    } catch (err) {
      toast.error("Failed to place the order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Checkout Page</Typography>
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
              <TextField label="Full Name" fullWidth margin="normal" defaultValue="John Doe" />
              <TextField label="Address" fullWidth margin="normal" defaultValue="123 Street, Singapore" />
              <TextField label="City" fullWidth margin="normal" defaultValue="Singapore" />
              <TextField label="Postal Code" fullWidth margin="normal" defaultValue="123456" />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button variant="outlined" onClick={() => navigate("/")}>Cancel</Button>
                <Button variant="contained" onClick={() => setStep(step + 1)}>Next</Button>
              </Box>
            </Box>
          )}

          {/* Payment Step */}
          {step === 1 && (
            <Box>
              {/* Show warning if billing country and IP country don’t match */}
              {isSuspicious && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Suspicious activity detected! The selected payment method's billing country ({billingCountry})
                  does not match your detected IP location ({userLocation?.country}).
                </Alert>
              )}
              
              <Typography variant="h6">Payment Information</Typography>
              {/* Show loading spinner while checking payment methods */}
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
                // Display payment method selection if available
                <RadioGroup
                  value={selectedPaymentMethod}
                  onChange={(e) => {
                    setSelectedPaymentMethod(e.target.value);
                    fetchBillingCountry(e.target.value); // Fetch billing country for selected payment method
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
                  disabled={paymentMethods.length === 0 || isSuspicious} // Disable next if no payment methods or suspicious activity
                >
                  Next
                </Button>
              </Box>
            </Box>
          )}

          {/* Review Step */}
          {step === 2 && (
            <Box>
              <Typography variant="h6">Review Order</Typography>
              <ul>
                {cartItems.map((item) => (
                  <li key={item.productId}>
                    {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                  </li>
                ))}
              </ul>
              <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                <Button onClick={() => setStep(step - 1)}>Back</Button>
                <Button variant="contained" onClick={handlePlaceOrder}>Place Order</Button>
              </Box>
            </Box>
          )}
        </Box>

        {/* Order Summary Sidebar */}
        <Paper sx={{ flex: 1, p: 2, height: 300, overflowY: "auto" }}>
          <Typography variant="h6" align="center">Order Summary</Typography>
          <ul>
            {cartItems.map((item) => (
              <li key={item.productId}>
                {item.name} - ${item.price.toFixed(2)} x {item.quantity}
              </li>
            ))}
          </ul>
          <Typography variant="h6" align="center">Total: ${total.toFixed(2)}</Typography>
        </Paper>
      </Box>
    </Box>
  );
}

export default CheckoutPage;