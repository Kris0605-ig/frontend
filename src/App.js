import Header from "./layouts/Header";
import Footer from "./layouts/Footer";
import Main from "./layouts/Main";
import "./assets/sass/ui.scss";
import "./assets/sass/bootstrap.scss";
import "./assets/sass/responsive.scss";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ thêm

function App() {
  return (
    <AuthProvider> {/* ✅ Bọc toàn bộ app trong AuthProvider */}
      <CartProvider>
        <Header />
        <Main />
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
