import React, { useEffect, useRef, useState } from 'react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import '@tensorflow/tfjs-backend-webgl';
import { usePose } from './PoseContext';
import { useParams, useLocation } from 'react-router-dom';
import http from "../../http";

// Helper function to convert image to Base64
const convertToBase64 = async (imageUrl: string) => {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error("❌ Error converting image to Base64:", error);
        return null;
    }
};

const ClothingOverlay: React.FC = () => {
  const { currentPose } = usePose();
  const [clothingImage, setClothingImage] = useState<string | null>(null); // Base64 string for clothing image
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { productId } = useParams<{ productId: string }>();

  // Fetch clothing image and process it for background removal
  useEffect(() => {
    const fetchClothingImage = async () => {
      try {
        const response = await http.get(`/api/product/${productId}`);

        console.log("API Response:", response.data); // Debug API response

        if (!response.data.image) {
          console.error("Error: No image found for product.");
          return;
        }

        // Construct full image URL from stored filename
        const imageUrl = `${import.meta.env.VITE_FILE_BASE_URL}${response.data.image}`;
        console.log("Constructed Image URL:", imageUrl);

        setClothingImage(imageUrl);

        // Convert image to Base64 before sending to backend
        const base64Image = await convertToBase64(imageUrl);
        if (!base64Image) {
            console.warn("⚠️ Failed to convert image to Base64, using original.");
            setClothingImage(imageUrl);
            return;
        }
        console.log("🔵 Sending to backend:", { imageUrl: base64Image });
        // Send image to the backend for background removal
        const removeBgResponse = await http.post('/api/removebackground', { imageUrl: base64Image });

        if (removeBgResponse.data.image) {
          console.log("✅ Background removed successfully.");
          setClothingImage(removeBgResponse.data.image); // Use processed image for AR
        } else {
          console.warn("⚠️ Using original image as background removal failed.");
          setClothingImage(imageUrl);
        }

      } catch (error) {
        setClothingImage(null);
        console.error('Error fetching product image:', error);
      }
    };

    if (productId) {
      fetchClothingImage();
    }
  }, [productId]);

  // Extra Debug Log
  useEffect(() => {
    console.log("📌 Updated clothingImage:", clothingImage);
  }, [clothingImage]);

  // Replace userPose state with currentPose from context
  useEffect(() => {
    if (!currentPose) {
      console.warn("⚠️ No Pose Detected!");
      return;
    }

    if (!clothingImage) {
      console.warn("⚠️ No Clothing Image Loaded!");
      return;
    }

    if (!canvasRef.current) {
      console.warn("⚠️ Canvas Not Found!");
      return;
    }

    console.log("🎯 Drawing clothing image...");

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      console.error("❌ Failed to get canvas context.");
      return;
    }

    if (currentPose && canvasRef.current && clothingImage) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear the canvas before drawing
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      const { keypoints } = currentPose;
      const torso = keypoints.find((kp: any) => kp.name === 'left_shoulder' || kp.name === 'right_shoulder');
      const leftHip = keypoints.find((kp: any) => kp.name === 'left_hip');
      const leftShoulder = keypoints.find((kp: any) => kp.name === 'left_shoulder');
      const rightShoulder = keypoints.find((kp: any) => kp.name === 'right_shoulder');

      console.log('User Pose:', currentPose);
      console.log('Torso Keypoint:', torso);

      if (torso && torso.score > 0.5 && clothingImage) {
        console.log("Under torso score, Drawing clothing image...");

        const img = new Image();
        img.src = clothingImage;

        //console.log('Clothing image loaded, drawing it on canvas');
        img.onload = () => { // Ensure image is loaded before displaying
          const shoulderWidth = Math.abs(rightShoulder.x - leftShoulder.x);
          const imgWidth = shoulderWidth + (shoulderWidth * 1.8);

          // Calculate height based on shoulder to hip distance
          const torsoHeight = Math.abs(leftShoulder.y - leftHip.y);
          const imgHeight = torsoHeight * 2.9; // Add 10% for better fit

          const displayWidth = window.innerWidth;
          const displayHeight = window.innerHeight;

          // Get webcam dimensions
          const webcamWidth = videoRef.current?.videoWidth || 640;
          const webcamHeight = videoRef.current?.videoHeight || 480;

          // Calculate scaling ratios
          const scaleX = displayWidth / webcamWidth;
          const scaleY = displayHeight / webcamHeight;

          // Scale the coordinates and center the clothing
          const x = (torso.x * scaleX) - (imgWidth / 2) - 150;
          const y = (torso.y * scaleY) - (imgHeight / 2) + 240;

          console.log("Overlay Position:", { x, y, width: imgWidth, height: imgHeight });

          const clothingElement = document.createElement('img');
          clothingElement.src = img.src;
          clothingElement.style.position = 'absolute';
          clothingElement.style.left = `${x}px`;
          clothingElement.style.top = `${y}px`;
          clothingElement.style.width = `${imgWidth}px`;
          clothingElement.style.height = `${imgHeight}px`;
          clothingElement.id = 'clothing-overlay';

          // Remove existing overlay before adding new one
          const existingClothingElement = document.getElementById('clothing-overlay');
          if (existingClothingElement) {
            existingClothingElement.remove();
          }

          document.body.appendChild(clothingElement); // Update the image position
        };
        // Handle image loading error
        img.onerror = (error) => {
          console.error('Error loading clothing image:', error);
        };
      }
    }
  }, [currentPose, clothingImage]);

  console.log('Detected Keypoints:', currentPose?.keypoints);
  console.log('Current Pose:', currentPose);
  console.log('Clothing Image Base64:', clothingImage);
  // // Clean up overlay when route changes

  return (
    <div className="relative w-[1920] h-[1000]">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

    </div>
  );
};
export default ClothingOverlay;
