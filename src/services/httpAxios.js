import axios from "axios";

const API_BASE_URL = "https://truyen-7lnw.onrender.com";

const httpAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Danh sách các endpoint KHÔNG cần token (public APIs)
const PUBLIC_ENDPOINTS = [
  "/api/public/",
  "/api/login",
  "/api/register",
  "/api/forgot-password",
  "/api/reset-password"
];

// 👉 GẮN TOKEN CHO CÁC API CẦN AUTH
httpAxios.interceptors.request.use(
  (config) => {
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token || localStorage.getItem("token");
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error("❌ Error parsing user data:", error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// 👉 XỬ LÝ RESPONSE CHUNG
httpAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default httpAxios;