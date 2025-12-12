import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import httpAxios from "../../services/httpAxios";
import "./Recommended.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    productService
      .getProductById(id)
      .then((res) => {
        console.log("✅ Dữ liệu chi tiết:", res);
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
            src={`${httpAxios.defaults.baseURL}/images/${product.image}`}
            alt={product.productName}
            className="img-fluid rounded-4 border shadow-sm"
            style={{ maxHeight: "400px", objectFit: "contain" }}
          />
        </div>

        {/* Thông tin sản phẩm */}
        <div className="col-md-7">
          <h2 className="fw-bold mb-3">{product.productName}</h2>
          <p className="text-secondary mb-2">
            Danh mục:{" "}
            <span className="fw-semibold text-dark">
              {product.category?.categoryName || "Không có"}
            </span>
          </p>

          {/* Giá và khuyến mãi */}
          {product.discount > 0 ? (
            <>
              <h3 className="text-danger fw-bold mb-1">
                {product.specialPrice.toLocaleString()}₫
              </h3>
              <p className="text-muted">
                <del>{product.price.toLocaleString()}₫</del>{" "}
                <span className="badge bg-danger ms-2">
                  -{product.discount}%
                </span>
              </p>
            </>
          ) : (
            <h3 className="text-danger fw-bold mb-3">
              {product.price.toLocaleString()}₫
            </h3>
          )}

          {/* Mô tả sản phẩm */}
          <div className="border-top pt-3 mt-3">
            <h6 className="fw-semibold text-dark mb-2">Mô tả sản phẩm:</h6>
            <p className="text-secondary">
              {product.description || "Không có mô tả cho sản phẩm này."}
            </p>
          </div>

          {/* Nút hành động */}
          <div className="mt-4 d-flex flex-wrap gap-2">
            <button
              className="btn btn-primary px-4 py-2 fw-semibold shadow-sm"
              onClick={() => addToCart(product)}
            >
              🛒 Thêm vào giỏ
            </button>
            <button
              className="btn btn-outline-dark px-4 py-2 fw-semibold"
              onClick={() => navigate("/")}
            >
              Trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
