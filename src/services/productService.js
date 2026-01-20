import httpAxios from "./httpAxios";
import axios from "axios"; // Dùng để gọi API bên ngoài (OTruyen)

const BASE_URL = "/api/public";
const OTRUYEN_API = "https://otruyenapi.com/v1/api"; //

// --- HÀM CHO DATABASE CÁ NHÂN (RENDER/AIVEN) ---
// Lưu ý: Các hàm này hiện đang bị lỗi do Database Aiven lỗi kết nối
const getAllProducts = async (pageNumber = 0, pageSize = 12) => {
  const res = await httpAxios.get(`${BASE_URL}/products`, {
    params: { pageNumber, pageSize },
  });
  return res.data;
};

const getProductById = async (productId) => {
  const res = await httpAxios.get(`${BASE_URL}/products/${productId}`);
  return res.data;
};

const getCategories = async (pageNumber = 0, pageSize = 1000) => {
  const res = await httpAxios.get(`${BASE_URL}/categories`, {
    params: { pageNumber, pageSize },
  });
  return res.data;
};

// --- HÀM CHO API OTRUYEN (DÙNG ĐỂ THAY THẾ DỮ LIỆU LỖI) ---

// 1. Lấy danh sách truyện mới cho trang chủ
const getOTruyenList = async (page = 1) => {
  const res = await axios.get(`${OTRUYEN_API}/home?page=${page}`);
  return res.data.data; 
};

// 2. Lấy chi tiết truyện theo slug (vd: 'dao-hai-tac')
const getOTruyenDetail = async (slug) => {
  const res = await axios.get(`${OTRUYEN_API}/truyen-tranh/${slug}`);
  return res.data.data.item;
};

// 3. Tìm kiếm truyện trên OTruyen (Sửa lỗi tìm kiếm không được)
const searchOTruyen = async (keyword) => {
  // Sử dụng endpoint /tim-kiem của OTruyen
  const res = await axios.get(`${OTRUYEN_API}/tim-kiem?keyword=${keyword}`);
  return res.data.data; 
};

const productService = {
  getAllProducts,
  getProductById,
  getCategories,
  getOTruyenList,
  getOTruyenDetail,
  searchOTruyen // Xuất hàm tìm kiếm mới
};

export default productService;