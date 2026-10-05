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
} from 'lucide-react';

interface DashboardProps {
  user: User;
  subjects: Subject[];
  studyTasks: StudyTask[];
  progress: ProgressData | null;
  quizAttempts: QuizAttempt[];
  onUpdateTaskStatus: (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
  onNavigate: (tab: string) => void;
  onRefreshPlan: () => void;
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
}) => {
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-violet-50/80 via-white to-sky-50/80 p-6 rounded-3xl border border-slate-200/60 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {greeting}, {user.name} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
            onClick={() => onNavigate('coach')}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Ask Coach</span>
          </button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Today's Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Today's Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {todaysTasks.length}
            </div>
            <span className="text-xs text-slate-400">Scheduled for today</span>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Completed Tasks</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-600 tabular-nums">
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
          className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between group hover:border-violet-200 transition-colors"
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-semibold text-slate-500">
              Daily Study Hours
            </span>
            <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
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
                  className="font-bold font-plus-jakarta select-none pointer-events-none"
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

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-violet-500" />
              <span>Target: {dailyGoalHours} hrs</span>
            </span>
            <span className="font-semibold text-slate-700">
              {dailyGoalPercentage >= 100 ? 'Goal Reached 🎉' : `${remainingHours}h left`}
            </span>
          </div>
        </div>

        {/* Quiz Average */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Quiz Average</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {progress?.quizAverage ?? 75}%
            </div>
            <span className="text-xs text-slate-400">Across {quizAttempts.length} quizzes</span>
          </div>
        </div>

        {/* Active Subjects */}
        <div className="col-span-2 lg:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium text-slate-500">Active Subjects</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tabular-nums">
              {subjects.length}
            </div>
            <span className="text-xs text-slate-400">Enrolled modules</span>
          </div>
        </div>
      </div>

      {/* 2.5 Circular Progress Ring Visualizer for Daily Study Hour Goal */}
      <div className="bg-gradient-to-br from-violet-50/70 via-white to-indigo-50/50 p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-violet-700">
            <Target className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Daily Study Hour Goal Visualizer
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {todayStudyHours} of {dailyGoalHours} hours completed today
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            {dailyGoalPercentage >= 100
              ? '🎉 Daily goal achieved! Outstanding consistency. Any additional revision blocks will further strengthen long-term retention.'
              : `${remainingHours} hrs remaining to hit your target today. Mark off your scheduled tasks below to complete your daily focus goal.`}
          </p>
          <div className="flex items-center gap-4 pt-1 text-xs">
            <span className="text-slate-400">
              Tasks Done Today:{' '}
              <strong className="text-slate-700">{completedToday} of {todaysTasks.length}</strong>
            </span>
            <span>·</span>
            <button
              onClick={() => onNavigate('profile')}
              className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
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
              className="stroke-violet-100"
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
            <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {dailyGoalPercentage}%
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Daily Goal
            </span>
          </div>
        </div>
      </div>

      {/* 3. Today's Study Plan Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Adaptive Study Plan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Algorithmically prioritized based on exam dates, difficulty, and your quiz performance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshPlan}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              title="Recalculate adaptive plan"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Regenerate Plan</span>
            </button>
            <button
              onClick={() => onNavigate('planner')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 ml-2"
            >
              <span>Weekly Calendar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {todaysTasks.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-slate-500">No tasks currently scheduled for today.</p>
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
              <thead className="bg-slate-50/70 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Time</th>
                  <th className="px-6 py-3.5">Subject</th>
                  <th className="px-6 py-3.5">Topic</th>
                  <th className="px-6 py-3.5">Duration</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaysTasks.map((task) => {
                  const isUpdating = updatingTaskId === task.id;
                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-slate-50/50 transition-colors ${
                        task.status === 'Completed' ? 'bg-slate-50/30 text-slate-400' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-mono text-xs tabular-nums text-slate-600 whitespace-nowrap">
                        {task.startTime}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800 whitespace-nowrap">
                        {task.subjectName}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="max-w-xs md:max-w-md truncate font-medium">
                          {task.topic}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 tabular-nums whitespace-nowrap">
                        {task.durationMinutes} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                            task.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : task.status === 'In Progress'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
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
                        <button
                          disabled={isUpdating}
                          onClick={() => handleStatusToggle(task)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            task.status === 'Completed'
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                              : task.status === 'In Progress'
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
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
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Subject Diagnostics & Exam Proximity</h3>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
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
                <div key={sub.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{sub.name}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Exam: {sub.examDate}</span>
                        <span>·</span>
                        <span className={daysLeft <= 15 ? 'text-rose-600 font-semibold' : ''}>
                          {daysLeft} days remaining
                        </span>
                        <span>·</span>
                        <span>Priority: {sub.priority}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-slate-900 tabular-nums">{score}%</span>
                      <span className="block text-[11px] text-slate-400">Score</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
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
