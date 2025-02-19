// import React, { useEffect, useRef, useState } from 'react';
// import * as poseDetection from '@tensorflow-models/pose-detection';
// import '@tensorflow/tfjs-backend-webgl';
// import { useParams } from 'react-router-dom';
// import http from "../../http";
// import CameraFeed from '../../components/AR/CameraFeed';
// import PoseOverlay from '../../components/AR/PoseOverlay';
// import ClothingOverlay from '../../components/AR/ClothingOverlay';
// import { PoseProvider } from '../../components/AR/PoseContext';


// const ArTryOn = () => {
//     return (
//         <PoseProvider>
//             <div className="relative w-[1920] h-[1000] style={{ zIndex: 1 }}">
//             <PoseOverlay />
//             <ClothingOverlay />
//             </div>
//         </PoseProvider>
//         );
// };

// export default ArTryOn;

import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress, Container } from '@mui/material';
import PoseOverlay from '../../components/AR/PoseOverlay';
import ClothingOverlay from '../../components/AR/ClothingOverlay';
import { PoseProvider } from '../../components/AR/PoseContext';

const ArTryOn = () => {
    const navigate = useNavigate();
    const { productId } = useParams();

    return (
        <PoseProvider>
            <Box 
                sx={{
                    width: '100vw',
                    height: '100vh',
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    overflow: 'hidden'
                }}
            >
                {/* Camera + AR Overlay Container */}
                <Box 
                    sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        overflow: 'hidden'
                    }}
                >
                    <PoseOverlay />
                    <ClothingOverlay />
                </Box>

                {/* Back Button */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        left: 20,
                        zIndex: 10
                    }}
                >
                    <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={() => navigate(`/product/${productId}`)}
                        sx={{ fontWeight: 'bold', padding: '8px 16px' }}
                    >
                        ← Back to Product
                    </Button>
                </Box>
            </Box>
        </PoseProvider>
    );
};

export default ArTryOn;

