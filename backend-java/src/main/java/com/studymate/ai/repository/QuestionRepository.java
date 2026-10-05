package com.studymate.ai.repository;

import com.studymate.ai.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findBySubjectId(Long subjectId);
    List<Question> findByQuizId(Long quizId);
}
