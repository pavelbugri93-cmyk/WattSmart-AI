// ============================================================
// FILE: PredictionResponse.java
// Result returned to the client after a prediction is computed.
// heatingLoad and coolingLoad come from the ML model.
// annualCost and co2 are calculated in PredictionService
// based on the user's electricity rate and standard emission factors.
// ============================================================
package com.example.wattsmart_ai.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PredictionResponse {
    private Double heatingLoad;   // kWh — predicted by ML model
    private Double coolingLoad;   // kWh — predicted by ML model
    private Double annualCost;    // ₪   — calculated from user's electricity rate
    private Double co2;           // kg  — calculated from standard emission factor
}