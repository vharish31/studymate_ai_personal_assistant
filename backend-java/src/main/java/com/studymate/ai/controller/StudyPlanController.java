package com.studymate.ai.controller;

import com.studymate.ai.entity.StudyTask;
import com.studymate.ai.entity.User;
import com.studymate.ai.repository.StudyTaskRepository;
import com.studymate.ai.repository.UserRepository;
import com.studymate.ai.service.StudyPlanService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StudyPlanController {

    private final StudyPlanService studyPlanService;
    private final StudyTaskRepository studyTaskRepository;
    private final UserRepository userRepository;

    @GetMapping("/study-plan")
    public ResponseEntity<List<StudyTask>> getStudyPlan(@AuthenticationPrincipal UserDetails userDetails,
                                                        @RequestParam(required = false) String date) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (date != null && !date.isBlank()) {
            LocalDate targetDate = LocalDate.parse(date);
            return ResponseEntity.ok(studyTaskRepository.findByUserIdAndScheduledDate(user.getId(), targetDate));
        }

        return ResponseEntity.ok(studyTaskRepository.findByUserId(user.getId()));
    }

    @PostMapping("/study-plan/generate")
    public ResponseEntity<Map<String, Object>> generatePlan(@AuthenticationPrincipal UserDetails userDetails,
                                                            @RequestBody(required = false) PlanGenerationRequest request) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Double hours = (request != null && request.getDailyHours() != null) ? request.getDailyHours() : user.getDailyStudyHours();
        String startTime = (request != null && request.getStartTime() != null) ? request.getStartTime() : user.getPreferredStartTime();

        List<StudyTask> tasks = studyPlanService.generateAdaptivePlan(user, hours, startTime);

        return ResponseEntity.ok(Map.of(
                "message", "Adaptive study plan generated successfully",
                "taskCount", tasks.size(),
                "tasks", tasks
        ));
    }

    @PutMapping("/study-tasks/{id}/complete")
    public ResponseEntity<StudyTask> completeTask(@PathVariable Long id,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        StudyTask task = studyTaskRepository.findById(id)
                .filter(t -> t.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Task not found or unauthorized"));

        task.setStatus(StudyTask.TaskStatus.Completed);
        return ResponseEntity.ok(studyTaskRepository.save(task));
    }

    @Data
    public static class PlanGenerationRequest {
        private Double dailyHours;
        private String startTime;
    }
}
