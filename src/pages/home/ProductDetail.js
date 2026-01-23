import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import "./Recommended.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const res = await productService.getOTruyenDetail(id);
        
        if (!res) {
          throw new Error("Không tìm thấy thông tin truyện");
        }

        setProduct({
          productId: res.slug || id,
          productName: res.name || "Không có tên",
          image: `https://otruyenapi.com/uploads/comics/${res.thumb_url || 'default.jpg'}`,
          description: res.content || "Đang cập nhật mô tả...",
          category: { 
            categoryName: res.category?.[0]?.name || "Truyện tranh" 
          },
          price: 0,
          quantity: 100,
          chapters: res.chapters?.[0]?.server_data || []
        });
      } catch (err) {
        console.error("❌ Lỗi tải chi tiết:", err);
        setError(err.message || "Không thể tải thông tin truyện");
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [id]);

  // Hàm trích xuất chapterId an toàn hơn
  const extractChapterId = (apiData) => {
    if (!apiData) return null;
    
    try {
      // Kiểm tra nhiều định dạng URL
      const urlParts = apiData.split('/');
      const lastPart = urlParts.pop();
      
      // Nếu có dạng ID:slug, lấy phần ID
      if (lastPart && lastPart.includes(':')) {
        return lastPart.split(':')[0];
      }
      
      return lastPart || null;
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </div>
        <p className="mt-2">Đang tải thông tin truyện...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5">
        <button className="btn btn-light mb-4 border" onClick={() => navigate(-1)}>
          ← Quay lại
        </button>
        <div className="alert alert-danger">
          <h4>Lỗi tải truyện</h4>
          <p>{error || "Không tìm thấy truyện này"}</p>
          <button 
            className="btn btn-outline-danger mt-2"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <button className="btn btn-light mb-4 border" onClick={() => navigate(-1)}>
        ← Quay lại
      </button>

      <div className="row bg-white p-4 rounded-4 shadow-lg">
        <div className="col-md-5 mb-4">
          <img 
            src={product.image} 
            alt={product.productName} 
            className="img-fluid rounded-4 shadow-sm"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/300x450?text=Không+có+ảnh";
            }}
          />
        </div>

        <div className="col-md-7">
          <h2 className="fw-bold mb-3">{product.productName}</h2>
          
          <div className="mb-3">
            <span className="badge bg-primary me-2">
              {product.category.categoryName}
            </span>
            <span className="badge bg-success">Miễn phí</span>
          </div>

          <div className="border-top pt-3 mb-4">
            <h5 className="fw-bold mb-2">Giới thiệu:</h5>
            <div 
              className="text-muted"
              dangerouslySetInnerHTML={{ 
                __html: product.description || "<i>Chưa có mô tả</i>" 
              }} 
            />
          </div>

          {/* Danh sách chương */}
          <div className="chapters-list mt-4" 
               style={{ 
                 maxHeight: "300px", 
                 overflowY: "auto", 
                 border: "1px solid #eee", 
                 padding: "15px",
                 borderRadius: "8px"
               }}>
            <h6 className="fw-bold mb-3">📖 Danh sách chương:</h6>
            
            {product.chapters.length > 0 ? (
              <div className="list-group">
                {product.chapters.map((chap, index) => {
                  const chapterId = extractChapterId(chap.chapter_api_data);
                  
                  if (!chapterId) {
                    return (
                      <div key={index} className="list-group-item text-muted">
                        <span>Chương {chap.chapter_name}</span>
                        <small className="ms-2">(Đang cập nhật)</small>
                      </div>
                    );
                  }

                  return (
                    <Link 
                      key={index} 
                      to={`/reading/${chapterId}`}
                      state={{ 
                        chapterName: chap.chapter_name,
                        comicName: product.productName
                      }}
                      className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <span className="fw-medium">Chương {chap.chapter_name}</span>
                        {chap.created_at && (
                          <small className="text-muted ms-2">
                            ({new Date(chap.created_at).toLocaleDateString('vi-VN')})
                          </small>
                        )}
                      </div>
                      <span className="badge bg-primary rounded-pill">→</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-3 text-muted">
                <p>Chưa có chương nào</p>
                <small>Vui lòng quay lại sau...</small>
              </div>
            )}
          </div>

          {/* Nút hành động */}
          <div className="mt-4 d-flex gap-2">
            <button 
              className="btn btn-primary px-4 d-flex align-items-center gap-2"
              onClick={() => {
                addToCart(product);
                alert(`Đã thêm "${product.productName}" vào yêu thích!`);
              }}
            >
              <span>❤️</span>
              <span>Yêu thích</span>
            </button>
            
            <button 
              className="btn btn-outline-secondary px-4"
              onClick={() => {
                // Chia sẻ truyện
                navigator.clipboard.writeText(window.location.href);
                alert("Đã sao chép link truyện!");
              }}
            >
              📋 Chia sẻ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;