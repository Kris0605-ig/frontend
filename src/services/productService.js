import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";

const ProductDetail = () => {
  const { id } = useParams(); // 'id' là slug truyện từ URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productService.getOTruyenDetail(id)
      .then((res) => {
        if (res) {
          setProduct({
            slug: res.slug,
            name: res.name,
            image: `https://otruyenapi.com/uploads/comics/${res.thumb_url}`,
            chapters: res.chapters?.[0]?.server_data || []
          });
        }
      })
      .catch((err) => console.error("❌ Lỗi tải chi tiết truyện:", err));
  }, [id]);

  if (!product) return <div className="text-center py-5">Đang tải thông tin truyện...</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-light mb-4 border" onClick={() => navigate(-1)}>← Quay lại</button>
      <div className="row bg-white p-4 rounded-4 shadow-lg">
        <div className="col-md-4 mb-4">
          <img src={product.image} alt={product.name} className="img-fluid rounded-4 shadow-sm" />
        </div>
        <div className="col-md-8">
          <h2 className="fw-bold mb-3">{product.name}</h2>
          <div className="chapters-list mt-4" style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #eee", padding: "15px", borderRadius: "10px" }}>
            <h6 className="fw-bold mb-3">📖 Danh sách chương:</h6>
            <div className="list-group">
              {product.chapters.map((chap, index) => {
                // Tách ID chương: lấy phần cuối cùng của link API
                const chapterId = chap.chapter_api_data.split('/').filter(Boolean).pop();
                
                return (
                  <Link 
                    key={index} 
                    to={`/reading?chapterId=${chapterId}`} 
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                  >
                    <span>Chương {chap.chapter_name}</span>
                    <span className="badge bg-primary rounded-pill">Đọc ngay</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;