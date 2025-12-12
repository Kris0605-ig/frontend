import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // ✅ Đã thêm Link vào đây
import "./auth.css";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
    navigate("/"); // ✅ quay về trang chủ
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="bg-white shadow-lg rounded-4 p-4 p-md-5"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <h3 className="text-center mb-4 fw-bold text-primary">
          🔐 Đăng nhập tài khoản
        </h3>
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="Nhập email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="mb-4">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Nút đăng nhập */}
          <button
            type="submit"
            className="btn btn-primary btn-lg w-100 fw-semibold shadow-sm"
          >
            Đăng nhập
          </button>

          {/* Liên kết phụ */}
          <div className="text-center mt-3">
            <Link // ✅ Thay <a> bằng <Link>
              to="/forgot-password" // ✅ Đã thay href="#" bằng to="/forgot-password" (URL hợp lệ)
              className="text-decoration-none text-secondary small me-2"
            >
              Quên mật khẩu?
            </Link>
            <span className="text-muted">•</span>
            <Link // ✅ Thay <a> bằng <Link>
              to="/register" // ✅ Đã thay href="/register" bằng to="/register"
              className="text-decoration-none text-secondary small ms-2"
            >
              Đăng ký tài khoản
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;