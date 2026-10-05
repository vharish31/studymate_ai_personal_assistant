import React from 'react';
import { User } from '../types';
import { BookOpen, Sparkles, GraduationCap, LogOut, Code2, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text wordmark Brand Zone */}
        <div
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-indigo-100 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              StudyMate AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-400">
              Adaptive Intelligent Study Planner
            </span>
          </div>
        </div>

        {/* Zone 2: Clean navigation links */}
        {user ? (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeTab === 'planner' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Study Planner
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeTab === 'quizzes' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap ${
                activeTab === 'coach' ? 'text-indigo-600 font-semibold' : ''
              }`}
            >
              AI Coach
            </button>
            <button
              onClick={() => setActiveTab('java-hub')}
              className={`hover:text-indigo-600 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'java-hub' ? 'text-indigo-600 font-semibold' : 'text-slate-700'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-600" />
              Java Spring Boot PBL
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-slate-900 transition-colors">
              Java Architecture
            </a>
            <a href="#demo" className="hover:text-slate-900 transition-colors">
              Live Demo
            </a>
          </nav>
        )}

        {/* Zone 3: Primary Action buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors text-sm"
                title="Profile & Preferences"
              >
                <div className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium text-slate-800">{user.name}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
