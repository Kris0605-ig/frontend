package com.doquockiet.example05.payloads;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long productId;

    @NotBlank(message = "productName is required")
    private String productName;
    private String image;      // tên file
    private String imageUrl;   // URL đầy đủ để frontend load
    private String description;
    @NotNull(message = "quantity is required")
    private Integer quantity;
    @NotNull(message = "price is required")
    private Double price;
    private Double discount;
    private Double specialPrice;
    // categoryId is provided by the path variable in controller, make it optional in request body
    private Long categoryId;
    private CategoryDTO category;
}
