import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ReadingPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapterData, setChapterData] = useState(null);

 // Cập nhật lại logic gọi API trong useEffect
useEffect(() => {
  // ĐÚNG: Phải có "/v1/api/chuong/" trước ID chương
  const apiUrl = `https://otruyenapi.com/v1/api/chuong/${chapterId}`;
  
  axios.get(apiUrl)
    .then(res => {
      if (res.data.status === "success") {
        setChapterData(res.data.data.item);
      }
    })
    .catch(err => {
      console.error("Lỗi kết nối server truyện:", err);
    });
}, [chapterId]);

  if (!chapterData) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="spinner-border text-primary me-2"></div>
        <span>Đang tải trang truyện...</span>
      </div>
    );
  }

  return (
    <div className="reading-container bg-dark text-white min-vh-100">
      {/* Thanh điều hướng cố định phía trên */}
      <div className="container-fluid py-3 sticky-top bg-dark border-bottom border-secondary shadow">
        <div className="container d-flex justify-content-between align-items-center">
          <button className="btn btn-sm btn-outline-light" onClick={() => navigate(-1)}>
            ← Thoát
          </button>
          <h6 className="mb-0 text-truncate px-2">
            {chapterData.comic_name} - {chapterData.chapter_name}
          </h6>
          <div style={{ width: "60px" }}></div> {/* Spacer để căn giữa tiêu đề */}
        </div>
      </div>

      {/* Danh sách ảnh truyện */}
      <div className="image-list d-flex flex-column align-items-center mt-2 pb-5">
      {chapterData.chapter_path && chapterData.chapter_image.map((img, index) => (
        <img
          key={index}
          // Sử dụng domain chuẩn sv1.otruyenapi.com để load ảnh
          src={`https://sv1.otruyenapi.com/${chapterData.chapter_path}/${img.image_file}`}
          alt={`Trang ${index + 1}`}
          className="img-fluid mb-1"
          style={{ maxWidth: "900px", width: "100%", display: "block" }}
          loading="lazy"
          onError={(e) => { e.target.src = "https://via.placeholder.com/800x1200?text=Lỗi+tải+ảnh"; }}
        />
      ))}
    </div>

      {/* Nút quay lại đầu trang nhanh */}
      <button 
        className="btn btn-primary position-fixed bottom-0 end-0 m-4 shadow-lg"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{ borderRadius: "50%", width: "50px", height: "50px" }}
      >
        ↑
      </button>
    </div>
  );
};

export default ReadingPage;