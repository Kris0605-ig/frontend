import httpAxios, { refreshToken, checkServerConnection } from "./httpAxios";
import axios from "axios";

const BASE_URL = "/api/public";
const OTRUYEN_API = "https://otruyenapi.com/v1/api";

// --- KIỂM TRA KẾT NỐI SERVER TRƯỚC KHI GỌI API ---
const ensureServerConnection = async () => {
  const connection = await checkServerConnection();
  if (!connection.connected) {
    console.warn("Server is not available, using fallback data");
    return false;
  }
  return true;
};

// --- DATABASE CÁ NHÂN (Render/Aiven) ---
const getAllProducts = async (pageNumber = 0, pageSize = 12) => {
  try {
    const isConnected = await ensureServerConnection();
    if (!isConnected) {
      // Trả về fallback data nếu server không kết nối
      return {
        content: [],
        totalPages: 0,
        _fallback: true
      };
    }
    
    const res = await httpAxios.get(`${BASE_URL}/products`, {
      params: { pageNumber, pageSize },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error getting products:", error);
    throw error;
  }
};

const getProductById = async (productId) => {
  try {
    const isConnected = await ensureServerConnection();
    if (!isConnected) {
      // Trả về fallback data
      return {
        productId,
        productName: "Product unavailable (server offline)",
        _fallback: true
      };
    }
    
    const res = await httpAxios.get(`${BASE_URL}/products/${productId}`);
    return res.data;
  } catch (error) {
    console.error(`❌ Error getting product ${productId}:`, error);
    
    // Nếu lỗi 404, thử tìm trên OTruyen
    if (error.response?.status === 404) {
      console.log(`🔍 Product ${productId} not found, trying OTruyen...`);
      return await getOTruyenDetail(productId);
    }
    
    throw error;
  }
};

const getCategories = async (pageNumber = 0, pageSize = 1000) => {
  try {
    const res = await httpAxios.get(`${BASE_URL}/categories`, {
      params: { pageNumber, pageSize },
    });
    return res.data;
  } catch (error) {
    console.error("❌ Error getting categories:", error);
    
    // Fallback categories
    return {
      content: [
        { categoryId: 1, categoryName: "Truyện tranh" },
        { categoryId: 2, categoryName: "Tiểu thuyết" },
        { categoryId: 3, categoryName: "Light Novel" }
      ],
      _fallback: true
    };
  }
};

// --- OTruyen API (External) ---
// Tạo instance riêng cho OTruyen để không bị ảnh hưởng bởi interceptor
const otruyenClient = axios.create({
  baseURL: OTRUYEN_API,
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }
});

const getOTruyenList = async (page = 1) => {
  try {
    const res = await otruyenClient.get(`/home`, { params: { page } });
    return res.data?.data || res.data || [];
  } catch (error) {
    console.error("❌ Error getting OTruyen list:", error);
    return [];
  }
};

const getOTruyenDetail = async (slug) => {
  try {
    const res = await otruyenClient.get(`/truyen-tranh/${slug}`);
    const item = res.data?.data?.item || res.data?.item;
    
    if (!item) {
      throw new Error("No data found");
    }
    
    return item;
  } catch (error) {
    console.error(`❌ Error getting OTruyen detail for ${slug}:`, error);
    
    // Fallback data
    return {
      slug,
      name: `Truyện ${slug}`,
      _fallback: true,
      _error: error.message
    };
  }
};

const searchOTruyen = async (keyword, page = 1) => {
  try {
    const res = await otruyenClient.get(`/tim-kiem`, {
      params: { keyword, page }
    });
    return res.data?.data || [];
  } catch (error) {
    console.error("❌ Error searching OTruyen:", error);
    return [];
  }
};

const productService = {
  // Database cá nhân
  getAllProducts,
  getProductById,
  getCategories,
  
  // OTruyen API
  getOTruyenList,
  getOTruyenDetail,
  searchOTruyen,
  
  // Utility
  isFallbackData: (data) => data?._fallback === true
};

export default productService;