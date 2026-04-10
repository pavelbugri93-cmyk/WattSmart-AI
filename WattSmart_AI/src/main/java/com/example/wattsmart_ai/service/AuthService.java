// ============================================================
// FILE: AuthService.java
// Handles user registration and login.
// Passwords are always stored as BCrypt hashes — never plaintext.
// On success, returns a signed JWT for use in subsequent requests.
// ============================================================
package com.example.wattsmart_ai.service;

import com.example.wattsmart_ai.config.JwtUtil;
import com.example.wattsmart_ai.dto.AuthRequest;
import com.example.wattsmart_ai.dto.AuthResponse;
import com.example.wattsmart_ai.model.User;
import com.example.wattsmart_ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponse register(AuthRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .build();

        userRepository.save(user);
        log.info("New user registered: {}", user.getEmail());

        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getEmail());
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        // matches() compares the raw password against the stored BCrypt hash
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        log.info("Successful login for: {}", user.getEmail());
        return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user.getEmail());
    }
}