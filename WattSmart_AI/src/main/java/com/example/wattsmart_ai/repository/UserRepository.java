// ============================================================
// FILE: UserRepository.java
// Data access layer for the users table.
// ============================================================
package com.example.wattsmart_ai.repository;

import com.example.wattsmart_ai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Looks up a user by email — used during login and JWT validation
    Optional<User> findByEmail(String email);

    // Checks if an email is already registered — used during registration to prevent duplicates
    boolean existsByEmail(String email);
}