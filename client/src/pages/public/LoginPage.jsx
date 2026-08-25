import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, User, Loader2 } from 'lucide-react';

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

  // Demo auto-fill helpers
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
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
          Sign in to your account to manage your applications
        </p>
      </div>

      {/* Demo Credentials Quick-Fill Strip for Evaluators */}
      <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
            ⚡ Quick Demo Fill
          </span>
          <span className="text-[10px] text-indigo-600 font-medium">Click to autofill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={fillUserDemo}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white text-indigo-700 rounded-xl border border-indigo-200 hover:bg-indigo-50 transition-colors shadow-2xs"
          >
            <User className="w-3.5 h-3.5 text-indigo-600" />
            User Demo
          </button>
          <button
            type="button"
            onClick={fillAdminDemo}
            className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-white text-purple-700 rounded-xl border border-purple-200 hover:bg-purple-50 transition-colors shadow-2xs"
          >
            <Shield className="w-3.5 h-3.5 text-purple-600" />
            Admin Demo
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
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
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-md shadow-indigo-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-700">
          Create account free &rarr;
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
