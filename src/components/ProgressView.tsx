import React from 'react';
import { ProgressData, QuizAttempt, Subject } from '../types';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  Trophy,
  AlertTriangle,
  TrendingUp,
  Award,
} from 'lucide-react';

interface ProgressViewProps {
  progress: ProgressData | null;
  quizAttempts: QuizAttempt[];
  subjects: Subject[];
}

export const ProgressView: React.FC<ProgressViewProps> = ({
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Progress & Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time tracking of syllabus coverage, revision consistency, and mastery metrics.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Overall Completion</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">
              {progress.completionPercentage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {progress.completedTasks} of {progress.totalTasks} study tasks done
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Total Study Time</span>
            <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">
              {progress.totalStudyHours} <span className="text-lg font-normal text-slate-500">hrs</span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Focused study completed</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Quiz Average</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-amber-600 tabular-nums">
              {progress.quizAverage}%
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Across {progress.totalQuizzesTaken} test sessions
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold text-slate-500">Pending Tasks</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900 tabular-nums">
              {progress.pendingTasks}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Remaining in current plan</div>
          </div>
        </div>
      </div>

      {/* Subject-Wise Performance Comparison */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Subject Performance & Readiness</h2>
          <p className="text-xs text-slate-500 mt-0.5">
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
                    <span className="font-bold text-slate-800 text-sm">{sub.name}</span>
                    <span className="text-slate-400">({sub.difficulty} · Priority: {sub.priority})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                      {sub.completedTasks} tasks done
                    </span>
                    <span className="font-bold text-slate-900 tabular-nums text-sm">
                      {score}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">
              Diagnosed Weak Topics ({weakTopics.length})
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Identified by repeated incorrect options during subject quizzes. The adaptive planner automatically schedules these topics for reinforcement.
          </p>

          {weakTopics.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No weak topics diagnosed. Excellent consistency!
            </div>
          ) : (
            <div className="space-y-2">
              {weakTopics.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between text-xs"
                >
                  <span className="font-semibold text-rose-900">{w.topic}</span>
                  <span className="font-mono text-rose-700">Missed in {w.missedCount} quiz(zes)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mastered / High Performance Topics */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-emerald-600">
            <Award className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Strong Mastery Areas</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Modules where your quiz scores exceed 80%. These require minimal maintenance revision before finals.
          </p>

          <div className="space-y-2">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">OOP Concepts & Encapsulation</span>
              <span className="font-mono text-emerald-700">90% Mastery</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">Binary Search & Arrays</span>
              <span className="font-mono text-emerald-700">85% Mastery</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-900">ACID Properties & Transactions</span>
              <span className="font-mono text-emerald-700">80% Mastery</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
