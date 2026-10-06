import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Clock, Volume2, Sparkles, X, Trash2 } from 'lucide-react';
import { AppNotification, notificationService } from '../services/notificationService';
import { StudyTask } from '../types';

interface NotificationBellProps {
  notifications: AppNotification[];
  upcomingTasks: StudyTask[];
  onClearNotifications: () => void;
  onSendTestReminder: () => void;
  onSimulateUpcomingTask?: () => void;
  onNavigateToPlanner?: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  upcomingTasks,
  onClearNotifications,
  onSendTestReminder,
  onSimulateUpcomingTask,
  onNavigateToPlanner,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>(() =>
    notificationService.getPermission()
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRequestPermission = async () => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    if (result === 'granted') {
      notificationService.playChime();
      notificationService.sendWebNotification('Notifications Enabled!', {
        body: 'You will now receive desktop alerts 15 minutes before study tasks are due.',
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        id="notification-bell-button"
        data-testid="notification-bell-button"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Study task notifications and 15-minute reminders"
        title="15-minute Study Task Reminders"
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Study Task Reminders
                </h3>
                <p className="text-[11px] text-slate-400">15-minute advance notice system</p>
              </div>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={onClearNotifications}
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1"
                title="Clear notifications"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Web Notification Permission Status Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                Browser Web Notification:
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  permission === 'granted'
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                    : permission === 'denied'
                    ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                }`}
              >
                {permission === 'granted'
                  ? 'Active / Allowed'
                  : permission === 'denied'
                  ? 'Blocked'
                  : 'Action Needed'}
              </span>
            </div>

            {permission !== 'granted' ? (
              <div className="space-y-1.5">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                  Allow browser notifications to receive desktop popups and chimes 15 minutes before tasks.
                </p>
                <button
                  onClick={handleRequestPermission}
                  className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Grant Notification Permission</span>
                </button>
              </div>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Web notifications will pop up 15 minutes before scheduled tasks.</span>
              </p>
            )}
          </div>

          {/* Action Quick Tools: Test Alert */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex gap-2">
            <button
              onClick={onSendTestReminder}
              className="flex-1 py-1.5 px-3 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              title="Test web notification and audio chime right now"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Test 15m Alert Now</span>
            </button>

            {onSimulateUpcomingTask && (
              <button
                onClick={onSimulateUpcomingTask}
                className="py-1.5 px-3 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                title="Create a task due in 15 minutes to test automatic polling"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Simulate 15m Task</span>
              </button>
            )}
          </div>

          {/* List of Recent Notifications / Upcoming Tasks */}
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors space-y-1"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {notif.title}
                    </span>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.subjectName && (
                    <span className="inline-block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                      {notif.subjectName}
                    </span>
                  )}
                </div>
              ))
            ) : upcomingTasks.length > 0 ? (
              <div className="p-3.5 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Upcoming Today Tasks:
                </span>
                {upcomingTasks.slice(0, 3).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between gap-2 text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                        {task.topic}
                      </span>
                      <span className="text-[11px] text-slate-400">{task.subjectName}</span>
                    </div>
                    <span className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg shrink-0">
                      {task.startTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 space-y-1">
                <Bell className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600" />
                <p className="text-xs font-medium">No recent notifications</p>
                <p className="text-[11px] text-slate-400">
                  Alerts will trigger 15 minutes before tasks.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {onNavigateToPlanner && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={() => {
                  onNavigateToPlanner();
                  setIsOpen(false);
                }}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View Full Study Planner Schedule →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
