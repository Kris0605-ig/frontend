// import React from "react";
// import { Route, Routes } from "react-router-dom";
// import Home from "./Home";
// import CategoriesPage from "../pages/Category/CategoryPage"; // ✅ đúng đường dẫns
// import ProductDetail from "../pages/home/ProductDetail"; // ✅ đúng đường dẫn
// import Recommended from "../pages/home/Recommended"; // ✅ đúng đường dẫn
// import CartPage from "../pages/cart/CartPage";
// import Login from "../pages/auth/Login";
// import Register from "../pages/auth/Register";
// import ProfilePage from "../pages/user/ProfilePage"; // Sửa đường dẫn import
// import CheckoutPage from "../pages/checkout/CheckoutPage"; // Import CheckoutPage
// const Main = () => (
//   <main>
//     <Routes>
//       <Route path="/" element={<Home />} />
//       <Route path="/" element={<Recommended />} />
//       <Route path="/product/:id" element={<ProductDetail />} />
//       <Route path="/cart" element={<CartPage />} />
//       <Route path="/login" element={<Login />} />
//       <Route path="/register" element={<Register />} />
//       <Route path="/profile" element={<ProfilePage />} />
//       <Route path="/checkout" element={<CheckoutPage />} />
//       <Route path="/category/:categoryId" element={<CategoryPage />} />
//     </Routes>
//   </main>
// );
// export default Main;
import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import CategoriesPage from "../pages/Category/CategoryPage";
import ProductDetail from "../pages/home/ProductDetail";
import CartPage from "../pages/cart/CartPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ProfilePage from "../pages/user/ProfilePage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import SearchPage from "../pages/home/SearchPage"; // ✅ Import SearchPage
import ReadingPage from "../pages/home/ReadingPage";
import CategoryPage from "../pages/Category/CategoryPage"; // Import CategoryPages

const Main = () => (
  <main>
    <Routes>
      <Route path="/" element={<Home />} />                       {/* Home + Recommended bên trong Home */}
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/category/:categoryId" element={<CategoriesPage />} />  {/* Danh sách thể loại */}
      <Route path="/search" element={<SearchPage />} />  {/* ✅ route search */}
<Route path="/reading/:slug/:chapterId" element={<ReadingPage />} />
<Route path="/" element={<Home />} />
        {/* Định nghĩa đường dẫn đọc truyện tại đây để tránh lỗi "No routes matched" */}
        <Route path="/reading/:chapterId" element={<ReadingPage />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/category/:categoryId" element={<CategoryPage />} />
    </Routes>
  </main>
);

export default Main;
