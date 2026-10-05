package com.studymate.ai.repository;

import com.studymate.ai.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByUserId(Long userId);
    List<Subject> findByUserIdOrderByExamDateAsc(Long userId);
}
