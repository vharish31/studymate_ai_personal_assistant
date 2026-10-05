import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderArchive,
  CalendarDays,
  HelpCircle,
  BarChart3,
  Bot,
  User as UserIcon,
  Code2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'materials', label: 'Materials Library', icon: FolderArchive },
    { id: 'planner', label: 'Study Planner', icon: CalendarDays },
    { id: 'quizzes', label: 'Quizzes & Practice', icon: HelpCircle },
    { id: 'progress', label: 'Progress & Analytics', icon: BarChart3 },
    { id: 'coach', label: 'AI Study Coach', icon: Bot },
    { id: 'java-hub', label: 'Java Spring Boot PBL', icon: Code2, badge: 'Code' },
    { id: 'profile', label: 'Profile & Settings', icon: UserIcon },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200/80 flex flex-col justify-between py-6 px-4 hidden md:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-6">
        {/* User Mini Profile */}
        <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-800 truncate">{user.name}</h4>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50/80 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Info & Logout */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50/50 to-sky-50/50 border border-indigo-50/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
            <span>Adaptive Engine:</span>
            <span className="text-emerald-700">Active</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
            Auto-weights subjects based on exam proximity & quiz errors.
          </p>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
