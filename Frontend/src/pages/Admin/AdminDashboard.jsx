import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

const AdminDashboard = () => {
    return (
        <div style={styles.container}>
            <AdminSidebar />
            <div style={styles.content}>
                <Outlet /> {/* ✅ This will load nested routes */}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: "flex",
        height: "100vh",
    },
    content: {
        flexGrow: 1,
        padding: "20px",
        overflow: "auto",
    }
};

export default AdminDashboard;
