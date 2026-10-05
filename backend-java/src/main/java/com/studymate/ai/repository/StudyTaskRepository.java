package com.studymate.ai.repository;

import com.studymate.ai.entity.StudyTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {
    List<StudyTask> findByUserId(Long userId);
    List<StudyTask> findByUserIdAndScheduledDate(Long userId, LocalDate date);
    List<StudyTask> findByUserIdAndStatus(Long userId, StudyTask.TaskStatus status);
}
