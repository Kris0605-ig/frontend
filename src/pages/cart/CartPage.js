import React from "react";
import { useCart } from "../../contexts/CartContext";
import { Link } from "react-router-dom";
import httpAxios from "../../services/httpAxios";
import { FaHeart, FaTrash } from "react-icons/fa";
import "./CartPage.css";

const FavoritePage = () => {
  const { cart, removeFromCart, clearCart } = useCart();

  // ⭐ Khi danh sách rỗng
  if (cart.length === 0) {
    return (
      <div className="container text-center py-5">
        <h3>❤️ Danh sách yêu thích trống</h3>
        <Link to="/" className="btn btn-primary mt-3">
          Tiếp tục xem truyện
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5 favorite-container">
      {/* Tiêu đề */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">❤️ Danh sách yêu thích của bạn</h2>

        {/* Xóa tất cả */}
        <button className="btn btn-outline-danger" onClick={clearCart}>
          <FaTrash /> Xóa tất cả
        </button>
      </div>

      {/* Lưới truyện */}
      <div className="favorites-grid">
        {cart.map((item) => (
          <div key={item.productId} className="favorite-card shadow-sm">

            <img
              src={`${httpAxios.defaults.baseURL}/images/${item.image}`}
              alt={item.productName}
              className="fav-img"
            />

            <h5 className="fav-title mt-2">{item.productName}</h5>
            <p className="fav-category">{item.category?.categoryName}</p>

            <p className="fav-price">
              {item.price.toLocaleString()}₫
            </p>

            {/* Bỏ yêu thích */}
            <button
              className="btn btn-outline-danger btn-sm mt-2"
              onClick={() => removeFromCart(item.productId)}
            >
              <FaHeart /> Bỏ yêu thích
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};

export default FavoritePage;
