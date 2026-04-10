// ============================================================
// FILE: PredictionController.java
// Exposes the energy prediction API.
// Guest endpoint is public — no auth required.
// All other endpoints require a valid JWT and operate
// on the authenticated user's data only.
// ============================================================
package com.example.wattsmart_ai.controller;

import com.example.wattsmart_ai.dto.PredictionRequest;
import com.example.wattsmart_ai.dto.PredictionResponse;
import com.example.wattsmart_ai.model.Prediction;
import com.example.wattsmart_ai.service.PredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/predict")
@RequiredArgsConstructor
public class PredictionController {

    private final PredictionService predictionService;

    // Public endpoint — allows unauthenticated users to try a prediction
    @PostMapping("/guest")
    public ResponseEntity<PredictionResponse> predictForGuest(@Valid @RequestBody PredictionRequest request) {
        log.info("Guest prediction request received");
        return ResponseEntity.ok(predictionService.predictGuest(request));
    }

    // Runs a prediction and saves it to the authenticated user's history
    @PostMapping
    public ResponseEntity<PredictionResponse> predictForUser(@Valid @RequestBody PredictionRequest request,
                                                             Authentication auth) {
        log.info("Prediction request for user: {}", auth.getName());
        return ResponseEntity.ok(predictionService.predictUser(request, auth.getName()));
    }

    // Returns all saved predictions for the authenticated user
    @GetMapping("/history")
    public ResponseEntity<List<Prediction>> getPredictionHistory(Authentication auth) {
        log.info("Fetching prediction history for user: {}", auth.getName());
        return ResponseEntity.ok(predictionService.getHistory(auth.getName()));
    }

    // Deletes a single prediction — service layer validates ownership before deleting
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrediction(@PathVariable Long id, Authentication auth) {
        predictionService.deleteById(id, auth.getName());
        return ResponseEntity.ok().build();
    }

    // Clears the full prediction history for the authenticated user
    @DeleteMapping
    public ResponseEntity<Void> deleteAllPredictions(Authentication auth) {
        predictionService.deleteAllByUser(auth.getName());
        return ResponseEntity.ok().build();
    }
}