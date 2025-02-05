import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const OrderPDF = ({ order }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header Section */}
            <View style={styles.header}>
                <Text style={styles.companyName}>ReCloset</Text>
                <Text style={styles.companyAddress}>123 Orchard Road, #10-01, ReCloset Building, Singapore 238888</Text>
            </View>

            {/* Order Details Section */}
            <View style={styles.orderDetails}>
                <View>
                    <Text style={styles.boldText}>ORDER NO</Text>
                    <Text>{order.orderId}</Text>
                </View>
                <View>
                    <Text style={styles.boldText}>ORDER DATE</Text>
                    <Text>{new Date(order.orderDate).toLocaleDateString()}</Text>
                </View>
                <View>
                    <Text style={styles.boldText}>VALID TILL</Text>
                    <Text>12/03/2025</Text>
                </View>
            </View>

            {/* Billing & Shipping Section */}
            <View style={styles.billingShippingContainer}>
                <View style={styles.billingShippingBox}>
                    <Text style={styles.boldText}>BILL TO</Text>
                    <Text>{order.userDetails?.name || "Customer Name"}</Text>
                    <Text>{order.userDetails?.email || "customer@email.com"}</Text>
                </View>
                <View style={styles.billingShippingBox}>
                    <Text style={styles.boldText}>SHIP TO</Text>
                    <Text>{order.userDetails?.name || "Customer Name"}</Text>
                    <Text>Customer's Shipping Address</Text>
                </View>
            </View>

            {/* Payment Details */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                <Text>Payment Method: {order.paymentDetails?.paymentMethod || "N/A"}</Text>
                <Text>Card Info: {order.paymentDetails?.maskedCardNumber || "**** **** **** 5678"}</Text>
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
                <View>
                    <Text style={styles.boldText}>Total Price</Text>
                    <Text>${order.totalPrice?.toFixed(2) || "0.00"}</Text>
                </View>
                <View>
                    <Text style={styles.boldText}>Delivery Method</Text>
                    <Text>{order.deliveryMethod || "Delivery"}</Text>
                </View>
                <View>
                    <Text style={styles.boldText}>Status</Text>
                    <Text>{order.status || "Pending"}</Text>
                </View>
            </View>

            {/* Order Items Table */}
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Product</Text>
                    <Text style={styles.tableHeaderText}>Qty</Text>
                    <Text style={styles.tableHeaderText}>Unit Price</Text>
                    <Text style={styles.tableHeaderText}>Total</Text>
                </View>
                {order.orderItems?.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCell}>Product ID: {item.productId}</Text>
                        <Text style={styles.tableCell}>{item.quantity}</Text>
                        <Text style={styles.tableCell}>${item.itemPrice.toFixed(2)}</Text>
                        <Text style={styles.tableCell}>${(item.quantity * item.itemPrice).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            {/* Footer Section */}
            <View style={styles.footer}>
                <Text style={styles.termsTitle}>TERMS & CONDITIONS</Text>
                <Text>Payment is due within 30 days</Text>
                <Text style={styles.termsTitle}>NOTES</Text>
                <Text>Please pay the balance due within time</Text>
            </View>
        </Page>
    </Document>
);

// Styling
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 12,
        fontFamily: "Helvetica",
    },
    header: {
        textAlign: "center",
        marginBottom: 20,
    },
    companyName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    companyAddress: {
        fontSize: 12,
    },
    orderDetails: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f0f0f0",
        borderRadius: 5,
    },
    billingShippingContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    billingShippingBox: {
        width: "48%",
        padding: 10,
        backgroundColor: "#e0f7e0",
        borderRadius: 5,
    },
    section: {
        marginBottom: 10,
        padding: 10,
        backgroundColor: "#f8f8f8",
        borderRadius: 5,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
    },
    orderSummary: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#dff0d8",
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
    },
    boldText: {
        fontWeight: "bold",
    },
    table: {
        width: "100%",
        borderWidth: 1,
        borderColor: "#ddd",
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#4CAF50",
        color: "white",
        padding: 5,
    },
    tableHeaderText: {
        flex: 1,
        fontSize: 12,
        fontWeight: "bold",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
        padding: 5,
    },
    tableCell: {
        flex: 1,
        fontSize: 12,
    },
    footer: {
        marginTop: 20,
        textAlign: "center",
    },
    termsTitle: {
        fontWeight: "bold",
        marginTop: 10,
    },
});

export default OrderPDF;
