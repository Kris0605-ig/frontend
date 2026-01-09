import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Dropdown } from "react-bootstrap";
import "./Header.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Header = () => {
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  // ===== LIVE SEARCH =====
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `https://truyen-7lnw.onrender.com/api/public/products/keyword/${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(data.content || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
        setResults([]);
      }
    };

    const delay = setTimeout(fetchSearchResults, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?query=${query}`);
  };

  const handleSelect = (productId) => {
    setQuery("");
    setResults([]);
    navigate(`/product/${productId}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header shadow-sm bg-white sticky-top">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

          {/* LOGO */}
          <Link to="/" className="d-flex align-items-center text-decoration-none">
            <img
              src={require("../assets/images/logomeoden.jpg")}
              alt="Logo"
              height="45"
              className="me-2 rounded-circle"
            />
            <span className="fw-bold fs-5 d-none d-md-inline" style={{ color: "#ff6a00" }}>
              Chúa Tể Sama
            </span>
          </Link>

          {/* SEARCH BOX */}
          <form className="flex-grow-1 mx-md-5 mx-0 position-relative" onSubmit={handleSubmit}>
            <div className="input-group rounded-pill border overflow-hidden">
              <input
                className="form-control border-0 shadow-none"
                placeholder="Bạn đang tìm gì..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn border-0" style={{ backgroundColor: "#ff6a00", color: "white" }}>
                <i className="fa fa-search" />
              </button>
            </div>

            {/* LIVE SEARCH RESULTS */}
            {results.length > 0 && (
              <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1050 }}>
                {results.map((item) => (
                  <li
                    key={item.productId}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => handleSelect(item.productId)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={item.image ? `https://truyen-7lnw.onrender.com/images/${item.image}` : "https://via.placeholder.com/40"}
                      alt={item.productName}
                      width="40" height="40" className="me-3 rounded shadow-sm"
                    />
                    <span className="text-truncate">{item.productName}</span>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* ACTIONS (CART + USER) */}
          <div className="d-flex align-items-center gap-3">
            {/* CART */}
            <Link to="/cart" className="btn border-0 position-relative p-2" style={{ color: "#ff6a00" }}>
              <i className="fa fa-shopping-cart fs-4" />
              {cart.length > 0 && (
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ fontSize: "0.65rem" }}>
                  {cart.length}
                </span>
              )}
            </Link>

            {/* AUTH SECTION */}
            {!user ? (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold">
                  Đăng nhập
                </Link>
                <Link to="/register" className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: "#ff6a00" }}>
                  Đăng ký
                </Link>
              </div>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="white" className="d-flex align-items-center gap-2 border-0 p-1">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=ff6a00&color=fff&rounded=true`} 
                    alt="avatar" 
                    width="35" height="35" 
                  />
                  <span className="fw-bold d-none d-lg-inline">Hi, {user.firstName || 'Member'}</span>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow border-0 mt-2">
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="fa fa-user-circle me-2" /> Hồ sơ của tôi
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/orders">
                    <i className="fa fa-box me-2" /> Đơn hàng
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger">
                    <i className="fa fa-sign-out-alt me-2" /> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;