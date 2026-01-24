package com.doquockiet.example05.payloads;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long productId;
    private String productName;
    private String slug;
    private String thumbUrl;
    private String description;
    private String status;
    private Integer quantity; // CartServiceImpl cần trường này
    private Double price;
    private Double discount;
    private Double specialPrice;
    private Long categoryId;

    // Thay vì dùng trường imageUrl, ta dùng hàm getter để React gọi
    public String getImageUrl() {
        if (this.thumbUrl != null && !this.thumbUrl.startsWith("http")) {
            return "https://otruyenapi.com/uploads/comics/" + this.thumbUrl;
        }
        return this.thumbUrl;
    }
}