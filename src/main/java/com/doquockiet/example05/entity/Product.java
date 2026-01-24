package com.doquockiet.example05.entity;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @NotBlank
    private String productName;

    @Column(unique = true)
    private String slug; // Định danh truyện từ OTruyen

    private String thumbUrl; // Link ảnh từ server OTruyen

    private String status; // Trạng thái truyện

@Lob
@Column(columnDefinition = "LONGTEXT")
private String description;

    private Integer quantity = 0;
    private double price = 0;
    private double discount = 0;
    private double specialPrice = 0;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "product", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private List<CartItem> cartItems = new ArrayList<>();

    @OneToMany(mappedBy = "product", cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    private List<OrderItem> orderItems = new ArrayList<>();
}