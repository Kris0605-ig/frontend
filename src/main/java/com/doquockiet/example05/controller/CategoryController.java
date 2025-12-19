package com.doquockiet.example05.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.doquockiet.example05.config.AppConstants;
import com.doquockiet.example05.entity.Category;
import com.doquockiet.example05.payloads.CategoryDTO;
import com.doquockiet.example05.payloads.CategoryResponse;
import com.doquockiet.example05.service.CategoryService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // 🟢 Tạo mới Category
    @PostMapping("/admin/category")
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody Category category) {
        CategoryDTO savedCategoryDTO = categoryService.createCategory(category);
        return new ResponseEntity<>(savedCategoryDTO, HttpStatus.CREATED);
    }

    // 🟢 Lấy danh sách Category (phân trang + sắp xếp)
    @GetMapping("/public/categories")
    public ResponseEntity<CategoryResponse> getCategories(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_CATEGORIES_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        CategoryResponse categoryResponse = categoryService.getCategories(
                pageNumber == 0 ? pageNumber : pageNumber - 1,
                pageSize,
                "id".equals(sortBy) ? "categoryId" : sortBy,
                sortOrder
        );

        return new ResponseEntity<>(categoryResponse, HttpStatus.OK);
    }

    // 🟢 Lấy chi tiết Category theo ID
    @GetMapping("/public/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> getOneCategory(@PathVariable Long categoryId) {
        CategoryDTO categoryDTO = categoryService.getCategoryById(categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    // 🟢 Cập nhật Category
    @PutMapping("/admin/categories/{categoryId}")
    public ResponseEntity<CategoryDTO> updateCategory(@RequestBody Category category, @PathVariable Long categoryId) {
        CategoryDTO categoryDTO = categoryService.updateCategory(category, categoryId);
        return new ResponseEntity<>(categoryDTO, HttpStatus.OK);
    }

    // 🟢 Xóa Category
    @DeleteMapping("/admin/categories/{categoryId}")
public ResponseEntity<String> deleteCategory(@PathVariable Long categoryId) {
        String status = categoryService.deleteCategory(categoryId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }
}