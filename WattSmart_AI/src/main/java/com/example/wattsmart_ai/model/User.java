// ============================================================
// FILE: User.java
// JPA entity representing a registered application user.
// The password field stores a BCrypt hash — never plaintext.
// electricityRate is the user's personal cost per kWh (₪),
// used to calculate the annual cost in each prediction.
// ============================================================
package com.example.wattsmart_ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hash — never stored as plaintext

    // Default rate of ₪0.60/kWh matches the Israeli residential electricity tariff
    @Column(name = "electricity_rate", nullable = false)
    @Builder.Default
    private Double electricityRate = 0.60;

    // updatable = false ensures the timestamp is set once and never overwritten
    @Column(name = "created_at", updatable = false, nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}