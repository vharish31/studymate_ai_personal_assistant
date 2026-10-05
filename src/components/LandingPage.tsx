import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  BookOpen,
  Calendar,
  Award,
  ArrowRight,
  CheckCircle2,
  FileText,
  Brain,
  ShieldCheck,
  Code2,
} from 'lucide-react';
import { AuthView } from './AuthView';

interface LandingPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string, confirm: string) => Promise<void>;
  initialAuthModal?: 'login' | 'register' | null;
  onCloseAuthModal?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLogin,
  onRegister,
  initialAuthModal = null,
  onCloseAuthModal,
}) => {
  const [modalMode, setModalMode] = useState<'login' | 'register' | null>(initialAuthModal);
  const [demoLoading, setDemoLoading] = useState(false);

  // Synchronize modal state whenever the parent triggers auth from Navbar or elsewhere
  useEffect(() => {
    if (initialAuthModal) {
      setModalMode(initialAuthModal);
    }
  }, [initialAuthModal]);

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      await onLogin('jashwanth@studymate.ai', 'password123');
    } catch (err: any) {
      console.error('Demo login error', err);
    } finally {
      setDemoLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    onCloseAuthModal?.();
  };

  return (
    <div className="space-y-24 py-8 animate-fade-in">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200/80 text-violet-700 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent College PBL & Capstone Project</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
          Master Your Syllabus with{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500">
            StudyMate AI
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Your personalized intelligent study companion. Dynamically balances revision schedules using exam countdowns, subject difficulty, and real quiz diagnostic scores.
        </p>

        {/* Primary Action Buttons: Sign In, Create Account & Demo */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setModalMode('register')}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModalMode('login')}
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-semibold shadow-xs transition-colors"
          >
            Student Sign In
          </button>

          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="px-6 py-3.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200/80 rounded-2xl text-sm font-semibold shadow-xs transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span>{demoLoading ? 'Entering Workspace...' : '1-Click Demo (Jashwanth)'}</span>
          </button>
        </div>

        {/* Quick hint */}
        <p className="text-xs text-slate-400">
          Pre-seeded with Java, DSA, DBMS & OS modules · Real account creation & sign in available
        </p>
      </section>

      {/* Feature Showcase Grid */}
      <section id="features" className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Intelligent Study Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered for Continuous Academic Progress
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Adaptive Study Planning</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Calculates daily timetable slots using exam proximity, subject priority, and quiz weakness multipliers rather than rigid static calendars.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Smart Material Analysis</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Upload PDF, DOCX, or TXT study notes. Automatically parses readable text, extracts high-frequency keywords, and creates custom quizzes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 hover:border-indigo-200 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Subject-Wise Quizzes</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Two levels of testing: Curated question banks and dynamic material generation. Diagnose weak concepts and receive immediate feedback.
            </p>
          </div>
        </div>
      </section>

      {/* College PBL & Architecture Highlight */}
      <section id="architecture" className="max-w-6xl mx-auto bg-slate-900 text-white p-10 rounded-3xl shadow-xl space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Full-Stack Java Technologies</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready for College Project Demonstrations
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              Implements Spring Boot 3, Spring Data JPA, Spring Security, BCrypt, MySQL schema, and a modular AIService interface directly runnable in IntelliJ or Eclipse.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setModalMode('register')}
              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition-colors whitespace-nowrap"
            >
              Create Account
            </button>
            <button
              onClick={() => setModalMode('login')}
              className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs border border-slate-700 transition-colors whitespace-nowrap"
            >
              Sign In
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block">Backend</span>
            <span className="font-semibold text-slate-200">Java 17 / Spring Boot 3</span>
          </div>
          <div>
            <span className="text-slate-400 block">Database</span>
            <span className="font-semibold text-slate-200">MySQL & Hibernate JPA</span>
          </div>
          <div>
            <span className="text-slate-400 block">Security</span>
            <span className="font-semibold text-slate-200">BCrypt Hashing & JWT</span>
          </div>
          <div>
            <span className="text-slate-400 block">Design Aesthetic</span>
            <span className="font-semibold text-slate-200">Canva-Style Pastel Light</span>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-4xl mx-auto text-center space-y-6 bg-gradient-to-tr from-violet-100/70 via-white to-sky-100/70 p-10 rounded-3xl border border-indigo-100 shadow-sm">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Ready to Ace Your Semester Exams?
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Join StudyMate AI today. Sign up for free or sign in to review your personalized syllabus progress and study goals.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => setModalMode('register')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <span>Create Free Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setModalMode('login')}
            className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            Sign In
          </button>
        </div>
      </section>

      {/* Auth Modal Popup */}
      {modalMode && (
        <AuthView
          mode={modalMode}
          onModeChange={(newMode) => setModalMode(newMode)}
          onLogin={onLogin}
          onRegister={onRegister}
          isModal={true}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};
