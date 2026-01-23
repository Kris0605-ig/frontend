import httpAxios from "./httpAxios";
import axios from "axios";

const BASE_URL = "/api/public";
const OTRUYEN_API = "https://otruyenapi.com/v1/api";

// --- HÀM KIỂM TRA KẾT NỐI SERVER ---
const checkServerConnection = async () => {
  try {
    // Thử kết nối đến endpoint đơn giản
    await httpAxios.get("/api/public/categories?pageSize=1", { timeout: 3000 });
    return true;
  } catch (error) {
    // Nếu server trả về lỗi (có response) -> vẫn kết nối được
    if (error.response) {
      return true;
    }
    console.warn("⚠️ Server không kết nối được:", error.message);
    return false;
  }
};

// --- DATABASE CÁ NHÂN (Render/Aiven) ---
const getAllProducts = async (pageNumber = 0, pageSize = 12) => {
  try {
    const isConnected = await checkServerConnection();
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
    const isConnected = await checkServerConnection();
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
// Tạo client cho OTruyen API (KHÔNG DÙNG User-Agent header)
const otruyenClient = axios.create({
  baseURL: OTRUYEN_API,
  timeout: 15000,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

// Hàm xử lý lỗi CORS và thử các endpoint khác nhau
const callOTruyenAPI = async (endpoint) => {
  try {
    // Thử gọi trực tiếp
    const response = await otruyenClient.get(endpoint);
    return response.data;
  } catch (error) {
    // Nếu lỗi CORS, thử dùng proxy
    if (error.code === 'ERR_NETWORK' || error.message.includes('CORS')) {
      console.log("⚠️ CORS error, trying proxy...");
      
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(
          `${OTRUYEN_API}${endpoint}`
        )}`;
        
        const proxyResponse = await axios.get(proxyUrl, { timeout: 15000 });
        
        if (proxyResponse.data?.contents) {
          try {
            return JSON.parse(proxyResponse.data.contents);
          } catch {
            return proxyResponse.data.contents;
          }
        }
      } catch (proxyError) {
        console.error("❌ Proxy also failed:", proxyError.message);
      }
    }
    
    throw error;
  }
};

// 1. Lấy danh sách truyện
const getOTruyenList = async (page = 1) => {
  try {
    const data = await callOTruyenAPI(`/home?page=${page}`);
    return data.data || data;
  } catch (error) {
    console.error("❌ Error getting OTruyen list:", error);
    return [];
  }
};

// 2. Lấy chi tiết truyện
const getOTruyenDetail = async (slug) => {
  try {
    const data = await callOTruyenAPI(`/truyen-tranh/${slug}`);
    const item = data.data?.item || data.item || data;
    
    if (!item) {
      throw new Error("No item data found");
    }
    
    // DEBUG: Log cấu trúc chapter data
    if (item.chapters?.[0]?.server_data?.[0]) {
      const chapterData = item.chapters[0].server_data[0];
      console.log('📊 Chapter API Data structure:', {
        chapter_api_data: chapterData.chapter_api_data,
        chapter_name: chapterData.chapter_name
      });
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

// 3. Tìm kiếm truyện
const searchOTruyen = async (keyword, page = 1) => {
  try {
    const data = await callOTruyenAPI(`/tim-kiem?keyword=${keyword}&page=${page}`);
    return data.data || [];
  } catch (error) {
    console.error("❌ Error searching OTruyen:", error);
    return [];
  }
};

// 4. Hàm QUAN TRỌNG: Lấy nội dung chương truyện (ĐÃ SỬA)
const getChapterContent = async (chapterId) => {
  console.log(`🔍 Đang tải chương ID: ${chapterId}`);
  
  // PHÂN TÍCH chapterId: Có thể là ID đơn hoặc URL đầy đủ
  let actualChapterId = chapterId;
  
  // Nếu chapterId chứa dấu ":" (ví dụ: "id:slug")
  if (chapterId.includes(':')) {
    actualChapterId = chapterId.split(':')[0];
    console.log(`🔍 Phát hiện ID dạng "id:slug", dùng: ${actualChapterId}`);
  }
  
  // THỬ CÁC ENDPOINT KHÁC NHAU
  const endpoints = [
    // Endpoint có thể đã thay đổi
    `/chuong/${actualChapterId}`,
    `/chapter/${actualChapterId}`,
    `/api/chuong/${actualChapterId}`,
    `/api/v1/chuong/${actualChapterId}`,
    `/api/v1/chapter/${actualChapterId}`,
    `/truyen-tranh/chuong/${actualChapterId}`,
    
    // Thử với query parameter
    `/chuong?id=${actualChapterId}`,
    `/api/chuong?id=${actualChapterId}`,
  ];
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Thử endpoint: ${endpoint}`);
      const data = await callOTruyenAPI(endpoint);
      
      if (data) {
        console.log(`✅ Thành công với: ${endpoint}`);
        return data.data || data;
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        console.log(`⚠️ Lỗi với ${endpoint}: ${error.message}`);
      }
      continue;
    }
  }
  
  // PHƯƠNG ÁN DỰ PHÒNG: Thử lấy từ HTML page
  try {
    console.log('🔄 Thử lấy từ trang HTML...');
    const htmlUrl = `https://otruyenapi.com/truyen-tranh/chuong-${actualChapterId}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(htmlUrl)}`;
    
    const response = await axios.get(proxyUrl, { timeout: 15000 });
    
    if (response.data?.contents) {
      // Parse HTML để lấy nội dung
      const htmlContent = response.data.contents;
      
      // Tìm nội dung chương trong HTML (điều chỉnh selector theo thực tế)
      const chapterMatch = htmlContent.match(/<div[^>]*class=".*chapter-content.*"[^>]*>([\s\S]*?)<\/div>/i) ||
                          htmlContent.match(/<div[^>]*id=".*chapter.*"[^>]*>([\s\S]*?)<\/div>/i) ||
                          htmlContent.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
      
      if (chapterMatch) {
        return {
          chapter_name: `Chương ${actualChapterId}`,
          chapter_content: chapterMatch[1],
          comic_name: "Từ trang web",
          _fromHtml: true
        };
      }
    }
  } catch (htmlError) {
    console.log('❌ Không thể lấy từ HTML:', htmlError.message);
  }
  
  // FALLBACK CUỐI CÙNG
  console.error(`🔥 Không thể tải chương ${chapterId}`);
  
  return {
    chapter_name: `Chương ${chapterId}`,
    chapter_content: `
      <div style="text-align: center; padding: 50px 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="font-size: 72px; margin-bottom: 20px; color: #e74c3c;">⚠️</div>
        <h2 style="color: #2c3e50; margin-bottom: 20px;">Không thể tải nội dung chương</h2>
        
        <div style="
          background: #f8f9fa;
          border-radius: 10px;
          padding: 25px;
          margin: 30px auto;
          max-width: 600px;
          text-align: left;
          border-left: 5px solid #3498db;
        ">
          <h4 style="color: #3498db; margin-top: 0;">Thông tin sự cố:</h4>
          <p><strong>Mã chương:</strong> <code>${chapterId}</code></p>
          <p><strong>Thời gian:</strong> ${new Date().toLocaleString('vi-VN')}</p>
          <p><strong>Nguyên nhân:</strong> Endpoint API đã thay đổi hoặc không khả dụng</p>
          <p><strong>Trạng thái:</strong> Đang khắc phục</p>
        </div>
        
        <p style="color: #7f8c8d; margin-bottom: 30px; max-width: 500px; margin-left: auto; margin-right: auto;">
          Chúng tôi đang nỗ lực khắc phục sự cố này. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.
        </p>
        
        <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
          <button onclick="window.history.back()" style="
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(52, 152, 219, 0.2);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(52, 152, 219, 0.3)';" 
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(52, 152, 219, 0.2)';">
            ← Quay lại
          </button>
          
          <button onclick="window.location.reload()" style="
            background: linear-gradient(135deg, #2ecc71, #27ae60);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(46, 204, 113, 0.2);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(46, 204, 113, 0.3)';" 
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(46, 204, 113, 0.2)';">
            🔄 Thử lại
          </button>
          
          <button onclick="window.location.href='/'" style="
            background: linear-gradient(135deg, #9b59b6, #8e44ad);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            box-shadow: 0 4px 6px rgba(155, 89, 182, 0.2);
            transition: all 0.3s ease;
          " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 12px rgba(155, 89, 182, 0.3)';" 
          onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(155, 89, 182, 0.2)';">
            🏠 Về trang chủ
          </button>
        </div>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; max-width: 500px; margin-left: auto; margin-right: auto;">
          <h4 style="color: #2c3e50;">Cần hỗ trợ?</h4>
          <p style="color: #7f8c8d; font-size: 14px;">
            Nếu sự cố kéo dài, vui lòng liên hệ qua email: 
            <a href="mailto:support@example.com" style="color: #3498db; text-decoration: none;">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    `,
    comic_name: "Lỗi hệ thống",
    _fallback: true,
    _error: "API_ENDPOINT_NOT_FOUND",
    _timestamp: new Date().toISOString()
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