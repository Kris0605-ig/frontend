package com.doquockiet.example05.service;

import com.doquockiet.example05.payloads.AddressDTO;
import com.doquockiet.example05.payloads.UserDTO;
import com.doquockiet.example05.payloads.UserResponse;

public interface UserService {

    UserDTO registerUser(UserDTO userDTO);

    UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

    UserDTO getUserById(Long userId);

    UserDTO updateUser(Long userId, UserDTO userDTO);

    String deleteUser(Long userId);

    UserDTO getUserByEmail(String email);

    UserDTO addAddressToUser(Long userId, AddressDTO addressDTO);

    UserDTO updateAddressOfUser(Long userId, Long addressId, AddressDTO addressDTO);

    String deleteAddressOfUser(Long userId, Long addressId);
}