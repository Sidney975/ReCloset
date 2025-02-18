import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import http from "../../http";

const CameraFeed: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          console.log('Camera feed started');
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
      }
    };
  
    setupCamera();
  }, []);  

  return <video ref={videoRef} autoPlay playsInline className="w-[1920px] h-[1000px] object-cover" />;
};

export default CameraFeed;
