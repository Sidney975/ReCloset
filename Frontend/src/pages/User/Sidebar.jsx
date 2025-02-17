import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { AccountCircle, Edit, Lock, Notifications, Receipt, Payment } from '@mui/icons-material';

const Sidebar = ({ activeTab }) => {
    const navigate = useNavigate();

    return (
        <Box sx={styles.sidebar}>
            <h2 style={styles.sidebarTitle}>Profile</h2>
            <List>
                <ListItem button selected={activeTab === 'profile'} onClick={() => navigate('/profile')}>
                    <ListItemIcon><AccountCircle /></ListItemIcon>
                    <ListItemText primary="My Profile" />
                </ListItem>
                <ListItem button selected={activeTab === 'edit-profile'} onClick={() => navigate('/edit-profile')}>
                    <ListItemIcon><Edit /></ListItemIcon>
                    <ListItemText primary="Edit Profile" />
                </ListItem>
                <ListItem button selected={activeTab === 'change-password'} onClick={() => navigate('/change-password')}>
                    <ListItemIcon><Lock /></ListItemIcon>
                    <ListItemText primary="Change Password" />
                </ListItem>
                <ListItem button selected={activeTab === 'notifications'} onClick={() => navigate('/notifications')}>
                    <ListItemIcon><Notifications /></ListItemIcon>
                    <ListItemText primary="Notifications" />
                </ListItem>
                <ListItem button selected={activeTab === 'ViewOrder'} onClick={() => navigate('/ViewOrder')}>
                    <ListItemIcon><Receipt /></ListItemIcon>
                    <ListItemText primary="Orders" />
                </ListItem>
                <ListItem button selected={activeTab === 'payments'} onClick={() => navigate('/payments')}>
                    <ListItemIcon><Payment /></ListItemIcon>
                    <ListItemText primary="Payment" />
                </ListItem>
                <ListItem button selected={activeTab === 'vouchers'} onClick={() => navigate('/usevoucher')}>
                    <ListItemIcon><Payment /></ListItemIcon>
                    <ListItemText primary="Vouchers" />
                </ListItem>
            </List>
        </Box>
    );
};

const styles = {
    sidebar: {
        width: '260px',
        backgroundColor: '#fff',
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        padding: '25px 20px',
        height: '100vh',
    },
    sidebarTitle: {
        fontSize: '22px',
        fontWeight: 'bold',
        marginBottom: '25px',
        textAlign: 'center',
    },
};

export default Sidebar;
