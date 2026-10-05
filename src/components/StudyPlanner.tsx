import React, { useState } from 'react';
import { StudyTask, Subject, User } from '../types';
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Filter,
  Check,
} from 'lucide-react';

interface StudyPlannerProps {
  user: User;
  subjects: Subject[];
  studyTasks: StudyTask[];
  onGeneratePlan: (dailyHours: number, startTime: string) => Promise<void>;
  onUpdateTaskStatus: (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
}

export const StudyPlanner: React.FC<StudyPlannerProps> = ({
  user,
  subjects,
  studyTasks,
  onGeneratePlan,
  onUpdateTaskStatus,
}) => {
  const [dailyHours, setDailyHours] = useState<number>(user.dailyStudyHours || 3.5);
  const [startTime, setStartTime] = useState<string>(user.preferredStartTime || '16:00');
  const [generating, setGenerating] = useState(false);
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await onGeneratePlan(dailyHours, startTime);
    } finally {
      setGenerating(false);
    }
  };

  // Group tasks by Date (next 7 days)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      offset: i,
      dateStr: d.toISOString().split('T')[0],
      dayName: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
      displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    };
  });

  const activeDate = days[selectedDayOffset]?.dateStr || days[0].dateStr;

  const currentTasks = studyTasks.filter((t) => {
    const dateMatch = t.scheduledDate === activeDate;
    const subMatch = filterSubject === 'all' || t.subjectId === filterSubject;
    return dateMatch && subMatch;
  });

  const handleToggle = async (task: StudyTask) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    await onUpdateTaskStatus(task.id, nextStatus);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner & Generation Controller */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Adaptive Algorithm Powered
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Intelligent Weekly Study Plan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl">
            Schedules are dynamically prioritized: high weakness & approaching exams receive longer revision blocks and prime study hours.
          </p>
        </div>

        {/* Plan Parameters Controls */}
        <div className="flex flex-wrap items-center gap-4 bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/70 dark:border-slate-700 transition-colors">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Daily Study Target
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 w-12 tabular-nums">
                {dailyHours} hrs
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-end"
          >
            <RotateCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Calculating Weights...' : 'Regenerate Plan'}</span>
          </button>
        </div>
      </div>

      {/* Day Selector Tabs (Canva-style segmented buttons) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((d) => {
          const isSelected = selectedDayOffset === d.offset;
          const dayTasks = studyTasks.filter((t) => t.scheduledDate === d.dateStr);
          const completedCount = dayTasks.filter((t) => t.status === 'Completed').length;

          return (
            <button
              key={d.offset}
              onClick={() => setSelectedDayOffset(d.offset)}
              className={`px-4 py-3 rounded-2xl text-left transition-all shrink-0 border ${
                isSelected
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              <div className="text-xs font-semibold">{d.dayName}</div>
              <div
                className={`text-[11px] mt-0.5 ${
                  isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-400'
                }`}
              >
                {d.displayDate}
              </div>
              <div className="mt-2 text-[10px] font-mono">
                {dayTasks.length > 0 ? (
                  <span
                    className={
                      completedCount === dayTasks.length && dayTasks.length > 0
                        ? 'text-emerald-300 font-bold'
                        : isSelected
                        ? 'text-indigo-200'
                        : 'text-slate-500 dark:text-slate-400'
                    }
                  >
                    {completedCount}/{dayTasks.length} Done
                  </span>
                ) : (
                  <span className={isSelected ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-400'}>
                    Free Day
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter and Content Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Schedule for {days[selectedDayOffset]?.dayName} ({days[selectedDayOffset]?.displayDate})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentTasks.length} tasks scheduled · Check off tasks as you finish them
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-400">Filter Subject:</span>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {currentTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarDays className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No tasks scheduled for this day or filter.
            </p>
            <button
              onClick={handleGenerate}
              className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Generate Weekly Schedule
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {currentTasks.map((task) => {
              const isCompleted = task.status === 'Completed';

              return (
                <div
                  key={task.id}
                  className={`p-5 flex items-center justify-between gap-4 transition-colors ${
                    isCompleted
                      ? 'bg-slate-50/50 dark:bg-slate-800/30'
                      : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500 bg-white dark:bg-slate-800 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            isCompleted
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.topic}
                        </span>
                        {task.priority === 'High' && (
                          <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                            High Priority
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-400 mt-1">
                        <span className="font-medium text-slate-600 dark:text-slate-300">{task.subjectName}</span>
                        <span>·</span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">{task.startTime}</span>
                        <span>·</span>
                        <span>{task.durationMinutes} minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        task.status === 'Completed'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : task.status === 'In Progress'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mathematical Algorithm Proof Box for PBL evaluation */}
      <div className="p-6 rounded-3xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3 transition-colors">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>College PBL Feature: The Adaptive Multi-Factor Scheduling Formula</span>
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The study plan is mathematically determined using:
          <code className="mx-1 px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-indigo-700 dark:text-indigo-300">
            TotalWeight = W_exam × W_priority × W_difficulty × W_quizWeakness
          </code>
          . When quiz scores drop below 60%, the system automatically flags missed topics and schedules urgent revision slots prior to approaching exams.
        </p>
      </div>
    </div>
  );
};
