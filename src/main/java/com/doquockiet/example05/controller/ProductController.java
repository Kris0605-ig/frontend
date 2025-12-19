package com.doquockiet.example05.controller;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.doquockiet.example05.config.AppConstants;
import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.payloads.ProductResponse;
import com.doquockiet.example05.service.ProductService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class ProductController {

    @Autowired
    private ProductService productService;

    // ✅ Thêm sản phẩm theo category
    @PostMapping("/admin/categories/{categoryId}/product")
    public ResponseEntity<ProductDTO> addProduct(
            @Valid @RequestBody ProductDTO productDTO,
            @PathVariable Long categoryId) {

        ProductDTO savedProduct = productService.addProduct(categoryId, productDTO);
        return new ResponseEntity<>(savedProduct, HttpStatus.CREATED);
    }

    // ✅ Lấy sản phẩm theo id (public) - giữ nguyên như hình ảnh có vẻ thiếu, nhưng có trong code bạn cung cấp ở hình ảnh 9d061d.png
    @GetMapping("/public/products/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        ProductDTO productDTO = productService.getProductById(productId);
        return new ResponseEntity<>(productDTO, HttpStatus.OK);
    }

    // ✅ Lấy tất cả sản phẩm (public) - Kết hợp với Lấy sản phẩm theo danh mục
    // Nếu categoryId = 0, nó sẽ gọi getAllProducts
    @GetMapping("/public/products")
    public ResponseEntity<ProductResponse> getAllProducts(
            @RequestParam(name = "categoryId", defaultValue = "0", required = false) Long categoryId,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        ProductResponse productResponse;

        // Nếu categoryId = 0, lấy tất cả sản phẩm (như method getAllProducts cũ)
        if (categoryId == 0) {
            productResponse = productService.getAllProducts(pageNumber, pageSize, sortBy, sortOrder);
        } else {
            // Nếu categoryId != 0, lấy sản phẩm theo danh mục (như method getProductsByCategory cũ)
            productResponse = productService.searchProductByCategory(categoryId, pageNumber, pageSize, sortBy, sortOrder);
        }

        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }
    
    // ✅ Lấy sản phẩm theo danh mục - Đã được hợp nhất vào getAllProducts theo hình ảnh hướng dẫn
    /* @GetMapping("/public/categories/{categoryId}/products") 
    public ResponseEntity<ProductResponse> getProductsByCategory(...) 
    { ... } 
    */
    
    // ✅ Tìm sản phẩm theo từ khóa
    // Có thể tìm kiếm theo từ khóa trong tất cả sản phẩm (categoryId = 0) hoặc trong một danh mục cụ thể.
    @GetMapping("/public/products/keyword/{keyword}")
    public ResponseEntity<ProductResponse> getProductsByKeyword(
            @PathVariable String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PRODUCTS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "categoryId", defaultValue = "0", required = false) Long categoryId) { // Thêm categoryId

        // Cần cập nhật productService để searchProductByKeyword nhận thêm categoryId
        ProductResponse productResponse = productService.searchProductByKeyword(
            keyword, 
            categoryId, // Thêm categoryId
            pageNumber, 
            pageSize, 
            sortBy, 
            sortOrder); 
            
        return new ResponseEntity<>(productResponse, HttpStatus.OK);
    }

    // ✅ Trả về hình ảnh sản phẩm (public)
    @GetMapping("/public/products/image/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws IOException { // Thêm throws IOException
        InputStream imageStream = productService.getProductImage(fileName);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.IMAGE_PNG);
        headers.setContentDispositionFormData("inline", fileName);
        // Dòng trên đã đủ, nhưng nếu muốn tuân thủ hoàn toàn hình ảnh:
        // headers.setContentDispositionFormData("inline", fileName);

        return new ResponseEntity<>(new InputStreamResource(imageStream), headers, HttpStatus.OK);
    }

    // ✅ Cập nhật thông tin sản phẩm (admin)
    @PutMapping("/admin/products/{productId}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long productId,
            @RequestBody ProductDTO productDTO) { // Giữ lại Product như code gốc

        ProductDTO updatedProduct = productService.updateProduct(productId, productDTO);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // ✅ Cập nhật ảnh sản phẩm (upload file thật)
    @PutMapping("/admin/products/{productId}/image")
    public ResponseEntity<ProductDTO> updateImage(
            @PathVariable Long productId,
            @RequestParam("image") MultipartFile image) throws IOException {

        ProductDTO updatedProduct = productService.updateProductImage(productId, image);
        return new ResponseEntity<>(updatedProduct, HttpStatus.OK);
    }

    // ✅ Xóa sản phẩm
    @DeleteMapping("/admin/products/{productId}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long productId) { // Giữ lại String như code gốc
        String status = productService.deleteProduct(productId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}