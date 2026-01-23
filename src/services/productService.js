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
      // Chỉ dùng 1 endpoint chuẩn duy nhất
      const res = await otruyenClient.get(`/chuong/${chapterId}`);
      if (res.data?.status === "success") {
        return res.data.data.item;
      }
      throw new Error("Không tìm thấy chương");
    } catch (err) {
      console.warn("Thử dùng Proxy do lỗi kết nối hoặc 404...");
      // Proxy dự phòng nếu bị chặn CORS hoặc lỗi mạng
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`${OTRUYEN_API}/chuong/${chapterId}`)}`;
      const proxyRes = await axios.get(proxyUrl);
      const data = JSON.parse(proxyRes.data.contents);
      return data.data.item;
    }
  },

  isFallbackData: (data) => data?._fallback === true
};

export default productService;