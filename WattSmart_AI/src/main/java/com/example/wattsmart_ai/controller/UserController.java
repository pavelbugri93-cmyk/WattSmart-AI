// ============================================================
// FILE: UserController.java
// Manages the authenticated user's profile data.
// Currently supports fetching profile info and updating
// the personal electricity rate used in cost calculations.
// ============================================================
package com.example.wattsmart_ai.controller;

import com.example.wattsmart_ai.model.User;
import com.example.wattsmart_ai.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // GET /user/profile — returns the current user's stored profile
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(Authentication auth) {
        log.info("Profile request for user: {}", auth.getName());
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    // PUT /user/rate — updates the electricity rate used for cost estimation
    @PutMapping("/rate")
    public ResponseEntity<User> updateElectricityRate(@RequestParam Double rate,
                                                      Authentication auth) {
        log.info("Updating electricity rate for user: {} → {}", auth.getName(), rate);
        return ResponseEntity.ok(userService.updateElectricityRate(auth.getName(), rate));
    }
}