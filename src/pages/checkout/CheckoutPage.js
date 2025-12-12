import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: ''
  });
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  // Lấy sản phẩm đã chọn từ localStorage khi component được tải
  useEffect(() => {
    const storedItems = localStorage.getItem('itemsToCheckout');
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      setSelectedItems(parsedItems);
      // Tính tổng tiền các sản phẩm đã chọn
      const total = parsedItems.reduce(
        (sum, item) => sum + (item.specialPrice > 0 ? item.specialPrice : item.price) * (item.quantity || 1),
        0
      );
      setTotalAmount(total);
    } else {
      // Nếu không có sản phẩm đã chọn, chuyển về trang giỏ hàng
      navigate('/cart');
    }
  }, [navigate]);

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Thông tin giao hàng:', shippingInfo);
    console.log('Thông tin thanh toán:', paymentInfo);
    console.log('Sản phẩm đã chọn:', selectedItems);
    alert(`Thanh toán thành công với tổng số tiền: ${totalAmount.toLocaleString()}₫`);
    // Xóa sản phẩm đã chọn khỏi localStorage sau khi thanh toán
    localStorage.removeItem('itemsToCheckout');
  };

  return (
    <div className="container py-5">
      <h2 className="mb-4">📝 Trang Thanh Toán</h2>

      {/* Hiển thị sản phẩm đã chọn */}
      <div className="card mb-5">
        <div className="card-header bg-light">
          <h5>Sản Phẩm Đã Chọn ({selectedItems.length})</h5>
        </div>
        <div className="card-body p-0">
          <table className="table mb-0">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá</th>
                <th>Tổng</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map(item => {
                const price = item.specialPrice > 0 ? item.specialPrice : item.price;
                const itemTotal = price * (item.quantity || 1);
                return (
                  <tr key={item.productId}>
                    <td>{item.productName}</td>
                    <td>{item.quantity || 1}</td>
                    <td>{price.toLocaleString()}₫</td>
                    <td>{itemTotal.toLocaleString()}₫</td>
                  </tr>
                );
              })
              }</tbody>
          </table>
        </div>
        <div className="card-footer bg-light text-end">
          <h4>Tổng Cộng: <span className="text-danger">{totalAmount.toLocaleString()}₫</span></h4>
        </div>
      </div>

      {/* Biểu mẫu thông tin giao hàng và thanh toán */}
      <form onSubmit={handleSubmit} className="row g-5">
        <div className="col-md-6">
          <h5>Thông Tin Giao Hàng</h5>
          <div className="mb-3">
            <label className="form-label">Họ và Tên</label>
            <input
              type="text"
              className="form-control"
              name="fullName"
              value={shippingInfo.fullName}
              onChange={handleShippingChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Địa Chỉ</label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={shippingInfo.address}
              onChange={handleShippingChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Thành Phố</label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={shippingInfo.city}
              onChange={handleShippingChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Số Điện Thoại</label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={shippingInfo.phone}
              onChange={handleShippingChange}
              required
            />
          </div>
        </div>

        <div className="col-md-6">
          <h5>Thông Tin Thanh Toán</h5>
          <div className="mb-3">
            <label className="form-label">Số Thẻ Tín Dụng</label>
            <input
              type="text"
              className="form-control"
              name="cardNumber"
              value={paymentInfo.cardNumber}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Ngày Hết Hạn (MM/YY)</label>
            <input
              type="text"
              className="form-control"
              name="expiryDate"
              value={paymentInfo.expiryDate}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">CVV</label>
            <input
              type="text"
              className="form-control"
              name="cvv"
              value={paymentInfo.cvv}
              onChange={handlePaymentChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-success w-100 mt-4">
            Xác Nhận Thanh Toán
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;