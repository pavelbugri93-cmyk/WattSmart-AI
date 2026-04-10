// ============================================================
// FILE: GlobalExceptionHandler.java
// Centralized error handling — catches unhandled exceptions
// and returns a clean JSON error response instead of a stack trace.
// ============================================================
package com.example.wattsmart_ai.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handles business logic errors thrown anywhere in the service layer
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
    }
}