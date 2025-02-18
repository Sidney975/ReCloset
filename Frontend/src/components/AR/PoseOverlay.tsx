import React, { useRef, useEffect, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl'; // Include this if you're using WebGL backend
import * as tf from '@tensorflow/tfjs';

import { usePose } from './PoseContext';

const PoseOverlay: React.FC = () => {
  // Add this line near other state declarations
  const { setCurrentPose } = usePose();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [detector, setDetector] = useState<poseDetection.PoseDetector | null>(null);
  const [cameraReady, setCameraReady] = useState(false); // Track if camera is ready

  // Setup pose detector
  useEffect(() => {
    const setupPoseDetector = async () => {
      try {
        await tf.ready(); // Wait for TensorFlow.js to be ready
        console.log('TensorFlow.js is ready');

        await tf.setBackend('webgl'); // Force using the webgl backend
        const model = poseDetection.SupportedModels.MoveNet;
        const detectorConfig = { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING };
        const newDetector = await poseDetection.createDetector(model, detectorConfig);
        setDetector(newDetector);

        console.log('Pose detector created successfully');
      } catch (error) {
        console.error('Error setting up pose detector:', error);
      }
    };

    setupPoseDetector();
  }, []);

  // Detect poses
  useEffect(() => {
    const detectPose = async () => {
      if (!detector || !videoRef.current || !canvasRef.current || !cameraReady) return;

      const poses = await detector.estimatePoses(videoRef.current!);
    console.log("Detected Poses:", poses);

    if (poses.length > 0) {
      setCurrentPose(poses[0]); // Save first pose
      console.log("Current Pose Set:", poses[0]);
    } else {
      console.warn("No poses detected.");
    }


      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Wait until the video is ready and has valid dimensions
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current && canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          console.log('Video metadata loaded, canvas size set');
        }
      };

       // Inside the detect function, add this line after poses are detected:
      const detect = async () => {
        const poses = await detector.estimatePoses(videoRef.current!);
        setCurrentPose(poses[0]); // Share the first detected pose
        if (canvasRef.current) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        //console.log('Pose detected:', poses); // Log poses every time

        poses.forEach((pose) => {
          pose.keypoints.forEach((keypoint) => {
            if (keypoint.score !== undefined && keypoint.score > 0.5) {
              ctx.beginPath();
              ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
              ctx.fillStyle = 'red';
              ctx.fill();
            }
          });
        });

        requestAnimationFrame(detect);
      };

      detect();
    };

    detectPose();
  }, [detector, cameraReady]);

  // Access webcam
  useEffect(() => {
    const startVideo = async () => {
      try {
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = () => {
            setCameraReady(true); // Set camera ready flag once metadata is loaded
            console.log('Camera feed started, setting cameraReady to true');
          };
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    startVideo();
  }, []);

  return (
    <div className="relative w-[1920] h-[1000]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <video ref={videoRef} className="hidden" autoPlay />
    </div>
  );
};

export default PoseOverlay;
