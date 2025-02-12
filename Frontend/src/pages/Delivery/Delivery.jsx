import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Select,
    MenuItem,
    TextField,
    Button,
    Typography,
    Box
} from "@mui/material";
import http from "../../http";
import { toast } from "react-toastify";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrderPDF from "../../components/OrderPDF";

const DeliveryAdmin = () => {
    const [deliveries, setDeliveries] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetchDeliveries();
    }, []);

    const fetchDeliveries = async () => {
        try {
            const response = await http.get("/api/delivery");
            setDeliveries(response.data);
        } catch (error) {
            console.error("Error fetching deliveries", error);
            toast.error("Failed to load deliveries");
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await http.put(`/api/delivery/${orderId}`, { shipmentStatus: newStatus });
            setDeliveries((prev) =>
                prev.map((d) => (d.orderId === orderId ? { ...d, shipmentStatus: newStatus } : d))
            );
            toast.success("Status updated successfully");
        } catch (error) {
            console.error("Error updating status", error);
            toast.error("Failed to update status");
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h4" gutterBottom>
                Delivery Management
            </Typography>
            <TextField
                label="Search by Order Number"
                variant="outlined"
                fullWidth
                sx={{ marginBottom: 2 }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <Box sx={{ display: "flex", justifyContent: "left", alignItems: "center", mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{
                        backgroundColor: "#007bff",
                        color: "white",
                        padding: "10px 20px",
                        fontSize: "16px",
                        borderRadius: "8px",
                        boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
                        "&:hover": {
                            backgroundColor: "#0056b3",
                        },
                    }}
                >
                    <PDFDownloadLink document={<OrderPDF deliveries={deliveries} />} fileName="DeliveryReport.pdf" style={{ textDecoration: "none", color: "inherit" }}>
                        {({ loading }) => (loading ? "Generating PDF..." : "Download PDF")}
                    </PDFDownloadLink>
                </Button>
            </Box>
            <br></br>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Order No</TableCell>
                            <TableCell>Delivery Tracker</TableCell>
                            <TableCell>Order Date</TableCell>
                            <TableCell>Dispatcher</TableCell>
                            <TableCell>Status</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {deliveries
                            .filter((d) => d.orderId.toString().includes(search))
                            .map((delivery) => (
                                <TableRow key={delivery.orderId}>
                                    <TableCell>{delivery.orderId}</TableCell>
                                    <TableCell>
                                        {delivery.trackingNumber}
                                    </TableCell>
                                    <TableCell>{new Date(delivery.createdAt).toLocaleString()}</TableCell>
                                    <TableCell>{delivery.carrier || "N/A"}</TableCell>
                                    <TableCell>
                                        <Select
                                            value={delivery.shipmentStatus}
                                            onChange={(e) => handleStatusChange(delivery.orderId, e.target.value)}
                                            sx={{ width: 150, height: 40 }}
                                        >
                                            <MenuItem value="Pending">Pending</MenuItem>
                                            <MenuItem value="Dispatched">Dispatched</MenuItem>
                                            <MenuItem value="Delivered">Delivered</MenuItem>
                                            <MenuItem value="Cancelled">Cancelled</MenuItem>
                                        </Select>
                                    </TableCell>

                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default DeliveryAdmin;
