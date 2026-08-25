import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Briefcase, ShieldCheck, Sparkles } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/70 via-slate-50/40 to-transparent -z-10 pointer-events-none" />
      <div className="absolute -top-24 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl -z-10" />
      <div className="absolute -bottom-24 left-10 w-96 h-96 bg-blue-200/40 rounded-full blur-3xl -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900">
            Job<span className="text-indigo-600">Tracker</span>
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 rounded-3xl border border-slate-200/80 backdrop-blur-sm">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} JobTracker. Built for high-growth software engineers.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
