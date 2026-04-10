// ============================================================
// FILE: AuthResponse.java
// Returned to the client after a successful login or registration.
// The token is a signed JWT used for all subsequent authenticated requests.
// ============================================================
package com.example.wattsmart_ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
}