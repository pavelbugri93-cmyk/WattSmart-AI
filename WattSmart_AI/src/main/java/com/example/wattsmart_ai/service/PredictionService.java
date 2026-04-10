// ============================================================
// FILE: PredictionService.java
// Core business logic for energy predictions.
// Calls the Python Flask ML microservice to get heating/cooling loads,
// then calculates annual cost and CO2 emissions based on the results.
//
// Guest predictions are not saved to the DB.
// Authenticated predictions are saved to the user's history.
// ============================================================
package com.example.wattsmart_ai.service;

import com.example.wattsmart_ai.dto.PredictionRequest;
import com.example.wattsmart_ai.dto.PredictionResponse;
import com.example.wattsmart_ai.model.Prediction;
import com.example.wattsmart_ai.model.User;
import com.example.wattsmart_ai.repository.PredictionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PredictionService {

    private final PredictionRepository predictionRepository;
    private final UserService userService;
    private final RestTemplate restTemplate;

    // CO2 emission factor: kg per kWh — based on Israel's electricity grid average
    private static final double CO2_EMISSION_FACTOR = 0.218;

    // Default electricity rate used for guest predictions (₪/kWh)
    private static final double DEFAULT_GUEST_RATE = 0.60;

    @Value("${flask.service.url}")
    private String flaskUrl;

    // Runs a prediction without saving — used for the public demo endpoint
    public PredictionResponse predictGuest(PredictionRequest request) {
        log.info("Guest prediction request received");
        return callFlaskService(request, DEFAULT_GUEST_RATE);
    }

    // Runs a prediction using the user's personal electricity rate and saves it to history
    public PredictionResponse predictUser(PredictionRequest request, String email) {
        User user = userService.getProfile(email);
        PredictionResponse response = callFlaskService(request, user.getElectricityRate());

        savePrediction(request, response, user);
        log.info("Prediction saved for user: {}", email);

        return response;
    }

    // Returns the user's prediction history, ordered newest first
    public List<Prediction> getHistory(String email) {
        User user = userService.getProfile(email);
        return predictionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    @Transactional
    public void deleteById(Long id, String email) {
        // Ownership validation can be added here if needed
        predictionRepository.deleteById(id);
        log.info("Prediction {} deleted by user: {}", id, email);
    }

    @Transactional
    public void deleteAllByUser(String email) {
        User user = userService.getProfile(email);
        predictionRepository.deleteAllByUser(user);
        log.info("All predictions cleared for user: {}", email);
    }

    // Sends the building parameters to the Flask ML service and returns the prediction result.
    // Field names in the map must exactly match what the Python model expects.
    private PredictionResponse callFlaskService(PredictionRequest request, Double electricityRate) {
        Map<String, Object> payload = buildFlaskPayload(request);

        log.info("Sending prediction request to Flask at: {}/predict", flaskUrl);

        try {
            Map<String, Object> flaskResponse = restTemplate.postForObject(
                    flaskUrl + "/predict",
                    payload,
                    Map.class
            );

            if (flaskResponse == null) {
                throw new RuntimeException("Empty response received from ML service");
            }

            double heatingLoad = ((Number) flaskResponse.get("heating_load")).doubleValue();
            double coolingLoad = ((Number) flaskResponse.get("cooling_load")).doubleValue();

            // Annual figures assume 365 days of continuous daily load
            double annualCost = (heatingLoad + coolingLoad) * 365 * electricityRate;
            double co2        = (heatingLoad + coolingLoad) * 365 * CO2_EMISSION_FACTOR;

            log.info("Prediction received — heating: {}, cooling: {}", heatingLoad, coolingLoad);

            return new PredictionResponse(
                    heatingLoad,
                    coolingLoad,
                    roundToTwoDecimals(annualCost),
                    roundToTwoDecimals(co2)
            );

        } catch (Exception e) {
            log.error("Failed to reach ML service: {}", e.getMessage());
            throw new RuntimeException("Prediction failed. Make sure the Python service is running.");
        }
    }

    // Maps Java camelCase field names to the snake_case keys the Python model expects
    private Map<String, Object> buildFlaskPayload(PredictionRequest request) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("Relative_Compactness",  request.getRelativeCompactness());
        payload.put("Surface_Area",          request.getSurfaceArea());
        payload.put("Wall_Area",             request.getWallArea());
        payload.put("Roof_Area",             request.getRoofArea());
        payload.put("Overall_Height",        request.getOverallHeight());
        payload.put("Orientation",           request.getOrientation());
        payload.put("Glazing_Area",          request.getGlazingArea());
        payload.put("Glazing_Distribution",  request.getGlazingDistribution());
        return payload;
    }

    private void savePrediction(PredictionRequest request, PredictionResponse response, User user) {
        Prediction prediction = Prediction.builder()
                .user(user)
                .relativeCompactness(request.getRelativeCompactness())
                .surfaceArea(request.getSurfaceArea())
                .wallArea(request.getWallArea())
                .roofArea(request.getRoofArea())
                .overallHeight(request.getOverallHeight())
                .orientation(request.getOrientation())
                .glazingArea(request.getGlazingArea())
                .glazingDistribution(request.getGlazingDistribution())
                .heatingLoad(response.getHeatingLoad())
                .coolingLoad(response.getCoolingLoad())
                .annualCost(response.getAnnualCost())
                .co2(response.getCo2())
                .build();

        predictionRepository.save(prediction);
    }

    private double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}