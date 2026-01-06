package com.doquockiet.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Set;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doquockiet.example05.config.AppConstants;
import com.doquockiet.example05.entity.Address;
import com.doquockiet.example05.entity.Cart;
import com.doquockiet.example05.entity.Role;
import com.doquockiet.example05.entity.User;
import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.exceptions.ResourceNotFoundException;
import com.doquockiet.example05.payloads.AddressDTO;
import com.doquockiet.example05.payloads.CartDTO;
import com.doquockiet.example05.payloads.ProductDTO;
import com.doquockiet.example05.payloads.UserDTO;
import com.doquockiet.example05.payloads.UserResponse;
import com.doquockiet.example05.repository.AddressRepo;
import com.doquockiet.example05.repository.RoleRepo;
import com.doquockiet.example05.repository.UserRepo;
import com.doquockiet.example05.service.UserService;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        try {
            User user = modelMapper.map(userDTO, User.class);
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));

            // --- PHẦN SỬA ĐỔI LOGIC ROLE Ở ĐÂY ---
            if (userDTO.getRoles() != null && !userDTO.getRoles().isEmpty()) {
                // Nếu có gửi Roles trong DTO (Ví dụ: roleId 101 từ Postman)
                user.getRoles().clear(); // Xóa các role mặc định nếu có
                userDTO.getRoles().forEach(roleDTO -> {
                    Role role = roleRepo.findById(roleDTO.getRoleId())
                            .orElseThrow(() -> new APIException("Role not found with ID: " + roleDTO.getRoleId()));
                    user.getRoles().add(role);
                });
            } else {
                // Nếu không gửi Role, mặc định gán USER (thường là 102)
                Role role = roleRepo.findById(AppConstants.USER_ID)
                        .orElseThrow(() -> new APIException("Default Role USER not found"));
                user.getRoles().add(role);
            }
            // -------------------------------------

            Cart cart = new Cart();
            cart.setUser(user);
            user.setCart(cart);

            if (userDTO.getAddress() != null) {
                AddressDTO ad = userDTO.getAddress();
                Address address = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                        ad.getCountry(), ad.getState(), ad.getCity(), ad.getPincode(), ad.getStreet(), ad.getBuildingName());
                if (address == null) {
                    address = modelMapper.map(ad, Address.class);
                    address = addressRepo.save(address);
                }
                user.setAddresses(List.of(address));
            }

            User registeredUser = userRepo.save(user);
            UserDTO response = modelMapper.map(registeredUser, UserDTO.class);
            
            if(!registeredUser.getAddresses().isEmpty()) {
                response.setAddress(modelMapper.map(registeredUser.getAddresses().get(0), AddressDTO.class));
            }
            return response;
        } catch (DataIntegrityViolationException e) {
            throw new APIException("Email already exists!");
        } catch (Exception e) {
            throw new APIException("Error: " + e.getMessage());
        }
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setMobileNumber(userDTO.getMobileNumber());

        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }

        if (userDTO.getAddress() != null) {
            Address address = findOrCreateAddress(userDTO.getAddress());
            user.setAddresses(List.of(address));
        }

        User updatedUser = userRepo.save(user);
        UserDTO resultDTO = modelMapper.map(updatedUser, UserDTO.class);
        if (!updatedUser.getAddresses().isEmpty()) {
            resultDTO.setAddress(modelMapper.map(updatedUser.getAddresses().get(0), AddressDTO.class));
        }
        return resultDTO;
    }

    private Address findOrCreateAddress(AddressDTO ad) {
        Address address = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                ad.getCountry(), ad.getState(), ad.getCity(), 
                ad.getPincode(), ad.getStreet(), ad.getBuildingName());
        
        if (address == null) {
            address = modelMapper.map(ad, Address.class);
            address = addressRepo.save(address);
        }
        return address;
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        UserDTO dto = modelMapper.map(user, UserDTO.class);

        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            dto.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }

        if (user.getCart() != null) {
            CartDTO cartDTO = modelMapper.map(user.getCart(), CartDTO.class);
            List<ProductDTO> products = user.getCart().getCartItems().stream()
                    .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                    .collect(Collectors.toList());
            cartDTO.setProducts(products);
            dto.setCart(cartDTO);
        }
        return dto;
    }

    @Override
    public UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sort);
        Page<User> pageUsers = userRepo.findAll(pageDetails);
        List<User> users = pageUsers.getContent();

        if (users.isEmpty()) {
            throw new APIException("No User exists");
        }

        List<UserDTO> dtos = users.stream().map(u -> {
            UserDTO dto = modelMapper.map(u, UserDTO.class);
            if (!u.getAddresses().isEmpty()) {
                dto.setAddress(modelMapper.map(u.getAddresses().get(0), AddressDTO.class));
            }
            return dto;
        }).collect(Collectors.toList());

        UserResponse response = new UserResponse();
        response.setContent(dtos);
        response.setPageNumber(pageUsers.getNumber());
        response.setPageSize(pageUsers.getSize());
        response.setTotalElements(pageUsers.getTotalElements());
        response.setTotalPages(pageUsers.getTotalPages());
        response.setLastPage(pageUsers.isLast());

        return response;
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        UserDTO dto = modelMapper.map(user, UserDTO.class);
        if (!user.getAddresses().isEmpty()) {
            dto.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }
        return dto;
    }

    @Override
    public String deleteUser(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        userRepo.delete(user);
        return "User with userId " + userId + " deleted successfully";
    }

    @Override
    public UserDTO addAddressToUser(Long userId, AddressDTO ad) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        Address address = findOrCreateAddress(ad);
        user.getAddresses().add(address);
        userRepo.save(user);

        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public UserDTO updateAddressOfUser(Long userId, Long addressId, AddressDTO ad) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        modelMapper.map(ad, address);
        address.setAddressId(addressId);

        addressRepo.save(address);
        return modelMapper.map(user, UserDTO.class);
    }

    @Override
    public String deleteAddressOfUser(Long userId, Long addressId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        user.getAddresses().remove(address);
        userRepo.save(user);

        return "Address with addressId " + addressId + " deleted successfully from user with userId " + userId;
    }
}