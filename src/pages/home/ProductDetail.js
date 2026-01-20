import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; // Thêm Link để điều hướng chương
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import "./Recommended.css";

const ProductDetail = () => {
  const { id } = useParams(); // 'id' ở đây nhận giá trị 'slug' từ URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    // Gọi hàm lấy dữ liệu từ API OTruyen thay vì Database cá nhân
    productService
      .getOTruyenDetail(id)
      .then((res) => {
        if (res) {
          // CHUYỂN ĐỔI: Map dữ liệu API ngoại sang định dạng UI của bạn
          setProduct({
            productId: res.slug,
            productName: res.name,
            // Nối domain ảnh chính thức của OTruyen
            image: `https://otruyenapi.com/uploads/comics/${res.thumb_url}`,
            description: res.content,
            category: { categoryName: res.category?.[0]?.name || "Truyện tranh" },
            price: 0, 
            quantity: 100, // Giả định để các chức năng UI không bị lỗi
            chapters: res.chapters?.[0]?.server_data || [] // Lấy danh sách chương
          });
        }
      })
      .catch((err) => {
        console.error("❌ Lỗi tải chi tiết từ OTruyen:", err);
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
      <button className="btn btn-light mb-4 shadow-sm border" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="row bg-white p-4 rounded-4 shadow-lg">
        {/* Ảnh truyện */}
        <div className="col-md-5 d-flex justify-content-center align-items-center mb-4 mb-md-0">
          <img
            src={product.image}
            alt={product.productName}
            className="img-fluid rounded-4 border shadow-sm"
            style={{ maxHeight: "400px", objectFit: "contain", width: "100%" }}
            onError={(e) => { e.target.src = "https://via.placeholder.com/400"; }}
          />
        </div>

        {/* Thông tin truyện */}
        <div className="col-md-7">
          <h2 className="fw-bold mb-3">{product.productName}</h2>
          <div className="mb-3">
             <span className="badge bg-info text-dark me-2">Slug: {product.productId}</span>
             <span className="text-secondary">
                Thể loại: <span className="fw-semibold text-dark">{product.category.categoryName}</span>
             </span>
          </div>

          <div className="price-section mb-4">
            <h3 className="text-success fw-bold mb-1">Miễn phí đọc</h3>
          </div>

          <div className="border-top pt-3 mt-3">
            <h6 className="fw-semibold text-dark mb-2">Tóm tắt nội dung:</h6>
            {/* Hiển thị HTML từ API */}
            <p className="text-secondary" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>

          {/* DANH SÁCH CHƯƠNG */}
          <div className="chapters-list mt-4" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", borderRadius: "10px", padding: "15px" }}>
            <h6 className="fw-bold mb-3">Danh sách chương:</h6>
            <div className="list-group list-group-flush">
              {product.chapters.length > 0 ? (
                product.chapters.map((chap, index) => (
                  <Link 
                    key={index} 
                    // Tách chapterId từ link API để điều hướng sang trang đọc
                    to={`/reading/${chap.chapter_api_data.split('/').pop()}`} 
                    className="list-group-item list-group-item-action text-primary d-flex justify-content-between align-items-center"
                  >
                    <span>Chương {chap.chapter_name}: {chap.chapter_title || "Đang cập nhật"}</span>
                    <small className="text-muted">Đọc ngay</small>
                  </Link>
                ))
              ) : (
                <p className="text-muted">Đang cập nhật danh sách chương...</p>
              )}
            </div>
          </div>

          <div className="mt-4 d-flex flex-wrap gap-2">
            <button className="btn btn-primary px-4 py-2 fw-semibold shadow-sm" onClick={() => addToCart(product)}>
              ❤️ Thêm vào yêu thích
            </button>
            <button className="btn btn-outline-dark px-4 py-2 fw-semibold" onClick={() => navigate("/")}>
              Tiếp tục khám phá
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;