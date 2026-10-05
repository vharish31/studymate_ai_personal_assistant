# StudyMate AI: Adaptive Intelligent Study Planner
## College Problem-Based Learning (PBL) & Capstone Project

**StudyMate AI** is a full-stack educational web application and intelligent study planner designed to optimize student revision schedules based on real-time factors: **exam proximity, topic difficulty, quiz performance, pending tasks, and student study preferences**.

---

## 🏛️ System Architecture

```
                               +------------------------------------------+
                               |     Client Interface (Responsive)        |
                               |  Canva-Inspired Pastel UI / Bootstrap /  |
                               |  React 19 SPA & Modern Component Tree    |
                               +--------------------+---------------------+
                                                    | REST APIs / JSON
                                                    v
+-----------------------------------------------------------------------------------------+
|                               StudyMate AI Full-Stack Core                              |
|                                                                                         |
|  +-------------------+  +-------------------+  +-------------------+  +--------------+  |
|  |   AuthController  |  | SubjectController |  |  QuizController   |  | MaterialCtrl |  |
|  +---------+---------+  +---------+---------+  +---------+---------+  +-------+------+  |
|            |                      |                      |                    |         |
|  +---------v---------+  +---------v---------+  +---------v---------+  +-------v------+  |
|  |    AuthService    |  |  SubjectService   |  |    QuizService    |  | MaterialSvc  |  |
|  | (BCrypt / JWT)    |  |                   |  | (Level 1 & 2 Gen) |  | (PDFBox/POI) |  |
|  +-------------------+  +-------------------+  +---------+---------+  +--------------+  |
|                                                          |                              |
|  +-------------------------------------------------------v---------------------------+  |
|  |                           Adaptive StudyPlanService (Algorithm)                   |  |
|  |   Weight = ExamProximity x SubjectPriority x SubjectDifficulty x QuizWeakness      |  |
|  +-------------------------------------------------------+---------------------------+  |
|                                                          |                              |
|  +-------------------------------------------------------v---------------------------+  |
|  |                           RuleBasedAIService & AI Study Coach                     |  |
|  +-------------------------------------------------------+---------------------------+  |
|                                                          |                              |
|  +-------------------------------------------------------v---------------------------+  |
|  |                     Spring Data JPA / Hibernate Layer (Repositories)              |  |
|  +-------------------------------------------------------+---------------------------+  |
|                                                          |                              |
|                                                          v                              |
|                                             MySQL Database (studymate_db)               |
+-----------------------------------------------------------------------------------------+
```

---

## 🚀 Key Functional Features

1. **Secure Authentication & RBAC**:
   - BCrypt password hashing.
   - User-isolated datasets (users cannot access another user's subjects, materials, or plans).
   - Default demo student: `jashwanth@studymate.ai` (Password: `password123`).

2. **Adaptive Study Planner Engine**:
   - Multi-factor algorithmic weight calculation:
     $$\text{Weight} = W_{\text{exam}} \times W_{\text{priority}} \times W_{\text{difficulty}} \times W_{\text{weakness}}$$
   - Allocates higher revision frequency and longer durations to subjects with approaching deadlines and lower quiz scores.
   - Automatically schedules weak topics identified in recent quizzes.

3. **Two-Level Quiz Engine**:
   - **Level 1 (Predefined Question Bank)**: Curated questions across Java, DSA, DBMS, and OS with comprehensive explanations.
   - **Level 2 (Material-Based Generation)**: Dynamically constructs diagnostic questions using extracted terms and concepts from uploaded materials.
   - Instant scoring, percentage, review breakdown, and personalized revision feedback.

4. **Study Material Library & Document Analysis**:
   - Supports **PDF**, **DOCX**, and **TXT** files.
   - Metadata persistence (file name, file size, upload timestamp, extracted concepts).
   - Local directory storage in `uploads/`.

5. **AI Study Coach**:
   - Provides real-time, context-grounded recommendations on questions like:
     - *"What should I study today?"*
     - *"Which subject needs more attention?"*
     - *"What are my weak topics?"*
     - *"What should I revise before my exam?"*

6. **Interactive Visual Dashboard & Progress Analytics**:
   - Real-time weekly study hours, task completion rate, subject performance comparison, and weak vs strong topics matrix.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 17+, Spring Boot 3.2.x, Spring Data JPA, Spring Security, Hibernate |
| **Database** | MySQL 8.x (DDL schema script provided in `src/main/resources/schema.sql`) |
| **Libraries** | Apache PDFBox, Apache POI OOXML, JJWT, Project Lombok |
| **Web Runtime** | Node.js + Express + React 19 + Tailwind CSS + Lucide Icons |
| **Build Tool** | Apache Maven (`pom.xml`) |

---

## 📦 How to Run in IntelliJ IDEA or Eclipse

### Prerequisites:
- Java JDK 17 or higher
- MySQL 8.0+ running on `localhost:3306`
- Maven 3.8+ (bundled with IntelliJ)

### Step 1: Clone / Open Project
1. Download or clone this directory.
2. In IntelliJ IDEA: Click **File -> Open...** and select the `backend-java` folder.
3. IntelliJ will detect `pom.xml` and download all dependencies automatically.

### Step 2: Database Setup
1. Open MySQL Workbench or terminal:
   ```sql
   CREATE DATABASE studymate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Execute the schema script located at:
   `src/main/resources/schema.sql`
3. In `src/main/resources/application.properties`, adjust username and password if different:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```

### Step 3: Run the Application
1. In IntelliJ, open `src/main/java/com/studymate/ai/StudyMateApplication.java`.
2. Right-click and choose **Run 'StudyMateApplication'**.
3. The server will start at `http://localhost:8080`.
4. REST APIs are fully accessible at `/api/auth/*`, `/api/subjects/*`, `/api/study-plan/*`, etc.

---

## 📄 College Presentation & Viva Highlights

- **Adaptive Scheduling Principle**: Explain how student performance in quizzes dynamically adjusts study priority weights rather than relying on a rigid, static timetable.
- **Data Isolation**: Highlight that all queries filter by the authenticated user's ID via Spring Security principal or JWT token.
- **Fail-Safe AI Architecture**: Emphasize that the system uses a modular `AIService` interface with `RuleBasedAIService` so the app is 100% resilient and functions offline without external cloud dependencies.
