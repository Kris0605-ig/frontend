import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import httpAxios from "../../services/httpAxios";
import { FaEye, FaHeart } from "react-icons/fa";

const Recommended = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ⭐ Dùng chung cart để làm favorites
  const { cart, addToCart, removeFromCart } = useCart();

  // Kiểm tra product có trong danh sách yêu thích không
  const isFavorite = (productId) => {
    return cart.some((item) => item.productId === productId);
  };

  // ⭐ Toggle yêu thích → dùng Cart API luôn
  const toggleFavorite = (product) => {
    if (isFavorite(product.productId)) {
      removeFromCart(product.productId); // xoá khỏi danh sách
    } else {
      addToCart(product); // thêm vào danh sách yêu thích
    }
  };

  // Lấy sản phẩm
  useEffect(() => {
    productService
      .getAllProducts(0, 12)
      .then((res) => setProducts(res.content || res || []))
      .catch((err) => console.error(err));
  }, []);

  // Lấy danh mục
  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        const data = res.content || res;
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));
  }, []);

  // Lọc sản phẩm theo categoryId
  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter(
          (p) =>
            (p.category?.categoryId || p.categoryId) === selectedCategory
        );

  return (
    <section className="recommended-section container py-5">
      <div className="text-center mb-4">
        <h3 className="fw-bold title-section">✨ Các truyện nổi bật ✨</h3>
        <p className="text-muted">
          Khám phá các sản phẩm được đọc giả yêu thích nhất
        </p>
      </div>

      {/* Lọc danh mục */}
      <div className="category-filter text-center mb-4">
        <button
          className={`btn btn-category ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => setSelectedCategory("All")}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.categoryId}
            className={`btn btn-category ${
              selectedCategory === c.categoryId ? "active" : ""
            }`}
            onClick={() => setSelectedCategory(c.categoryId)}
          >
            {c.categoryName}
          </button>
        ))}
      </div>

      {/* Lưới sản phẩm */}
      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-muted">Không có sản phẩm nào</p>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.productId} className="product-card shadow-sm">
              <div className="img-wrap">
                <img
                  src={`${httpAxios.defaults.baseURL}/images/${p.image}`}
                  alt={p.productName}
                  className="product-image"
                />
                <div className="overlay">
                  <Link to={`/product/${p.productId}`} className="btn btn-light me-2">
                    <FaEye /> Xem
                  </Link>

                  {/* ⭐ Nút Yêu thích dùng Cart API */}
                  <button
                    className="btn btn-primary"
                    onClick={() => toggleFavorite(p)}
                  >
                    <FaHeart
                      style={{
                        color: isFavorite(p.productId) ? "red" : "white",
                      }}
                    />{" "}
                    Yêu thích
                  </button>
                </div>
              </div>

              <div className="info-wrap text-center mt-3">
                <h5 className="product-title">{p.productName}</h5>
                <p className="price mt-2">{p.price.toLocaleString()}₫</p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Recommended;
