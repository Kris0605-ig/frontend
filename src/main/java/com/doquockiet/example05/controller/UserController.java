package com.doquockiet.example05.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.doquockiet.example05.config.AppConstants;
import com.doquockiet.example05.payloads.APIResponse;
import com.doquockiet.example05.payloads.AddressDTO;
import com.doquockiet.example05.payloads.UserDTO;
import com.doquockiet.example05.payloads.UserResponse;
import com.doquockiet.example05.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Bearer Authentication")
public class UserController {

    @Autowired
    private UserService userService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/users")
    public ResponseEntity<UserResponse> getAllUsers(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        UserResponse userResponse = userService.getAllUsers(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/admin/users/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(userDTO, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/admin/users/{userId}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long userId, @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<APIResponse> deleteUser(@PathVariable Long userId) {
        String status = userService.deleteUser(userId);
        return new ResponseEntity<>(new APIResponse(status, true), HttpStatus.OK);
    }

    @GetMapping("/public/users/email/{email}")
    public ResponseEntity<UserDTO> getUserEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> getUserByIdPublic(@PathVariable Long userId) {
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(userDTO, HttpStatus.OK);
    }

    @PutMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> updateUserPublic(@PathVariable Long userId, @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    // Các phương thức xử lý Address (Địa chỉ)
    @PostMapping("/admin/users/{userId}/addresses")
    public ResponseEntity<UserDTO> addAddressToUser(@PathVariable Long userId, @Valid @RequestBody AddressDTO addressDTO) {
        UserDTO updatedUser = userService.addAddressToUser(userId, addressDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.CREATED);
    }

    @PutMapping("/admin/users/{userId}/addresses/{addressId}")
    public ResponseEntity<UserDTO> updateAddressOfUser(@PathVariable Long userId, @PathVariable Long addressId, @Valid @RequestBody AddressDTO addressDTO) {
        UserDTO updatedUser = userService.updateAddressOfUser(userId, addressId, addressDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/admin/users/{userId}/addresses/{addressId}")
    public ResponseEntity<APIResponse> deleteAddressOfUser(@PathVariable Long userId, @PathVariable Long addressId) {
        String status = userService.deleteAddressOfUser(userId, addressId);
        return new ResponseEntity<>(new APIResponse(status, true), HttpStatus.OK);
    }

    @PostMapping("/public/users/{userId}/addresses")
    public ResponseEntity<UserDTO> addAddressToUserPublic(@PathVariable Long userId, @Valid @RequestBody AddressDTO addressDTO) {
        UserDTO updatedUser = userService.addAddressToUser(userId, addressDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.CREATED);
    }

    @PutMapping("/public/users/{userId}/addresses/{addressId}")
    public ResponseEntity<UserDTO> updateAddressOfUserPublic(@PathVariable Long userId, @PathVariable Long addressId, @Valid @RequestBody AddressDTO addressDTO) {
        UserDTO updatedUser = userService.updateAddressOfUser(userId, addressId, addressDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/public/users/{userId}/addresses/{addressId}")
    public ResponseEntity<APIResponse> deleteAddressOfUserPublic(@PathVariable Long userId, @PathVariable Long addressId) {
        String status = userService.deleteAddressOfUser(userId, addressId);
        return new ResponseEntity<>(new APIResponse(status, true), HttpStatus.OK);
    }
}