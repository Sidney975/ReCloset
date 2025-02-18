import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
import { Edit } from '@mui/icons-material';
import UserContext from '../../contexts/UserContext';
import Sidebar from './Sidebar';
import http from "../../http";


const Profile = () => {
    const { user, setUser } = useContext(UserContext); // ✅ Ensure setUser is used
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            http.get("/user/auth", {
                headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` }
            })
            .then((res) => {
                setUser(res.data.user); // ✅ Store user in context
            })
            .catch(() => {
                navigate("/login"); // 🔄 Redirect if authentication fails
            });
        }
    }, [user, navigate, setUser]); // ✅ Only runs when `user` changes

    if (!user) {
        return <div style={styles.message}>Loading user details...</div>;
    }

    return (
        <Box sx={styles.container}>
            <Sidebar activeTab="profile" />
            <Box sx={styles.profileContent}>
                <Typography variant="h5" sx={styles.sectionTitle}>
                    Profile Information
                    <IconButton onClick={() => navigate('/edit-profile')} sx={styles.editButton}>
                        <Edit />
                    </IconButton>
                </Typography>
                <Box sx={styles.profileDetails}>
                    <Typography sx={styles.label}><strong>First Name:</strong> {user.firstName || "Not provided"}</Typography>
                    <Typography sx={styles.label}><strong>Last Name:</strong> {user.lastName || "Not provided"}</Typography>
                    <Typography sx={styles.label}><strong>Email:</strong> {user.email}</Typography>
                    <Typography sx={styles.label}><strong>Phone Number:</strong> {user.phoneNumber || "Not provided"}</Typography>
                    <Typography sx={styles.label}><strong>Address:</strong> {user.address || "Not provided"}</Typography>
                    <Typography sx={styles.label}><strong>Loyality Points:</strong> {user.loyaltyPoints || "Not provided"}</Typography>
                </Box>
            </Box>
        </Box>
    );
};


const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f4f4f4', // Light gray background for contrast
    },
    profileContent: {
        flex: 1,
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#333', // Darker text for readability
    },
    profileDetails: {
        backgroundColor: '#fff', // White card background
        padding: '25px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Subtle shadow for depth
    },
    label: {
        fontSize: '16px',
        color: '#444', // Slightly darker gray for clarity
        marginBottom: '10px',
    },
    editButton: {
        cursor: 'pointer',
        color: '#007bff', // Matches Material UI primary color
    },
};

export default Profile;
