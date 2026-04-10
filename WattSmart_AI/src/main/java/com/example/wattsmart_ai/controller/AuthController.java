// ============================================================
// FILE: AuthController.java
// Handles user registration and login.
// Includes in-memory IP-based rate limiting to prevent brute-force attacks.
// On 5 failed attempts from the same IP, the endpoint is blocked for 60 seconds.
// A scheduled task runs every minute to clean up expired entries from the map.
// ============================================================
package com.example.wattsmart_ai.controller;

import com.example.wattsmart_ai.dto.AuthRequest;
import com.example.wattsmart_ai.dto.AuthResponse;
import com.example.wattsmart_ai.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // Rate limiting constants — adjust these to tune strictness
    private static final int  MAX_ATTEMPTS          = 5;
    private static final long BLOCK_DURATION_SECONDS = 60;

    // Thread-safe map: IP address → [attempt count, first attempt timestamp]
    private final ConcurrentHashMap<String, long[]> loginAttempts = new ConcurrentHashMap<>();

    // POST /auth/register
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody AuthRequest request) {
        log.info("Registration request for email: {}", request.getEmail());
        return ResponseEntity.ok(authService.register(request));
    }

    // POST /auth/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request,
                                   HttpServletRequest httpRequest) {
        String clientIp = httpRequest.getRemoteAddr();

        if (isIpBlocked(clientIp)) {
            log.warn("Login blocked for IP: {} — too many failed attempts", clientIp);
            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body("Too many failed attempts. Please try again in 1 minute.");
        }

        try {
            AuthResponse response = authService.login(request);
            clearAttempts(clientIp);
            log.info("Successful login for: {}", request.getEmail());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            recordFailedAttempt(clientIp);
            int remainingAttempts = getRemainingAttempts(clientIp);
            log.warn("Failed login attempt from IP: {} — {} attempts remaining", clientIp, remainingAttempts);

            String message = remainingAttempts > 0
                    ? "Invalid email or password. " + remainingAttempts + " attempts remaining."
                    : "Account temporarily blocked. Try again in 1 minute.";

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(message);
        }
    }

    // Runs every 60 seconds — removes entries that are no longer within the block window.
    // Prevents the map from growing indefinitely in production.
    @Scheduled(fixedRate = 60_000)
    public void cleanExpiredEntries() {
        long now = Instant.now().getEpochSecond();
        loginAttempts.entrySet().removeIf(entry ->
                now - entry.getValue()[1] > BLOCK_DURATION_SECONDS
        );
        log.debug("Rate limit map cleaned. Current size: {}", loginAttempts.size());
    }

    // Returns true if this IP has exceeded the allowed attempt limit within the time window
    private boolean isIpBlocked(String ip) {
        long[] attempts = loginAttempts.get(ip);
        if (attempts == null) return false;

        long elapsedSeconds = Instant.now().getEpochSecond() - attempts[1];

        if (elapsedSeconds > BLOCK_DURATION_SECONDS) {
            loginAttempts.remove(ip);
            return false;
        }
        return attempts[0] >= MAX_ATTEMPTS;
    }

    // Increments the failed attempt counter for this IP
    private void recordFailedAttempt(String ip) {
        loginAttempts.compute(ip, (key, existing) -> {
            if (existing == null) return new long[]{1, Instant.now().getEpochSecond()};
            existing[0]++;
            return existing;
        });
    }

    private void clearAttempts(String ip) {
        loginAttempts.remove(ip);
    }

    private int getRemainingAttempts(String ip) {
        long[] attempts = loginAttempts.get(ip);
        return attempts == null ? MAX_ATTEMPTS : (int) Math.max(0, MAX_ATTEMPTS - attempts[0]);
    }
}