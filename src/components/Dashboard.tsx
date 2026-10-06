import React, { useState, useEffect } from 'react';
import {
  User,
  StudyTask,
  ProgressData,
  Subject,
  QuizAttempt,
} from '../types';
import {
  CheckCircle2,
  Clock,
  BookOpen,
  Trophy,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertCircle,
  Play,
  RotateCw,
  Target,
  Flame,
  Zap,
  Upload,
  ArrowUpRight,
  Layers,
} from 'lucide-react';
import { PomodoroTimer } from './PomodoroTimer';

interface DashboardProps {
  user: User;
  subjects: Subject[];
  studyTasks: StudyTask[];
  progress: ProgressData | null;
  quizAttempts: QuizAttempt[];
  onUpdateTaskStatus: (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
  onNavigate: (tab: string) => void;
  onRefreshPlan: () => void;
  onLogFocus?: (taskId: string, minutes: number, completeTask: boolean) => Promise<any>;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  subjects,
  studyTasks,
  progress,
  quizAttempts,
  onUpdateTaskStatus,
  onNavigate,
  onRefreshPlan,
  onLogFocus,
}) => {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [selectedActiveTaskId, setSelectedActiveTaskId] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Mount animation trigger for circular SVG progress rings
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  // Time of day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Filter tasks for today
  const todayStr = new Date().toISOString().split('T')[0];
  const todaysTasks = studyTasks.filter(
    (t) => t.scheduledDate === todayStr || studyTasks.indexOf(t) < 4
  );

  const completedToday = todaysTasks.filter((t) => t.status === 'Completed').length;

  // Dynamic study hour progress values pulled directly from 'progress' object state
  const totalGoalHours =
    progress?.totalGoalHours != null
      ? progress.totalGoalHours
      : progress?.dailyGoalHours != null
      ? progress.dailyGoalHours
      : user.dailyStudyHours ?? 3.5;

  const completedTodayMinutes = todaysTasks
    .filter((t) => t.status === 'Completed')
    .reduce((acc, t) => acc + t.durationMinutes, 0);

  const studyHoursCompleted =
    progress?.studyHoursCompleted != null
      ? progress.studyHoursCompleted
      : progress?.todayStudyHours != null
      ? progress.todayStudyHours
      : completedTodayMinutes > 0
      ? +(completedTodayMinutes / 60).toFixed(1)
      : +(progress?.totalStudyHours ? Math.min(totalGoalHours, progress.totalStudyHours) : 1.5).toFixed(1);

  const dailyGoalHours = totalGoalHours;
  const todayStudyHours = studyHoursCompleted;

  const studyHoursRatio =
    totalGoalHours > 0 ? Math.min(1, Math.max(0, studyHoursCompleted / totalGoalHours)) : 0;
  const dailyGoalPercentage =
    progress?.dailyGoalPercentage != null
      ? progress.dailyGoalPercentage
      : Math.min(100, Math.round(studyHoursRatio * 100));
  const remainingHours = +(Math.max(0, totalGoalHours - studyHoursCompleted)).toFixed(1);

  // #daily-study-hours-card SVG Ring Constants & Stroke Dashoffset
  // Dynamically calculated based on the ratio of studyHoursCompleted / totalGoalHours from progress API
  const studyHoursCompletedVal =
    (progress as any)?.studyHoursCompleted ?? progress?.todayStudyHours ?? studyHoursCompleted;
  const totalGoalHoursVal =
    (progress as any)?.totalGoalHours ?? progress?.dailyGoalHours ?? totalGoalHours;
  const progressRatio =
    totalGoalHoursVal > 0 ? studyHoursCompletedVal / totalGoalHoursVal : 0;
  const strokeDashoffset = 251.2 * (1 - progressRatio);

  // SVG Circular Ring Constants for Hero section
  const ringRadius = 48;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~301.59
  const ringDashoffset = isMounted ? ringCircumference * (1 - dailyGoalPercentage / 100) : ringCircumference;

  const handleStatusToggle = async (task: StudyTask) => {
    setUpdatingTaskId(task.id);
    let nextStatus: 'Pending' | 'In Progress' | 'Completed' = 'In Progress';
    if (task.status === 'Pending') nextStatus = 'In Progress';
    else if (task.status === 'In Progress') nextStatus = 'Completed';
    else nextStatus = 'Pending';

    try {
      await onUpdateTaskStatus(task.id, nextStatus);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  // Active task selection:
  // 1. Manually selected task if present in todaysTasks, OR
  // 2. First task with status === 'In Progress', OR
  // 3. First task with status === 'Pending', OR
  // 4. First task in todaysTasks
  const activeTask =
    (selectedActiveTaskId && todaysTasks.find((t) => t.id === selectedActiveTaskId)) ||
    todaysTasks.find((t) => t.status === 'In Progress') ||
    todaysTasks.find((t) => t.status === 'Pending') ||
    todaysTasks[0] ||
    null;

  const handleSelectTaskForFocus = (task: StudyTask) => {
    setSelectedActiveTaskId(task.id);
    if (task.status === 'Pending') {
      onUpdateTaskStatus(task.id, 'In Progress').catch(() => {});
    }
    const cardEl = document.getElementById('active-studytask-card');
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleQuickStartStudySession = async () => {
    if (activeTask) {
      setSelectedActiveTaskId(activeTask.id);
      if (activeTask.status === 'Pending') {
        try {
          await onUpdateTaskStatus(activeTask.id, 'In Progress');
        } catch (e) {
          console.error(e);
        }
      }
      const cardEl = document.getElementById('active-studytask-card');
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      // Auto-trigger Pomodoro timer start button after scroll
      setTimeout(() => {
        const startBtn = document.getElementById('pomodoro-start-btn');
        if (startBtn) {
          startBtn.click();
        }
      }, 350);
    } else {
      onRefreshPlan();
    }
  };

  const handleQuickLogQuiz = () => {
    onNavigate('quizzes');
  };

  const handleQuickRegeneratePlan = async () => {
    setIsRegenerating(true);
    try {
      await onRefreshPlan();
    } finally {
      setTimeout(() => setIsRegenerating(false), 600);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-50/80 via-white to-sky-50/80 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-800/80 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {greeting}, {user.name} 👋
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Let’s make today productive. Your adaptive schedule has balanced your highest priority topics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('quizzes')}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Practice Quiz</span>
          </button>
          <button
            onClick={() => onNavigate('quizzes')}
            className="px-4 py-2.5 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>
          <button
            onClick={() => onNavigate('coach')}
            className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ask Coach</span>
          </button>
        </div>
      </div>

      {/* 1.5 Quick Action Grid at the Top */}
      <div
        id="quick-actions-grid"
        data-testid="quick-actions-grid"
        className="bg-gradient-to-r from-slate-50/90 via-indigo-50/30 to-violet-50/40 dark:from-slate-900/90 dark:via-slate-900 dark:to-indigo-950/20 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5 transition-all"
      >
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <h2 className="text-xs font-extrabold tracking-wider uppercase text-slate-800 dark:text-slate-200">
              Quick Actions
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
            1-Click Launchpad
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Action 1: Start Study Session */}
          <button
            type="button"
            id="quick-action-start-session"
            data-testid="quick-action-start-study-session"
            onClick={handleQuickStartStudySession}
            className="group relative bg-white dark:bg-slate-900 hover:bg-gradient-to-br hover:from-white hover:to-rose-50/60 dark:hover:from-slate-900 dark:hover:to-rose-950/25 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-rose-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Flame className="w-5 h-5 fill-current animate-pulse text-amber-300" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/70 px-2 py-0.5 rounded-full border border-rose-200/60 dark:border-rose-900/60">
                <span>Start Now</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                Start Study Session
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {activeTask ? `Focus on: ${activeTask.topic}` : 'Launch Pomodoro focus timer'}
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span className="truncate max-w-[140px] font-medium text-slate-600 dark:text-slate-300">
                {activeTask ? activeTask.subjectName : 'Adaptive Task'}
              </span>
              <span className="font-mono text-indigo-600 dark:text-indigo-400 font-semibold shrink-0">
                {activeTask ? `${activeTask.durationMinutes}m target` : 'Pomodoro'}
              </span>
            </div>
          </button>

          {/* Action 2: Log Recent Quiz */}
          <button
            type="button"
            id="quick-action-log-quiz"
            data-testid="quick-action-log-recent-quiz"
            onClick={handleQuickLogQuiz}
            className="group relative bg-white dark:bg-slate-900 hover:bg-gradient-to-br hover:from-white hover:to-amber-50/60 dark:hover:from-slate-900 dark:hover:to-amber-950/25 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Trophy className="w-5 h-5 fill-current text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-full border border-amber-200/60 dark:border-amber-900/60">
                <span>Quiz Hub</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                Log Recent Quiz
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Take an active recall test & record score
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Average: <strong className="text-amber-600 dark:text-amber-400">{progress?.quizAverage ?? 75}%</strong></span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">{quizAttempts.length} quizzes</span>
            </div>
          </button>

          {/* Action 3: Regenerate Adaptive Plan */}
          <button
            type="button"
            id="quick-action-regenerate-plan"
            data-testid="quick-action-regenerate-plan"
            disabled={isRegenerating}
            onClick={handleQuickRegeneratePlan}
            className="group relative bg-white dark:bg-slate-900 hover:bg-gradient-to-br hover:from-white hover:to-emerald-50/60 dark:hover:from-slate-900 dark:hover:to-emerald-950/25 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <RotateCw className={`w-5 h-5 ${isRegenerating ? 'animate-spin' : ''}`} />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-900/60">
                <span>{isRegenerating ? 'Syncing...' : 'Rebalance'}</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Regenerate Plan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Recalculate tasks based on priorities & exams
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Today's Tasks: <strong className="text-slate-700 dark:text-slate-300">{todaysTasks.length}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Adaptive</span>
            </div>
          </button>

          {/* Action 4: Upload Study Material */}
          <button
            type="button"
            id="quick-action-upload-material"
            data-testid="quick-action-upload-material"
            onClick={() => onNavigate('materials')}
            className="group relative bg-white dark:bg-slate-900 hover:bg-gradient-to-br hover:from-white hover:to-sky-50/60 dark:hover:from-slate-900 dark:hover:to-sky-950/25 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700/80 shadow-xs hover:shadow-md transition-all text-left flex flex-col justify-between overflow-hidden cursor-pointer active:scale-98"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform shrink-0">
                <Upload className="w-5 h-5 text-white" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/70 px-2 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-900/60">
                <span>Library</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Upload Material
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                Add lecture notes, PDFs, or textbook slides
              </p>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
              <span>Subjects: <strong className="text-slate-700 dark:text-slate-300">{subjects.length}</strong></span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">AI Extraction</span>
            </div>
          </button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Today's Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {todaysTasks.length}
            </div>
            <span className="text-xs text-slate-400">Scheduled for today</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Completed Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {progress?.completedTasks ?? completedToday}
            </div>
            <span className="text-xs text-slate-400">
              {progress?.completionPercentage ?? 0}% completed
            </span>
          </div>
        </div>

        {/* Daily Study Hours with Circular SVG Progress Ring */}
        <div
          id="daily-study-hours-card"
          className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between group hover:border-violet-200 dark:hover:border-violet-900 transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Daily Study Hours
            </span>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-full shrink-0">
              {dailyGoalPercentage}% Done
            </span>
          </div>

          {/* Circular SVG progress ring with centered text overlay in 'Plus Jakarta Sans' */}
          <div className="my-2 flex items-center justify-center">
            <div className="relative w-[100px] h-[100px] flex items-center justify-center shrink-0">
              <svg className="w-[100px] h-[100px]" viewBox="0 0 100 100">
                {/* Background Track Circle: stroke-dasharray: 251.2, stroke: #e2e8f0 */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#e2e8f0"
                  strokeWidth="5"
                  strokeDasharray="251.2"
                  style={{ strokeDasharray: '251.2', stroke: '#e2e8f0' }}
                  fill="transparent"
                />
                {/* Animated Foreground Circle with stroke-dasharray and stroke-dashoffset */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#summaryHourGradient)"
                  strokeWidth="5"
                  strokeDasharray="251.2"
                  strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 50 50)"
                  style={{
                    strokeDasharray: '251.2',
                    strokeDashoffset: `${strokeDashoffset}`,
                    transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    transitionProperty: 'stroke-dashoffset',
                    transitionDuration: '1s',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'stroke-dashoffset',
                  }}
                  strokeLinecap="round"
                  fill="transparent"
                  className="progress-ring-circle transition-all duration-1000"
                />

                <defs>
                  <linearGradient id="summaryHourGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                </defs>

                {/* Centered text overlay inside the circular SVG ring using 'Plus Jakarta Sans' typography */}
                <text
                  id="daily-study-hours-overlay"
                  x="50"
                  y="50"
                  textAnchor="middle"
                  dominantBaseline="central"
                  alignmentBaseline="central"
                  fill="#0F172A"
                  className="font-bold font-plus-jakarta select-none pointer-events-none fill-slate-900 dark:fill-slate-100"
                  fontFamily="'Plus Jakarta Sans', sans-serif"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontSize: '9px',
                    fontWeight: 700,
                  }}
                  aria-label={`${studyHoursCompleted} / ${totalGoalHours} hours`}
                >
                  {studyHoursCompleted} / {totalGoalHours} hours
                </text>
              </svg>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <span>Target: {dailyGoalHours} hrs</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {dailyGoalPercentage >= 100 ? 'Goal Reached 🎉' : `${remainingHours}h left`}
            </span>
          </div>
        </div>

        {/* Quiz Average */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Quiz Average</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {progress?.quizAverage ?? 75}%
            </div>
            <span className="text-xs text-slate-400">Across {quizAttempts.length} quizzes</span>
          </div>
        </div>

        {/* Active Subjects */}
        <div className="col-span-2 lg:col-span-1 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {subjects.length}
            </div>
            <span className="text-xs text-slate-400">Enrolled modules</span>
          </div>
        </div>
      </div>

      {/* 2.5 Circular Progress Ring Visualizer for Daily Study Hour Goal */}
      <div className="bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-violet-700 dark:text-violet-400">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Daily Study Hour Goal Visualizer
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {todayStudyHours} of {dailyGoalHours} hours completed today
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {dailyGoalPercentage >= 100
              ? '🎉 Daily goal achieved! Outstanding consistency. Any additional revision blocks will further strengthen long-term retention.'
              : `${remainingHours} hrs remaining to hit your target today. Mark off your scheduled tasks below to complete your daily focus goal.`}
          </p>
          <div className="flex items-center gap-4 pt-1 text-xs">
            <span className="text-slate-400 dark:text-slate-500">
              Tasks Done Today:{' '}
              <strong className="text-slate-700 dark:text-slate-300">{completedToday} of {todaysTasks.length}</strong>
            </span>
            <span>·</span>
            <button
              onClick={() => onNavigate('profile')}
              className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1"
            >
              <span>Edit Goal in Settings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Circular Progress Ring Visualizer */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
            {/* Background track circle */}
            <circle
              cx="60"
              cy="60"
              r={ringRadius}
              className="stroke-violet-100 dark:stroke-slate-800"
              strokeWidth="9"
              fill="transparent"
            />
            {/* Animated progress circle */}
            <circle
              cx="60"
              cy="60"
              r={ringRadius}
              stroke="url(#dailyGoalGradient)"
              strokeWidth="9"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="dailyGoalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {dailyGoalPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Daily Goal
            </span>
          </div>
        </div>
      </div>

      {/* 2.8 Active StudyTask Card with Integrated Pomodoro Focus Timer */}
      {activeTask && (
        <div
          id="active-studytask-card"
          data-testid="active-studytask-card"
          className="bg-white dark:bg-slate-900 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
        >
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <Flame className="w-5 h-5 fill-current text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-200">
                    Active Study Task
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-white/15 px-2.5 py-0.5 rounded-full border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Focus Session
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-0.5">
                  {activeTask.topic}
                </h3>
              </div>
            </div>

            {/* Task Switcher Dropdown (if multiple tasks scheduled) */}
            {todaysTasks.length > 1 && (
              <div className="flex items-center gap-2 bg-indigo-950/50 p-1.5 rounded-2xl border border-indigo-400/30">
                <span className="text-xs font-semibold text-indigo-200 pl-2">Switch Focus:</span>
                <select
                  value={activeTask.id}
                  onChange={(e) => setSelectedActiveTaskId(e.target.value)}
                  className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs font-semibold rounded-xl px-3 py-1.5 border-none focus:ring-2 focus:ring-white outline-none cursor-pointer"
                >
                  {todaysTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.subjectName} · {t.topic} ({t.durationMinutes}m)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card Content Grid */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left Column: Task Details, Timing & Focus Stats */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {activeTask.subjectName}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                      activeTask.priority === 'High'
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                        : activeTask.priority === 'Medium'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Priority: {activeTask.priority}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      activeTask.status === 'Completed'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : activeTask.status === 'In Progress'
                        ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeTask.status === 'Completed'
                          ? 'bg-emerald-500'
                          : activeTask.status === 'In Progress'
                          ? 'bg-amber-500'
                          : 'bg-slate-400'
                      }`}
                    />
                    {activeTask.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    Scheduled: {activeTask.startTime}
                  </span>
                  <span>·</span>
                  <span>Target: {activeTask.durationMinutes} minutes</span>
                </div>
              </div>

              {/* Focus Strategy Banner */}
              <div className="p-4 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Pomodoro Focus Strategy</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  Start the Pomodoro timer to initiate dedicated, distraction-free study. When completed, logged focused minutes instantly update your daily progress record!
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span>Today's Logged Focus: <strong className="text-indigo-600 dark:text-indigo-400">{progress?.todayFocusedMinutes || 0} mins</strong></span>
                  <span>Sessions: <strong className="text-slate-700 dark:text-slate-300">{progress?.focusSessionsCount || 0} completed</strong></span>
                </div>
              </div>

              {/* Status Action Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={updatingTaskId === activeTask.id}
                  onClick={() => handleStatusToggle(activeTask)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    activeTask.status === 'Completed'
                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      : activeTask.status === 'In Progress'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {updatingTaskId === activeTask.id
                      ? 'Updating...'
                      : activeTask.status === 'Completed'
                      ? 'Mark Incomplete'
                      : activeTask.status === 'In Progress'
                      ? 'Mark Completed'
                      : 'Mark In Progress'}
                  </span>
                </button>
              </div>
            </div>

            {/* Right Column: Pomodoro Focus Timer Component */}
            <div className="lg:col-span-7">
              <PomodoroTimer
                task={activeTask}
                onLogFocus={async (taskId, minutes, completeTask) => {
                  if (onLogFocus) {
                    await onLogFocus(taskId, minutes, completeTask);
                  }
                }}
                onTaskStatusChange={onUpdateTaskStatus}
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Today's Study Plan Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today's Adaptive Study Plan</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Algorithmically prioritized based on exam dates, difficulty, and your quiz performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshPlan}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
              title="Recalculate adaptive plan"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate Plan</span>
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors flex items-center gap-1 ml-2"
            >
              <span>Weekly Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks currently scheduled for today.</p>
            <button
              onClick={onRefreshPlan}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition-colors"
            >
              Generate Today's Tasks
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Topic</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todaysTasks.map((task) => {
                  const isUpdating = updatingTaskId === task.id;
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors ${
                        task.status === 'Completed' ? 'bg-slate-50/30 dark:bg-slate-800/20 text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs tabular-nums text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {task.startTime}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                        {task.subjectName}
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        <div className="max-w-xs md:max-w-md truncate font-medium">
                          {task.topic}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {task.durationMinutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : task.status === 'In Progress'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              task.status === 'Completed'
                                ? 'bg-emerald-500'
                                : task.status === 'In Progress'
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                          />
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleSelectTaskForFocus(task)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                              activeTask?.id === task.id
                                ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300 dark:ring-indigo-700'
                                : 'bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                            }`}
                            title="Focus on this task with Pomodoro timer"
                          >
                            <Flame className={`w-3.5 h-3.5 ${activeTask?.id === task.id ? 'fill-current text-amber-300 animate-pulse' : 'text-indigo-500'}`} />
                            <span>{activeTask?.id === task.id ? 'Focusing' : 'Focus'}</span>
                          </button>

                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusToggle(task)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              task.status === 'Completed'
                                ? 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                                : task.status === 'In Progress'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                                : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300'
                            }`}
                          >
                            {isUpdating
                              ? 'Saving...'
                              : task.status === 'Completed'
                              ? 'Mark Pending'
                              : task.status === 'In Progress'
                              ? 'Complete Task'
                              : 'Start Study'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Two-Column Progress & Insights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject-Wise Performance Breakdown */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Subject Diagnostics & Exam Proximity</h3>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              Manage Subjects
            </button>
          </div>
          <div className="space-y-4 pt-2">
            {subjects.map((sub) => {
              const daysLeft = Math.max(
                1,
                Math.round(
                  (new Date(sub.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                )
              );
              // Find quiz avg for this subject
              const subPerf = progress?.subjectPerformance?.find((p) => p.id === sub.id);
              const score = subPerf ? subPerf.quizAverage : 75;

              return (
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{sub.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Exam: {sub.examDate}</span>
                        <span>·</span>
                        <span className={daysLeft <= 15 ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}>
                          {daysLeft} days remaining
                        </span>
                        <span>·</span>
                        <span>Priority: {sub.priority}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">{score}%</span>
                      <span className="block text-[11px] text-slate-400">Score</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80
                          ? 'bg-emerald-500'
                          : score >= 65
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(10, score))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Recommendations Card */}
        <div className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white p-6 rounded-3xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-violet-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold uppercase tracking-wider">AI Study Coach Insight</span>
            </div>
            <h3 className="text-xl font-bold leading-snug">
              Adaptive Attention Suggested
            </h3>
            <p className="text-sm text-violet-100 leading-relaxed">
              Based on your latest test scores, DSA graphs and binary trees show lower retention. We've shifted 45 minutes of today's schedule to active recall practice.
            </p>
          </div>

          <div className="pt-6 border-t border-violet-500/50 space-y-3">
            <button
              onClick={() => onNavigate('coach')}
              className="w-full py-2.5 px-4 bg-white text-indigo-900 rounded-xl text-xs font-bold hover:bg-violet-50 transition-colors text-center shadow-sm"
            >
              Open Full AI Coach Chat
            </button>
            <p className="text-[11px] text-violet-200 text-center">
              Powered by StudyMate Adaptive Intelligence
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
