import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import { FaEye, FaHeart, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Recommended = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 8; 

  const { cart, addToCart, removeFromCart } = useCart();

  // ĐÃ SỬA: Không cần URL của Render cho ảnh nữa
  const isFavorite = (productId) => cart.some((item) => item.productId === productId);

  const toggleFavorite = (product) => {
    isFavorite(product.productId) ? removeFromCart(product.productId) : addToCart(product);
  };

  useEffect(() => {
    productService
      .getAllProducts(currentPage, pageSize, "productId", "desc")
      .then((res) => {
        setProducts(res.content || []);
        setTotalPages(res.totalPages || 0);
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm:", err));
  }, [currentPage]);

  useEffect(() => {
    productService
      .getCategories()
      .then((res) => {
        const data = res.content || res;
        if (Array.isArray(data)) setCategories(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => (p.category?.categoryId || p.categoryId) === selectedCategory);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="recommended-section container py-5">
      <div className="text-center mb-4">
        <h3 className="fw-bold title-section">✨ Các truyện nổi bật ✨</h3>
        <p className="text-muted">Khám phá thế giới truyện tranh đầy hấp dẫn</p>
      </div>

      <div className="category-filter text-center mb-4">
        <button
          className={`btn btn-category ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => { setSelectedCategory("All"); setCurrentPage(0); }}
        >
          Tất cả
        </button>
        {categories.map((c) => (
          <button
            key={c.categoryId}
            className={`btn btn-category ${selectedCategory === c.categoryId ? "active" : ""}`}
            onClick={() => { setSelectedCategory(c.categoryId); setCurrentPage(0); }}
          >
            {c.categoryName}
          </button>
        ))}
      </div>

      <div className="product-grid">
        {filteredProducts.length === 0 ? (
          <div className="text-center w-100 py-5">
              <p className="text-muted">Không có sản phẩm nào ở trang này.</p>
          </div>
        ) : (
          filteredProducts.map((p) => (
            <div key={p.productId} className="product-card shadow-sm">
              <div className="img-wrap">
                {/* ĐÃ SỬA: Gọi trực tiếp p.image */}
                <img
                  src={p.image ? p.image : "https://via.placeholder.com/150"}
                  alt={p.productName}
                  className="product-image"
                  onError={(e) => { e.target.src = "https://via.placeholder.com/150"; }}
                />
                <div className="overlay">
                  <Link to={`/product/${p.productId}`} className="btn btn-light me-2">
                    <FaEye /> Xem
                  </Link>
                  <button className="btn btn-primary" onClick={() => toggleFavorite(p)}>
                    <FaHeart style={{ color: isFavorite(p.productId) ? "red" : "white" }} />
                  </button>
                </div>
              </div>

              <div className="info-wrap text-center mt-3">
                <h6 className="product-title text-truncate px-2">{p.productName}</h6>
                <p className="price text-danger fw-bold">
                  {p.specialPrice ? p.specialPrice.toLocaleString() : p.price.toLocaleString()}₫
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-container d-flex justify-content-center align-items-center mt-5 gap-2">
          <button 
            className="btn btn-outline-primary btn-pagination"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
          >
            <FaChevronLeft />
          </button>

          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`btn btn-pagination ${currentPage === index ? "btn-primary" : "btn-outline-primary"}`}
              onClick={() => handlePageChange(index)}
            >
              {index + 1}
            </button>
          ))}

          <button 
            className="btn btn-outline-primary btn-pagination"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </section>
  );
};

export default Recommended;