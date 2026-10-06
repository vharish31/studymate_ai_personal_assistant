import React, { useEffect, useState, useRef } from 'react';
import { Bell, Clock, X, ArrowRight, BookOpen } from 'lucide-react';
import { AppNotification } from '../services/notificationService';

interface NotificationToastProps {
  notification: AppNotification | null;
  onDismiss: () => void;
  onNavigateToPlanner?: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  onNavigateToPlanner,
}) => {
  const [progress, setProgress] = useState(100);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (!notification) {
      setProgress(100);
      return;
    }

    setProgress(100);
    const duration = 8000; // 8 seconds display
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPercent);
      if (remainingPercent <= 0) {
        clearInterval(progressInterval);
      }
    }, 100);

    const dismissTimeout = setTimeout(() => {
      onDismissRef.current();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(dismissTimeout);
    };
  }, [notification]);

  if (!notification) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-5 right-5 z-50 max-w-md w-full animate-slide-up shadow-2xl rounded-2xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-900/80 p-4 transition-colors overflow-hidden"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm relative">
          <Bell className="w-5 h-5 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>15-Minute Advance Alert</span>
              </span>
            </div>
            <button
              onClick={onDismiss}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 truncate">
            {notification.title}
          </h4>

          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
            {notification.message}
          </p>

          {notification.subjectName && (
            <div className="mt-2.5 flex items-center justify-between gap-2">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{notification.subjectName}</span>
              </span>

              {onNavigateToPlanner && (
                <button
                  onClick={() => {
                    onNavigateToPlanner();
                    onDismiss();
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  <span>Open Planner</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Progress countdown bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-indigo-600 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
