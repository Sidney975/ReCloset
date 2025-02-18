import React, { useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Select,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import http from "../../http";

const ManageUsers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Fetch all customers
  useEffect(() => {
    http.get("/user/customers")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch customers", err);
      });
  }, []);

  // ✅ Open edit dialog
  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  // ✅ Open password change dialog
  const handleChangePassword = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setOpenPasswordDialog(true);
  };

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  // ✅ Submit updated user info
  const handleSave = () => {
    http.put(`/user/admin/update-user/${selectedUser.userId}`, selectedUser)
      .then(() => {
        setCustomers(customers.map(user => user.userId === selectedUser.userId ? selectedUser : user));
        setOpenEditDialog(false);
      })
      .catch((err) => {
        console.error("Failed to update user", err);
      });
  };

  // ✅ Change user password
  const handlePasswordSave = () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    http.put(`/user/admin/change-password/${selectedUser.userId}`, { newPassword })
      .then(() => {
        setNewPassword("");
        setConfirmPassword("");
        setOpenPasswordDialog(false);
      })
      .catch((err) => {
        console.error("Failed to change password", err);
      });
  };

  return (
    <div>
      <h1>Manage Customers</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.userId}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber || "N/A"}</TableCell>
              <TableCell>{user.address || "N/A"}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleEdit(user)} style={{ marginRight: 5 }}>
                  Edit
                </Button>
                <Button variant="contained" color="secondary" onClick={() => handleChangePassword(user)}>
                  Change Password
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit User Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)}>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Phone"
            name="phoneNumber"
            value={selectedUser?.phoneNumber || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Address"
            name="address"
            value={selectedUser?.address || ""}
            onChange={handleChange}
            fullWidth
          />
          <Select
            fullWidth
            margin="dense"
            name="role"
            value={selectedUser?.role || ""}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value="Customer">Customer</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {/* New Password Field */}
          <TextField
            margin="dense"
            label="New Password"
            type={showNewPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          {/* Confirm Password Field */}
          <TextField
            margin="dense"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handlePasswordSave} color="primary">
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ManageUsers;
