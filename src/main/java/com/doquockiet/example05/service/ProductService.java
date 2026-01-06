package com.doquockiet.example05.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.payloads.ProductResponse;

public interface ProductService {

    // Thêm sản phẩm mới vào danh mục
    ProductDTO addProduct(Long categoryId, ProductDTO productDTO);

    // Lấy danh sách tất cả sản phẩm có phân trang và sắp xếp
    ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    // Tìm sản phẩm theo danh mục
    ProductResponse searchProductByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    // Cập nhật thông tin sản phẩm
    ProductDTO updateProduct(Long productId, ProductDTO productDTO);

    // Cập nhật hình ảnh sản phẩm
    ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException;

    // Lấy file hình ảnh sản phẩm từ hệ thống lưu trữ
    InputStream getProductImage(String fileName) throws FileNotFoundException;

    // Tìm kiếm sản phẩm theo từ khóa (có thể lọc theo category nếu có)
    ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    // Xóa sản phẩm
    String deleteProduct(Long productId);

    // Lấy thông tin chi tiết sản phẩm theo ID
    ProductDTO getProductById(Long productId);
}
