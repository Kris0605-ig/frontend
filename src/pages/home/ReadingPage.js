import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../services/productService";
import "./ReadingPage.css";

const ReadingPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const loadChapter = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`📖 Đang tải chương: ${chapterId}`);
        
        const data = await productService.getChapterContent(chapterId);
        
        // Kiểm tra nếu là fallback data
        if (productService.isFallbackData(data)) {
          setError(data._error || "API endpoint đã thay đổi, đang hiển thị bản thay thế");
        }
        
        setChapter(data);
        
        // Cache chapter vào localStorage nếu không phải fallback
        if (!productService.isFallbackData(data)) {
          localStorage.setItem(`chapter_${chapterId}`, JSON.stringify(data));
          localStorage.setItem("lastReadChapter", chapterId);
        }
        
      } catch (err) {
        console.error("❌ Lỗi tải chương:", err);
        setError(err.message || "Lỗi kết nối server truyện");
        
        // Tự động thử lại (tối đa 2 lần)
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadChapter();
  }, [chapterId, retryCount]);

  if (loading) {
    return (
      <div className="reading-container">
        <div className="reading-header">
          <button onClick={() => navigate(-1)}>← Quay lại</button>
          <h2>Đang tải chương...</h2>
        </div>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Đang tải nội dung {retryCount > 0 ? `(Thử lại ${retryCount}/2)` : ''}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reading-container">
      {/* Header với nút điều hướng */}
      <div className="reading-header">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Quay lại
        </button>
        
        <div className="chapter-info">
          <h2>{chapter?.comic_name || "Đọc truyện"}</h2>
          <h3>{chapter?.chapter_name || `Chương ${chapterId}`}</h3>
        </div>
      </div>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <div className="warning-banner">
          <span className="warning-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Nội dung chương */}
      <div 
        className="chapter-content"
        dangerouslySetInnerHTML={{ __html: chapter?.chapter_content || "<p>Không có nội dung</p>" }}
      />

      {/* Điều hướng chương */}
      <div className="reading-controls">
        <button onClick={() => navigate(-1)}>Chương trước</button>
        <button onClick={() => navigate(-1)}>Danh sách chương</button>
        <button>Chương sau</button>
      </div>
    </div>
  );
};

export default ReadingPage;