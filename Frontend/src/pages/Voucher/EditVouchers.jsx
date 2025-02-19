import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useFormik } from 'formik';
import http from '../../http'; // your axios/http instance
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function EditVoucher() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // We'll store the voucher data here to load into Formik
  const [voucherData, setVoucherData] = useState({
    voucherName: "",
    voucherTypeEnum: "",
    voucherCode: "",
    discountValue: "",
    minimumValue: "",
    pointsCost: "",
    expirationDate: "",
    hidden: false
  });

  // Fetch voucher by ID on mount
  useEffect(() => {
    http.get(`/voucher/${id}`)
      .then((res) => {
        setVoucherData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch voucher:", err);
        toast.error("Failed to fetch voucher. Please try again.");
      });
  }, [id]);

  // Formik setup
  const formik = useFormik({
    enableReinitialize: true, // Important when we load data asynchronously
    initialValues: voucherData,
    onSubmit: (data) => {
      // Trim the name and code fields
      data.voucherName = data.voucherName.trim();
      data.voucherCode = data.voucherCode.trim();

      // If it's free shipping, discountValue should be 0
      if (data.voucherTypeEnum === "FreeShipping") {
        data.discountValue = 0;
      } 
      // Otherwise, if it's PriceDeduction, optionally do any checks here
      else {
        const discount = parseFloat(data.discountValue || "0");
        if (isNaN(discount) || discount < 1) {
          toast.error("Please enter a valid discount value (≥ 1) for price deduction.");
          return;
        }
      }

      // PUT to the update API
      http.put(`/voucher/${id}`, data)
        .then(() => {
          toast.success("Voucher updated successfully!");
          navigate("/admin/voucher");
        })
        .catch((err) => {
          console.error("Failed to update voucher:", err);
          toast.error("Failed to update voucher. Please try again.");
        });
    },
  });

  // Delete-related dialog
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  // Delete the voucher
  const deleteVoucher = () => {
    http.delete(`/voucher/${id}`)
      .then(() => {
        toast.success("Voucher deleted successfully!");
        navigate("/admin/voucher");
      })
      .catch(err => {
        console.error("Failed to delete voucher:", err);
        toast.error("Failed to delete voucher. Please try again.");
      });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ my: 2 }}>
        Edit Voucher
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
                // If user picks FreeShipping, set discountValue to 0
                if (e.target.value === "FreeShipping") {
                  formik.setFieldValue("discountValue", 0);
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

            {/* If PriceDeduction, show discountValue input (otherwise read-only or zero) */}
            {formik.values.voucherTypeEnum === "PriceDeduction" && (
              <TextField
                fullWidth
                margin="dense"
                type="number"
                label="Discount Value"
                name="discountValue"
                value={formik.values.discountValue}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
            )}

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

        {/* Hidden Radio Group */}
        <Box sx={{ mt: 2 }}>
          <FormLabel component="legend">Hidden?</FormLabel>
          <RadioGroup
            row
            name="hidden"
            value={formik.values.hidden ? "true" : "false"}
            onChange={(e) =>
              formik.setFieldValue("hidden", e.target.value === "true")
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

        {/* Update & Delete Buttons */}
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" type="submit">
            Update
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ ml: 2 }}
            onClick={handleOpen}
          >
            Delete
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Voucher</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this voucher?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={deleteVoucher}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <ToastContainer />
    </Box>
  );
}

export default EditVoucher;
