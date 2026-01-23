import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productService from "services/productService";

const ReadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Lấy chapterId từ dấu ? trên URL
  const query = new URLSearchParams(location.search);
  const chapterId = query.get("chapterId");

  useEffect(() => {
    if (chapterId) {
      productService.getChapterContent(chapterId)
        .then((res) => {
          if (res && res.chapter_image) {
            setData(res);
          } else {
            setError("Không tìm thấy dữ liệu ảnh của chương này.");
          }
        })
        .catch((err) => {
          console.error("❌ Lỗi tải nội dung:", err);
          setError("Lỗi kết nối server truyện. Vui lòng thử lại!");
        });
    }
  }, [chapterId]);

  if (error) return <div className="text-center py-5 text-white bg-dark vh-100"><h3>{error}</h3><button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>Quay lại</button></div>;
  if (!data) return <div className="text-center py-5 text-white bg-dark vh-100">Đang tải trang truyện...</div>;

  return (
    <div className="bg-dark min-vh-100 text-white">
      {/* Thanh điều hướng cố định phía trên */}
      <div className="sticky-top bg-dark p-3 border-bottom d-flex align-items-center">
        <button className="btn btn-outline-light btn-sm me-3" onClick={() => navigate(-1)}>Thoát</button>
        <div className="text-truncate">
          <span className="fw-bold">{data.comic_name}</span> - <span>Chương {data.chapter_name}</span>
        </div>
      </div>

      {/* Hiển thị danh sách ảnh chương */}
      <div className="d-flex flex-column align-items-center mt-2 pb-5">
        {data.chapter_image.map((img, i) => (
          <img 
            key={i} 
            src={`https://sv1.otruyenapi.com/${data.chapter_path}/${img.image_file}`} 
            className="img-fluid mb-1" 
            style={{ maxWidth: "900px", width: "100%", display: "block" }}
            alt={`Trang ${i + 1}`}
            loading="lazy"
            onError={(e) => { e.target.src = "https://via.placeholder.com/800x1200?text=Lỗi+tải+ảnh"; }}
          />
        ))}
      </div>
    </div>
  );
};

export default ReadingPage;