package com.doquockiet.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import com.doquockiet.example05.entity.Category;
import com.doquockiet.example05.entity.Product;
import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.exceptions.ResourceNotFoundException;
//import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.payloads.CategoryDTO;
import com.doquockiet.example05.payloads.CategoryResponse;
import com.doquockiet.example05.repository.CategoryRepo;
import com.doquockiet.example05.service.CategoryService;
//import com.doquockiet.example05.service.ProductService;

@Transactional
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepo categoryRepo;



    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CategoryDTO createCategory(Category category) {
        Category savedCategory = categoryRepo.save(category);
        return modelMapper.map(savedCategory, CategoryDTO.class);
    }

    @Override
    public CategoryResponse getCategories(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Category> pageCategories = categoryRepo.findAll(pageable);
        List<CategoryDTO> categoryDTOs = pageCategories.getContent()
                .stream()
                .map(cat -> modelMapper.map(cat, CategoryDTO.class))
                .collect(Collectors.toList());

        CategoryResponse response = new CategoryResponse();
        response.setContent(categoryDTOs);
        response.setPageNumber(pageCategories.getNumber());
        response.setPageSize(pageCategories.getSize());
        response.setTotalElements(pageCategories.getTotalElements());
        response.setTotalPages(pageCategories.getTotalPages());
        response.setLastPage(pageCategories.isLast());
        return response;
    }

    @Override
    public CategoryDTO getCategoryById(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));
        return modelMapper.map(category, CategoryDTO.class);
    }

    @Override
    public CategoryDTO updateCategory(Category category, Long categoryId) {
        Category existing = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        existing.setCategoryName(category.getCategoryName());
        Category updated = categoryRepo.save(existing);
        return modelMapper.map(updated, CategoryDTO.class);
    }

    @Override
    public String deleteCategory(Long categoryId) {
        Category category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "categoryId", categoryId));

        List<Product> products = category.getProducts();
        if (!products.isEmpty()) {
            throw new APIException("Cannot delete category as it contains products !!!");
        }
        System.out.println("Attempting to delete category with ID: " + categoryId);
        categoryRepo.delete(category);
        System.out.println("Category with ID: " + categoryId + " deleted successfully from repository.");
        return "Category with categoryId: " + categoryId + " deleted successfully !!!";
    }
}
