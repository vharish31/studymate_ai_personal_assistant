package com.studymate.ai.repository;

import com.studymate.ai.entity.StudyMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudyMaterialRepository extends JpaRepository<StudyMaterial, Long> {
    List<StudyMaterial> findByUserId(Long userId);
    List<StudyMaterial> findByUserIdAndSubjectId(Long userId, Long subjectId);
}
