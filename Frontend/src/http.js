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


instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        console.error("Authentication error: ", error.response);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
        localStorage.removeItem("adminData"); 
        window.location.href = "/login";  
      }
      return Promise.reject(error);
    }
  );
  
export default instance;
