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
});
// Thêm interceptor để kiểm tra request
otruyenClient.interceptors.request.use(
  (config) => {
    // Debug: xem headers đang gửi đi
    console.log('📤 Sending request to:', config.url);
    console.log('📤 Headers:', config.headers);
    return config;
  },
  (error) => Promise.reject(error)
);
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
// const getChapterContent = async (chapterId) => {
//   try {
//     const res = await otruyenClient.get(`/chuong/${chapterId}`);
//     return res.data?.data || res.data;
//   } catch (error) {
//     console.error(`❌ Error getting chapter ${chapterId}:`, error);
//     return {
//       chapter_name: `Chương ${chapterId}`,
//       chapter_content: "<p>Đang tải nội dung chương...</p>",
//       _fallback: true
//     };
//   }
// };
const getChapterContent = async (chapterId) => {
  console.log(`🔍 Đang tìm endpoint cho chương: ${chapterId}`);
  
  // THỬ CÁC ENDPOINT MỚI - API ĐÃ THAY ĐỔI
  const endpoints = [
    // Endpoint mới có thể là:
    `/api/chuong/${chapterId}`,
    `/api/chapter/${chapterId}`,
    `/api/truyen-tranh/chuong/${chapterId}`,
    `/chapter/${chapterId}`,
    `/truyen-tranh/${chapterId}`,
    
    // Hoặc endpoint khác với định dạng ID khác
    // Thử cắt ID nếu có dạng "id:slug"
    chapterId.includes(':') ? `/api/chuong/${chapterId.split(':')[0]}` : null
  ].filter(Boolean); // Lọc bỏ null

  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Thử endpoint: ${endpoint}`);
      const response = await otruyenClient.get(endpoint);
      
      if (response.data) {
        console.log(`✅ Thành công với: ${endpoint}`);
        return response.data.data || response.data;
      }
    } catch (error) {
      // Chỉ log nếu không phải 404
      if (error.response?.status !== 404) {
        console.log(`❌ Lỗi với ${endpoint}:`, error.message);
      }
      continue;
    }
  }
  
  // NẾU KHÔNG TÌM THẤY ENDPOINT, THỬ CÁCH KHÁC:
  console.log('🔄 Thử phương án dự phòng...');
  
  // Cách 2: Dùng API tìm kiếm chương
  try {
    // Thử lấy thông tin chương từ API tìm kiếm
    const searchResponse = await otruyenClient.get(`/tim-kiem?keyword=${chapterId}`);
    if (searchResponse.data?.data?.length > 0) {
      console.log('✅ Tìm thấy chương qua search API');
      return searchResponse.data.data[0];
    }
  } catch (searchError) {
    console.log('❌ Search API cũng lỗi:', searchError.message);
  }
  
  // Cách 3: Thử proxy khác (tránh CORS)
  try {
    console.log('🔄 Thử dùng proxy...');
    const proxyResponse = await axios.get(
      `https://api.allorigins.win/get?url=${encodeURIComponent(
        `https://otruyenapi.com/v1/api/chuong/${chapterId}`
      )}`
    );
    
    if (proxyResponse.data?.contents) {
      const data = JSON.parse(proxyResponse.data.contents);
      console.log('✅ Thành công với proxy');
      return data.data || data;
    }
  } catch (proxyError) {
    console.log('❌ Proxy cũng lỗi:', proxyError.message);
  }
  
  // FALLBACK: Trả về dữ liệu mẫu để không bị lỗi UI
  console.warn('🔥 Tất cả endpoints đều thất bại, dùng fallback data');
  return {
    chapter_name: `Chương ${chapterId}`,
    chapter_content: `
      <div style="text-align: center; padding: 40px; font-family: Arial, sans-serif;">
        <h3 style="color: #e74c3c;">⚠️ Không thể tải nội dung</h3>
        <p>Chương truyện tạm thời không khả dụng. Nguyên nhân có thể:</p>
        <ul style="text-align: left; display: inline-block; margin: 20px 0;">
          <li>API đã thay đổi endpoint</li>
          <li>Chương đã bị xóa hoặc di chuyển</li>
          <li>Lỗi kết nối tạm thời</li>
        </ul>
        <p>Vui lòng thử lại sau hoặc đọc chương khác.</p>
        <button onclick="window.history.back()" style="
          background: #3498db;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 20px;
        ">← Quay lại</button>
      </div>
    `,
    comic_name: "Truyện đang bảo trì",
    _fallback: true,
    _error: `Endpoint /chuong/${chapterId} không còn hoạt động`
  };
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