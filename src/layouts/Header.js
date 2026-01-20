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

  // ===== LIVE SEARCH TỪ OTRUYEN API =====
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `https://otruyenapi.com/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}`
        );

        if (!res.ok) {
          setResults([]);
          return;
        }

        const data = await res.json();
        setResults(data.data.items || []);
      } catch (err) {
        console.error("Lỗi tìm kiếm ngoại:", err);
        setResults([]);
      }
    };

    const delay = setTimeout(fetchSearchResults, 400);
    return () => clearTimeout(delay);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?keyword=${query}`);
  };

  const handleSelect = (slug) => {
    setQuery("");
    setResults([]);
    navigate(`/product/${slug}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header shadow-sm bg-white sticky-top">
      <div className="container py-2">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">

          {/* LOGO & MENU ĐIỀU HƯỚNG */}
          <div className="d-flex align-items-center">
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

            {/* THANH MENU ĐIỀU HƯỚNG TÍCH HỢP DROPDOWN */}
            <nav className="ms-5 d-none d-lg-flex gap-4 align-items-center">
              <Link to="/" className="text-decoration-none fw-bold text-dark hover-orange">
                Trang chủ
              </Link>

              <Dropdown>
                <Dropdown.Toggle variant="white" className="fw-bold border-0 p-0 shadow-none hover-orange d-flex align-items-center">
                  Danh mục
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow border-0 mt-2 p-2" style={{ minWidth: "250px" }}>
                  <div className="row g-0" style={{ width: "400px", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                    {/* Cột 1: Theo quốc gia */}
                    <div>
                      <h6 className="dropdown-header text-primary">Quốc gia</h6>
                      <Dropdown.Item as={Link} to="/category/manga">Manga</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/category/manhua">Manhua</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/category/manhwa">Manhwa</Dropdown.Item>
                    </div>
                    {/* Cột 2: Thể loại phổ biến */}
                    <div>
                      <h6 className="dropdown-header text-primary">Thể loại</h6>
                      <Dropdown.Item as={Link} to="/category/hanh-dong">Hành động</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/category/tinh-cam">Tình cảm</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/category/truyen-mau">Truyện màu</Dropdown.Item>
                    </div>
                  </div>
                </Dropdown.Menu>
              </Dropdown>
            </nav>
          </div>

          {/* SEARCH BOX */}
          <form className="flex-grow-1 mx-md-5 mx-0 position-relative" onSubmit={handleSubmit}>
            <div className="input-group rounded-pill border overflow-hidden">
              <input
                className="form-control border-0 shadow-none"
                placeholder="Bạn đang tìm gì..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button className="btn border-0" style={{ backgroundColor: "#ff6a00", color: "white" }} type="submit">
                <i className="fa fa-search" />
              </button>
            </div>

            {/* LIVE SEARCH RESULTS (OTRUYEN DATA) */}
            {results.length > 0 && (
              <ul className="list-group position-absolute w-100 shadow-lg mt-1" style={{ zIndex: 1050 }}>
                {results.slice(0, 5).map((item) => (
                  <li
                    key={item.slug}
                    className="list-group-item list-group-item-action d-flex align-items-center"
                    onClick={() => handleSelect(item.slug)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={`https://otruyenapi.com/uploads/comics/${item.thumb_url}`}
                      alt={item.name}
                      width="40" height="40" className="me-3 rounded shadow-sm"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/40"; }}
                    />
                    <span className="text-truncate">{item.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* ACTIONS (CART + USER) */}
          <div className="d-flex align-items-center gap-3">
            <Link to="/cart" className="btn border-0 position-relative p-2" style={{ color: "#ff6a00" }}>
              <i className="fa fa-shopping-cart fs-4" />
              {cart.length > 0 && (
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle" style={{ fontSize: "0.65rem" }}>
                  {cart.length}
                </span>
              )}
            </Link>

            {!user ? (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-dark btn-sm rounded-pill px-3 fw-bold">Đăng nhập</Link>
                <Link to="/register" className="btn btn-sm rounded-pill px-3 fw-bold text-white shadow-sm" style={{ backgroundColor: "#ff6a00" }}>Đăng ký</Link>
              </div>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="white" className="d-flex align-items-center gap-2 border-0 p-1">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.firstName || 'User'}&background=ff6a00&color=fff&rounded=true`} 
                    alt="avatar" width="35" height="35" 
                  />
                  <span className="fw-bold d-none d-lg-inline">Hi, {user.firstName || 'Member'}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu className="shadow border-0 mt-2">
                  <Dropdown.Item as={Link} to="/profile"><i className="fa fa-user-circle me-2" /> Hồ sơ</Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="text-danger"><i className="fa fa-sign-out-alt me-2" /> Đăng xuất</Dropdown.Item>
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