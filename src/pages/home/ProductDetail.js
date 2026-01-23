import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import productService from "../../services/productService";// Giữ nguyên hoặc kiểm tra lại nếu folder home nằm trong folder pages

const ProductDetail = () => {
  const { id } = useParams(); // 'id' ở đây chính là slug của truyện
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    productService.getOTruyenDetail(id)
      .then((res) => {
        if (res) {
          setProduct({
            slug: res.slug,
            name: res.name,
            image: `https://otruyenapi.com/uploads/comics/${res.thumb_url}`,
            description: res.content,
            chapters: res.chapters?.[0]?.server_data || []
          });
        }
      })
      .catch((err) => console.error("Lỗi tải truyện:", err));
  }, [id]);

  if (!product) return <div className="text-center py-5">Đang tải...</div>;

  return (
    <div className="container py-5">
      <button className="btn btn-light mb-4 border" onClick={() => navigate(-1)}>← Quay lại</button>
      <div className="row bg-white p-4 rounded shadow">
        <div className="col-md-4"><img src={product.image} className="img-fluid rounded" alt="" /></div>
        <div className="col-md-8">
          <h2 className="fw-bold">{product.name}</h2>
          <div className="mt-4" style={{ maxHeight: "300px", overflowY: "auto" }}>
            <h6 className="fw-bold">Danh sách chương:</h6>
            <div className="list-group">
              {product.chapters.map((chap, index) => {
                // SỬA TẠI ĐÂY: Truyền slug, chapter và các thông tin khác qua URL
                const readingUrl = `/reading?slug=${product.slug}&chapter=${chap.chapter_name}&title=${encodeURIComponent(product.name)}&cover=${encodeURIComponent(product.image)}`;
                
                return (
                  <Link key={index} to={readingUrl} className="list-group-item list-group-item-action">
                    Chương {chap.chapter_name}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;