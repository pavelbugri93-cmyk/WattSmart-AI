// ============================================================
// FILE: PredictionRequest.java
// Input features sent to the ML microservice for energy prediction.
// Field names match the UCI Energy Efficiency dataset columns.
// ============================================================
package com.example.wattsmart_ai.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PredictionRequest {

    @NotNull(message = "Relative compactness is required")
    private Double relativeCompactness;

    @NotNull(message = "Surface area is required")
    @DecimalMin(value = "0.0", message = "Surface area must be positive")
    private Double surfaceArea;

    @NotNull(message = "Wall area is required")
    @DecimalMin(value = "0.0", message = "Wall area must be positive")
    private Double wallArea;

    @NotNull(message = "Roof area is required")
    @DecimalMin(value = "0.0", message = "Roof area must be positive")
    private Double roofArea;

    @NotNull(message = "Overall height is required")
    @DecimalMin(value = "0.0", message = "Overall height must be positive")
    private Double overallHeight;

    @NotNull(message = "Orientation is required")
    private Integer orientation;

    @NotNull(message = "Glazing area is required")
    @DecimalMin(value = "0.0", message = "Glazing area must be positive")
    private Double glazingArea;

    @NotNull(message = "Glazing distribution is required")
    private Integer glazingDistribution;
}