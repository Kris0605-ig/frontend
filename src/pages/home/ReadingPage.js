import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import productService from "../../services/productService";

const ReadingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy các tham số từ URL (?slug=abc&chapter=1...)
  const query = new URLSearchParams(location.search);
  const slug = query.get("slug");
  const chapterName = query.get("chapter");

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true);
        // Bước 1: Gọi chi tiết truyện để lấy danh sách chương mới nhất
        const comicDetail = await productService.getOTruyenDetail(slug);
        
        // Bước 2: Tìm đúng chương dựa trên số chương (chapterName)
        const chapters = comicDetail.chapters?.[0]?.server_data || [];
        const currentChap = chapters.find(c => c.chapter_name === chapterName);

        if (currentChap) {
          // Bước 3: Lấy ID chương từ link API và gọi lấy nội dung ảnh
          const chapterId = currentChap.chapter_api_data.split('/').filter(Boolean).pop();
          const res = await productService.getChapterContent(chapterId);
          setData(res);
        } else {
          alert("Không tìm thấy chương này!");
          navigate(-1);
        }
      } catch (err) {
        console.error("Lỗi tải chương:", err);
        alert("Lỗi kết nối server truyện!");
      } finally {
        setLoading(false);
      }
    };

    if (slug && chapterName) {
      fetchChapter();
    }
  }, [slug, chapterName, navigate]);

  if (loading) return <div className="text-center py-5 text-white bg-dark vh-100">Đang tải nội dung chương...</div>;
  if (!data) return <div className="text-center py-5 text-white bg-dark vh-100">Dữ liệu trống</div>;

  return (
    <div className="bg-dark min-vh-100 text-white">
      <div className="sticky-top bg-dark p-3 border-bottom d-flex align-items-center justify-content-between">
        <button className="btn btn-outline-light btn-sm" onClick={() => navigate(-1)}>← Thoát</button>
        <span className="text-truncate px-2">{data.comic_name} - Chương {data.chapter_name}</span>
        <div style={{ width: "60px" }}></div> 
      </div>
      
      <div className="d-flex flex-column align-items-center mt-2 pb-5">
        {data.chapter_image.map((img, i) => (
          <img 
            key={i} 
            src={`https://sv1.otruyenapi.com/${data.chapter_path}/${img.image_file}`} 
            className="img-fluid mb-1 shadow" 
            style={{ maxWidth: "900px", width: "100%", display: "block" }}
            alt={`Trang ${i + 1}`}
            onError={(e) => { e.target.src = "https://via.placeholder.com/800x1200?text=Lỗi+tải+ảnh"; }}
          />
        ))}
      </div>
    </div>
  );
};

export default ReadingPage;