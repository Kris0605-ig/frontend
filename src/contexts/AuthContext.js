import React, { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // ✅ Đăng nhập
  const login = async (email, password) => {
    try {
      const userData = await authService.login({ email, password });
      setUser(userData);
      alert("Đăng nhập thành công!");
    } catch (err) {
      alert(err.message);
    }
  };

  // ✅ Đăng ký
const register = async (userData) => {
  try {
    const newUser = await authService.register(userData);
    setUser(newUser);
    alert("Đăng ký thành công!");
  } catch (err) {
    alert(err.message);
  }
};

  // ✅ Đăng xuất
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("Đăng xuất thành công!");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
