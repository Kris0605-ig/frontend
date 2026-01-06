import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import httpAxios from "../../services/httpAxios";
import "./SearchPage.css"; // file CSS riêng cho SearchPage nếu muốn

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const query = params.get("query") || "";

  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) return;
      try {
        const res = await fetch(
          `${httpAxios.defaults.baseURL}/api/public/products/keyword/${encodeURIComponent(query)}`
        );
        if (!res.ok) {
          console.error("Lỗi HTTP:", res.status, res.statusText);
          setResults([]);
          return;
        }
        const data = await res.json();
        setResults(data.content || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      }
    };
    fetchResults();
  }, [query]);

  return (
    <div className="container py-5">
      <h3 className="mb-4">Kết quả tìm kiếm cho: "{query}"</h3>
      {results.length === 0 ? (
        <p>Không tìm thấy sản phẩm nào.</p>
      ) : (
        <div className="row">
          {results.map((item) => (
            <div key={item.id || item.productId} className="col-md-3 mb-4">
              <Link to={`/product/${item.slug || item.productSlug}`} className="text-decoration-none">
                <div className="card h-100 shadow-sm search-card">
                  <img
                    src={`${httpAxios.defaults.baseURL}/images/${item.image}`}
                    alt={item.name || item.productName}
                    className="card-img-top search-card-img"
                    
                  />
                  <div className="card-body text-center">
                    <h5 className="card-title text-truncate">{item.name || item.productName}</h5>
                    <p className="text-primary fw-bold">{(item.price || 0).toLocaleString()}₫</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
