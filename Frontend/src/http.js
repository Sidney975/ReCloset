import axios from "axios";

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    let accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
        config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    if (config.data && config.data.user) {
        delete config.data.user;
    }
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        console.error("Error details:", error);
        if (error.response) {
            console.error("Response error:", error.response);
        } else {
            console.error("No response received:", error.message);
        }
        // Optional: Add a fallback to handle network issues gracefully
        if (error.message.includes("Network Error")) {
            alert("Unable to connect to the server. Please try again later.");
        }
        return Promise.reject(error);
    }
);



export default instance;
