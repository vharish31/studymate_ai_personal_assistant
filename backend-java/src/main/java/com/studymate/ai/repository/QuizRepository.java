package com.studymate.ai.repository;

import com.studymate.ai.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByUserId(Long userId);
    List<Quiz> findByUserIdAndSubjectId(Long userId, Long subjectId);
}
