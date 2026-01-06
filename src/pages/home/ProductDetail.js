import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import "./Recommended.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  // URL gốc của backend (bỏ chữ /api ở cuối nếu có)
  const IMAGE_BASE_URL = "http://localhost:8080/images";

  useEffect(() => {
    productService
      .getProductById(id)
      .then((res) => {
        // Nếu res trả về trực tiếp Object sản phẩm
        setProduct(res);
      })
      .catch((err) => {
        console.error("❌ Lỗi tải sản phẩm:", err);
      });
  }, [id]);

  if (!product) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button
        className="btn btn-light mb-4 shadow-sm border"
        onClick={() => navigate(-1)}
      >
        ← Quay lại
      </button>

      <div className="row bg-white p-4 rounded-4 shadow-lg">
        {/* Ảnh sản phẩm */}
        <div className="col-md-5 d-flex justify-content-center align-items-center mb-4 mb-md-0">
          <img
            src={product.image ? `${IMAGE_BASE_URL}/${product.image}` : "https://via.placeholder.com/400"}
            alt={product.productName}
            className="img-fluid rounded-4 border shadow-sm"
            style={{ maxHeight: "400px", objectFit: "contain", width: "100%" }}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <h2 className="fw-bold mb-3">{product.productName}</h2>
          <div className="mb-3">
             <span className="badge bg-info text-dark me-2">
                ID: {product.productId}
             </span>
             <span className="text-secondary">
                Danh mục: <span className="fw-semibold text-dark">{product.category?.categoryName || "Chưa phân loại"}</span>
             </span>
          </div>

          {/* Giá và khuyến mãi */}
          <div className="price-section mb-4">
            {product.discount > 0 ? (
              <>
                <h3 className="text-danger fw-bold mb-1">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.specialPrice)}
                </h3>
                <p className="text-muted">
                  <del>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}</del>
                  <span className="badge bg-danger ms-2">-{product.discount}%</span>
                </p>
              </>
            ) : (
              <h3 className="text-danger fw-bold mb-3">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price)}
              </h3>
            )}
          </div>

          {/* Trạng thái kho */}
          <p className={product.quantity > 0 ? "text-success" : "text-danger"}>
            {product.quantity > 0 ? `● Còn hàng (${product.quantity})` : "○ Hết hàng"}
          </p>

          {/* Mô tả sản phẩm */}
          <div className="border-top pt-3 mt-3">
            <h6 className="fw-semibold text-dark mb-2">Mô tả sản phẩm:</h6>
            <p className="text-secondary" style={{ whiteSpace: "pre-line" }}>
              {product.description || "Không có mô tả cho sản phẩm này."}
            </p>
          </div>

          {/* Nút hành động */}
          <div className="mt-4 d-flex flex-wrap gap-2">
            <button
              className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
              onClick={() => addToCart(product)}
              disabled={product.quantity <= 0}
            >
              🛒 {product.quantity > 0 ? "Thêm vào giỏ" : "Tạm hết hàng"}
            </button>
            <button
              className="btn btn-outline-dark px-4 py-2 fw-semibold"
              onClick={() => navigate("/")}
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;