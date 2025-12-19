import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: "", password: "" });

    const handleChange = (e) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:8080/api/login", credentials);
            
            // Lưu JWT và Thông tin User
            localStorage.setItem("token", response.data["jwt-token"]);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            alert("Đăng nhập thành công!");
            navigate("/"); // Về trang chủ
            window.location.reload(); // Reload để Header cập nhật giao diện
        } catch (err) {
            alert("Sai email hoặc mật khẩu!");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <form onSubmit={handleLogin} className="card p-4 shadow" style={{ width: "400px" }}>
                <h3 className="text-center mb-4 fw-bold text-primary">Đăng nhập</h3>
                <input type="email" name="email" placeholder="Email" className="form-control mb-3" onChange={handleChange} required />
                <input type="password" name="password" placeholder="Mật khẩu" className="form-control mb-3" onChange={handleChange} required />
                <button className="btn btn-primary w-100 py-2">Đăng nhập</button>
            </form>
        </div>
    );
};
export default Login;