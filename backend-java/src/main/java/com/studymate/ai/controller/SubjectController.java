package com.studymate.ai.controller;

import com.studymate.ai.entity.Subject;
import com.studymate.ai.entity.User;
import com.studymate.ai.repository.SubjectRepository;
import com.studymate.ai.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SubjectController {

    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Subject>> getUserSubjects(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(subjectRepository.findByUserIdOrderByExamDateAsc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Subject> createSubject(@AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody Subject subject) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        subject.setUser(user);
        Subject saved = subjectRepository.save(subject);
        return ResponseEntity.status(201).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subject> updateSubject(@PathVariable Long id,
                                                 @AuthenticationPrincipal UserDetails userDetails,
                                                 @RequestBody Subject updated) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Subject existing = subjectRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Subject not found or access denied"));

        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setDifficulty(updated.getDifficulty());
        existing.setPriority(updated.getPriority());
        existing.setExamDate(updated.getExamDate());

        return ResponseEntity.ok(subjectRepository.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubject(@PathVariable Long id,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Subject existing = subjectRepository.findById(id)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new RuntimeException("Subject not found or access denied"));

        subjectRepository.delete(existing);
        return ResponseEntity.noContent().build();
    }
}
