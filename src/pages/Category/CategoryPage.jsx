import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categoryId } = useParams(); // categoryId này sẽ là slug thể loại như 'action', 'manga'
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");
      try {
        // ĐÃ SỬA: Thay localhost bằng API OTruyen theo thể loại
        const res = await fetch(`https://otruyenapi.com/v1/api/the-loai/${categoryId}`);

        if (!res.ok) throw new Error(`Lỗi kết nối API: ${res.status}`);

        const data = await res.json();
        
        if (data.status === "success" && data.data.items) {
          // CHUYỂN ĐỔI: Map dữ liệu API ngoại sang định dạng UI của bạn
          const formatted = data.data.items.map(item => ({
            productId: item.slug,
            productName: item.name,
            // Nối domain ảnh chính thức của OTruyen
            image: `https://otruyenapi.com/uploads/comics/${item.thumb_url}`,
            price: 0 // Truyện ngoại mặc định miễn phí
          }));
          setProducts(formatted);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải danh sách truyện. Vui lòng kiểm tra lại slug thể loại.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-4">Thể loại: {categoryId}</h2>

      {loading && <p className="text-center text-muted">Đang tải truyện...</p>}
      {error && <p className="text-center text-danger">{error}</p>}

      <div className="row g-4">
        {products.length === 0 && !loading && !error && (
          <p className="text-center text-muted">Không tìm thấy truyện nào ở thể loại này.</p>
        )}

        {products.map((p) => (
          <div className="product-item" key={p.productId}>
            <div className="product-card shadow-sm border rounded p-2 h-100">
              <div className="img-wrap" style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={p.image}
                  alt={p.productName}
                  className="product-image img-fluid"
                  style={{ height: "250px", objectFit: "cover", width: "100%" }}
                  onError={(e) => { e.target.src = "https://via.placeholder.com/300x400"; }}
                />
                <div className="overlay d-flex justify-content-center align-items-center" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", opacity: 0, transition: "0.3s" }}>
                  <Link to={`/product/${p.productId}`} className="btn btn-light me-2">
                    <FaEye /> Xem
                  </Link>
                  <button className="btn btn-primary" onClick={() => addToCart(p)}>
                    <FaShoppingCart /> Yêu thích
                  </button>
                </div>
              </div>
              <div className="info-wrap text-center mt-3">
                <h6 className="product-title text-truncate" title={p.productName}>{p.productName}</h6>
                <p className="price mt-2 text-success fw-bold">Miễn phí</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;