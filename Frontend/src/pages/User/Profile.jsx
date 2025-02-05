import React, { useContext } from 'react';
import UserContext from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();

    if (!user) {
        return <div style={styles.message}>Please log in to view your profile.</div>;
    }

    return (
        <div style={styles.container}>
            <div style={styles.profileCard}>
                <h2 style={styles.title}>Profile</h2>
                <div style={styles.content}>
                    {/* Sidebar on the Left */}
                    <div style={styles.sidebar}>
                        <button style={styles.button} onClick={() => navigate('/Payments')}>
                            Payment
                        </button>
                        <br></br>
                        <br></br>
                        <button style={styles.button} onClick={() => navigate('/ViewOrder')}>
                            Orders
                        </button>
                    </div>

                    {/* Profile Information */}
                    <div style={styles.profileInfo}>
                        <p><strong>Name:</strong> {user.username}</p>
                        <p><strong>Email:</strong> {user.email}</p>
                        <p><strong>Phone:</strong> {user.phone_number || "Not provided"}</p>
                        <p><strong>Role:</strong> {user.role || "User"}</p>
                        <p><strong>Loyalty Points:</strong> {user.loyaltyPoints || 0}</p>
                        <p><strong>Status:</strong> {user.status || "Active"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Styles
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f4f4',
    },
    profileCard: {
        width: '450px',
        padding: '20px',
        borderRadius: '10px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '15px',
        color: '#333',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px',
    },
    content: {
        display: 'flex',
        alignItems: 'flex-start',
    },
    sidebar: {
        width: '150px',
        textAlign: 'center',
        marginRight: '20px',
        borderRight: '2px solid #ddd',
        paddingRight: '10px',
    },
    sidebarTitle: {
        fontSize: '18px',
        marginTop: '10px',
        color: '#555',
    },
    profileInfo: {
        textAlign: 'left',
        flex: 1,
    },
    button: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '10px 15px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background 0.3s',
        width: '100%',
    },
    buttonHover: {
        backgroundColor: '#0056b3',
    },
    message: {
        textAlign: 'center',
        fontSize: '18px',
        marginTop: '50px',
    },
};

export default Profile;
