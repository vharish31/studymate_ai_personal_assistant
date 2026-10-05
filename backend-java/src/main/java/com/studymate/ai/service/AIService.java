package com.studymate.ai.service;

import java.util.List;

/**
 * Modular AI Service Interface
 * Allows seamless switching between local rule-based offline analysis and external AI APIs.
 */
public interface AIService {

    /**
     * Provide study coach recommendation based on student query and context
     */
    String generateStudyAdvice(String query, String lowestSubject, double lowestAvg, List<String> weakTopics, String nextExamSubject, long daysToExam);

    /**
     * Extract key topics and keywords from material text
     */
    List<String> extractTopics(String text);

    /**
     * Generate quiz questions from parsed study document content
     */
    String generateExplanation(String question, String correctAnswer, String topic);
}
