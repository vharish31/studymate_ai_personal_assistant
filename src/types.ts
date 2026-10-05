export interface User {
  id: string;
  name: string;
  email: string;
  dailyStudyHours: number;
  preferredStartTime: string;
  createdAt?: string;
}

export interface Subject {
  id: string;
  userId: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  priority: 'Low' | 'Medium' | 'High';
  examDate: string;
  createdAt: string;
}

export interface StudyMaterial {
  id: string;
  userId: string;
  subjectId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  extractedText?: string;
  extractedTopics?: string[];
  extractedKeywords?: string[];
}

export interface Question {
  id: string;
  quizId?: string;
  subjectId: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  userId: string;
  subjectId: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: string;
  questions: Question[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  subjectId: string;
  subjectName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  attemptedAt: string;
  weakTopics: string[];
  feedback: string;
}

export interface StudyTask {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  scheduledDate: string;
  startTime: string;
  durationMinutes: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
}

export interface SubjectPerformance {
  id: string;
  name: string;
  quizAverage: number;
  completedTasks: number;
  totalTasks: number;
  difficulty: string;
  priority: string;
  examDate: string;
}

export interface ProgressData {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionPercentage: number;
  totalStudyHours: number;
  todayStudyHours?: number;
  studyHoursCompleted?: number;
  dailyGoalHours?: number;
  totalGoalHours?: number;
  dailyGoalPercentage?: number;
  quizAverage: number;
  totalQuizzesTaken: number;
  subjectPerformance: SubjectPerformance[];
  weakTopics: Array<{ topic: string; missedCount: number }>;
}
