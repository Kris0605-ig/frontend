import httpAxios from "./httpAxios";

const CART_URL = "/api";

const addProductToCart = async (cartId, productId, quantity) => {
  try {
    const response = await httpAxios.post(`${CART_URL}/public/carts/${cartId}/products/${productId}/quantity/${quantity}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi thêm sản phẩm vào giỏ hàng:", error);
    throw error;
  }
};

const getCartByUser = async (userId) => {
  try {
    const response = await httpAxios.get(`${CART_URL}/public/users/${userId}/carts`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy giỏ hàng:", error);
    throw error;
  }
};

const updateProductQuantityInCart = async (cartId, productId, quantity) => {
  try {
    const response = await httpAxios.put(`${CART_URL}/public/carts/${cartId}/products/${productId}/quantity/${quantity}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm:", error);
    throw error;
  }
};

const deleteProductFromCart = async (cartId, productId) => {
  try {
    await httpAxios.delete(`${CART_URL}/public/carts/${cartId}/product/${productId}`);
    return true; // Hoặc trả về một giá trị phù hợp
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    throw error;
  }
};

const cartService = {
  addProductToCart,
  getCartByUser,
  updateProductQuantityInCart,
  deleteProductFromCart,
};

export default cartService;