import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, User, Loader2, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setSubmitting(true);
    const res = await login({ email, password });
    setSubmitting(false);

    if (res.success) {
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  const fillUserDemo = () => {
    setEmail('demo@jobtracker.com');
    setPassword('Demo@123456');
  };

  const fillAdminDemo = () => {
    setEmail('admin@jobtracker.com');
    setPassword('Admin@123456');
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Sign in to your account to manage your applications
        </p>
      </div>

      {/* 1-Click Demo Fill Assistant */}
      <div className="mb-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            1-Click Demo Autofill
          </span>
          <span className="text-[10px] text-slate-400">Click to fill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillUserDemo}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900/90 text-indigo-300 rounded-xl border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
          >
            <User className="w-3.5 h-3.5" />
            Fresher User
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold bg-slate-900/90 text-purple-300 rounded-xl border border-purple-500/30 hover:bg-purple-600 hover:text-white transition-all shadow-xs"
          >
            <Shield className="w-3.5 h-3.5" />
            Admin Portal
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
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
              placeholder="name@example.com"
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm placeholder:text-slate-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Password
          </label>
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
              className="w-full pl-10 pr-10 py-2.5 glass-input rounded-xl text-sm placeholder:text-slate-500 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-3 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-[1.02]"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Authenticating...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-indigo-400 hover:text-indigo-300">
          Create account free &rarr;
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
