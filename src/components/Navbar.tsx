import React from 'react';
import { User, StudyTask } from '../types';
import { BookOpen, Sparkles, GraduationCap, LogOut, Code2, User as UserIcon, Sun, Moon } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { AppNotification } from '../services/notificationService';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  notifications?: AppNotification[];
  upcomingTasks?: StudyTask[];
  onClearNotifications?: () => void;
  onSendTestReminder?: () => void;
  onSimulateUpcomingTask?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  activeTab,
  setActiveTab,
  onOpenAuth,
  theme = 'light',
  onToggleTheme,
  notifications = [],
  upcomingTasks = [],
  onClearNotifications = () => {},
  onSendTestReminder = () => {},
  onSimulateUpcomingTask,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text wordmark Brand Zone */}
        <div
          onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-500 via-indigo-500 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-indigo-100 dark:shadow-none group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
              StudyMate AI
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
              Adaptive Intelligent Study Planner
            </span>
          </div>
        </div>

        {/* Zone 2: Clean navigation links */}
        {user ? (
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                activeTab === 'dashboard' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('planner')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                activeTab === 'planner' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Study Planner
            </button>
            <button
              onClick={() => setActiveTab('quizzes')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                activeTab === 'quizzes' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              Quizzes
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap ${
                activeTab === 'coach' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : ''
              }`}
            >
              AI Coach
            </button>
            <button
              onClick={() => setActiveTab('java-hub')}
              className={`hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'java-hub' ? 'text-indigo-600 dark:text-indigo-400 font-semibold' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <Code2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Java Spring Boot PBL
            </button>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Java Architecture
            </a>
            <a href="#demo" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              Live Demo
            </a>
          </nav>
        )}

        {/* Zone 3: Primary Action buttons, Notification Bell & Global Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 15-Minute Study Task Notification Bell */}
          <NotificationBell
            notifications={notifications}
            upcomingTasks={upcomingTasks}
            onClearNotifications={onClearNotifications}
            onSendTestReminder={onSendTestReminder}
            onSimulateUpcomingTask={onSimulateUpcomingTask}
            onNavigateToPlanner={() => setActiveTab('planner')}
          />

          {/* Global Theme Toggle Button */}
          <button
            id="theme-toggle"
            data-testid="theme-toggle"
            onClick={onToggleTheme}
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="theme-toggle p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setActiveTab('profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors text-sm"
                title="Profile & Preferences"
              >
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 flex items-center justify-center font-semibold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-medium text-slate-800 dark:text-slate-200">{user.name}</span>
              </button>
              <button
                onClick={onLogout}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAuth?.('login')}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth?.('register')}
                className="px-4 py-2 text-sm font-medium text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-500 rounded-xl transition-colors shadow-sm whitespace-nowrap"
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
