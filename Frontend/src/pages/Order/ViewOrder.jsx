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
    CircularProgress,
    IconButton,
    Tooltip,
    Chip,
    TablePagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import http from "../../http";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../../contexts/UserContext";

function ViewOrders() {
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const { user } = useContext(UserContext);
    
    // Fetch orders from the backend
    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = () => {
        setLoading(true);
        http.get("/checkout")
            .then((response) => {
                console.log("Orders Response:", response.data); // Debug response
                setOrders(response.data || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch orders:", error);
                setLoading(false);
            });
    };

    const renderShipmentStatus = (status) => {
        const statusColors = {
            pending: "warning",
            order_placed: "info",
            despatch_in_progress: "info",
            ready_for_pick_up: "info",
            in_transit: "primary",
            with_driver: "secondary",
            delivered: "success",
            cancelled: "error",
        };

        const statusLabels = {
            pending: "Pending",
            order_placed: "Order Placed",
            despatch_in_progress: "Despatch in Progress",
            ready_for_pick_up: "Ready for Pickup",
            in_transit: "In Transit",
            with_driver: "With Driver",
            delivered: "Delivered",
            cancelled: "Cancelled",
        };
    
    
        // Convert status to lowercase to ensure consistent key matching
        const statusKey = status?.toLowerCase().replace(/\s/g, "_");
    
        return <Chip
        label={statusLabels[statusKey] || "Unknown"}
        color={statusColors[statusKey] || "default"}
    />;
    };
    

    const renderDeliveryMethod = (method) => {
        if (method === "Delivery") {
            return (
                <Tooltip title="Delivery">
                    <Typography>🚚 Delivery</Typography>
                </Tooltip>
            );
        } else if (method === "Pick-Up") {
            return (
                <Tooltip title="Pick-Up">
                    <Typography>🏠 Pick-Up</Typography>
                </Tooltip>
            );
        }
        return (
            <Tooltip title="Unknown">
                <Typography>❓ Unknown</Typography>
            </Tooltip>
        );
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const paginatedOrders = orders.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Orders
            </Typography>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                    <CircularProgress />
                </Box>
            ) : orders.length > 0 ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center"><strong>Order ID</strong></TableCell>
                                <TableCell align="center"><strong>Order Date</strong></TableCell>
                                <TableCell align="center"><strong>Total Price</strong></TableCell>
                                <TableCell align="center"><strong>Delivery Method</strong></TableCell>
                                <TableCell align="center"><strong>Status</strong></TableCell>
                                <TableCell align="center"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedOrders.map((order, index) => (
                                <TableRow key={order.orderId || `order-${index}`}>
                                    {/* Use the map index + 1 to display the custom order ID */}
                                    <TableCell align="center">{page * rowsPerPage + index + 1}</TableCell>
                                    <TableCell align="center">
                                        {order.orderDate ? new Date(order.orderDate).toLocaleString() : "Date Not Available"}
                                    </TableCell>
                                    <TableCell align="center">${order.totalPrice ? order.totalPrice.toFixed(2) : "0.00"}</TableCell>
                                    <TableCell align="center">{renderDeliveryMethod(order.deliveryMethod)}</TableCell>
                                    <TableCell align="center">{renderShipmentStatus(order.status)}</TableCell>
                                    <TableCell align="center">
                                        <IconButton
                                            color="primary"
                                            size="small"
                                            onClick={() => navigate(`/OrderDetails/${order.orderId}`)}
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={orders.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handlePageChange}
                        onRowsPerPageChange={handleRowsPerPageChange}
                    />
                </TableContainer>
            ) : (
                <Typography>No orders found.</Typography>
            )}
        </Box>
    );
}

export default ViewOrders;
