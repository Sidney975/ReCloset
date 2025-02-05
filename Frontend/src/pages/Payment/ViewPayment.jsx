import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Fab,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Checkbox,
  IconButton,
  TablePagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import http from "../../http";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";

function ViewPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = () => {
    setLoading(true);
    http.get("/payment")
      .then((response) => {
        setPayments(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch payments:", error);
        setLoading(false);
      });
  };

  const deletePayment = (id) => {
    http.delete(`/payment/${id}`)
      .then(() => {
        fetchPayments(); // Refresh the list after deletion
        setOpenDialog(false);
        setSelectedPayment(null);
      })
      .catch((error) => {
        console.error("Failed to delete payment:", error);
      });
  };

  const handleDeleteClick = (payment) => {
    setSelectedPayment(payment);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedPayment(null);
  };

  const handleCheckboxChange = (paymentId, isCurrentlyDefault, paymentStatus) => {
    // Prevent setting as default if the payment status is 'Inactive'
    if (paymentStatus === 'Inactive') {
      toast.error("You cannot set this payment method as the default because it is inactive.");
      return;
    }
  
    const updatedDefault = !isCurrentlyDefault;
  
    http.put(`/payment/${paymentId}`, { defaultPreference: updatedDefault })
      .then(() => {
        fetchPayments(); // Refresh data to sync with backend
      })
      .catch((error) => {
        console.error("Failed to update default payment preference:", error);
      });
  };


  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedPayments = payments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Payments
      </Typography>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
          <CircularProgress />
        </Box>
      ) : payments.length > 0 ? (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center"><strong>Payment ID</strong></TableCell>
                  <TableCell align="center"><strong>Payment Method</strong></TableCell>
                  <TableCell align="center"><strong>Last 4 Digits</strong></TableCell>
                  <TableCell align="center"><strong>Expiry Date</strong></TableCell>
                  <TableCell align="center"><strong>Billing Address</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Default Preference</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedPayments.map((payment, index) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                    <TableCell align="center">{payment.paymentMethod}</TableCell>
                    <TableCell align="center">{payment.maskedCardNumber}</TableCell>
                    <TableCell align="center">{payment.expiryDate}</TableCell>
                    <TableCell align="center">{payment.billingAddress}</TableCell>
                    <TableCell align="center">{payment.status}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={payment.isDefault || false}
                        disabled={!payment.isDefault && payments.some((p) => p.isDefault)}
                        onChange={() => handleCheckboxChange(payment.paymentId, payment.isDefault, payment.status)}
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => navigate(`/EditPayment/${payment.paymentId}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        size="small"
                        sx={{ ml: 1 }}
                        onClick={() => handleDeleteClick(payment)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={payments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </TableContainer>
        </>
      ) : (
        <Typography>No payments found.</Typography>
      )}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => navigate("/AddPayment")}
        sx={{
          position: "fixed",
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the payment for {selectedPayment?.paymentMethod} (ID: {selectedPayment?.paymentId})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => deletePayment(selectedPayment?.paymentId)} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ViewPayments;
