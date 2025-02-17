import { useState, useEffect } from "react";
import axios from "axios";

function useUserIP() {
  const [userIP, setUserIP] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchIPData() {
      try {
        // Fetch user IP and country from ipwho.is (Free API)
        const response = await axios.get("https://ipwho.is/");
        
        setUserIP(response.data.ip);
        setUserLocation({
          country: response.data.country,
          city: response.data.city,
        });

        console.log("User IP Data:", response.data);
      } catch (err) {
        console.error("Error fetching IP:", err);
        setError("Could not retrieve IP data.");
      }
    }

    fetchIPData();
  }, []);

  return { userIP, userLocation, error };
}

export default useUserIP;
