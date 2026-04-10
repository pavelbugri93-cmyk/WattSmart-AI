// ============================================================
// FILE: DatabaseInitializer.java
// Runs once on startup — creates the 'wattsmart' database
// if it doesn't already exist in PostgreSQL.
// ============================================================
package com.example.wattsmart_ai.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Slf4j
@Configuration
public class DatabaseInitializer {



    // Connects to the default 'postgres' DB to check/create our app DB
    private static final String POSTGRES_DEFAULT_URL = "jdbc:postgresql://postgres:5432/postgres";
    private static final String TARGET_DATABASE_NAME = "wattsmart";

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @PostConstruct
    public void createDatabaseIfNotExists() {
        try (Connection connection = DriverManager.getConnection(POSTGRES_DEFAULT_URL, username, password);
             Statement statement = connection.createStatement()) {

            if (!databaseExists(statement)) {
                statement.executeUpdate("CREATE DATABASE " + TARGET_DATABASE_NAME);
                log.info("Database '{}' created successfully.", TARGET_DATABASE_NAME);
            } else {
                log.info("Database '{}' already exists. Skipping creation.", TARGET_DATABASE_NAME);
            }

        } catch (Exception e) {
            log.error("Failed to initialize database '{}': {}", TARGET_DATABASE_NAME, e.getMessage());
        }
    }

    // Queries pg_database to check if our target DB already exists
    private boolean databaseExists(Statement statement) throws Exception {
        ResultSet result = statement.executeQuery(
                "SELECT 1 FROM pg_database WHERE datname = '" + TARGET_DATABASE_NAME + "'"
        );
        return result.next();
    }
}