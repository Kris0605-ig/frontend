import React, { createContext, useContext, useState, useEffect } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [cartId, setCartId] = useState(null);
  const { user: currentUser } = useAuth();

  // Tự động tải giỏ hàng khi user đăng nhập/thay đổi
  useEffect(() => {
    const fetchCart = async () => {
      if (currentUser && currentUser.userId) { // ✅ Dùng userId
        try {
          const userCart = await cartService.getCartByUser(currentUser.userId);
          setCart(userCart.products || []);
          setCartId(userCart.cartId);
        } catch (error) {
          console.error("Lỗi tải giỏ hàng:", error);
          setCart([]);
          setCartId(null);
        }
      } else {
        setCart([]);
        setCartId(null);
      }
    };
    fetchCart();
  }, [currentUser]);

  // Thêm sản phẩm
  const addToCart = async (product) => {
    if (!currentUser || !currentUser.userId) {
      alert("Vui lòng đăng nhập để thực hiện hành động này!");
      return;
    }

    if (!cartId) {
      alert("Hệ thống đang khởi tạo dữ liệu, vui lòng thử lại sau giây lát.");
      return;
    }

    const existing = cart.find((item) => item.productId === product.productId);
    const quantity = existing ? existing.quantity + 1 : 1;

    try {
      await cartService.addProductToCart(cartId, product.productId, quantity);
      setCart((prevCart) => {
        if (existing) {
          return prevCart.map((item) =>
            item.productId === product.productId ? { ...item, quantity: quantity } : item
          );
        }
        return [...prevCart, { ...product, quantity: quantity }];
      });
      alert("Đã thêm vào danh sách yêu thích!");
    } catch (error) {
      console.error("Lỗi thêm sản phẩm:", error);
      alert("Không thể thêm vào giỏ hàng.");
    }
  };

  // Xóa sản phẩm
  const removeFromCart = async (productId) => {
    if (!currentUser?.userId || !cartId) return;
    try {
      await cartService.deleteProductFromCart(cartId, productId);
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    } catch (error) {
      console.error("Lỗi xóa sản phẩm:", error);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = async (productId, qty) => {
    if (!cartId || !currentUser?.userId) return;
    try {
      await cartService.updateProductQuantityInCart(cartId, productId, qty);
      setCart((prev) =>
        prev.map((item) => item.productId === productId ? { ...item, quantity: qty } : item)
      );
    } catch (error) {
      console.error("Lỗi cập nhật số lượng:", error);
    }
  };

  // Xóa sạch giỏ
  const clearCart = async () => {
    if (!cartId || !currentUser?.userId) return;
    try {
      for (const item of cart) {
        await cartService.deleteProductFromCart(cartId, item.productId);
      }
      setCart([]);
    } catch (error) {
      console.error("Lỗi xóa sạch giỏ hàng:", error);
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);