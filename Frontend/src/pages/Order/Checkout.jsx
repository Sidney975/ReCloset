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
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import http from "../../http";

function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cartItems, setCartItems] = useState([
    { id: 1, name: "T-Shirt", price: 10.99, quantity: 2 },
    { id: 2, name: "Jeans", price: 20.99, quantity: 1 },
  ]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [total, setTotal] = useState(0);
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState({
    firstName: "Jerald",
    lastName: "Liu",
    address: "Canberra Street 998, Singapore",
    city: "Singapore",
    state: "Singapore",
    zipCode: "123456",
  });
  const navigate = useNavigate();
  const steps = ["Delivery Address", "Payment Information", "Review Order"];

  useEffect(() => {
    console.log("Calculating total...");
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setTotal(totalAmount);

    // Fetch payment methods
    // Fetch payment methods
    async function fetchPaymentMethods() {
      try {
        console.log("Fetching payment methods...");
        const response = await http.get("/payment");
        console.log("Payment methods response:", response.data);

        // Filter and process payment methods
        const methods = Array.isArray(response.data)
          ? response.data
            .filter((method) => method.status === "Active") // Only include active payment methods
            .map((method) => ({
              PaymentId: method.paymentId,
              PaymentMethod: method.paymentMethod || "Unknown Method",
              MaskedCardNumber: method.maskedCardNumber || "****",
              IsDefault: method.isDefault || false,
            }))
          : [];
        setPaymentMethods(methods);

        const defaultMethod = methods.find((method) => method.IsDefault);
        if (defaultMethod) {
          setSelectedPaymentMethod(defaultMethod.PaymentId);
          console.log("Default payment method selected:", defaultMethod);
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        setError("Failed to load payment methods. Please try again.");
      }
    }



    fetchPaymentMethods();
  }, [cartItems]);

  const handleNext = () => {
    console.log(`Proceeding to the next step. Current step: ${step}`);
    if (step < steps.length - 1) setStep(step + 1);
  };

  const handleBack = () => {
    console.log(`Going back to the previous step. Current step: ${step}`);
    if (step > 0) setStep(step - 1);
  };

  const handlePaymentMethodChange = (event) => {
    console.log("Payment method changed to:", event.target.value);
    setSelectedPaymentMethod(event.target.value);
  };

  const handlePlaceOrder = async () => {
    const payload = {
      deliveryOption: 1,
      paymentId: selectedPaymentMethod,
      orderItems: cartItems.map((item) => ({
        ProductId: item.id,
        Quantity: item.quantity,
        ItemPrice: item.price,
      })),
    };

    try {
      setLoading(true);
      console.log("Placing order with payload:", payload);
      const response = await http.post("/checkout", payload);
      console.log("Order placed successfully:", response.data);
      toast.success("Order placed successfully!");
      navigate("/");
    } catch (err) {
      console.error("Error placing order:", err);
      toast.error("Failed to place the order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !error) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Checkout Page
      </Typography>
      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Main Content */}
        <Box sx={{ flex: 2 }}>
          <Stepper activeStep={step} sx={{ mb: 3 }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          <Box>
            {step === 0 && (
              <Box>
                <Typography variant="h6">Delivery Address</Typography>
                <Box component="form" sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={address.firstName}
                    onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={address.lastName}
                    onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                  />
                  <TextField
                    label="Address"
                    fullWidth
                    value={address.address}
                    onChange={(e) => setAddress({ ...address, address: e.target.value })}
                  />
                  <TextField
                    label="City"
                    fullWidth
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  />
                  <TextField
                    label="State"
                    fullWidth
                    value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                  />
                  <TextField
                    label="ZIP Code"
                    fullWidth
                    value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                  />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                    {/* New Navigate Home Button */}
                    <Button variant="outlined" color="secondary" onClick={() => navigate("/")}>
                      Cancel
                    </Button>
                    <Button variant="contained" onClick={handleNext}>
                      Next
                    </Button>
                  </Box>
                </Box>
              </Box>
            )}
            {step === 1 && (
              <Box>
                <Typography variant="h6">Payment Information</Typography>
                <RadioGroup value={selectedPaymentMethod} onChange={handlePaymentMethodChange}>
                  {paymentMethods.map((method) => (
                    <FormControlLabel
                      key={method.PaymentId}
                      value={method.PaymentId}
                      control={<Radio />}
                      label={`${method.PaymentMethod} ending in ${method.MaskedCardNumber}`}
                    />
                  ))}
                </RadioGroup>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                </Box>
              </Box>
            )}
            {step === 2 && (
              <Box>
                <Typography variant="h6">Review Order</Typography>
                <ul>
                  {cartItems.map((item) => (
                    <li key={item.id}>
                      {item.name} - ${item.price.toFixed(2)} x {item.quantity}
                    </li>
                  ))}
                </ul>
                <Typography variant="h6">Total: ${total.toFixed(2)}</Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                  <Button onClick={handleBack}>Back</Button>
                  <Button variant="contained" onClick={handlePlaceOrder}>
                    Place Order
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
        {/* Cart Items */}
        <Paper
          sx={{
            flex: 1,
            p: 2,
            height: 300, // Fixed height
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflowY: "auto", // Enable scrolling for overflow
          }}
        >
          <Typography variant="h6" align="center">
            Order Summary
          </Typography>
          <ul>
            {cartItems.map((item) => (
              <li key={item.id}>
                {item.name} - ${item.price.toFixed(2)} x {item.quantity}
              </li>
            ))}
          </ul>
          <Typography variant="h6" align="center">
            Total: ${total.toFixed(2)}
          </Typography>
        </Paper>
      </Box>
    </Box>

  );
}

export default CheckoutPage;