package com.studymate.ai.service;

import com.studymate.ai.entity.StudyTask;
import com.studymate.ai.entity.Subject;
import com.studymate.ai.entity.User;
import com.studymate.ai.entity.QuizAttempt;
import com.studymate.ai.repository.StudyTaskRepository;
import com.studymate.ai.repository.SubjectRepository;
import com.studymate.ai.repository.QuizAttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Adaptive Study Planner Engine
 *
 * Multi-Factor Weighting Algorithm:
 * 1. Exam Proximity: Closer exams get scaled exponentially higher weight.
 * 2. Subject Priority: High (2.5x), Medium (1.8x), Low (1.0x).
 * 3. Difficulty: Hard (2.0x), Medium (1.5x), Easy (1.0x).
 * 4. Quiz Performance: Low score (<60%) triggers Urgent Weakness Multiplier (3.0x)
 *    and prioritizes weak topics for immediate revision.
 * 5. Available daily study time and preferred start time.
 */
@Service
@RequiredArgsConstructor
public class StudyPlanService {

    private final SubjectRepository subjectRepository;
    private final StudyTaskRepository studyTaskRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    @Transactional
    public List<StudyTask> generateAdaptivePlan(User user, Double dailyHours, String startTime) {
        List<Subject> subjects = subjectRepository.findByUserId(user.getId());
        if (subjects.isEmpty()) {
            return Collections.emptyList();
        }

        // 1. Calculate weights per subject
        Map<Long, SubjectWeightInfo> weightMap = new HashMap<>();
        LocalDate today = LocalDate.now();

        for (Subject subject : subjects) {
            // Exam Proximity Factor
            long daysToExam = Math.max(1, ChronoUnit.DAYS.between(today, subject.getExamDate()));
            double examWeight = daysToExam <= 7 ? 3.5 : (daysToExam <= 15 ? 2.5 : (daysToExam <= 30 ? 1.8 : 1.0));

            // Priority Factor
            double priorityWeight = subject.getPriority() == Subject.Priority.High ? 2.5
                    : (subject.getPriority() == Subject.Priority.Medium ? 1.8 : 1.0);

            // Difficulty Factor
            double difficultyWeight = subject.getDifficulty() == Subject.Difficulty.Hard ? 2.0
                    : (subject.getDifficulty() == Subject.Difficulty.Medium ? 1.5 : 1.0);

            // Quiz Performance & Weak Topics
            List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdAndSubjectId(user.getId(), subject.getId());
            double weaknessMultiplier = 1.5;
            List<String> weakTopics = new ArrayList<>();

            if (!attempts.isEmpty()) {
                double avgScore = attempts.stream().mapToDouble(QuizAttempt::getPercentage).average().orElse(75.0);
                for (QuizAttempt att : attempts) {
                    if (att.getWeakTopics() != null && !att.getWeakTopics().isBlank()) {
                        String[] topics = att.getWeakTopics().split(",");
                        for (String t : topics) {
                            if (!t.isBlank()) weakTopics.add(t.trim());
                        }
                    }
                }
                // Low scores directly boost revision allocation
                weaknessMultiplier = avgScore < 60.0 ? 3.0 : (avgScore < 75.0 ? 2.0 : 1.0);
            }

            double totalWeight = examWeight * priorityWeight * difficultyWeight * weaknessMultiplier;
            weightMap.put(subject.getId(), new SubjectWeightInfo(subject, totalWeight, weakTopics));
        }

        // Sort subjects by descending weight (most urgent first)
        List<SubjectWeightInfo> sortedSubjects = new ArrayList<>(weightMap.values());
        sortedSubjects.sort((a, b) -> Double.compare(b.weight, a.weight));

        // 2. Generate 7-day adaptive schedule
        List<StudyTask> generatedTasks = new ArrayList<>();
        double effectiveDailyHours = (dailyHours != null && dailyHours > 0) ? dailyHours : (user.getDailyStudyHours() != null ? user.getDailyStudyHours() : 3.0);
        String preferredTime = (startTime != null && !startTime.isBlank()) ? startTime : user.getPreferredStartTime();

        for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
            LocalDate taskDate = today.plusDays(dayOffset);
            int remainingMinutes = (int) Math.round(effectiveDailyHours * 60);

            String[] timeParts = preferredTime.split(":");
            int currentHour = Integer.parseInt(timeParts[0]);
            int currentMin = Integer.parseInt(timeParts[1]);

            int subjectIdx = dayOffset % sortedSubjects.size();

            while (remainingMinutes >= 30) {
                SubjectWeightInfo currentSub = sortedSubjects.get(subjectIdx % sortedSubjects.size());
                int duration = remainingMinutes >= 60 ? (currentSub.weight > 10.0 ? 60 : 45) : remainingMinutes;

                String topic;
                if (!currentSub.weakTopics.isEmpty()) {
                    topic = currentSub.weakTopics.get(dayOffset % currentSub.weakTopics.size()) + " (Adaptive Revision)";
                } else {
                    topic = currentSub.subject.getName() + " Essential Modules";
                }

                String formattedHour = currentHour > 12 ? String.valueOf(currentHour - 12) : String.valueOf(currentHour);
                String ampm = currentHour >= 12 ? "PM" : "AM";
                String slotTime = String.format("%s:%02d %s", formattedHour, currentMin, ampm);

                StudyTask task = StudyTask.builder()
                        .user(user)
                        .subject(currentSub.subject)
                        .topic(topic)
                        .scheduledDate(taskDate)
                        .startTime(slotTime)
                        .durationMinutes(duration)
                        .status(StudyTask.TaskStatus.Pending)
                        .priority(currentSub.subject.getPriority())
                        .build();

                generatedTasks.add(task);

                remainingMinutes -= duration;
                currentMin += duration;
                if (currentMin >= 60) {
                    currentHour += currentMin / 60;
                    currentMin = currentMin % 60;
                }
                subjectIdx++;
            }
        }

        return studyTaskRepository.saveAll(generatedTasks);
    }

    private static class SubjectWeightInfo {
        final Subject subject;
        final double weight;
        final List<String> weakTopics;

        SubjectWeightInfo(Subject subject, double weight, List<String> weakTopics) {
            this.subject = subject;
            this.weight = weight;
            this.weakTopics = weakTopics;
        }
    }
}
