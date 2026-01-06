package com.doquockiet.example05.service;

import com.doquockiet.example05.entity.Category;
import com.doquockiet.example05.payloads.CategoryDTO;
import com.doquockiet.example05.payloads.CategoryResponse;

public interface CategoryService {

	CategoryDTO createCategory(Category category);

	CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

	CategoryDTO getCategoryById(Long categoryId);

	CategoryDTO updateCategory(Category category, Long categoryId);

	String deleteCategory(Long categoryId);
}