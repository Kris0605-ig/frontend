package com.doquockiet.example05.payloads;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddressDTO {

    private Long addressId;

    @NotBlank(message = "Street name is required")
    @Size(min = 5, message = "Street name must be at least 5 characters long")
    private String street;

    @NotBlank(message = "Building name is required")
    @Size(min = 2, message = "Building name must be at least 2 characters long")
    private String buildingName;

    @NotBlank(message = "City is required")
    @Size(min = 2, message = "City name must be at least 2 characters long")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, message = "State name must be at least 2 characters long")
    private String state;

    @NotBlank(message = "Country is required")
    @Size(min = 2, message = "Country name must be at least 2 characters long")
    private String country;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;
}