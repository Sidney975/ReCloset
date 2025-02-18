import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Box, Typography, TextField, Button, MenuItem, Fab, Checkbox, FormControlLabel, IconButton, InputAdornment } from "@mui/material";
import { useFormik } from "formik";
import { Visibility, VisibilityOff, Check, ArrowBack } from "@mui/icons-material";
import * as yup from "yup";
import http from "../../http"; // Replace with your actual HTTP client

function AddPayment() {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCVV, setShowCVV] = useState(false);
  const [hasDefaultPreference, setHasDefaultPreference] = useState(false);
  const [loadingDefaultPreference, setLoadingDefaultPreference] = useState(true);
  const [status, setStatus] = useState("Inactive"); // Track status
  const cardNumberRef = useRef(null);
  const cvvRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    http.get("/payment")
      .then((res) => {
        const hasDefault = res.data.some((method) => method.isDefault === true);
        console.log("Has default preference:", hasDefault);
        setHasDefaultPreference(hasDefault);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch payment methods. Please try again.");
      })
      .finally(() => {
        setLoadingDefaultPreference(false); // Indicate that the check is complete
      });
  }, []);

  const handleClickShowCardNumber = () => {
    const input = cardNumberRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setShowCardNumber(!showCardNumber);
    setTimeout(() => {
      input.setSelectionRange(start, end);
    }, 0);
  };

  const handleMouseDownCardNumber = (event) => event.preventDefault();

  const handleClickShowCVV = () => {
    const input = cvvRef.current;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    setShowCVV(!showCVV);
    setTimeout(() => {
      input.setSelectionRange(start, end);
    }, 0);
  };

  const handleMouseDownCVV = (event) => event.preventDefault();

  const formik = useFormik({
    initialValues: {
      firstName: "", // 🔹 Added First Name
      lastName: "", // 🔹 Added Last Name
      mobileNumber: "", // 🔹 Added Mobile Number
      paymentMethod: "",
      cardNumber: "",
      cvv: "",
      expiryDate: "",
      billingAddress: "",
      billingZip: "",
      status: "Inactive",
      defaultPreference: false,
      country: "",  // 🔹 Added country
      city: ""      // 🔹 Added city
    },
    validationSchema: yup.object({
      firstName: yup.string().trim().max(50).required("First Name is required"), // 🔹 Validation
      lastName: yup.string().trim().max(50).required("Last Name is required"), // 🔹 Validation
      mobileNumber: yup.string().matches(/^\d{8}$/, "Mobile number must be between 8 digits").required("Mobile number is required"), // 🔹 Validation
      paymentMethod: yup.string().trim().required("Payment Method is required").max(50),
      cardNumber: yup.string().trim().matches(/^\d{16}$/, "Card Number must be 16 digits").required("Card Number is required"),
      cvv: yup.string().trim().matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits").required("CVV is required"),
      expiryDate: yup.date().required("Expiry Date is required").test("is-future-date", "Card is Expired", (value) => value && new Date(value) > new Date()),
      billingAddress: yup.string().trim().max(200).required("Billing Address is required"),
      billingZip: yup.string().matches(/^\d{6}$/, "Billing ZIP must be exactly 6 digits").required("Billing ZIP is required"),
      status: yup.string().required("Status is required"),
      defaultPreference: yup.boolean(),
      country: yup.string().trim().required("Country is required"),  // 🔹 Added validation
      city: yup.string().trim().required("City is required"),        // 🔹 Added validation
    }),
    onSubmit: (data) => {
      const payload = {
        paymentMethod: data.paymentMethod,
        cardNumber: data.cardNumber,
        cvv: data.cvv,
        expiryDate: new Date(data.expiryDate).toISOString().split("T")[0],
        billingAddress: data.billingAddress,
        defaultPreference: data.defaultPreference,
        status: data.status === "Active" ? 1 : 0,
        country: data.country,
        city: data.city,
        mobileNumber: data.mobileNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        billingZip: parseInt(data.billingZip, 10),
      };

      http.post("/payment", payload)
        .then(() => {
          toast.success("Payment Added Successfully!");
          navigate("/payments");
        })
        .catch((err) => {
          console.error(err);
          toast.error("Error adding payment, please try again.");
        });
    },
  });

  const handleExpiryDateBlur = (event) => {
    const value = event.target.value;

    // Check if the entered date is valid and not in the past
    if (value && new Date(value) <= new Date()) {
      toast.error("The card is expired. Please use a valid expiry date.");
    }

    // Call Formik's default blur handler
    formik.handleBlur(event);
  };

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    formik.setFieldValue("status", newStatus);
    if (newStatus === "Inactive" || newStatus === "Active") {
      formik.setFieldValue("defaultPreference", false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        margin: "auto",
        padding: 4,
        borderRadius: 2,
        color: "black",
      }}
    >
      <Typography variant="h5" sx={{ my: 2 }}>
        Add Payment
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <TextField
          select
          fullWidth
          margin="dense"
          label="Payment Method"
          name="paymentMethod"
          value={formik.values.paymentMethod}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.paymentMethod && Boolean(formik.errors.paymentMethod)}
          helperText={formik.touched.paymentMethod && formik.errors.paymentMethod}
        >
          <MenuItem value="Visa">Visa</MenuItem>
          <MenuItem value="MasterCard">Master Card</MenuItem>
          <MenuItem value="Credit Card">Credit Card</MenuItem>
          <MenuItem value="Debit Card">Debit Card</MenuItem>
        </TextField>
        <TextField
          fullWidth
          margin="dense"
          label="Card Number"
          name="cardNumber"
          type={showCardNumber ? "text" : "password"}
          value={formik.values.cardNumber}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 16) {
              formik.setFieldValue("cardNumber", value);
            }
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
          helperText={formik.touched.cardNumber && formik.errors.cardNumber}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle card number visibility"
                  onClick={handleClickShowCardNumber}
                  onMouseDown={handleMouseDownCardNumber}
                  edge="end"
                >
                  {showCardNumber ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            inputRef: cardNumberRef,
          }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="CVV"
          name="cvv"
          type={showCVV ? "text" : "password"}
          value={formik.values.cvv}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 4) {
              formik.setFieldValue("cvv", value);
            }
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.cvv && Boolean(formik.errors.cvv)}
          helperText={formik.touched.cvv && formik.errors.cvv}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle cvv visibility"
                  onClick={handleClickShowCVV}
                  onMouseDown={handleMouseDownCVV}
                  edge="end"
                >
                  {showCVV ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            inputRef: cvvRef,
          }}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Expiry Date"
          type="date"
          name="expiryDate"
          InputLabelProps={{ shrink: true }}
          value={formik.values.expiryDate}
          onChange={formik.handleChange}
          onBlur={handleExpiryDateBlur} // Use the custom blur handler here
          error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
          helperText={formik.touched.expiryDate && formik.errors.expiryDate}
        />

        {/* 🔹 First Name */}
        <TextField
          fullWidth
          margin="dense"
          label="First Name"
          name="firstName"
          value={formik.values.firstName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
          helperText={formik.touched.firstName && formik.errors.firstName}
        />

        {/* 🔹 Last Name */}
        <TextField
          fullWidth
          margin="dense"
          label="Last Name"
          name="lastName"
          value={formik.values.lastName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.lastName && Boolean(formik.errors.lastName)}
          helperText={formik.touched.lastName && formik.errors.lastName}
        />

        <TextField
          fullWidth
          margin="dense"
          label="Billing Address"
          name="billingAddress"
          value={formik.values.billingAddress}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.billingAddress && Boolean(formik.errors.billingAddress)}
          helperText={formik.touched.billingAddress && formik.errors.billingAddress}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Billing ZIP"
          name="billingZip"
          value={formik.values.billingZip}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*$/.test(value) && value.length <= 6) {
              formik.setFieldValue("billingZip", value);
            }
          }}
          onBlur={formik.handleBlur}
          error={formik.touched.billingZip && Boolean(formik.errors.billingZip)}
          helperText={formik.touched.billingZip && formik.errors.billingZip}
        />



        {/* 🔹 City */}
        <TextField
          fullWidth
          margin="dense"
          label="City"
          name="city"
          value={formik.values.city}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.city && Boolean(formik.errors.city)}
          helperText={formik.touched.city && formik.errors.city}
        />

        {/* 🔹 Country */}
        <TextField
          fullWidth
          margin="dense"
          label="Country"
          name="country"
          value={formik.values.country}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.country && Boolean(formik.errors.country)}
          helperText={formik.touched.country && formik.errors.country}
        />

        {/* 🔹 Mobile Number */}
        <TextField
          fullWidth
          margin="dense"
          label="Mobile Number"
          name="mobileNumber"
          value={formik.values.mobileNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.mobileNumber && Boolean(formik.errors.mobileNumber)}
          helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
        />

        <TextField
          select
          fullWidth
          margin="dense"
          label="Status"
          name="status"
          value={formik.values.status}
          onChange={handleStatusChange}
          onBlur={formik.handleBlur}
          error={formik.touched.status && Boolean(formik.errors.status)}
          helperText={formik.touched.status && formik.errors.status}
        >
          <MenuItem value="Inactive">Inactive</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
        </TextField>

        {/* Conditionally render the Default Preference checkbox */}
        {status === "Active" && !hasDefaultPreference && (
          <FormControlLabel
            control={<Checkbox checked={formik.values.defaultPreference} onChange={formik.handleChange} name="defaultPreference" />}
            label="Default Preference"
          />
        )}

        <Box sx={{ mt: 3, textAlign: "right", display: "flex", justifyContent: "space-between" }}>
          {/* Back FAB */}
          <Fab color="primary" aria-label="back" onClick={() => navigate(-1)}>
            <ArrowBack />
          </Fab>
          <Button variant="contained" color="primary" type="submit" disabled={loadingDefaultPreference}>
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default AddPayment;