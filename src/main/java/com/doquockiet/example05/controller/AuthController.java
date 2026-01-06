package com.doquockiet.example05.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import com.doquockiet.example05.payloads.LoginCredentials;
import com.doquockiet.example05.payloads.UserDTO;
import com.doquockiet.example05.security.JWTUtil;
import com.doquockiet.example05.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UserDTO userDTO) {
        // Validation từ UserDTO sẽ chặn các lỗi tên, số điện thoại, email tại đây
        UserDTO registeredUser = userService.registerUser(userDTO);
        String token = jwtUtil.generateToken(registeredUser);

        Map<String, Object> response = new HashMap<>();
        response.put("jwt-token", token);
        response.put("user", registeredUser);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginCredentials credentials) {
        try {
            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(
                            credentials.getEmail(),
                            credentials.getPassword()
                    );

            authenticationManager.authenticate(authToken);

            UserDTO user = userService.getUserByEmail(credentials.getEmail());
            String token = jwtUtil.generateToken(user);

            Map<String, Object> response = new HashMap<>();
            response.put("jwt-token", token);
            response.put("user", user);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Email hoặc mật khẩu không đúng");
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(errorResponse);
        }
    }
}