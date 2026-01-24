package com.doquockiet.example05.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;
import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.payloads.ProductResponse;

public interface ProductService {
    // Phương thức mới để đồng bộ dữ liệu truyện từ OTruyen
    ProductDTO syncFromOTruyen(String slug, Long categoryId);

    ProductDTO addProduct(Long categoryId, ProductDTO productDTO);
    
    ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    
    ProductResponse searchProductByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    
    ProductDTO updateProduct(Long productId, ProductDTO productDTO);
    
    ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException;
    
    InputStream getProductImage(String fileName) throws FileNotFoundException;
    
    ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    
    String deleteProduct(Long productId);
    
    ProductDTO getProductById(Long productId);
}