import axios from "axios";

// Hàm lấy danh sách truyện (Dùng cho Recommended.js)
const getOTruyenList = async (page = 1) => {
  try {
    const res = await axios.get(`https://otruyenapi.com/v1/api/danh-sach/truyen-moi?page=${page}`);
    return res.data.data; 
  } catch (err) {
    console.error("Lỗi getOTruyenList:", err);
    return null;
  }
};

// Hàm lấy chi tiết truyện (Dùng cho ProductDetail.js)
const getOTruyenDetail = async (slug) => {
  try {
    const res = await axios.get(`https://otruyenapi.com/v1/api/truyen-tranh/${slug}`);
    return res.data.data.item;
  } catch (err) {
    console.error("Lỗi getOTruyenDetail:", err);
    return null;
  }
};

// Hàm lấy nội dung chương (Dùng cho ReadingPage.js)
const getChapterContent = async (chapterId) => {
  try {
    const res = await axios.get(`https://sv1.otruyenapi.com/v1/api/chapter/${chapterId}`);
    return res.data.data.item;
  } catch (err) {
    console.error("Lỗi getChapterContent:", err);
    return null;
  }
};

// QUAN TRỌNG: Object export phải chứa đầy đủ các hàm trên
const productService = {
  getOTruyenList,
  getOTruyenDetail,
  getChapterContent
};

export default productService;