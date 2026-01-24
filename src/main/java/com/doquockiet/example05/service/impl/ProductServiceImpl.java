package com.doquockiet.example05.service.impl;

import java.io.FileNotFoundException;
import java.io.InputStream;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.doquockiet.example05.entity.*;
import com.doquockiet.example05.exceptions.*;
import com.doquockiet.example05.payloads.*;
import com.doquockiet.example05.repository.*;
import com.doquockiet.example05.service.FileService;
import com.doquockiet.example05.service.ProductService;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private FileService fileService;

    @Value("${project.image}")
    private String path;

    // 1. ĐỒNG BỘ TRUYỆN TỪ OTRUYEN API
    @Override
    @SuppressWarnings("unchecked")
    public ProductDTO syncFromOTruyen(String slug, Long categoryId) {
        String url = "https://otruyenapi.com/v1/api/truyen-tranh/" + slug;
        
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            Map<String, Object> item = (Map<String, Object>) data.get("item");

            // Kiểm tra xem truyện đã có trong DB chưa theo slug
            Product product = productRepo.findBySlug(slug).orElse(new Product());
            
            product.setProductName((String) item.get("name"));
            product.setSlug((String) item.get("slug"));
            product.setThumbUrl((String) item.get("thumb_url"));
            product.setDescription((String) item.get("content"));
            product.setStatus((String) item.get("status"));

            Category category = categoryRepo.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
            product.setCategory(category);

            // Các giá trị mặc định cho hệ thống bán hàng (nếu cần)
            if (product.getProductId() == null) {
                product.setPrice(0.0);
                product.setQuantity(100);
            }

            Product savedProduct = productRepo.save(product);
            return modelMapper.map(savedProduct, ProductDTO.class);
        } catch (Exception e) {
            throw new APIException("Lỗi khi đồng bộ từ OTruyen: " + e.getMessage());
        }
    }

    // 2. LẤY TẤT CẢ SẢN PHẨM (PHÂN TRANG)
    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Product> pageProducts = productRepo.findAll(pageable);
        
        return getProductResponse(pageProducts);
    }

    // 3. TÌM KIẾM THEO TỪ KHÓA VÀ DANH MỤC
    @Override
    public ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        Page<Product> pageProducts;
        if (categoryId != null && categoryId > 0) {
            pageProducts = productRepo.findByProductNameContainingAndCategoryCategoryId(keyword, categoryId, pageable);
        } else {
            pageProducts = productRepo.findByProductNameContaining(keyword, pageable);
        }

        return getProductResponse(pageProducts);
    }

    // 4. LẤY CHI TIẾT THEO ID
    @Override
    public ProductDTO getProductById(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        return modelMapper.map(product, ProductDTO.class);
    }

    // 5. XÓA SẢN PHẨM
    @Override
    public String deleteProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        productRepo.delete(product);
        return "Sản phẩm với ID: " + productId + " đã được xóa thành công!";
    }

    // 6. CẬP NHẬT ẢNH (DÙNG CHO UPLOAD FILE RIÊNG)
    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws java.io.IOException {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        String fileName = fileService.uploadImage(path, image);
        product.setThumbUrl(fileName); // Lưu vào thumbUrl để đồng bộ hiển thị

        Product updated = productRepo.save(product);
        return modelMapper.map(updated, ProductDTO.class);
    }

    // Helper: Chuyển đổi kết quả Page sang Response DTO
    private ProductResponse getProductResponse(Page<Product> pageProducts) {
        List<ProductDTO> productDTOs = pageProducts.getContent().stream()
                .map(p -> modelMapper.map(p, ProductDTO.class))
                .collect(Collectors.toList());

        ProductResponse response = new ProductResponse();
        response.setContent(productDTOs);
        response.setPageNumber(pageProducts.getNumber());
        response.setPageSize(pageProducts.getSize());
        response.setTotalElements(pageProducts.getTotalElements());
        response.setTotalPages(pageProducts.getTotalPages());
        response.setLastPage(pageProducts.isLast());
        return response;
    }

    // Các phương thức interface bắt buộc khác (nếu có)
    @Override public ProductDTO addProduct(Long cId, ProductDTO p) { return syncFromOTruyen(p.getSlug(), cId); }
    @Override public ProductDTO updateProduct(Long pId, ProductDTO p) { return null; } // Triển khai nếu cần update thủ công
    @Override public InputStream getProductImage(String f) throws FileNotFoundException { return fileService.getResource(path, f); }
    @Override public ProductResponse searchProductByCategory(Long cId, Integer pN, Integer pS, String sB, String sO) {
        return searchProductByKeyword("", cId, pN, pS, sB, sO);
    }
}