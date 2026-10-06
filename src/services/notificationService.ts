import { StudyTask } from '../types';

export interface AppNotification {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  subjectName?: string;
  topic?: string;
  scheduledTime?: string;
  timestamp: number;
  read: boolean;
  type: 'reminder_15m' | 'test' | 'info';
}

class NotificationService {
  private notifiedTasksSet: Set<string> = new Set();
  private storageKey = 'studymate_notified_reminders';
  private audioCtx: AudioContext | null = null;

  constructor() {
    this.loadNotifiedTasks();
  }

  private loadNotifiedTasks() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          this.notifiedTasksSet = new Set(arr);
        }
      }
    } catch {
      // ignore
    }
  }

  private persistNotifiedTasks() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(Array.from(this.notifiedTasksSet)));
    } catch {
      // ignore
    }
  }

  /**
   * Check if the browser supports the Web Notification API
   */
  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  /**
   * Current browser permission status
   */
  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  /**
   * Request browser permission to show web notifications
   */
  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (err) {
      console.warn('Notification.requestPermission error:', err);
      return Notification.permission;
    }
  }

  /**
   * Plays a pleasant chime sound using Web Audio API
   */
  public playChime() {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!this.audioCtx || this.audioCtx.state === 'closed') {
        this.audioCtx = new AudioContextClass();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: D5 (587.33 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0, now);
      gain1.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0, now + 0.12);
      gain2.gain.linearRampToValueAtTime(0.22, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {
      // Audio playback failed (e.g. user hasn't interacted with page yet)
    }
  }

  /**
   * Parses dates and various time formats (e.g. "16:00", "4:00 PM", "04:30 pm")
   */
  public parseTaskDateTime(scheduledDate: string, startTime: string): Date | null {
    if (!scheduledDate || !startTime) return null;
    try {
      const dateParts = scheduledDate.split('-');
      if (dateParts.length < 3) return null;
      const year = parseInt(dateParts[0], 10);
      const month = parseInt(dateParts[1], 10) - 1;
      const day = parseInt(dateParts[2], 10);

      const trimmed = startTime.trim();
      const isPM = /pm/i.test(trimmed);
      const isAM = /am/i.test(trimmed);
      const cleanTime = trimmed.replace(/am|pm/gi, '').trim();
      const timeParts = cleanTime.split(':');

      let hours = 0;
      let minutes = 0;

      if (timeParts.length >= 1) hours = parseInt(timeParts[0], 10);
      if (timeParts.length >= 2) minutes = parseInt(timeParts[1], 10);

      if (isPM && hours < 12) {
        hours += 12;
      } else if (isAM && hours === 12) {
        hours = 0;
      }

      const parsed = new Date(year, month, day, hours, minutes, 0, 0);
      return isNaN(parsed.getTime()) ? null : parsed;
    } catch {
      return null;
    }
  }

  /**
   * Get start Date of task
   */
  public getTaskStartDateTime(task: StudyTask): Date | null {
    return this.parseTaskDateTime(task.scheduledDate, task.startTime);
  }

  /**
   * Get due Date of task (scheduled start time + durationMinutes)
   */
  public getTaskDueDateTime(task: StudyTask): Date | null {
    const start = this.getTaskStartDateTime(task);
    if (!start) return null;
    const durationMs = (task.durationMinutes || 45) * 60 * 1000;
    return new Date(start.getTime() + durationMs);
  }

  /**
   * Check if this reminder was already dispatched
   */
  public hasBeenNotified(reminderKey: string): boolean {
    return this.notifiedTasksSet.has(reminderKey);
  }

  /**
   * Mark a reminder as dispatched
   */
  public markNotified(reminderKey: string) {
    this.notifiedTasksSet.add(reminderKey);
    this.persistNotifiedTasks();
  }

  /**
   * Clear all notified reminder keys (e.g. for testing)
   */
  public resetNotifiedHistory() {
    this.notifiedTasksSet.clear();
    this.persistNotifiedTasks();
  }

  /**
   * Send a system Native Web Notification
   */
  public sendWebNotification(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported() || this.getPermission() !== 'granted') {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (err) {
      console.warn('Failed to display native Web Notification:', err);
      return null;
    }
  }

  /**
   * Dispatches the 15-minute advance reminder
   */
  public dispatchTaskReminder(
    task: StudyTask,
    targetType: 'due' | 'start' = 'due'
  ): { title: string; message: string; notification: Notification | null } {
    const timeLabel = task.startTime;
    const typeLabel = targetType === 'due' ? 'is due in 15 minutes' : 'starts in 15 minutes';
    const title = `Study Reminder: ${task.topic}`;
    const message = `Your scheduled task for ${task.subjectName} ${typeLabel} (${timeLabel}). Get your notes ready!`;

    // 1. Play auditory chime
    this.playChime();

    // 2. Send Native Web Notification if permitted
    const notification = this.sendWebNotification(title, {
      body: message,
      tag: `task-15m-${task.id}-${targetType}`,
    });

    return { title, message, notification };
  }

  /**
   * Polls tasks and triggers 15-minute reminders
   */
  public checkAndNotifyTasks(
    tasks: StudyTask[],
    onReminderTriggered: (notification: AppNotification) => void
  ) {
    if (!tasks || tasks.length === 0) return;

    const now = Date.now();
    const fifteenMinMs = 15 * 60 * 1000;
    // Allow a 2-minute tolerance window around the 15-minute mark (13 to 17 minutes before)
    // or if the task is within 15 minutes in the future and hasn't been notified yet
    const minLeadMs = 13 * 60 * 1000;
    const maxLeadMs = 16 * 60 * 1000;

    tasks.forEach((task) => {
      if (task.status === 'Completed') return;

      // 1. Check reminder based on task DUE deadline (start + duration)
      const dueTime = this.getTaskDueDateTime(task);
      if (dueTime) {
        const diffDue = dueTime.getTime() - now;
        const dueKey = `reminder_due_15m_${task.id}_${task.scheduledDate}_${task.startTime}`;

        // Trigger if between 13 and 16 minutes before due, OR if within 15 minutes and hasn't been fired
        if (diffDue > 0 && diffDue <= maxLeadMs && diffDue >= minLeadMs - 60000) {
          if (!this.hasBeenNotified(dueKey)) {
            this.markNotified(dueKey);
            const res = this.dispatchTaskReminder(task, 'due');
            onReminderTriggered({
              id: `notif-${Date.now()}-${task.id}`,
              taskId: task.id,
              title: res.title,
              message: res.message,
              subjectName: task.subjectName,
              topic: task.topic,
              scheduledTime: task.startTime,
              timestamp: Date.now(),
              read: false,
              type: 'reminder_15m',
            });
          }
        }
      }

      // 2. Check reminder based on task START time
      const startTime = this.getTaskStartDateTime(task);
      if (startTime) {
        const diffStart = startTime.getTime() - now;
        const startKey = `reminder_start_15m_${task.id}_${task.scheduledDate}_${task.startTime}`;

        if (diffStart > 0 && diffStart <= maxLeadMs && diffStart >= minLeadMs - 60000) {
          if (!this.hasBeenNotified(startKey)) {
            this.markNotified(startKey);
            const res = this.dispatchTaskReminder(task, 'start');
            onReminderTriggered({
              id: `notif-${Date.now()}-${task.id}-start`,
              taskId: task.id,
              title: res.title,
              message: res.message,
              subjectName: task.subjectName,
              topic: task.topic,
              scheduledTime: task.startTime,
              timestamp: Date.now(),
              read: false,
              type: 'reminder_15m',
            });
          }
        }
      }
    });
  }
}

export const notificationService = new NotificationService();
