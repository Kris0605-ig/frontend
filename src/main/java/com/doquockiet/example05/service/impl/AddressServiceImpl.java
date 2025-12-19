package com.doquockiet.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.doquockiet.example05.entity.Address;
import com.doquockiet.example05.entity.User;
import com.doquockiet.example05.exceptions.APIException;
import com.doquockiet.example05.exceptions.ResourceNotFoundException;
import com.doquockiet.example05.payloads.AddressDTO;
import com.doquockiet.example05.repository.AddressRepo;
import com.doquockiet.example05.repository.UserRepo;
import com.doquockiet.example05.service.AddressService;

@Service
@Transactional
public class AddressServiceImpl implements AddressService {

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public AddressDTO createAddress(AddressDTO addressDTO) {

        String country = addressDTO.getCountry();
        String state = addressDTO.getState();
        String city = addressDTO.getCity();
        String pincode = addressDTO.getPincode();
        String street = addressDTO.getStreet();
        String buildingName = addressDTO.getBuildingName();

        Address addressFromDB = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(country,
                state, city, pincode, street, buildingName);

        if (addressFromDB != null) {
            throw new APIException("Address already exists with addressId: " + addressFromDB.getAddressId());
        }

        Address address = modelMapper.map(addressDTO, Address.class);

        Address savedAddress = addressRepo.save(address);

        return modelMapper.map(savedAddress, AddressDTO.class);
    }

    @Override
    public List<AddressDTO> getAddresses() {
        List<Address> addresses = addressRepo.findAll();

        List<AddressDTO> addressDTOs = addresses.stream()
                .map(address -> modelMapper.map(address, AddressDTO.class))
                .collect(Collectors.toList());

        return addressDTOs;
    }

    @Override
    public AddressDTO getAddress(Long addressId) {
        Address address = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        return modelMapper.map(address, AddressDTO.class);
    }

    @Override
    public AddressDTO updateAddress(Long addressId, Address address) {
        Address addressFromDB = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        String country = address.getCountry();
        String state = address.getState();
        String city = address.getCity();
        String pincode = address.getPincode();
        String street = address.getStreet();
        String buildingName = address.getBuildingName();

        Address addressWithSameDetails = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                country, state, city, pincode, street, buildingName);

        if (addressWithSameDetails != null && addressWithSameDetails.getAddressId() != addressId) {
            throw new APIException(
                    "Address with same details already exists with addressId: "
                            + addressWithSameDetails.getAddressId());
        }

        if (addressFromDB != null) {
            addressFromDB.setCountry(address.getCountry());
            addressFromDB.setState(address.getState());
            addressFromDB.setCity(address.getCity());
            addressFromDB.setPincode(address.getPincode());
            addressFromDB.setStreet(address.getStreet());
            addressFromDB.setBuildingName(address.getBuildingName());

            Address updatedAddress = addressRepo.save(addressFromDB);

            return modelMapper.map(updatedAddress, AddressDTO.class);
        } else {
            List<User> users = userRepo.findByAddress(addressId);
            final Address a = addressFromDB;
            users.forEach(user -> user.getAddresses().add(a));

            deleteAddress(addressId);

            return modelMapper.map(addressFromDB, AddressDTO.class);
        }
    }

    @Override
    public String deleteAddress(Long addressId) {
        Address addressFromDB = addressRepo.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "addressId", addressId));

        List<User> users = userRepo.findByAddress(addressId);

        users.forEach(user -> {
            user.getAddresses().remove(addressFromDB);
            userRepo.save(user);
        });

        addressRepo.deleteById(addressId);

        return "Address deleted successfully with addressId: " + addressId;
    }
}