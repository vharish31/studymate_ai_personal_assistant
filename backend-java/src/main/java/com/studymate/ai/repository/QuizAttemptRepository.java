package com.studymate.ai.repository;

import com.studymate.ai.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByUserId(Long userId);
    List<QuizAttempt> findByUserIdOrderByAttemptedAtDesc(Long userId);
    List<QuizAttempt> findByUserIdAndSubjectId(Long userId, Long subjectId);
}
