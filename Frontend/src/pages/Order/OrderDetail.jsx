import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import http from "../../http";
import { PDFDownloadLink } from "@react-pdf/renderer";
import OrderPDF from "../../components/OrderPDF"; // Import the PDF document component

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await http.get(`/checkout/${orderId}`);
                setOrder(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch order details.");
                setLoading(false);
            }
        };
        fetchOrderDetails();
    }, [orderId]);

    const handleSort = (key) => {
        let direction = "ascending";
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    const sortedItems = React.useMemo(() => {
        if (!order || !order.orderItems || !sortConfig.key) {
            return order?.orderItems || [];
        }

        return [...order.orderItems].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }, [order, sortConfig]);

    if (loading) {
        return <div style={styles.loading}>Loading...</div>;
    }

    if (error) {
        return <div style={styles.error}>{error}</div>;
    }

    if (!order) {
        return <div style={styles.error}>No order details available.</div>;
    }

    return (
        <div style={styles.page}>
            <div style={styles.header}>
                <h1>Order Details</h1>
                <p>Order ID: <span style={styles.highlight}>{order.orderId}</span></p>
                <p>Order Date: <span style={styles.highlight}>{new Date(order.orderDate).toLocaleDateString()}</span></p>
            </div>

            <div style={styles.summary}>
                <div style={styles.section}>
                    <h2>Summary</h2>
                    <p>Total Price: <strong>${order.totalPrice?.toFixed(2)}</strong></p>
                    <p>Delivery Method: <strong>{order.deliveryMethod}</strong></p>
                    <p>Status: <strong>{order.status}</strong></p>
                </div>

                <div style={styles.section}>
                    <h2>Payment Details</h2>
                    <p>Payment Method: <strong>{order.paymentDetails?.paymentMethod || "N/A"}</strong></p>
                    <p>Card Info: <strong>{order.paymentDetails?.maskedCardNumber || "N/A"}</strong></p>
                </div>
            </div>

            <div style={styles.items}>
                <h2>Order Items</h2>
                {sortedItems.length > 0 ? (
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.tableHeader} onClick={() => handleSort("productId")}>
                                    Product ID {sortConfig.key === "productId" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort("quantity")}>
                                    Quantity {sortConfig.key === "quantity" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort("itemPrice")}>
                                    Price {sortConfig.key === "itemPrice" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                                </th>
                                <th style={styles.tableHeader} onClick={() => handleSort("totalPrice")}>
                                    Total {sortConfig.key === "totalPrice" ? (sortConfig.direction === "ascending" ? "↑" : "↓") : ""}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedItems.map((item, index) => (
                                <tr key={index} style={styles.tableRow}>
                                    <td style={styles.tableCell}>{item.productId}</td>
                                    <td style={styles.tableCell}>{item.quantity}</td>
                                    <td style={styles.tableCell}>${item.itemPrice.toFixed(2)}</td>
                                    <td style={styles.tableCell}>
                                        ${(item.quantity * item.itemPrice).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No items in this order.</p>
                )}
            </div>

            {/* PDF Download Button */}
            <div style={styles.buttonContainer}>
                <PDFDownloadLink document={<OrderPDF order={order} />} fileName={`Invoice_${order.orderId}.pdf`}>
                    {({ loading }) => (
                        <button style={styles.button}>
                            {loading ? "Generating PDF..." : "Download PDF"}
                        </button>
                    )}
                </PDFDownloadLink>
            </div>
        </div>
    );
};

const styles = {
    buttonContainer: {
        marginTop: "20px",
        textAlign: "center",
    },
    button: {
        padding: "10px 20px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
    },
    page: {
        maxWidth: "800px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
        color: "#333",
        backgroundColor: "#f9f9f9",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "20px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)"
    },
    header: {
        textAlign: "center",
        marginBottom: "20px"
    },
    highlight: {
        fontWeight: "bold",
        color: "#555"
    },
    summary: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px"
    },
    section: {
        flex: 1,
        margin: "0 10px",
        padding: "15px",
        backgroundColor: "#fff",
        borderRadius: "8px",
        border: "1px solid #ddd",
        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
    },
    items: {
        marginTop: "20px"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        marginTop: "10px",
        borderRadius: "8px",
        overflow: "hidden"
    },
    tableHeader: {
        backgroundColor: "#f5f5f5",
        fontWeight: "bold",
        padding: "12px",
        textAlign: "left",
        cursor: "pointer",
        borderBottom: "2px solid #ddd"
    },
    tableRow: {
        backgroundColor: "#fff",
        borderBottom: "1px solid #ddd"
    },
    tableCell: {
        padding: "12px",
        textAlign: "left",
        fontSize: "14px"
    },
    loading: {
        textAlign: "center",
        fontSize: "1.2em",
        color: "#666",
        marginTop: "50px"
    },
    error: {
        textAlign: "center",
        fontSize: "1.2em",
        color: "#f00",
        marginTop: "50px"
    }
};

export default OrderDetails;