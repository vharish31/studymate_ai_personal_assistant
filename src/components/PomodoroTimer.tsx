import React, { useState, useEffect, useRef } from 'react';
import { StudyTask } from '../types';
import { notificationService } from '../services/notificationService';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  Sparkles,
  Volume2,
  Flame,
  Award,
} from 'lucide-react';

interface PomodoroTimerProps {
  task: StudyTask;
  onLogFocus: (taskId: string, minutes: number, completeTask: boolean) => Promise<any>;
  onTaskStatusChange?: (taskId: string, status: 'Pending' | 'In Progress' | 'Completed') => Promise<void>;
  className?: string;
}

type TimerPreset = 25 | 50 | 5 | 'task';

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({
  task,
  onLogFocus,
  onTaskStatusChange,
  className = '',
}) => {
  // Preset selection: default 25 minutes (standard Pomodoro)
  const [selectedPreset, setSelectedPreset] = useState<TimerPreset>(25);
  
  // Timer duration in seconds based on preset
  const getInitialSeconds = (preset: TimerPreset): number => {
    if (preset === 'task') return (task.durationMinutes || 25) * 60;
    return preset * 60;
  };

  const [initialSeconds, setInitialSeconds] = useState<number>(() => getInitialSeconds(25));
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [markTaskComplete, setMarkTaskComplete] = useState<boolean>(true);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [logSuccessMsg, setLogSuccessMsg] = useState<string | null>(null);

  // Interval reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevTaskIdRef = useRef<string>(task.id);

  // If active task changes, update duration if preset was 'task' and reset if not running
  useEffect(() => {
    if (prevTaskIdRef.current !== task.id) {
      prevTaskIdRef.current = task.id;
      if (!isRunning) {
        const secs = getInitialSeconds(selectedPreset);
        setInitialSeconds(secs);
        setTimeLeft(secs);
        setElapsedSeconds(0);
        setIsCompleted(false);
        setLogSuccessMsg(null);
      }
    }
  }, [task.id, task.durationMinutes, selectedPreset, isRunning]);

  // Main countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimerCompletion();
            return 0;
          }
          return prev - 1;
        });
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, initialSeconds]);

  // Handle natural timer completion (hits 00:00)
  const handleTimerCompletion = () => {
    setIsRunning(false);
    setIsCompleted(true);
    
    // Play celebratory audio chime
    try {
      notificationService.playChime();
    } catch {
      // Audio fallback
    }

    // Web notification if supported and granted
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const mins = Math.max(1, Math.round(initialSeconds / 60));
        new Notification(`🎯 Focus Session Finished!`, {
          body: `Superb! You finished ${mins} focus minutes on "${task.topic}". Log your session to update your progress!`,
          icon: '/favicon.ico',
        });
      }
    } catch {
      // ignore
    }
  };

  // Change preset duration
  const handleSelectPreset = (preset: TimerPreset) => {
    if (isRunning) return; // Prevent changing preset mid-countdown
    setSelectedPreset(preset);
    const secs = getInitialSeconds(preset);
    setInitialSeconds(secs);
    setTimeLeft(secs);
    setElapsedSeconds(0);
    setIsCompleted(false);
    setLogSuccessMsg(null);
  };

  // Start timer
  const handleStart = () => {
    if (timeLeft === 0) {
      // Restart if at zero
      setTimeLeft(initialSeconds);
      setElapsedSeconds(0);
      setIsCompleted(false);
    }
    setIsRunning(true);
    setLogSuccessMsg(null);

    // If task is Pending, automatically set it to In Progress
    if (task.status === 'Pending' && onTaskStatusChange) {
      onTaskStatusChange(task.id, 'In Progress').catch(() => {});
    }
  };

  // Pause timer
  const handlePause = () => {
    setIsRunning(false);
  };

  // Reset timer
  const handleReset = () => {
    setIsRunning(false);
    const secs = getInitialSeconds(selectedPreset);
    setTimeLeft(secs);
    setElapsedSeconds(0);
    setIsCompleted(false);
  };

  // Log focused minutes to progress record
  const handleLogProgress = async () => {
    // Total focused minutes: if completed naturally, initialSeconds / 60;
    // if manual early complete, elapsedSeconds / 60 (minimum 1 minute)
    const minutesToLog = isCompleted
      ? Math.max(1, Math.round(initialSeconds / 60))
      : Math.max(1, Math.round(elapsedSeconds / 60));

    setIsLogging(true);
    try {
      await onLogFocus(task.id, minutesToLog, markTaskComplete);
      setLogSuccessMsg(`Logged ${minutesToLog} focused min to your progress record!`);
      setIsCompleted(false);
      setIsRunning(false);
      
      // Reset timer for the next cycle
      const secs = getInitialSeconds(selectedPreset);
      setTimeLeft(secs);
      setElapsedSeconds(0);
    } catch (err: any) {
      console.error('Failed to log focus minutes:', err);
    } finally {
      setIsLogging(false);
    }
  };

  // Formatting utilities
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // SVG Progress Ring calculation
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius; // ~326.7
  const progressRatio = initialSeconds > 0 ? (initialSeconds - timeLeft) / initialSeconds : 0;
  const strokeDashoffset = ringCircumference * (1 - progressRatio);

  return (
    <div
      id="pomodoro-focus-timer"
      data-testid="pomodoro-focus-timer"
      className={`relative bg-gradient-to-br from-white via-indigo-50/20 to-violet-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/30 rounded-3xl p-6 border border-indigo-100 dark:border-slate-800 shadow-sm transition-all ${className}`}
    >
      {/* Header bar with Mode Badge & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <Flame className="w-4 h-4 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pomodoro Focus Timer</h4>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  isRunning
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : timeLeft < initialSeconds && !isCompleted
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                }`}
              >
                {isRunning ? '● Focusing' : timeLeft < initialSeconds && !isCompleted ? 'Paused' : isCompleted ? 'Completed' : 'Ready'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Target: <span className="font-semibold text-slate-700 dark:text-slate-200">{task.topic}</span>
            </p>
          </div>
        </div>

        {/* Preset Selector buttons */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSelectPreset(25)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedPreset === 25
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="Standard 25 min Pomodoro"
          >
            25m Focus
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSelectPreset('task')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedPreset === 'task'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={`Match task duration (${task.durationMinutes}m)`}
          >
            {task.durationMinutes}m Task
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSelectPreset(50)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedPreset === 50
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="50 min Deep Work"
          >
            50m Deep
          </button>
          <button
            type="button"
            disabled={isRunning}
            onClick={() => handleSelectPreset(5)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedPreset === 5
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
            title="5 min Rest"
          >
            5m Rest
          </button>
        </div>
      </div>

      {/* Main Timer Display & SVG Ring */}
      <div className="py-6 flex flex-col md:flex-row items-center justify-around gap-6">
        {/* Circular SVG Ring & Time Overlay */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-40 h-40 -rotate-90" viewBox="0 0 130 130">
            {/* Background circle track */}
            <circle
              cx="65"
              cy="65"
              r={ringRadius}
              className="stroke-slate-100 dark:stroke-slate-800"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated progress ring */}
            <circle
              cx="65"
              cy="65"
              r={ringRadius}
              stroke="url(#pomodoroTimerGradient)"
              strokeWidth="8"
              strokeDasharray={ringCircumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-500 ease-out"
            />
            <defs>
              <linearGradient id="pomodoroTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F43F5E" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Large Digits Overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span
              id="pomodoro-timer-digits"
              data-testid="pomodoro-timer-digits"
              className="text-3xl font-extrabold tracking-tight font-mono tabular-nums text-slate-900 dark:text-white select-none"
            >
              {formattedTime}
            </span>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">
              {isRunning ? 'Remaining' : isCompleted ? 'Finished' : 'Duration'}
            </span>
          </div>
        </div>

        {/* Timer Control Buttons (Start, Pause, Reset) */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2.5">
            {!isRunning ? (
              <button
                id="pomodoro-start-btn"
                data-testid="pomodoro-start-btn"
                type="button"
                onClick={handleStart}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/30 active:scale-95 transition-all flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{timeLeft < initialSeconds && !isCompleted ? 'Resume Focus' : 'Start Focus'}</span>
              </button>
            ) : (
              <button
                id="pomodoro-pause-btn"
                data-testid="pomodoro-pause-btn"
                type="button"
                onClick={handlePause}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </button>
            )}

            {/* Reset Button */}
            <button
              id="pomodoro-reset-btn"
              data-testid="pomodoro-reset-btn"
              type="button"
              onClick={handleReset}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 active:scale-95"
              title="Reset timer to start"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Quick Log Action (available whenever elapsed time >= 1 min or timer completed) */}
          {(elapsedSeconds >= 60 || isCompleted) && (
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 w-full">
              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={markTaskComplete}
                  onChange={(e) => setMarkTaskComplete(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Mark "{task.topic}" as Completed when logging</span>
              </label>

              <button
                id="pomodoro-log-btn"
                data-testid="pomodoro-log-btn"
                type="button"
                disabled={isLogging}
                onClick={handleLogProgress}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>
                  {isLogging
                    ? 'Logging...'
                    : `Log ${
                        isCompleted
                          ? Math.max(1, Math.round(initialSeconds / 60))
                          : Math.max(1, Math.round(elapsedSeconds / 60))
                      } min to Progress Record`}
                </span>
              </button>
            </div>
          )}

          {/* Success Banner */}
          {logSuccessMsg && (
            <div className="w-full p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2 animate-fade-in">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{logSuccessMsg}</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Banner if timer naturally hit 00:00 */}
      {isCompleted && !logSuccessMsg && (
        <div className="mt-2 p-3.5 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-emerald-950/40 rounded-2xl border border-indigo-200 dark:border-emerald-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                Pomodoro Cycle Complete! 🎉
              </h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                You focused for {Math.max(1, Math.round(initialSeconds / 60))} minutes. Click log to save to your progress record.
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isLogging}
            onClick={handleLogProgress}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            {isLogging ? 'Logging...' : 'Log & Save Minutes'}
          </button>
        </div>
      )}
    </div>
  );
};
