package com.doquockiet.example05.repository;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.doquockiet.example05.entity.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    // Tìm truyện bằng slug (định danh duy nhất)
    Optional<Product> findBySlug(String slug);

    Page<Product> findByProductNameContaining(String keyword, Pageable pageable);
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
    Page<Product> findByProductNameContainingAndCategoryCategoryId(String keyword, Long categoryId, Pageable pageable);
}