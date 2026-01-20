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

  // ĐÃ CẬP NHẬT: Hàm Adapter để biến dữ liệu OTruyen thành cấu trúc của bạn
  const formatExternalData = (items) => {
    return items.map(item => ({
      productId: item.slug, // Dùng slug làm ID để Link sang trang chi tiết
      productName: item.name,
      // Nối domain ảnh chính thức của OTruyen
      image: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`,
      price: 0, // API ngoài thường không trả về giá
      specialPrice: 0,
      category: { categoryName: "Truyện mới" }
    }));
  };

  const isFavorite = (productId) => cart.some((item) => item.productId === productId);

  const toggleFavorite = (product) => {
    isFavorite(product.productId) ? removeFromCart(product.productId) : addToCart(product);
  };

  useEffect(() => {
    // ĐÃ SỬA: Gọi hàm lấy dữ liệu từ OTruyen thay vì database cá nhân
    productService
      .getOTruyenList(currentPage + 1) // OTruyen thường bắt đầu từ trang 1
      .then((res) => {
        if (res && res.items) {
          const formatted = formatExternalData(res.items);
          setProducts(formatted);
          // Tính toán tổng trang dựa trên dữ liệu API ngoại
          setTotalPages(Math.ceil(res.params.pagination.totalItems / res.params.pagination.totalItemsPerPage));
        }
      })
      .catch((err) => console.error("Lỗi lấy sản phẩm từ OTruyen:", err));
  }, [currentPage]);

  // Giữ nguyên logic hiển thị...
  return (
    <section className="recommended-section container py-5">
      {/* ... (Các phần tiêu đề và filter giữ nguyên) ... */}
      
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
                {/* Dùng slug để dẫn tới trang chi tiết của OTruyen */}
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
      
      {/* ... (Phần phân trang giữ nguyên) ... */}
    </section>
  );
};

export default Recommended;