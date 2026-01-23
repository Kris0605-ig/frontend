import axios from "axios";

const OTRUYEN_API = "https://otruyenapi.com/v1/api";

const otruyenClient = axios.create({
  baseURL: OTRUYEN_API,
  timeout: 10000,
  headers: { "Accept": "application/json" }
});

const productService = {
  getOTruyenList: async (page = 1) => {
    try {
      const res = await otruyenClient.get(`/home?page=${page}`);
      return res.data.data;
    } catch (err) {
      console.error("Lỗi lấy danh sách:", err);
      return { items: [] };
    }
  },

  getOTruyenDetail: async (slug) => {
    try {
      const res = await otruyenClient.get(`/truyen-tranh/${slug}`);
      return res.data.data.item;
    } catch (err) {
      console.error("Lỗi lấy chi tiết truyện:", err);
      throw err;
    }
  },

  getChapterContent: async (chapterId) => {
    try {
      // 1. Gọi trực tiếp
      const res = await otruyenClient.get(`/chuong/${chapterId}`);
      if (res.data?.status === "success") return res.data.data.item;
      throw new Error("API Direct failed");
    } catch (err) {
      console.warn("⚠️ Đang thử dùng Proxy dự phòng (AllOrigins)...");
      try {
        const url = `${OTRUYEN_API}/chuong/${chapterId}`;
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const proxyRes = await axios.get(proxyUrl);
        
        // Parse dữ liệu từ Proxy an toàn
        let data = proxyRes.data.contents;
        if (typeof data === "string") data = JSON.parse(data);

        if (data?.data?.item) return data.data.item;
        throw new Error("Data not found in Proxy");
      } catch (proxyErr) {
        console.error("❌ Cả API và Proxy đều thất bại:", proxyErr.message);
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