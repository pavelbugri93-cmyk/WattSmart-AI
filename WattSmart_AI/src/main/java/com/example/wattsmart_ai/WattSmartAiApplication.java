// ============================================================
// FILE: WattSmartAiApplication.java
// Application entry point.
// @EnableScheduling activates the @Scheduled tasks (e.g. rate limit cleanup).
// ============================================================
package com.example.wattsmart_ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.Environment;
import org.springframework.scheduling.annotation.EnableScheduling;

@Slf4j
@SpringBootApplication
@EnableScheduling
public class WattSmartAiApplication {

    public static void main(String[] args) {
        ConfigurableApplicationContext ctx =
                SpringApplication.run(WattSmartAiApplication.class, args);

        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        log.info("WattSmart AI — Server Started!");
        log.info("http://localhost:8080/swagger-ui/index.html");
        log.info("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    }
}