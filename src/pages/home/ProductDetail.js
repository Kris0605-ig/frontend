import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import productService from "../../services/productService";
import "./Recommended.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    productService
      .getOTruyenDetail(id)
      .then((res) => {
        if (res) {
          setProduct({
            productId: res.slug,
            productName: res.name,
            image: `https://otruyenapi.com/uploads/comics/${res.thumb_url}`,
            description: res.content,
            category: { categoryName: res.category?.[0]?.name || "Truyện tranh" },
            price: 0, 
            quantity: 100,
            chapters: res.chapters?.[0]?.server_data || [] 
          });
        }
      })
      .catch((err) => console.error("❌ Lỗi tải chi tiết:", err));
  }, [id]);

  if (!product) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-light mb-4 border" onClick={() => navigate(-1)}>← Quay lại</button>

      <div className="row bg-white p-4 rounded-4 shadow-lg">
        <div className="col-md-5 mb-4">
          <img src={product.image} alt={product.productName} className="img-fluid rounded-4 shadow-sm" />
        </div>

        <div className="col-md-7">
          <h2 className="fw-bold mb-3">{product.productName}</h2>
          <div className="price-section mb-4"><h3 className="text-success fw-bold">Miễn phí đọc</h3></div>
          <div className="border-top pt-3"><p dangerouslySetInnerHTML={{ __html: product.description }} /></div>

          <div className="chapters-list mt-4" style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #eee", padding: "15px" }}>
            <h6 className="fw-bold mb-3">Danh sách chương:</h6>
            <div className="list-group list-group-flush">
              {product.chapters.length > 0 ? (
                product.chapters.map((chap, index) => {
                  // Tách lấy mã ID từ link API chính xác
                  const chapterId = chap.chapter_api_data.split('/').pop();
                  return (
                    <Link 
                      key={index} 
                      to={`/reading/${chapterId}`} 
                      className="list-group-item list-group-item-action text-primary d-flex justify-content-between"
                    >
                      <span>Chương {chap.chapter_name}</span>
                      <small className="text-muted">Đọc ngay</small>
                    </Link>
                  );
                })
              ) : <p>Đang cập nhật...</p>}
            </div>
          </div>

          <div className="mt-4 d-flex gap-2">
            <button className="btn btn-primary px-4" onClick={() => addToCart(product)}>❤️ Yêu thích</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;