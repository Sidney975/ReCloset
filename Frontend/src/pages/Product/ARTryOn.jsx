import React, { useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { useParams } from 'react-router-dom';
import http from "../../http";
import CameraFeed from '../../components/AR/CameraFeed';
import PoseOverlay from '../../components/AR/PoseOverlay';
import ClothingOverlay from '../../components/AR/ClothingOverlay';
import { PoseProvider } from '../../components/AR/PoseContext';


const ArTryOn = () => {
    return (
        <PoseProvider>
            <div className="relative w-[1920] h-[1000] style={{ zIndex: 1 }}">
            <PoseOverlay />
            <ClothingOverlay />
            </div>
        </PoseProvider>
        );
};

export default ArTryOn;
