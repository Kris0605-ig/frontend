import React, { useEffect, useState } from "react";
import "./Recommended.css";
import { Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import { FaEye, FaHeart } from "react-icons/fa"; // ĐÃ XÓA: FaChevronLeft, FaChevronRight

const Recommended = () => {
  const [products, setProducts] = useState([]);
  // ĐÃ XÓA: categories, selectedCategory, pageSize vì không sử dụng
  const [currentPage] = useState(0); 
  const [totalPages, setTotalPages] = useState(0);

  const { cart, addToCart, removeFromCart } = useCart();

  const formatExternalData = (items) => {
    return items.map(item => ({
      productId: item.slug, 
      productName: item.name,
      image: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`,
      price: 0,
      specialPrice: 0,
      category: { categoryName: "Truyện mới" }
    }));
  };

  const isFavorite = (productId) => cart.some((item) => item.productId === productId);

  const toggleFavorite = (product) => {
    isFavorite(product.productId) ? removeFromCart(product.productId) : addToCart(product);
  };

  useEffect(() => {
    productService
      .getOTruyenList(currentPage + 1)
      .then((res) => {
        if (res && res.items) {
          const formatted = formatExternalData(res.items);
          setProducts(formatted);
          setTotalPages(Math.ceil(res.params.pagination.totalItems / res.params.pagination.totalItemsPerPage));
        }
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm từ OTruyen:", err));
  }, [currentPage]);

  return (
    <section className="recommended-section container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Truyện Đề Cử</h3>
        <Link to="/category/all" className="text-orange text-decoration-none">Xem tất cả</Link>
      </div>
      
      <div className="product-grid">
        {products.map((p) => (
          <div key={p.productId} className="product-card shadow-sm">
            <div className="img-wrap">
              <img
                src={p.image} 
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
              <p className="price text-danger fw-bold">Miễn phí</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hiển thị thông tin trang hiện tại */}
      <div className="text-center mt-4">
        <small className="text-muted">Trang {currentPage + 1} / {totalPages}</small>
      </div>
    </section>
  );
};

export default Recommended;