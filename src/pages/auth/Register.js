import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import "./auth.css";

const Register = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Generate random email to avoid duplicate
  const generateRandomEmail = () => {
    return `user${Date.now()}@example.com`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      mobileNumber: form.mobileNumber,
      email: form.email.trim() || generateRandomEmail(),
      password: form.password,
      address: {
        street: "string",
        city: "string",
        state: "string",
        pincode: "string",
        buildingName: "string 1",
        country: "string",
      },
      cart: null,
    };

    console.log("Sending:", JSON.stringify(userData, null, 2));

    try {
      await authService.register(userData);
      alert("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div
        className="bg-white shadow-lg rounded-4 p-4 p-md-5"
        style={{ width: "100%", maxWidth: "480px" }}
      >
        <h3 className="text-center mb-4 fw-bold text-success">
          ✨ Tạo tài khoản mới
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Họ</label>
              <input
                name="firstName"
                placeholder="Nhập họ"
                className="form-control form-control-lg"
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6 mb-3">
              <label className="form-label fw-semibold">Tên</label>
              <input
                name="lastName"
                placeholder="Nhập tên"
                className="form-control form-control-lg"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Số điện thoại</label>
            <input
              name="mobileNumber"
              placeholder="Nhập số điện thoại"
              className="form-control form-control-lg"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Email</label>
            <input
              name="email"
              type="email"
              placeholder="Email (để trống sẽ tự tạo)"
              className="form-control form-control-lg"
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Mật khẩu</label>
            <input
              name="password"
              type="password"
              placeholder="Nhập mật khẩu"
              className="form-control form-control-lg"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-success btn-lg w-100 fw-semibold shadow-sm"
          >
            Đăng ký
          </button>

          <div className="text-center mt-3">
            <p className="text-muted small">
              Đã có tài khoản?{" "}
              <a
                href="/login"
                className="text-decoration-none text-success fw-semibold"
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
