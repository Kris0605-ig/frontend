import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: "", firstName: "", lastName: "",
        mobileNumber: "", email: "", password: "",
        address: { street: "", city: "", state: "", pincode: "", buildingName: "", country: "" },
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "fullName") {
            const parts = value.trim().split(/\s+/);
            const first = parts[0] || "";
            const last = parts.length > 1 ? parts.slice(1).join(" ") : " ";
            setFormData({ ...formData, fullName: value, firstName: first, lastName: last });
        } else if (name in formData.address) {
            setFormData({ ...formData, address: { ...formData.address, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { fullName, ...dataToSend } = formData;
        try {
            await axios.post("https://truyen-7lnw.onrender.com/api/register", dataToSend);
            alert("Đăng ký thành công! Hãy đăng nhập.");
            navigate("/login");
        } catch (err) {
            const errorMsg = err.response?.data?.errors 
                ? Object.values(err.response.data.errors).join("\n") 
                : "Đăng ký thất bại";
            alert(errorMsg);
        }
    };

    return (
        <div className="container d-flex justify-content-center py-5">
            <div className="card shadow p-4" style={{ maxWidth: "550px", width: "100%" }}>
                <h3 className="text-center text-primary fw-bold mb-4">Đăng ký</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="fullName" placeholder="Họ và Tên" className="form-control mb-3" onChange={handleChange} required />
                    <div className="row">
                        <div className="col-md-6"><input type="email" name="email" placeholder="Email" className="form-control mb-3" onChange={handleChange} required /></div>
                        <div className="col-md-6"><input type="text" name="mobileNumber" placeholder="Số điện thoại" className="form-control mb-3" onChange={handleChange} required /></div>
                    </div>
                    <input type="password" name="password" placeholder="Mật khẩu (>= 6 ký tự)" className="form-control mb-3" onChange={handleChange} required />
                    <hr />
                    <h6 className="text-secondary mb-3">Thông tin địa chỉ</h6>
                    <div className="row g-2">
                        <div className="col-6"><input type="text" name="buildingName" placeholder="Số nhà/Tòa nhà" className="form-control" onChange={handleChange} required /></div>
                        <div className="col-6"><input type="text" name="street" placeholder="Tên đường" className="form-control" onChange={handleChange} required /></div>
                        <div className="col-6"><input type="text" name="city" placeholder="Quận/Huyện" className="form-control" onChange={handleChange} required /></div>
                        <div className="col-6"><input type="text" name="state" placeholder="Tỉnh/Thành phố" className="form-control" onChange={handleChange} required /></div>
                        <div className="col-6"><input type="text" name="pincode" placeholder="Mã Zip (6 số)" className="form-control" onChange={handleChange} required /></div>
                        <div className="col-6"><input type="text" name="country" placeholder="Quốc gia" className="form-control" onChange={handleChange} required /></div>
                    </div>
                    <button className="btn btn-primary w-100 mt-4 py-2 fw-bold">Đăng ký ngay</button>
                </form>
            </div>
        </div>
    );
};
export default Register;