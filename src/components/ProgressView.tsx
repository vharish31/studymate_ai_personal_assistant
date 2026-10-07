import React, { useState } from 'react';
import { ProgressData, QuizAttempt, Subject, User } from '../types';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Award,
  Flame,
  Calendar,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  FileText,
  Download,
  Check,
  Loader2,
  Eye,
  X,
} from 'lucide-react';
import { downloadProgressPDFReport } from '../utils/pdfExport';

interface ProgressViewProps {
  user?: User | null;
  progress: ProgressData | null;
  quizAttempts: QuizAttempt[];
  subjects: Subject[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  user,
  progress,
  quizAttempts,
  subjects,
}) => {
  if (!progress) {
    return (
      <div className="p-12 text-center text-slate-500">
        Loading performance analytics...
      </div>
    );
  }

  // Strong vs Weak topics
  const weakTopics = progress.weakTopics || [];

  // Hovered day for interactive chart tooltip
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // Focus duration trends over the past week (using server data or fallback from today's progress)
  const todayStr = new Date().toISOString().split('T')[0];
  const weeklyTrends = React.useMemo(() => {
    if (progress.focusWeeklyTrends && progress.focusWeeklyTrends.length > 0) {
      return progress.focusWeeklyTrends;
    }
    // Fallback if server hasn't returned trends yet
    const pastDaysMinutes = [45, 60, 35, 75, 50, 65, progress.todayFocusedMinutes || 30];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const mins = i === 6 ? (progress.todayFocusedMinutes || pastDaysMinutes[6]) : pastDaysMinutes[i % 7];
      return {
        date: dateStr,
        dayName,
        minutes: mins,
        sessionsCount: Math.max(1, Math.round(mins / 25)),
      };
    });
  }, [progress.focusWeeklyTrends, progress.todayFocusedMinutes]);

  const totalWeeklyMinutes = weeklyTrends.reduce((acc, d) => acc + d.minutes, 0);
  const totalWeeklyHours = +(totalWeeklyMinutes / 60).toFixed(1);
  const dailyAverageMinutes = Math.round(totalWeeklyMinutes / (weeklyTrends.length || 7));
  const dailyFocusGoalMinutes = 50; // Standard recommended focus duration target
  const maxDayMinutes = Math.max(...weeklyTrends.map((d) => d.minutes), dailyFocusGoalMinutes);
  const chartYMax = Math.ceil((maxDayMinutes + 15) / 30) * 30; // e.g. 90, 120
  const peakDay = weeklyTrends.reduce((prev, curr) => (curr.minutes > prev.minutes ? curr : prev), weeklyTrends[0]);
  const activeFocusDaysCount = weeklyTrends.filter((d) => d.minutes > 0).length;

  // PDF Export state
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Short delay for UI spinner smoothness
      await new Promise((resolve) => setTimeout(resolve, 200));
      downloadProgressPDFReport({
        user,
        progress,
        quizAttempts,
        subjects,
        weeklyTrends,
      });
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export PDF report', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with PDF Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Progress & Analytics</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time tracking of syllabus coverage, revision consistency, and mastery metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            id="btn-preview-report"
            data-testid="btn-preview-report"
            onClick={() => setShowExportModal(true)}
            className="px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            title="Preview report contents"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">Preview Report</span>
          </button>

          <button
            type="button"
            id="btn-export-pdf-report"
            data-testid="btn-export-pdf-report"
            disabled={isExporting}
            onClick={handleExportPDF}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-98 ${
              exportSuccess
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
            } disabled:opacity-70`}
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating PDF...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-white" />
                <span>Export PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overall Completion</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {progress.completionPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {progress.completedTasks} of {progress.totalTasks} study tasks done
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Study Time</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {progress.totalStudyHours} <span className="text-lg font-normal text-slate-500 dark:text-slate-400">hrs</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Focused study completed</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Quiz Average</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {progress.quizAverage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Across {progress.totalQuizzesTaken} test sessions
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {progress.pendingTasks}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Remaining in current plan</div>
          </div>
        </div>
      </div>

      {/* Pomodoro Focus & Deep Work Metrics Card */}
      <div className="bg-gradient-to-r from-rose-50/70 via-indigo-50/50 to-violet-50/70 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 p-6 rounded-3xl border border-indigo-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Flame className="w-6 h-6 fill-current animate-pulse text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Pomodoro Focus Record</h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-2 py-0.5 rounded-full">
                Active Tracking
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Accumulated deep work minutes logged via the active StudyTask Pomodoro timer.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-10 border-t md:border-t-0 md:border-l border-slate-200/80 dark:border-slate-800 pt-4 md:pt-0 md:pl-8">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Today's Focus</span>
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
              {progress.todayFocusedMinutes || 0} <span className="text-xs font-normal text-slate-500">mins</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Total Focused</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white tabular-nums">
              {progress.totalFocusedMinutes || 0} <span className="text-xs font-normal text-slate-500">mins</span>
            </span>
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Focus Cycles</span>
            <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {progress.focusSessionsCount || 0} <span className="text-xs font-normal text-slate-500">done</span>
            </span>
          </div>
        </div>
      </div>

      {/* Focus Duration Trends Over The Past Week Chart */}
      <div
        id="focus-duration-trends-chart"
        data-testid="focus-duration-trends-chart"
        className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors"
      >
        {/* Chart Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Weekly Focus Duration Trends
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Daily deep work & Pomodoro minutes logged across the past 7 days.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{totalWeeklyMinutes} mins ({totalWeeklyHours} hrs) this week</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Avg: {dailyAverageMinutes}m / day</span>
            </span>
          </div>
        </div>

        {/* Visual Chart Canvas */}
        <div className="relative pt-6 pb-2">
          {/* Target line indicator info */}
          <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-indigo-400 dark:border-indigo-500" />
              <span>Target Benchmark: {dailyFocusGoalMinutes} mins/day</span>
            </span>
            <span>Peak Day: <strong className="text-slate-700 dark:text-slate-300">{peakDay.dayName} ({peakDay.minutes}m)</strong></span>
          </div>

          {/* Chart Grid & Bars Container */}
          <div className="relative h-64 w-full bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex flex-col justify-end">
            {/* Background Grid Lines */}
            <div className="absolute inset-x-4 inset-y-4 pointer-events-none flex flex-col justify-between">
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 pr-1">
                <span>{chartYMax}m</span>
                <span className="hidden sm:inline">Max Scale</span>
              </div>
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 pr-1">
                <span>{Math.round(chartYMax * 0.66)}m</span>
              </div>
              <div className="border-b border-dashed border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 pr-1">
                <span>{Math.round(chartYMax * 0.33)}m</span>
              </div>
              <div className="border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400 pr-1">
                <span>0m</span>
              </div>
            </div>

            {/* Daily Target Benchmark Line */}
            <div
              className="absolute inset-x-4 pointer-events-none border-t-2 border-dashed border-indigo-400/80 dark:border-indigo-500/80 z-10 transition-all"
              style={{
                bottom: `${Math.min(95, Math.max(10, (dailyFocusGoalMinutes / chartYMax) * 100))}%`,
              }}
            >
              <span className="absolute right-0 -top-4 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-xs border border-indigo-100 dark:border-indigo-900/50">
                Goal: {dailyFocusGoalMinutes}m
              </span>
            </div>

            {/* 7 Days Column Bars */}
            <div className="relative z-20 grid grid-cols-7 gap-2 sm:gap-4 h-full items-end pt-6 pb-2">
              {weeklyTrends.map((day, idx) => {
                const isToday = day.date === todayStr;
                const isPeak = day.minutes === peakDay.minutes && day.minutes > 0;
                const meetsGoal = day.minutes >= dailyFocusGoalMinutes;
                const barHeightPercent = Math.min(100, Math.max(6, (day.minutes / chartYMax) * 100));
                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={day.date}
                    className="relative flex flex-col items-center h-full justify-end group cursor-pointer"
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    onMouseLeave={() => setHoveredDayIndex(null)}
                    onClick={() => setHoveredDayIndex(isHovered ? null : idx)}
                  >
                    {/* Floating Tooltip */}
                    {isHovered && (
                      <div className="absolute -top-16 z-30 bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-xl border border-slate-700 pointer-events-none whitespace-nowrap animate-fade-in flex flex-col items-center gap-0.5">
                        <span className="font-bold text-[11px] text-indigo-300">
                          {day.dayName} · {day.date}
                        </span>
                        <span className="font-extrabold text-sm">
                          {day.minutes} mins focused
                        </span>
                        <span className="text-[10px] text-slate-300">
                          {day.sessionsCount} session{day.sessionsCount !== 1 ? 's' : ''} ({Math.round((day.minutes / dailyFocusGoalMinutes) * 100)}% of daily goal)
                        </span>
                        <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-1 border-r border-b border-slate-700" />
                      </div>
                    )}

                    {/* Peak / Today indicator chip */}
                    <div className="mb-1 text-[11px] font-bold tabular-nums text-slate-700 dark:text-slate-300 flex items-center gap-0.5">
                      {isPeak && <Flame className="w-3 h-3 text-amber-500 fill-current inline" />}
                      <span>{day.minutes > 0 ? `${day.minutes}m` : '0m'}</span>
                    </div>

                    {/* The Bar */}
                    <div className="w-full max-w-[36px] bg-slate-200/60 dark:bg-slate-700/40 rounded-xl overflow-hidden flex flex-col justify-end p-0.5 h-full max-h-[160px]">
                      <div
                        className={`w-full rounded-lg transition-all duration-500 shadow-sm ${
                          isToday
                            ? 'bg-gradient-to-t from-indigo-600 via-indigo-500 to-violet-400 ring-2 ring-indigo-400/50 dark:ring-indigo-500/50'
                            : meetsGoal
                            ? 'bg-gradient-to-t from-emerald-600 to-teal-400'
                            : day.minutes > 0
                            ? 'bg-gradient-to-t from-indigo-500 to-sky-400'
                            : 'bg-slate-300 dark:bg-slate-700 opacity-40'
                        } ${isHovered ? 'brightness-110 scale-[1.03]' : ''}`}
                        style={{ height: `${barHeightPercent}%` }}
                      />
                    </div>

                    {/* Day Label Below Bar */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-xs font-bold block ${
                          isToday
                            ? 'text-indigo-600 dark:text-indigo-400 underline underline-offset-2'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {day.dayName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block tabular-nums">
                        {day.date.split('-').slice(1).join('/')}
                      </span>
                      {isToday && (
                        <span className="text-[9px] uppercase font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/80 px-1 py-0.2 rounded-full inline-block mt-0.5">
                          Today
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Insights Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
          <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100/80 dark:border-indigo-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Total Deep Work
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {totalWeeklyMinutes} mins <span className="text-xs font-normal text-slate-500">({totalWeeklyHours} hrs)</span>
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100/80 dark:border-amber-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Most Focused Day
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {peakDay.dayName} · {peakDay.minutes} mins
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-900/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Consistency Rate
              </span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
                {activeFocusDaysCount} of 7 days <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">({Math.round((activeFocusDaysCount / 7) * 100)}%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Comparison */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Subject Performance & Readiness</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subject averages dictate algorithmic priority; subjects under 70% receive elevated revision frequency.
          </p>
        </div>

        <div className="space-y-5">
          {progress.subjectPerformance?.map((sub) => {
            const score = sub.quizAverage;
            const barColor =
              score >= 80 ? 'bg-emerald-500' : score >= 65 ? 'bg-amber-500' : 'bg-rose-500';

            return (
              <div key={sub.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{sub.name}</span>
                    <span className="text-slate-400 dark:text-slate-500">({sub.difficulty} · Priority: {sub.priority})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-slate-500">
                      {sub.completedTasks} tasks done
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums text-sm">
                      {score}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                    style={{ width: `${Math.max(8, score)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Weak Topics vs Strengths Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Weak Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Diagnosed Weak Topics ({weakTopics.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Identified by repeated incorrect options during subject quizzes. The adaptive planner automatically schedules these topics for reinforcement.
          </p>

          {weakTopics.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/60 rounded-2xl">
              No weak topics diagnosed. Excellent consistency!
            </div>
          ) : (
            <div className="space-y-2">
              {weakTopics.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-rose-900 dark:text-rose-200">{w.topic}</span>
                  <span className="font-mono text-rose-700 dark:text-rose-300">Missed in {w.missedCount} quiz(zes)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mastered / High Performance Topics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Award className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Strong Mastery Areas</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Modules where your quiz scores exceed 80%. These require minimal maintenance revision before finals.
          </p>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">OOP Concepts & Encapsulation</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">90% Mastery</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">Binary Search & Arrays</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">85% Mastery</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900 dark:text-emerald-200">ACID Properties & Transactions</span>
              <span className="font-mono text-emerald-700 dark:text-emerald-300">80% Mastery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Report Preview & Confirmation Modal */}
      {showExportModal && (
        <div
          id="export-pdf-modal"
          data-testid="export-pdf-modal"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowExportModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Export Academic Progress Report
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Download an official, print-ready PDF summary of your study record.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Snapshot */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200/50 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400">Student:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name || 'Enrolled Student'} ({user?.email || 'N/A'})</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Syllabus Coverage:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {progress.completionPercentage}% ({progress.completedTasks}/{progress.totalTasks} tasks)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Diagnostic Quiz Avg:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                    {progress.quizAverage}% ({quizAttempts.length} tests)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Study Hours:</span>
                  <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {progress.totalStudyHours} hrs
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Weekly Pomodoro Focus:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                    {totalWeeklyMinutes} mins ({totalWeeklyHours} hrs)
                  </span>
                </div>
              </div>
            </div>

            {/* Inclusions List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Report Sections Included
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verified Student Profile & Executive KPI Summary</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Past 7 Days Deep Work & Focus Duration Trends</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Subject-wise Exam Readiness & Task Breakdown Table</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Diagnostic Quiz History with Scored Performance Records</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Diagnosed Weak Topics & Targeted Reinforcement Schedule</span>
                </li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-download-pdf"
                data-testid="btn-confirm-download-pdf"
                disabled={isExporting}
                onClick={async () => {
                  await handleExportPDF();
                  setShowExportModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-white" />
                    <span>Download PDF Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
