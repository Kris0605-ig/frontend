import axios from "axios";

const API_BASE_URL = "https://truyen-7lnw.onrender.com";

const httpAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Thêm timeout
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
    // Kiểm tra xem endpoint có phải public không
    const isPublicEndpoint = PUBLIC_ENDPOINTS.some(endpoint => 
      config.url.includes(endpoint)
    );
    
    // Nếu không phải public endpoint -> gắn token
    if (!isPublicEndpoint) {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = user?.token || localStorage.getItem("token");
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`🔐 Token attached for: ${config.url}`);
        } else {
          console.warn(`⚠️ No token found for protected endpoint: ${config.url}`);
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
  (response) => {
    // Bạn có thể log response nếu cần debug
    // console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Xử lý lỗi chung
    if (error.response) {
      const { status, data } = error.response;
      
      console.error(`❌ API Error [${status}]:`, data?.message || error.message);
      
      // Xử lý lỗi 401 (Unauthorized)
      if (status === 401) {
        console.warn("⚠️ Token expired or invalid. Redirecting to login...");
        
        // Xóa thông tin user
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        
        // Chuyển hướng đến trang login
        if (window.location.pathname !== "/login") {
          window.location.href = "/login?expired=true";
        }
      }
      
      // Xử lý lỗi 403 (Forbidden)
      if (status === 403) {
        console.warn("⛔ Access forbidden");
        // Có thể hiển thị thông báo cho người dùng
      }
      
      // Xử lý lỗi 404 (Not Found)
      if (status === 404) {
        console.warn("🔍 Resource not found");
      }
      
      // Xử lý lỗi 500 (Server Error)
      if (status >= 500) {
        console.error("💥 Server error");
      }
    } else if (error.request) {
      // Request đã được gửi nhưng không nhận được response
      console.error("🌐 Network error - No response received:", error.message);
      
      // Hiển thị thông báo mất kết nối
      if (!window.navigator.onLine) {
        alert("⚠️ Mất kết nối mạng. Vui lòng kiểm tra lại kết nối Internet.");
      }
    } else {
      // Lỗi khi thiết lập request
      console.error("🚫 Request setup error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

// 👉 HÀM TIỆN ÍCH ĐỂ REFRESH TOKEN (nếu có)
export const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await httpAxios.post("/api/refresh-token", {
      refreshToken
    });
    
    if (response.data.token) {
      // Cập nhật token mới
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.token = response.data.token;
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", response.data.token);
      
      console.log("🔄 Token refreshed successfully");
      return response.data.token;
    }
  } catch (error) {
    console.error("❌ Failed to refresh token:", error);
    // Xóa tất cả thông tin đăng nhập
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    
    // Chuyển hướng về login
    window.location.href = "/login?session=expired";
    throw error;
  }
};

// 👉 HÀM KIỂM TRA KẾT NỐI SERVER
export const checkServerConnection = async () => {
  try {
    const response = await httpAxios.get("/health", { timeout: 5000 });
    return {
      connected: true,
      status: response.status,
      message: "Server is running"
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      message: "Cannot connect to server"
    };
  }
};

export default httpAxios;