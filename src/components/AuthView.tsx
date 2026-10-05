import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  ShieldCheck,
} from 'lucide-react';

interface AuthViewProps {
  mode: 'login' | 'register';
  onModeChange: (mode: 'login' | 'register') => void;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string, confirm: string) => Promise<void>;
  onClose?: () => void;
  isModal?: boolean;
}

export const AuthView: React.FC<AuthViewProps> = ({
  mode,
  onModeChange,
  onLogin,
  onRegister,
  onClose,
  isModal = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Clear fields and error when switching modes
  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [mode]);

  // Handle ESC key to close if modal
  useEffect(() => {
    if (!isModal || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModal, onClose]);

  const handleFillDemo = () => {
    setEmail('jashwanth@studymate.ai');
    setPassword('password123');
    setError(null);
  };

  const handleDirectDemoLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await onLogin('jashwanth@studymate.ai', 'password123');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide a valid email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (mode === 'register') {
      const cleanName = name.trim();
      if (!cleanName) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-type your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(cleanEmail, password);
      } else {
        await onRegister(name.trim(), cleanEmail, password, confirmPassword);
      }
      if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err.message || (mode === 'login' ? 'Invalid email or password.' : 'Failed to create account.'));
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/90 relative">
      {/* Modal Close Button */}
      {isModal && onClose && (
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header & Logo */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-sky-400 flex items-center justify-center text-white shadow-sm shadow-indigo-100">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome Back to StudyMate' : 'Create Free Student Account'}
          </h2>
          <p className="text-xs text-slate-500">
            {mode === 'login'
              ? 'Sign in to access your adaptive study schedule'
              : 'Sign up to get personalized plans and quizzes'}
          </p>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => onModeChange('login')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => onModeChange('register')}
          className={`py-2 text-xs font-bold rounded-xl transition-all ${
            mode === 'register'
              ? 'bg-white text-indigo-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-start gap-2.5 animate-shake">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <div className="flex-1 leading-relaxed">{error}</div>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl text-xs text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <div className="flex-1 leading-relaxed">{success}</div>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Harish Kumar"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Password <span className="text-rose-500">*</span>
            </label>
            {mode === 'register' && (
              <span className="text-[11px] text-slate-400">Min 6 characters</span>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50/60 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {mode === 'register' && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50/60 border rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-rose-300 focus:ring-rose-400'
                    : 'border-slate-200 focus:ring-indigo-500'
                }`}
              />
            </div>
            {confirmPassword && confirmPassword !== password && (
              <p className="text-[11px] text-rose-500 mt-1">Passwords do not match</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ArrowRight className="w-4 h-4" />
          )}
          <span>
            {loading
              ? mode === 'login'
                ? 'Signing in...'
                : 'Creating account...'
              : mode === 'login'
              ? 'Sign In to Workspace'
              : 'Create Free Account'}
          </span>
        </button>
      </form>

      {/* Demo Credentials Quick-Fill helper for easy evaluation */}
      {mode === 'login' && (
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Testing or Demo account:</span>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-2"
            >
              Fill Demo Credentials
            </button>
          </div>
          <button
            type="button"
            onClick={handleDirectDemoLogin}
            disabled={loading}
            className="w-full py-2 px-3 bg-violet-50 hover:bg-violet-100/80 text-violet-700 border border-violet-200/80 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-500" />
            <span>1-Click Sign In as Demo Student (Jashwanth)</span>
          </button>
        </div>
      )}

      {/* Switch Mode Footer */}
      <div className="text-center pt-4 mt-2">
        {mode === 'login' ? (
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <button
              type="button"
              onClick={() => onModeChange('register')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Create Account
            </button>
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => onModeChange('login')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Sign In
            </button>
          </p>
        )}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto animate-fade-in">
        {content}
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      {content}
    </div>
  );
};
