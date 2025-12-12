import httpAxios from "./httpAxios";
import { jwtDecode } from "jwt-decode";

const register = async (userData) => {
  try {
    const res = await httpAxios.post(`/api/register`, userData);
    const token = res.data["jwt-token"];
    const user = { id: res.data.id, email: userData.email, token };
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Đăng ký thất bại! Vui lòng kiểm tra dữ liệu.");
  }
};

const login = async (credentials) => {
  try {
    const res = await httpAxios.post(`/api/login`, credentials);
    const token = res.data["jwt-token"];
    const decodedToken = jwtDecode(token);
    console.log("authService - Decoded Token:", decodedToken);
    const userId = decodedToken.id; // Giả sử id được lưu trong trường 'id' của token
    const user = { id: userId, email: credentials.email, token };
    localStorage.setItem("user", JSON.stringify(user));
    return user;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Sai tài khoản hoặc mật khẩu");
  }
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

// ... các hàm khác

const authService = { register, login, logout, getCurrentUser };

export default authService;