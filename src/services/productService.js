import axios from "axios";

const OTRUYEN_API = "https://otruyenapi.com/v1/api";

// Cấu hình axios riêng cho OTruyen để tránh lỗi Header bảo mật
const otruyenClient = axios.create({
  baseURL: OTRUYEN_API,
  timeout: 10000,
  headers: { "Accept": "application/json" }
});

const productService = {
  // Lấy danh sách truyện mới cho trang chủ
  getOTruyenList: async (page = 1) => {
    try {
      const res = await otruyenClient.get(`/home?page=${page}`);
      return res.data.data;
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
      return { items: [] };
    }
  },

  // Lấy chi tiết truyện và danh sách chương
  getOTruyenDetail: async (slug) => {
    try {
      const res = await otruyenClient.get(`/truyen-tranh/${slug}`);
      return res.data.data.item;
    } catch (err) {
      console.error("Lỗi lấy chi tiết truyện:", err);
      throw err;
    }
  },

  // Hàm lấy nội dung chương - ĐÃ SỬA ĐỂ HẾT LỖI 404
  getChapterContent: async (chapterId) => {
  try {
    // 1. Thử gọi trực tiếp bằng client đã cấu hình
    const res = await otruyenClient.get(`/chuong/${chapterId}`);
    
    if (res.data && res.data.status === "success") {
      return res.data.data.item;
    }
    throw new Error("Dữ liệu không thành công");
  } catch (err) {
    console.warn("⚠️ Đang thử dùng Proxy dự phòng...");
    
    try {
      const url = `${OTRUYEN_API}/chuong/${chapterId}`;
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      
      const proxyRes = await axios.get(proxyUrl);
      
      // Kiểm tra nếu proxyRes có dữ liệu nội dung
      if (proxyRes.data && proxyRes.data.contents) {
        const data = JSON.parse(proxyRes.data.contents);
        
        // KIỂM TRA AN TOÀN: Tránh lỗi "undefined reading item"
        if (data && data.data && data.data.item) {
          return data.data.item;
        }
      }
      throw new Error("Proxy không trả về dữ liệu item");
    } catch (proxyErr) {
      console.error("❌ Cả API và Proxy đều thất bại:", proxyErr.message);
      // Trả về dữ liệu giả lập để không gây crash app
      return {
        comic_name: "Lỗi tải dữ liệu",
        chapter_name: "N/A",
        chapter_image: [],
        _fallback: true
      };
    }
  }
},

isFallbackData: (data) => data?._fallback === true
};

export default productService;