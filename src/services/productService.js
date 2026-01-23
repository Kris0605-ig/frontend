// src/services/productService.js
import httpAxios, { checkServerConnection } from "./httpAxios"; // Chỉ import những hàm cần dùng
import axios from "axios";

const BASE_URL = "/api/public";
const OTRUYEN_API = "https://otruyenapi.com/v1/api";

// --- KIỂM TRA KẾT NỐI SERVER TRƯỚC KHI GỌI API ---
const ensureServerConnection = async () => {
  try {
    const connection = await checkServerConnection();
    return connection.connected;
  } catch (error) {
    console.warn("⚠️ Server connection check failed:", error.message);
    return false;
  }
};

// --- DATABASE CÁ NHÂN (Render/Aiven) ---
const getAllProducts = async (pageNumber = 0, pageSize = 12) => {
  try {
    const isConnected = await ensureServerConnection();
    if (!isConnected) {
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
    return {
      content: [],
      totalPages: 0,
      _fallback: true,
      _error: error.message
    };
  }
};

const getProductById = async (productId) => {
  try {
    const isConnected = await ensureServerConnection();
    if (!isConnected) {
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
    
    if (error.response?.status === 404) {
      console.log(`🔍 Product ${productId} not found, trying OTruyen...`);
      return await getOTruyenDetail(productId);
    }
    
    return {
      productId,
      productName: "Error loading product",
      _fallback: true,
      _error: error.message
    };
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
const otruyenClient = axios.create({
  baseURL: OTRUYEN_API,
  timeout: 10000,
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "application/json"
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
    
    return {
      slug,
      name: `Truyện ${slug}`,
      thumb_url: "",
      content: "Đang tải nội dung...",
      category: [{ name: "Truyện tranh" }],
      chapters: [{ server_data: [] }],
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

// Hàm lấy nội dung chương
const getChapterContent = async (chapterId) => {
  try {
    const res = await otruyenClient.get(`/chuong/${chapterId}`);
    return res.data?.data || res.data;
  } catch (error) {
    console.error(`❌ Error getting chapter ${chapterId}:`, error);
    return {
      chapter_name: `Chương ${chapterId}`,
      chapter_content: "<p>Đang tải nội dung chương...</p>",
      _fallback: true
    };
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
  getChapterContent,
  
  // Utility
  isFallbackData: (data) => data?._fallback === true
};

export default productService;