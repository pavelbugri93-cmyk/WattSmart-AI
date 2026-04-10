// ============================================================
// FILE: UserService.java
// Manages user data and implements UserDetailsService —
// the interface Spring Security uses to load users during JWT validation.
// ============================================================
package com.example.wattsmart_ai.service;

import com.example.wattsmart_ai.model.User;
import com.example.wattsmart_ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;

    // Called by Spring Security on every authenticated request —
    // loads the user from DB so the JWT filter can set the security context
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // Empty authorities list — this app uses JWT claims, not role-based access
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );
    }

    // Returns the full User entity — used by PredictionService and controllers
    public User getProfile(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    // Updates the user's personal electricity rate used in cost calculations
    public User updateElectricityRate(String email, Double rate) {
        User user = getProfile(email);
        user.setElectricityRate(rate);
        log.info("Electricity rate updated for {}: {} ₪/kWh", email, rate);
        return userRepository.save(user);
    }
}