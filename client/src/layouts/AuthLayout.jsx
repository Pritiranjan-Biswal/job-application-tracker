import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Briefcase, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Dynamic ambient background mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/15 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Briefcase className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-2xl font-extrabold tracking-tight text-white block">
              Job<span className="text-indigo-400">Tracker</span>
            </span>
            <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold block">
              FULL-STACK MERN SAAS
            </span>
          </div>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="glass-card py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-700/60 backdrop-blur-xl">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>HTTP-only JWT Protection &bull; Bcrypt Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
