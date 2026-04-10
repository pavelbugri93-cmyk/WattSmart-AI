// ============================================================
// FILE: Prediction.java
// JPA entity representing a single energy prediction record.
// Stored in the 'predictions' table, linked to the user who ran it.
//
// The unique constraint prevents saving duplicate predictions —
// same user + same 8 building parameters = same result, no point storing twice.
// ============================================================
package com.example.wattsmart_ai.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "predictions", uniqueConstraints = {
        @UniqueConstraint(columnNames = {
                "user_id", "relative_compactness", "surface_area", "wall_area",
                "roof_area", "overall_height", "orientation", "glazing_area", "glazing_distribution"
        })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prediction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // LAZY loading — the User object is only fetched from DB when explicitly accessed
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // ── Building input parameters (from UCI Energy Efficiency dataset) ──────

    @Column(name = "relative_compactness", nullable = false)
    private Double relativeCompactness;

    @Column(name = "surface_area", nullable = false)
    private Double surfaceArea;

    @Column(name = "wall_area", nullable = false)
    private Double wallArea;

    @Column(name = "roof_area", nullable = false)
    private Double roofArea;

    @Column(name = "overall_height", nullable = false)
    private Double overallHeight;

    @Column(name = "orientation", nullable = false)
    private Integer orientation;

    @Column(name = "glazing_area", nullable = false)
    private Double glazingArea;

    @Column(name = "glazing_distribution", nullable = false)
    private Integer glazingDistribution;

    // ── Prediction results returned by the ML microservice ──────────────────

    @Column(name = "heating_load")
    private Double heatingLoad;     // kWh — predicted by ML model

    @Column(name = "cooling_load")
    private Double coolingLoad;     // kWh — predicted by ML model

    @Column(name = "annual_cost")
    private Double annualCost;      // ₪   — calculated from user's electricity rate

    @Column(name = "co2")
    private Double co2;             // kg  — calculated from standard emission factor

    // updatable = false ensures the timestamp is set once and never overwritten
    @Column(name = "created_at", updatable = false, nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}