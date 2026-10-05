# StudyMate AI: Adaptive Intelligent Study Planner

An end-to-end full-stack educational web application and intelligent study planner designed for college students, PBL presentations, and capstone demonstrations.

---

## 🌟 Overview

StudyMate AI dynamically optimizes student study schedules and revision timetables using an adaptive multi-factor algorithm based on:
- **Exam Proximity** (Days remaining until exam)
- **Subject Priority** (High, Medium, Low)
- **Topic Difficulty** (Easy, Medium, Hard)
- **Real Quiz Performance & Diagnostic Scores**
- **Identified Weak Topics** (Missed quiz answers trigger immediate revision scheduling)
- **Student Daily Availability & Preferred Study Hours**

---

## 🛠️ Architecture & Technology Stack

### Web & Prototype Runtime
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Canva-inspired pastel educational UI.
- **Backend API**: Express server (`server.ts`) with persistent file-backed JSON store (`data/studymate_db.json`) and local document directory (`uploads/`).
- **Authentication**: BCrypt password hashing, session tokens, and user data isolation.

### Complete Java Spring Boot Project (`/backend-java/`)
- **Framework**: Java 17+, Spring Boot 3.2.x, Maven
- **Persistence**: Spring Data JPA, Hibernate, MySQL 8.x (`schema.sql` included)
- **Security**: Spring Security, BCryptPasswordEncoder, JJWT (JSON Web Token)
- **Document Analysis**: Apache PDFBox (PDF text extraction), Apache POI (DOCX processing)
- **AI Architecture**: Modular `AIService` interface with `RuleBasedAIService` implementation for 100% offline, fail-safe execution.

---

## 🚀 Key Modules & Endpoints

| Category | Endpoint | Method | Description |
|---|---|---|---|
| **Auth** | `/api/auth/register` | POST | Register student with BCrypt encryption |
| **Auth** | `/api/auth/login` | POST | Authenticate student and issue token |
| **Subjects** | `/api/subjects` | GET/POST | Manage subjects, difficulties & exam dates |
| **Materials** | `/api/materials/upload` | POST | Upload PDF, DOCX, TXT with concept parsing |
| **Quizzes** | `/api/quizzes/generate` | POST | Generate diagnostic quiz (Level 1 & Level 2) |
| **Quizzes** | `/api/quizzes/:id/submit` | POST | Submit answers, calculate score, flag weak topics |
| **Planner** | `/api/study-plan/generate` | POST | Run adaptive algorithm & generate 7-day plan |
| **Tasks** | `/api/study-tasks/:id/status`| PUT | Mark task Pending, In Progress, or Completed |
| **Progress** | `/api/progress` | GET | Retrieve overall mastery, study hours, & KPIs |
| **Coach** | `/api/coach/query` | POST | Contextual AI Study Coach advice |
| **Export** | `/api/export-java-zip` | GET | Download complete Maven Spring Boot project .zip |

---

## 📋 Default Demo Account

For rapid evaluation and viva demonstration:
- **Email**: `jashwanth@studymate.ai`
- **Password**: `password123`
*(Or click "Explore Demo Workspace (Jashwanth)" on the landing page)*

---

## 🏃 Running the Java Spring Boot Backend in IntelliJ / Eclipse

1. Open IntelliJ IDEA or Eclipse.
2. Select **File -> Open...** and point to the `backend-java` folder.
3. Maven will automatically import dependencies from `pom.xml`.
4. Ensure MySQL is running on `localhost:3306`, or execute the DDL script in `src/main/resources/schema.sql`.
5. Run `StudyMateApplication.java`. The backend will launch on `http://localhost:8080`.
