import httpAxios from "./httpAxios";

const BASE_URL = "/api/public";

// Lấy tất cả sản phẩm
const getAllProducts = async (pageNumber = 0, pageSize = 12) => {
  const res = await httpAxios.get(`${BASE_URL}/products`, {
    params: { pageNumber, pageSize },
  });
  return res.data;
};

// Lấy sản phẩm theo ID
const getProductById = async (productId) => {
  const res = await httpAxios.get(`${BASE_URL}/products/${productId}`);
  return res.data;
};

// Lấy danh mục (hỗ trợ pagination - mặc định lấy nhiều để có tất cả categories)
const getCategories = async (pageNumber = 0, pageSize = 1000) => {
  const res = await httpAxios.get(`${BASE_URL}/categories`, {
    params: { pageNumber, pageSize },
  });
  return res.data;
};

// Tìm kiếm sản phẩm
const searchProducts = async (keyword) => {
  const res = await httpAxios.get(`${BASE_URL}/products/search`, {
    params: { keyword },
  });
  return res.data;
};

// ⭐ FIX WARNING — không export object vô danh
const productService = {
  getAllProducts,
  getProductById,
  getCategories,
  searchProducts,
};

export default productService;
