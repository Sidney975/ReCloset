import React, { useEffect, useState } from "react";
import { Table, TableHead, TableBody, TableRow, TableCell, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import http from "../../http";

const ManageUsers = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Fetch all customers
  useEffect(() => {
    http.get("/user/customers")
      .then((res) => {
        setCustomers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch customers", err);
      });
  }, []);

  // Open edit dialog
  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpenEditDialog(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setSelectedUser({ ...selectedUser, [e.target.name]: e.target.value });
  };

  // Submit updated user info
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

  return (
    <div>
      <h1>Manage Customers</h1>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>{user.userId}</TableCell>
              <TableCell>{user.userId}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.phoneNumber || "N/A"}</TableCell>
              <TableCell>
                <Button variant="contained" color="primary" onClick={() => handleEdit(user)}>
                  Edit
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
            label="Email"
            name="email"
            value={selectedUser?.email || ""}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Phone"
            name="phoneNumber"
            value={selectedUser?.phoneNumber || ""}
            onChange={handleChange}
            fullWidth
          />
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
    </div>
  );
};

export default ManageUsers;
