import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { useFormik } from 'formik';
import http from '../../http'; // Your HTTP helper (e.g., an axios instance)
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AddVoucher() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  // Fetch categories (for Free Shipping vouchers)
  useEffect(() => {
    http.get("/api/category")
      .then(response => {
        setCategories(response.data);
      })
      .catch(error => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      });
  }, []);

  const formik = useFormik({
    initialValues: {
      voucherName: "",
      voucherTypeEnum: "", // "PriceDeduction" or "FreeShipping"
      voucherCode: "",
      // For Price Deduction vouchers:
      discountType: "", // "percentage" or "flat"
      discountValue: "",
      // Other fields:
      minimumValue: "",
      pointsCost: "",
      expirationDate: "",
      // For Free Shipping vouchers:
      categoryId: "",
      hidden: false
    },
    // No external validation schema is provided.
    onSubmit: (data) => {
      // Trim string fields
      data.voucherName = data.voucherName.trim();
      data.voucherCode = data.voucherCode.trim();

      // Conditional logic based on voucher type
      if (data.voucherTypeEnum === "FreeShipping") {
        // For Free Shipping, force discount value to 0 and clear discount type.
        data.discountValue = 0;
        data.discountType = "";
        if (!data.categoryId) {
          toast.error("Please select a category for Free Shipping vouchers.");
          return;
        }
      } else if (data.voucherTypeEnum === "PriceDeduction") {
        // For Price Deduction, ensure discount type and value are valid.
        if (!data.discountType) {
          toast.error("Please select a discount type.");
          return;
        }
        const discount = parseFloat(data.discountValue);
        if (data.discountType === "percentage") {
          if (isNaN(discount) || discount < 0.01 || discount > 0.99) {
            toast.error("Percentage discount must be between 0.01 and 0.99.");
            return;
          }
        } else if (data.discountType === "flat") {
          if (isNaN(discount) || discount < 1) {
            toast.error("Flat discount must be at least 1.");
            return;
          }
        }
      }
      // Post the data to the server
      http.post("/voucher", data)
        .then((res) => {
          toast.success("Voucher added successfully!");
          navigate("/admin/voucher");
        })
        .catch((err) => {
          console.error("Failed to add voucher:", err);
          toast.error("Failed to add voucher. Please try again.");
        });
    }
  });

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        Add Voucher
      </Typography>
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          

          <Grid item xs={12} md={6}>
            {/* Voucher Name */}
            <TextField
              fullWidth
              margin="dense"
              label="Voucher Name"
              name="voucherName"
              value={formik.values.voucherName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {/* Voucher Type */}
            <TextField
              select
              fullWidth
              margin="dense"
              label="Voucher Type"
              name="voucherTypeEnum"
              value={formik.values.voucherTypeEnum}
              onChange={(e) => {
                formik.handleChange(e);
                // When voucher type changes, clear related fields.
                if (e.target.value === "FreeShipping") {
                  formik.setFieldValue("discountType", "");
                  formik.setFieldValue("discountValue", 0);
                  formik.setFieldValue("categoryId", "");
                } else {
                  formik.setFieldValue("discountType", "");
                  formik.setFieldValue("discountValue", "");
                  formik.setFieldValue("categoryId", "");
                }
              }}
              onBlur={formik.handleBlur}
            >
              <MenuItem value="PriceDeduction">Price Deduction</MenuItem>
              <MenuItem value="FreeShipping">Free Shipping</MenuItem>
            </TextField>

            {/* Voucher Code */}
            <TextField
              fullWidth
              margin="dense"
              label="Voucher Code"
              name="voucherCode"
              value={formik.values.voucherCode}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />

            {/* Conditional fields for Price Deduction */}
            {formik.values.voucherTypeEnum === "PriceDeduction" && (
              <>
                {/* Discount Type */}
                <TextField
                  select
                  fullWidth
                  margin="dense"
                  label="Discount Type"
                  name="discountType"
                  value={formik.values.discountType}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                >
                  <MenuItem value="percentage">Percentage</MenuItem>
                  <MenuItem value="flat">Flat Discount</MenuItem>
                </TextField>

                {/* Discount Value with dynamic label */}
                <TextField
                  fullWidth
                  margin="dense"
                  type="number"
                  label={
                    formik.values.discountType === "percentage"
                      ? "Discount (%)"
                      : "Discount Amount"
                  }
                  name="discountValue"
                  value={formik.values.discountValue}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </>
            )}

            {/* Conditional field for Free Shipping */}
            {formik.values.voucherTypeEnum !== "FreeShipping" && (
              <TextField
                select
                fullWidth
                margin="dense"
                label="Category"
                name="categoryId"
                value={formik.values.categoryId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              >
                {categories.map((category) => (
                  <MenuItem key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            {/* Other fields */}
            <TextField
              fullWidth
              margin="dense"
              type="number"
              label="Minimum Value"
              name="minimumValue"
              value={formik.values.minimumValue}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <TextField
              fullWidth
              margin="dense"
              type="number"
              label="Points Cost"
              name="pointsCost"
              value={formik.values.pointsCost}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            <TextField
              fullWidth
              margin="dense"
              type="date"
              label="Expiration Date"
              name="expirationDate"
              value={formik.values.expirationDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        {/* Hidden (Radio Buttons) */}
        <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Hidden?</FormLabel>
              <RadioGroup
                row
                name="hidden"
                value={formik.values.hidden ? 'true' : 'false'}
                onChange={(e) =>
                  formik.setFieldValue('hidden', e.target.value === 'true')
                }
              >
                <FormControlLabel
                  value="true"
                  control={<Radio />}
                  label="Yes"
                />
                <FormControlLabel
                  value="false"
                  control={<Radio />}
                  label="No"
                />
              </RadioGroup>
            </Box>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit">
            Add
          </Button>
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
}

export default AddVoucher;
