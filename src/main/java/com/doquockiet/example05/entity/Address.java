package com.doquockiet.example05.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long addressId;

    @NotBlank
    @Size(min = 5, message = "Street name must contain at least 5 characters")
    @Column(name = "street")
    private String street;

    @NotBlank
    @Size(min = 5, message = "Building name must contain at least 5 characters")
    @Column(name = "building_name") // Chỉ định rõ dùng cột có gạch dưới trong database của bạn
    @JsonProperty("buildingName")   // Đảm bảo Postman gửi "buildingName" lên vẫn nhận được
    private String buildingName;

    @NotBlank
    @Size(min = 4, message = "City name must contain at least 4 characters")
    @Column(name = "city")
    private String city;

    @NotBlank
    @Size(min = 2, message = "State name must contain at least 2 characters")
    @Column(name = "state")
    private String state;

    @NotBlank
    @Size(min = 2, message = "Country name must contain at least 2 characters")
    @Column(name = "country")
    private String country;

    @NotBlank
    @Size(min = 6, message = "Pincode must contain at least 6 characters")
    @Column(name = "pincode")
    private String pincode;

    @ManyToMany(mappedBy = "addresses")
    private List<User> users = new ArrayList<>();

    // Constructor cho việc khởi tạo nhanh
    public Address(String country, String state, String city, String pincode, String street, String buildingName) {
        this.country = country;
        this.state = state;
        this.city = city;
        this.pincode = pincode;
        this.street = street;
        this.buildingName = buildingName;
    }
}