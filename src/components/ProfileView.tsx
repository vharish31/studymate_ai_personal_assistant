import React, { useState } from 'react';
import { User } from '../types';
import { User as UserIcon, Clock, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onUpdateProfile: (data: {
    name?: string;
    dailyStudyHours?: number;
    preferredStartTime?: string;
    password?: string;
  }) => Promise<void>;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onUpdateProfile }) => {
  const [name, setName] = useState(user.name);
  const [dailyHours, setDailyHours] = useState(user.dailyStudyHours || 3);
  const [startTime, setStartTime] = useState(user.preferredStartTime || '16:00');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await onUpdateProfile({
        name,
        dailyStudyHours: dailyHours,
        preferredStartTime: startTime,
        password: newPassword ? newPassword : undefined,
      });
      setSuccess('Profile and study preferences updated successfully!');
      setNewPassword('');
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Profile & Preferences</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure daily study availability and account credentials.
        </p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-sm">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{user.name}</h3>
              <p className="text-xs text-slate-400">{user.email}</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Student Account · Enrolled in StudyMate AI
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Study Hours Allocation
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-sm font-bold text-slate-800 w-16 tabular-nums">
                    {dailyHours} hrs
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Preferred Daily Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Change Password (Leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="New password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              {saving ? 'Saving Changes...' : 'Save Preferences'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
