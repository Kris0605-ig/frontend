import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import productService from "../../services/productService";

const ReadingPage = () => {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    productService.getChapterContent(chapterId)
      .then(res => setData(res))
      .catch(err => alert("Không thể tải chương này!"));
  }, [chapterId]);

  if (!data) return <div className="text-center py-5 text-white bg-dark vh-100">Đang tải ảnh...</div>;

  return (
    <div className="bg-dark min-vh-100 text-white">
      <div className="sticky-top bg-dark p-3 border-bottom d-flex align-items-center">
        <button className="btn btn-outline-light btn-sm" onClick={() => navigate(-1)}>Thoát</button>
        <span className="ms-3">{data.comic_name} - Chương {data.chapter_name}</span>
      </div>
      <div className="d-flex flex-column align-items-center mt-2">
        {data.chapter_image.map((img, i) => (
          <img 
            key={i} 
            src={`https://sv1.otruyenapi.com/${data.chapter_path}/${img.image_file}`} 
            className="img-fluid mb-1" 
            style={{ maxWidth: "900px", width: "100%" }}
            alt=""
          />
        ))}
      </div>
    </div>
  );
};

export default ReadingPage;