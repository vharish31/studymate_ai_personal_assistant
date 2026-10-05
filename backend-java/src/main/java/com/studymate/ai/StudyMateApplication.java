package com.studymate.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * StudyMate AI: Adaptive Intelligent Study Planner
 * Main Entry Point for Spring Boot Application
 *
 * College PBL Project Implementation
 */
@SpringBootApplication
public class StudyMateApplication {

    public static void main(String[] args) {
        SpringApplication.run(StudyMateApplication.class, args);
        System.out.println("=========================================================");
        System.out.println("  StudyMate AI Backend started successfully on port 8080 ");
        System.out.println("  Adaptive Planner Engine & REST APIs are live!           ");
        System.out.println("=========================================================");
    }
}
