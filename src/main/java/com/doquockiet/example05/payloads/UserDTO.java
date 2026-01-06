package com.doquockiet.example05.payloads;

import java.util.Set;
import java.util.HashSet;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long userId;

    @NotBlank(message = "First Name is required")
    @Size(min = 2, max = 30, message = "First Name must be between 2 and 30 characters long")
    @Pattern(regexp = "^[\\p{L} ]*$", message = "First Name must not contain numbers or special characters")
    private String firstName;

    @NotBlank(message = "Last Name is required")
    @Size(min = 2, max = 30, message = "Last Name must be between 2 and 30 characters long")
    @Pattern(regexp = "^[\\p{L} ]*$", message = "Last Name must not contain numbers or special characters")
    private String lastName;

    @NotBlank(message = "Mobile Number is required")
    @Size(min = 10, max = 10, message = "Mobile Number must be exactly 10 digits long")
    @Pattern(regexp = "^\\d{10}$", message = "Mobile Number must contain only Numbers")
    private String mobileNumber;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password;

    // --- THÊM TRƯỜNG ROLES NÀY VÀO ĐỂ HẾT LỖI getRoles() ---
    private Set<RoleDTO> roles = new HashSet<>(); 

    @Valid 
    private AddressDTO address; 

    private CartDTO cart;
}