import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    CircularProgress,
    Alert,
    IconButton,
    InputAdornment,
    Fab,
    FormControlLabel,
    Checkbox
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Visibility, VisibilityOff, Check, ArrowBack } from "@mui/icons-material";
import http from "../../http";

function EditPayment() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCardNumber, setShowCardNumber] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const [hasDefaultPreference, setHasDefaultPreference] = useState(false);
    const [isCurrentDefault, setIsCurrentDefault] = useState(false);
    const cardNumberRef = useRef(null);
    const cvvRef = useRef(null);

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

    useEffect(() => {
        // Fetch all payments to determine if a default preference exists
        http.get("/payment")
            .then((res) => {
                const hasDefault = res.data.some((method) => method.isDefault === true);
                setHasDefaultPreference(hasDefault);
            })
            .catch((err) => {
                console.error("Error fetching payments:", err);
                toast.error("Failed to fetch payment methods.");
            });

        http.get(`/payment/${id}`)
            .then((response) => {
                formik.setValues({
                    paymentMethod: response.data.paymentMethod,
                    cardNumber: "",
                    cvv: "",
                    expiryDate: "",
                    billingAddress: response.data.billingAddress,
                    billingZip: response.data.billingZip,
                    status: response.data.status,
                    defaultPreference: response.data.isDefault || false,
                    country: response.data.country,  // 🔹 Added country
                    city: response.data.city     // 🔹 Added city
                });
                setIsCurrentDefault(response.data.isDefault);
                console.log("Payment details loaded:", response.data);
                console.log("Default Preference Right Now:", response.data.isDefault);
                console.log("isCurrentDefault", response.data.isDefault);
                setLoading(false);
            })
            .catch((err) => {
                setError("Failed to load payment details.");
                console.error(err);
                setLoading(false);
                toast.error("Failed to load payment details.");
            });
    }, [id]);

    const formik = useFormik({
        initialValues: {
            paymentMethod: "",
            cardNumber: "",
            cvv: "",
            expiryDate: "",
            billingAddress: "",
            billingZip: "",
            status: "Inactive",
            defaultPreference: false, // Ensure this is a boolean
        },

        validationSchema: yup.object({
            paymentMethod: yup.string().required("Payment Method is required"),
            cardNumber: yup
                .string()
                .matches(/^\d{16}$/, "Card Number must be 16 digits")
                .required("Card Number is required"),
            cvv: yup
                .string()
                .matches(/^\d{3,4}$/, "CVV must be 3 or 4 digits")
                .required("CVV is required"),
            expiryDate: yup
                .date()
                .required("Expiry Date is required")
                .test("is-future-date", "Card is Expired", (value) => {
                    return value && new Date(value) > new Date();
                }),
            billingAddress: yup
                .string()
                .max(200, "Maximum 200 characters")
                .required("Billing Address is required"),
            billingZip: yup
                .string()
                .matches(/^\d{6}$/, "Billing ZIP must be a valid 6-digit code")
                .required("Billing ZIP is required"),
            status: yup.string().required("Status is required"),
            country: yup.string().trim().required("Country is required"),  // 🔹 Added validation
            city: yup.string().trim().required("City is required"),        // 🔹 Added validation
        }),
        validateOnBlur: true,
        validateOnChange: true,
        onSubmit: async (data) => {
            if (new Date(data.expiryDate) < new Date()) {
                toast.error("Card is expired. Please check the expiration date.");
                return;
            }
            const payload = {
                ...data,
                billingZip: parseInt(data.billingZip, 10),
                status: data.status === "Active" ? 1 : 0,
                defaultPreference: data.defaultPreference ? true : false, // Include defaultPreference in the payload
            };
            console.log("Submitting payload:", payload);
            http.put(`/payment/${id}`, payload)
                .then(() => {
                    toast.success("Payment updated successfully!");
                    navigate("/payments");
                })
                .catch((err) => {
                    console.error("Submission Error:", err);
                    toast.error("Failed to update payment. Please try again.");
                });
        },
    });

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        formik.setFieldValue("status", newStatus);
        if (newStatus === "Inactive") {
            formik.setFieldValue("defaultPreference", false);
        } else if (newStatus === "Active" && isCurrentDefault) {
            formik.setFieldValue("defaultPreference", true);
        } else {
            formik.setFieldValue("defaultPreference", false);
        }
    };

    if (loading) {
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

    const handleExpiryDateBlur = (event) => {
        const value = event.target.value;

        // Check if the entered date is valid and not in the past
        if (value && new Date(value) <= new Date()) {
            toast.error("The card is expired. Please use a valid expiry date.");
        }

        // Call Formik's default blur handler
        formik.handleBlur(event);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
                Edit Payment
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
                        const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
                        if (value.length <= 16) {
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
                        const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
                        if (value.length <= 4) {
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
                    onBlur={handleExpiryDateBlur}
                    error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                    helperText={formik.touched.expiryDate && formik.errors.expiryDate}
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
                        const value = e.target.value.replace(/\D/g, ""); // Allow only numbers
                        if (value.length <= 6) {
                            formik.setFieldValue("billingZip", value);
                        }
                    }}
                    onBlur={formik.handleBlur}
                    error={formik.touched.billingZip && Boolean(formik.errors.billingZip)}
                    helperText={formik.touched.billingZip && formik.errors.billingZip}
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
                {formik.values.status === "Active" && (!hasDefaultPreference || isCurrentDefault) && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={!!formik.values.defaultPreference} // Coerce to boolean
                                onChange={formik.handleChange}
                                name="defaultPreference"
                            />
                        }
                        label="Default Preference"
                    />
                )}

                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
                    {/* Back FAB */}
                    <Fab color="primary" aria-label="back" onClick={() => navigate(-1)}>
                        <ArrowBack />
                    </Fab>
                    {/* Save Changes FAB */}
                    <Fab color="success" aria-label="save" type="submit">
                        <Check />
                    </Fab>
                </Box>
            </Box>
        </Box>
    );
}

export default EditPayment;