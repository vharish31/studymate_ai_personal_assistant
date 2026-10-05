import React, { useState, useEffect } from 'react';
import { api, getAuthToken } from './services/api';
import {
  User,
  Subject,
  StudyMaterial,
  Quiz,
  QuizAttempt,
  StudyTask,
  ProgressData,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Subjects } from './components/Subjects';
import { Materials } from './components/Materials';
import { StudyPlanner } from './components/StudyPlanner';
import { QuizView } from './components/QuizView';
import { ProgressView } from './components/ProgressView';
import { StudyCoach } from './components/StudyCoach';
import { JavaProjectHub } from './components/JavaProjectHub';
import { ProfileView } from './components/ProfileView';
import { LandingPage } from './components/LandingPage';
import {
  LayoutDashboard,
  BookOpen,
  FolderArchive,
  CalendarDays,
  HelpCircle,
  BarChart3,
  Bot,
  Code2,
  User as UserIcon,
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register' | null>(null);

  // Core application data states
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [studyTasks, setStudyTasks] = useState<StudyTask[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  // Cross-navigation state
  const [preselectedQuizSubject, setPreselectedQuizSubject] = useState<string | undefined>(undefined);
  const [preselectedQuizMaterial, setPreselectedQuizMaterial] = useState<string | undefined>(undefined);

  // Global Theme state (persisted in localStorage)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('studymate_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('studymate_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Check auth on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = getAuthToken();
      if (token) {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          await loadUserData();
        } else {
          // Token expired or invalid, auto-login demo for convenience if user wants
          setUser(null);
        }
      }
    } catch (err) {
      console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const [subs, mats, tasks, attempts, prog] = await Promise.all([
        api.getSubjects(),
        api.getMaterials(),
        api.getStudyPlan(),
        api.getQuizAttempts(),
        api.getProgress(),
      ]);
      setSubjects(subs);
      setMaterials(mats);
      setStudyTasks(tasks);
      setQuizAttempts(attempts);
      setProgress(prog);
    } catch (err) {
      console.error('Failed to load user records', err);
    }
  };

  // Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setAuthModalMode(null);
    setActiveTab('dashboard');
    await loadUserData();
  };

  const handleRegister = async (name: string, email: string, pass: string, confirm: string) => {
    const res = await api.register(name, email, pass, confirm);
    setUser(res.user);
    setAuthModalMode(null);
    setActiveTab('dashboard');
    await loadUserData();
  };

  const handleLogout = async () => {
    await api.logout();
    setUser(null);
    setAuthModalMode(null);
    setActiveTab('landing');
  };

  // Subject Handlers
  const handleAddSubject = async (sub: Partial<Subject>) => {
    const created = await api.createSubject(sub);
    setSubjects((prev) => [...prev, created]);
    const prog = await api.getProgress();
    setProgress(prog);
  };

  const handleUpdateSubject = async (id: string, sub: Partial<Subject>) => {
    const updated = await api.updateSubject(id, sub);
    setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)));
    const prog = await api.getProgress();
    setProgress(prog);
  };

  const handleDeleteSubject = async (id: string) => {
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setStudyTasks((prev) => prev.filter((t) => t.subjectId !== id));
    setMaterials((prev) => prev.filter((m) => m.subjectId !== id));
    const prog = await api.getProgress();
    setProgress(prog);
  };

  // Material Handlers
  const handleUploadMaterial = async (file: File, subjectId: string) => {
    const uploaded = await api.uploadMaterial(file, subjectId);
    setMaterials((prev) => [uploaded, ...prev]);
  };

  const handleDeleteMaterial = async (id: string) => {
    await api.deleteMaterial(id);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  // Study Plan Handlers
  const handleGeneratePlan = async (dailyHours: number, startTime: string) => {
    const res = await api.generateStudyPlan(dailyHours, startTime);
    const updatedTasks = await api.getStudyPlan();
    setStudyTasks(updatedTasks);
    const prog = await api.getProgress();
    setProgress(prog);
  };

  const handleUpdateTaskStatus = async (
    taskId: string,
    status: 'Pending' | 'In Progress' | 'Completed'
  ) => {
    const updated = await api.updateTaskStatus(taskId, status);
    setStudyTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    const prog = await api.getProgress();
    setProgress(prog);
  };

  // Quiz Handlers
  const handleGenerateQuiz = async (params: {
    subjectId: string;
    topic?: string;
    numberOfQuestions?: number;
    difficulty?: string;
    materialId?: string;
  }): Promise<Quiz> => {
    return api.generateQuiz(params);
  };

  const handleSubmitQuiz = async (quizId: string, answers: Record<string, number>) => {
    const result = await api.submitQuiz(quizId, answers);
    setQuizAttempts((prev) => [result.attempt, ...prev]);
    const prog = await api.getProgress();
    setProgress(prog);
    return result;
  };

  // Profile update
  const handleUpdateProfile = async (data: {
    name?: string;
    dailyStudyHours?: number;
    preferredStartTime?: string;
    password?: string;
  }) => {
    const updated = await api.updateProfile(data);
    setUser(updated);
  };

  // Cross-Navigation to Quiz
  const handleNavigateToQuiz = (subjectId: string, materialId?: string) => {
    setPreselectedQuizSubject(subjectId);
    setPreselectedQuizMaterial(materialId);
    setActiveTab('quizzes');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loading StudyMate AI...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-200">
      {/* Top Bar Contract (3 zones) */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Container */}
      {!user || activeTab === 'landing' || activeTab === 'login' || activeTab === 'register' ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 w-full">
          <LandingPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            initialAuthModal={authModalMode || (activeTab === 'login' ? 'login' : activeTab === 'register' ? 'register' : null)}
            onCloseAuthModal={() => {
              setAuthModalMode(null);
              if (activeTab === 'login' || activeTab === 'register') {
                setActiveTab('landing');
              }
            }}
          />
        </main>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto w-full flex">
          {/* Canva-style Pastel Sidebar */}
          <Sidebar
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* Active Viewport Area */}
          <main className="flex-1 p-4 sm:p-8 overflow-x-hidden min-w-0">
            {activeTab === 'dashboard' && (
              <Dashboard
                user={user}
                subjects={subjects}
                studyTasks={studyTasks}
                progress={progress}
                quizAttempts={quizAttempts}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onNavigate={setActiveTab}
                onRefreshPlan={() => handleGeneratePlan(user.dailyStudyHours || 3, user.preferredStartTime || '16:00')}
              />
            )}

            {activeTab === 'subjects' && (
              <Subjects
                subjects={subjects}
                onAddSubject={handleAddSubject}
                onUpdateSubject={handleUpdateSubject}
                onDeleteSubject={handleDeleteSubject}
                onNavigateToQuiz={(subId) => handleNavigateToQuiz(subId)}
              />
            )}

            {activeTab === 'materials' && (
              <Materials
                materials={materials}
                subjects={subjects}
                onUploadMaterial={handleUploadMaterial}
                onDeleteMaterial={handleDeleteMaterial}
                onGenerateQuizFromMaterial={(subId, matId) => handleNavigateToQuiz(subId, matId)}
              />
            )}

            {activeTab === 'planner' && (
              <StudyPlanner
                user={user}
                subjects={subjects}
                studyTasks={studyTasks}
                onGeneratePlan={handleGeneratePlan}
                onUpdateTaskStatus={handleUpdateTaskStatus}
              />
            )}

            {activeTab === 'quizzes' && (
              <QuizView
                subjects={subjects}
                materials={materials}
                quizAttempts={quizAttempts}
                onGenerateQuiz={handleGenerateQuiz}
                onSubmitQuiz={handleSubmitQuiz}
                onRefreshAdaptivePlan={() => handleGeneratePlan(user.dailyStudyHours || 3, user.preferredStartTime || '16:00')}
                preselectedSubjectId={preselectedQuizSubject}
                preselectedMaterialId={preselectedQuizMaterial}
              />
            )}

            {activeTab === 'progress' && (
              <ProgressView
                progress={progress}
                quizAttempts={quizAttempts}
                subjects={subjects}
              />
            )}

            {activeTab === 'coach' && (
              <StudyCoach
                user={user}
                subjects={subjects}
                onQueryCoach={(q) => api.queryCoach(q)}
              />
            )}

            {activeTab === 'java-hub' && <JavaProjectHub />}

            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onUpdateProfile={handleUpdateProfile}
              />
            )}
          </main>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (Visible on mobile viewports for quick switching) */}
      {user && (
        <div className="md:hidden sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around text-[10px] text-slate-500 dark:text-slate-400">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Home</span>
          </button>
          <button
            onClick={() => setActiveTab('planner')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'planner' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Planner</span>
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'quizzes' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes</span>
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'coach' ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}`}
          >
            <Bot className="w-4 h-4" />
            <span>Coach</span>
          </button>
          <button
            onClick={() => setActiveTab('java-hub')}
            className={`flex flex-col items-center gap-1 ${activeTab === 'java-hub' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : ''}`}
          >
            <Code2 className="w-4 h-4" />
            <span>Java PBL</span>
          </button>
        </div>
      )}
    </div>
  );
}
