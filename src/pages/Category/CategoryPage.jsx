import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FaShoppingCart, FaEye } from "react-icons/fa";
import { useCart } from "../../contexts/CartContext";
import "./CategoryPage.css";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `http://localhost/index.php?pages=api_products_by_category&id=${categoryId}`
        );

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
        else setProducts([]);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError("Không thể tải sản phẩm, vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId]);

  return (
    <div className="container py-5">
      <h2 className="text-center fw-bold mb-4">Sản phẩm thể loại</h2>

      {loading && <p className="text-center text-muted">Đang tải sản phẩm...</p>}
      {error && <p className="text-center text-danger">{error}</p>}

      <div className="row g-4">
        {products.length === 0 && !loading && !error && (
          <p className="text-center text-muted">Không có sản phẩm nào</p>
        )}

        {products.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p.productId}>
            <div className="product-card shadow-sm">
              <div className="img-wrap">
                <img
                  src={p.image ? `/images/${p.image}` : "https://via.placeholder.com/300"}
                  alt={p.productName}
                  className="product-image"
                />
                <div className="overlay">
                  <Link to={`/product/${p.productId}`} className="btn btn-light me-2">
                    <FaEye /> Xem
                  </Link>
                  <button className="btn btn-primary" onClick={() => addToCart(p)}>
                    <FaShoppingCart /> Giỏ
                  </button>
                </div>
              </div>
              <div className="info-wrap text-center mt-3">
                <h5 className="product-title">{p.productName}</h5>
                <p className="price mt-2">{p.price.toLocaleString()}₫</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;
