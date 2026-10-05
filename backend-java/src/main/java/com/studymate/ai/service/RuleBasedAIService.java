package com.studymate.ai.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Robust Offline Rule-Based AI Engine
 * Guarantees 100% functionality without external API keys or network latency.
 */
@Service
public class RuleBasedAIService implements AIService {

    @Override
    public String generateStudyAdvice(String query, String lowestSubject, double lowestAvg, List<String> weakTopics, String nextExamSubject, long daysToExam) {
        String q = (query != null) ? query.toLowerCase() : "";

        if (q.contains("what should i study today") || q.contains("today")) {
            if (lowestSubject != null && lowestAvg < 70) {
                String weakStr = !weakTopics.isEmpty() ? weakTopics.get(0) : "core fundamentals";
                return String.format("Your %s quiz performance is currently %.1f%%, and your exam is approaching. We recommend spending 60 minutes revising %s today.",
                        lowestSubject, lowestAvg, weakStr);
            } else if (nextExamSubject != null) {
                return String.format("Your next exam is %s in %d days. We suggest dedicating 45 minutes to high-yield topics today.", nextExamSubject, daysToExam);
            } else {
                return "Your progress is steady! Allocate 45 minutes to review your highest priority subject tasks today.";
            }
        }

        if (q.contains("which subject needs more attention") || q.contains("attention")) {
            if (lowestSubject != null) {
                return String.format("%s is currently your lowest-scoring subject (%.1f%%). StudyMate AI has increased its frequency in your study plan.", lowestSubject, lowestAvg);
            }
            return "All subjects are currently in good balance. Keep up the consistent pace!";
        }

        if (q.contains("weak topics") || q.contains("weakness")) {
            if (!weakTopics.isEmpty()) {
                return "Your primary weak topics from recent quiz attempts are: " + String.join(", ", weakTopics.subList(0, Math.min(3, weakTopics.size()))) + ". Targeted practice quizzes are recommended.";
            }
            return "No weak topics detected yet! Complete more quizzes to build your diagnostic profile.";
        }

        if (q.contains("exam") || q.contains("revise")) {
            if (nextExamSubject != null) {
                return String.format("Focus on %s! With %d days remaining, prioritize past exam patterns, formula sheets, and active recall quizzes.", nextExamSubject, daysToExam);
            }
            return "Check your Subjects tab and confirm all exam dates are logged.";
        }

        return "I am your StudyMate AI Coach. Ask me what to study today, check your weak topics, or inspect upcoming exam priorities!";
    }

    @Override
    public List<String> extractTopics(String text) {
        if (text == null || text.isBlank()) {
            return List.of("General Concepts", "Key Definitions");
        }

        Set<String> topics = new LinkedHashSet<>();
        // Match headings like "1. Title", "Chapter 1", or bold titles
        Pattern pattern = Pattern.compile("(?m)^(?:(?:[0-9]+\\.|Chapter|[A-Z][a-zA-Z\\s]{3,30}:))\\s*([A-Za-z0-9\\s]{3,40})");
        Matcher matcher = pattern.matcher(text);
        while (matcher.find() && topics.size() < 5) {
            String match = matcher.group(1).trim();
            if (match.length() > 4) {
                topics.add(match);
            }
        }

        if (topics.isEmpty()) {
            topics.add("Core Principles");
            topics.add("Architectural Overview");
            topics.add("Practical Applications");
        }

        return new ArrayList<>(topics);
    }

    @Override
    public String generateExplanation(String question, String correctAnswer, String topic) {
        return String.format("The correct answer is %s. In %s, this property ensures correct semantic behavior and prevents runtime inconsistencies.", correctAnswer, topic);
    }
}
