// ============================================================
// FILE: PredictionRepository.java
// Data access layer for the predictions table.
// Spring Data JPA auto-implements all methods at runtime
// based on the method name conventions.
// ============================================================
package com.example.wattsmart_ai.repository;

import com.example.wattsmart_ai.model.Prediction;
import com.example.wattsmart_ai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PredictionRepository extends JpaRepository<Prediction, Long> {

    // Returns all predictions for a given user, newest first — used for history page
    List<Prediction> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Deletes all predictions belonging to a specific user — used for "clear history"
    void deleteAllByUser(User user);
}