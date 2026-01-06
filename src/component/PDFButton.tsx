// file: component/PDFButton.tsx

import { BlobProvider } from '@react-pdf/renderer';
import MyDocument from './MyDocument';
import { HiOutlinePrinter } from 'react-icons/hi';
import React, { useState, CSSProperties } from 'react';

// Định nghĩa kiểu props để nhận cartData
const PDFButton = ({ cartData }: { cartData: any }) => {

    const [data] = useState(cartData); // Giữ dữ liệu giỏ hàng

    // SỬA LỖI TYPESCRIPT: Khai báo kiểu CSSProperties rõ ràng
    const btnStyle: CSSProperties = {
        borderRadius: '3px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 10px',
        fontSize: '12px',
        color: '#FFD700', 
        fontWeight: 700,
        cursor: 'pointer',
        userSelect: 'none', // Thuộc tính CSS hợp lệ
        backgroundColor: '#FF6700', 
        textDecoration: 'none',
        transition: 'background-color 0.3s, color 0.3s',
    };

    const styles = {
        btn: btnStyle
    };
    
    const handleMouseEnter = (e: any) => { /* Logic hover */ };
    const handleMouseLeave = (e: any) => { /* Logic hover */ };


    if (!data) return <span>Error: PDF Data Missing.</span>;

    return (
        <BlobProvider document={<MyDocument data={data} />}>
            {({ url, loading, blob }) => {
                if (loading) {
                    return <span style={{ padding: '6px 10px', color: '#333' }}>Creating PDF...</span>;
                }
                
                return (
                    <a
                        // SỬA LỖI TYPESCRIPT: Chuyển null thành undefined cho href
                        href={url || undefined} 
                        target="_blank" 
                        style={styles.btn}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                    >
                        <HiOutlinePrinter size={17} />
                        <span style={{ textDecoration: 'none' }}>PRINT</span>
                    </a>
                );
            }}
        </BlobProvider>
    );
};

export default PDFButton;