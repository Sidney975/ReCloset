import React, { useContext } from "react";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminContext from "../../contexts/AdminContext";

const AdminDashboard = () => {
    const { admin } = useContext(AdminContext);

    if (!admin) {
        return <Navigate to="/login" replace />;
    }

    return (
        <>
            <div style={styles.container}>
                <AdminSidebar />
                <div style={styles.content}>
                    <Outlet /> {/* ✅ Load nested routes */}
                </div>
            </div>
        </>
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
