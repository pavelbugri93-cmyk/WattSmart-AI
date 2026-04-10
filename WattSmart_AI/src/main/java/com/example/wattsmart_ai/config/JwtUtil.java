// ============================================================
// FILE: JwtUtil.java
// Handles all JWT operations: generating tokens, extracting
// the user's email, and validating token integrity and expiry.
// Uses HMAC-SHA256 signing with a secret key from application.properties.
// ============================================================
package com.example.wattsmart_ai.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Slf4j
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationMs;

    // Generates a signed JWT with the user's email as the subject
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // Extracts the email (subject) stored inside the token payload
    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    // Returns true only if the token has a valid signature and is not expired
    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException e) {
            log.warn("Invalid JWT token: {}", e.getMessage());
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Derives a secure signing key from the configured secret string
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }
}