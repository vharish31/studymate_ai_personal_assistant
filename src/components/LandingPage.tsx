import React, { useState } from 'react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin('jashwanth@studymate.ai', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (modalMode === 'login') {
        await onLogin(email, password);
      } else if (modalMode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }
        await onRegister(name, email, password, confirmPassword);
      }
      setModalMode(null);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
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

        {/* CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center gap-2"
          >
            <span>{loading ? 'Entering Workspace...' : 'Explore Demo Workspace (Jashwanth)'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setModalMode('login')}
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-2xl text-sm font-semibold shadow-xs transition-colors"
          >
            Student Sign In
          </button>
        </div>

        {/* Quick hint */}
        <p className="text-xs text-slate-400">
          Pre-seeded with Java, DSA, DBMS & OS modules · No external API key required
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

          <button
            onClick={handleDemoLogin}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-2xl text-xs shadow-md transition-colors whitespace-nowrap self-start md:self-auto"
          >
            Launch Prototype Now
          </button>
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

      {/* Auth Modal (Login / Register) */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                {modalMode === 'login' ? 'Student Sign In' : 'Create Free Account'}
              </h3>
              <button
                onClick={() => {
                  setModalMode(null);
                  onCloseAuthModal?.();
                }}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {modalMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jashwanth"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {modalMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-colors mt-2"
              >
                {loading
                  ? 'Please wait...'
                  : modalMode === 'login'
                  ? 'Sign In to StudyMate'
                  : 'Register Account'}
              </button>

              <div className="text-center pt-2">
                {modalMode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('register');
                      setError(null);
                    }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Don't have an account? Sign Up
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('login');
                      setError(null);
                    }}
                    className="text-xs text-indigo-600 hover:underline"
                  >
                    Already have an account? Sign In
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
