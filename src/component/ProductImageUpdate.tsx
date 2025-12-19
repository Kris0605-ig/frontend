import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNotify, useRedirect } from 'react-admin';
import axios from 'axios';
import './css/ProductImageUpdate.css';
import { CircularProgress } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';

const ProductImageUpdate = () => {
    const { id } = useParams<{ id: string }>();
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const notify = useNotify();
    const redirect = useRedirect();
    const token = localStorage.getItem('jwt-token');

    // 🟢 Lấy ảnh hiện tại
    useEffect(() => {
        const fetchImage = async () => {
            try {
                const res = await axios.get(`http://localhost:8080/api/public/products/${id}`);
                setCurrentImage(res.data.image || null);
            } catch {
                setCurrentImage(null);
            }
        };
        fetchImage();
    }, [id]);

    // 🟢 Khi chọn file mới
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const selectedFile = event.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // 🟢 Upload ảnh
    const handleUpload = async () => {
        if (!file) {
            notify('⚠️ Vui lòng chọn ảnh!');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        try {
            setLoading(true);
            await axios.put(`http://localhost:8080/api/admin/products/${id}/image`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setProgress(percent);
                },
            });

            notify('✅ Cập nhật hình ảnh thành công!');
            redirect('/products');
        } catch (error) {
            notify('❌ Lỗi khi cập nhật hình ảnh.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="image-update-container">
            <h2>📷 Cập nhật hình ảnh cho sản phẩm #{id}</h2>

            <div className="image-section">
               

                <div className="image-box">
                    <h4>Ảnh mới</h4>
                    {preview ? (
                        <img src={preview} alt="Preview" className="product-img preview-animate" />
                    ) : (
                        <div className="upload-placeholder">
                            <CloudUpload className="upload-icon" />
                            <p>Chưa chọn ảnh</p>
                        </div>
                    )}
                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="file-input"
            />

            <button
                onClick={handleUpload}
                className="upload-button"
                disabled={loading}
            >
                {loading ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Cập nhật ảnh'}
            </button>

            {loading && (
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
            )}
        </div>
    );
};

export default ProductImageUpdate;
