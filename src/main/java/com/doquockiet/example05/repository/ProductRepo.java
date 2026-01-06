package com.doquockiet.example05.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.doquockiet.example05.entity.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    // Tìm sản phẩm theo tên
    Page<Product> findByProductNameContaining(String keyword, Pageable pageable);

    // Tìm sản phẩm theo danh mục
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);

    // Tìm sản phẩm theo tên + danh mục
    Page<Product> findByProductNameContainingAndCategoryCategoryId(String keyword, Long categoryId, Pageable pageable);
}
