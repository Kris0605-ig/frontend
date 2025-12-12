import React, { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext"; // Import useAuth

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null); // Thêm state cartId
  const { user: currentUser } = useAuth(); // Lấy user từ AuthContext

  useEffect(() => {
    const fetchCart = async () => {
      if (currentUser && currentUser.id) {
        try {
          const userCart = await cartService.getCartByUser(currentUser.id);
          setCart(userCart.products || []);
          setCartId(userCart.cartId); // Lưu cartId vào state
        } catch (error) {
          console.error("Lỗi khi tải giỏ hàng:", error);
          setCart([]);
          setCartId(null);
        }
      } else {
        setCart([]);
        setCartId(null);
      }
    };
    fetchCart();
  }, [currentUser]); // Thay đổi dependency thành currentUser

  // 🛒 Thêm sản phẩm vào giỏ
  const addToCart = async (product) => {
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.");
      return;
    }

    if (!cartId) {
      console.error("Không tìm thấy Cart ID. Không thể thêm sản phẩm.");
      alert("Không thể thêm sản phẩm vào giỏ hàng do lỗi hệ thống.");
      return;
    }

    const existing = cart.find((item) => item.productId === product.productId);
    const quantity = existing ? existing.quantity + 1 : 1;

    try {
      await cartService.addProductToCart(cartId, product.productId, quantity);
      setCart((prevCart) => {
        if (existing) {
          return prevCart.map((item) =>
            item.productId === product.productId
              ? { ...item, quantity: quantity } : item
          );
        }
        return [...prevCart, { ...product, quantity: quantity }];
      });
      alert("Đã thêm sản phẩm vào giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
      alert("Không thể thêm sản phẩm vào giỏ hàng.");
    }
  };

  // ❌ Xoá sản phẩm khỏi giỏ
  const removeFromCart = async (productId) => {
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng.");
      return;
    }
    if (!cartId) {
      console.error("Không tìm thấy Cart ID. Không thể xóa sản phẩm.");
      alert("Không thể xóa sản phẩm khỏi giỏ hàng do lỗi hệ thống.");
      return;
    }
    try {
      await cartService.deleteProductFromCart(cartId, productId);
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      alert("Đã xóa sản phẩm khỏi giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
      alert("Không thể xóa sản phẩm khỏi giỏ hàng.");
    }
  };

  // 🔄 Cập nhật số lượng
  const updateQuantity = async (productId, qty) => {
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để cập nhật số lượng sản phẩm.");
      return;
    }
    if (!cartId) {
      console.error("Không tìm thấy Cart ID. Không thể cập nhật số lượng sản phẩm.");
      alert("Không thể cập nhật số lượng sản phẩm do lỗi hệ thống.");
      return;
    }
    try {
      await cartService.updateProductQuantityInCart(cartId, productId, qty);
      setCart((prev) =>
        prev.map((item) =>
          item.productId === productId ? { ...item, quantity: qty } : item
        )
      );
      // alert("Đã cập nhật số lượng sản phẩm!"); // Xóa dòng này
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
      alert("Không thể cập nhật số lượng sản phẩm.");
    }
  };

  // 🗑 Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (!currentUser || !currentUser.id) {
      alert("Vui lòng đăng nhập để xóa giỏ hàng.");
      return;
    }
    if (!cartId) {
      console.error("Không tìm thấy Cart ID. Không thể xóa toàn bộ giỏ hàng.");
      alert("Không thể xóa toàn bộ giỏ hàng do lỗi hệ thống.");
      return;
    }
    try {
      for (const item of cart) {
        await cartService.deleteProductFromCart(cartId, item.productId);
      }
      setCart([]);
      alert("Đã xóa toàn bộ giỏ hàng!");
    } catch (error) {
      console.error("Lỗi khi xóa toàn bộ giỏ hàng:", error);
      alert("Không thể xóa toàn bộ giỏ hàng.");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
