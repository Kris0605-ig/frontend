package com.doquockiet.example05.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.doquockiet.example05.entity.Address;
import com.doquockiet.example05.payloads.APIResponse;
import com.doquockiet.example05.payloads.AddressDTO;
import com.doquockiet.example05.service.AddressService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "Bearer Authentication")
public class AddressController {

    @Autowired
    private AddressService addressService;

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping("/address")
    public ResponseEntity<AddressDTO> createAddress(@Valid @RequestBody AddressDTO addressDTO) {
        AddressDTO createdAddress = addressService.createAddress(addressDTO);
        return new ResponseEntity<AddressDTO>(createdAddress, HttpStatus.CREATED);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/addresses")
    public ResponseEntity<List<AddressDTO>> getAddresses() {
        List<AddressDTO> addresses = addressService.getAddresses();
        return new ResponseEntity<List<AddressDTO>>(addresses, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/address/{addressId}")
    public ResponseEntity<AddressDTO> getAddress(@PathVariable Long addressId) {
        AddressDTO address = addressService.getAddress(addressId);
        return new ResponseEntity<AddressDTO>(address, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/address/{addressId}")
    public ResponseEntity<AddressDTO> updateAddress(@PathVariable Long addressId, @Valid @RequestBody Address address) {
        AddressDTO updatedAddress = addressService.updateAddress(addressId, address);
        return new ResponseEntity<AddressDTO>(updatedAddress, HttpStatus.OK);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/address/{addressId}")
    public ResponseEntity<APIResponse> deleteAddress(@PathVariable Long addressId) {
        String status = addressService.deleteAddress(addressId);
        return new ResponseEntity<APIResponse>(new APIResponse(status, true), HttpStatus.OK);
    }
}