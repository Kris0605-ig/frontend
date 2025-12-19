package com.doquockiet.example05.service.impl;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.doquockiet.example05.entity.Cart;
import com.doquockiet.example05.entity.Category;
import com.doquockiet.example05.entity.Product;
import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.exceptions.ResourceNotFoundException;
import com.doquockiet.example05.payloads.CategoryDTO;
import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.payloads.ProductResponse;
import com.doquockiet.example05.repository.CartRepo;
import com.doquockiet.example05.repository.CategoryRepo;
import com.doquockiet.example05.repository.ProductRepo;
import com.doquockiet.example05.service.CartService;
import com.doquockiet.example05.service.FileService;
import com.doquockiet.example05.service.ProductService;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;

@Transactional
@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepo productRepo;


    @Autowired
    private CategoryRepo categoryRepo;

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private FileService fileService;

    @Autowired
    private ModelMapper modelMapper;
    @PostConstruct
    public void setupMapper() {
        modelMapper.createTypeMap(Category.class, CategoryDTO.class);

        modelMapper.createTypeMap(Product.class, ProductDTO.class)
                .addMapping(src -> src.getCategory().getCategoryId(), ProductDTO::setCategoryId);
    }
    @Value("${project.image}")
    private String path;

    // ---------------------------------------------------------
    // Add new product
    // ---------------------------------------------------------
    @Override
    public ProductDTO addProduct(Long categoryId, ProductDTO productDTO) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        Product product = modelMapper.map(productDTO, Product.class);

        boolean productNotPresent = category.getProducts().stream()
                .noneMatch(p -> p.getProductName().equals(product.getProductName()) &&
                        p.getDescription().equals(product.getDescription()));

        if (!productNotPresent) {
            throw new APIException("Product already exists !!!");
        }

        product.setImage("default.png");
        product.setCategory(category);
        double specialPrice = product.getPrice() - ((product.getDiscount() * 0.01) * product.getPrice());
        product.setSpecialPrice(specialPrice);

        Product savedProduct = productRepo.save(product);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    // ---------------------------------------------------------
    // Get all products
    // ---------------------------------------------------------
    @Override
    public ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Product> pageProducts = productRepo.findAll(pageable);
        List<ProductDTO> productDTOs = pageProducts.getContent()
                .stream()
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

    // ---------------------------------------------------------
    // Search product by category
    // ---------------------------------------------------------
    @Override
    public ProductResponse searchProductByCategory(Long categoryId, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Product> pageProducts = productRepo.findByCategoryCategoryId(categoryId, pageable);
        if (pageProducts.isEmpty()) {
            throw new APIException("Category doesn’t contain any products !!!");
        }

        List<ProductDTO> productDTOs = pageProducts.getContent()
                .stream()
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

    // ---------------------------------------------------------
    // Update product
    // ---------------------------------------------------------
    @Override
    public ProductDTO updateProduct(Long productId, ProductDTO productDTO) {
        Product productFromDB = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        Product product = modelMapper.map(productDTO, Product.class);
        product.setImage(productFromDB.getImage());
        product.setProductId(productId);
        Category category = categoryRepo.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", productDTO.getCategoryId()));
        product.setCategory(category);

        double specialPrice = product.getPrice() - ((product.getDiscount() * 0.01) * product.getPrice());
        product.setSpecialPrice(specialPrice);

        Product savedProduct = productRepo.save(product);
        return modelMapper.map(savedProduct, ProductDTO.class);
    }

    // ---------------------------------------------------------
    // Update product image
    // ---------------------------------------------------------
    @Override
    public ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        String fileName = fileService.uploadImage(path, image);
        product.setImage(fileName);

        Product updated = productRepo.save(product);
        return modelMapper.map(updated, ProductDTO.class);
    }

    // ---------------------------------------------------------
    // Search product by keyword (with optional category)
    // ---------------------------------------------------------
   // ---------------------------------------------------------
// Search product by keyword (và tùy chọn theo category)
// ---------------------------------------------------------
@Override
public ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
    Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

    Page<Product> pageProducts;

    // Nếu có categoryId -> tìm theo keyword + category
    if (categoryId != null && categoryId > 0) {
        pageProducts = productRepo.findByProductNameContainingAndCategoryCategoryId(keyword, categoryId, pageable);
    } else {
        // Nếu không có categoryId -> chỉ tìm theo keyword
        pageProducts = productRepo.findByProductNameContaining(keyword, pageable);
    }

    List<Product> products = pageProducts.getContent();

    if (products.isEmpty()) {
        throw new APIException("Không tìm thấy sản phẩm nào với từ khóa: " + keyword);
    }

    List<ProductDTO> productDTOs = products.stream()
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


    // ---------------------------------------------------------
    // Delete product
    // ---------------------------------------------------------
    @Override
    public String deleteProduct(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        List<Cart> carts = cartRepo.findCartsByProductId(productId);
        carts.forEach(cart -> cartService.deleteProductFromCart(cart.getCartId(), productId));

        productRepo.delete(product);
        return "Product with productId: " + productId + " deleted successfully !!!";
    }

    // ---------------------------------------------------------
    // Get product image
    // ---------------------------------------------------------
    @Override
    public InputStream getProductImage(String fileName) throws FileNotFoundException {
        return fileService.getResource(path, fileName);
    }

    // ---------------------------------------------------------
    // Get product by ID
    // ---------------------------------------------------------
    @Override
    public ProductDTO getProductById(Long productId) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));
        return modelMapper.map(product, ProductDTO.class);
    }
}
