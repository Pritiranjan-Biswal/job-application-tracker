import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  TrendingUp,
  CalendarCheck2,
  FileText,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Lock,
  KanbanSquare,
  PlayCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[850px] h-[450px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[120px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-[800px] left-[-200px] w-[500px] h-[500px] bg-blue-600/10 blur-[140px] pointer-events-none -z-10 rounded-full" />
      <div className="absolute top-[1200px] right-[-200px] w-[600px] h-[600px] bg-purple-600/10 blur-[160px] pointer-events-none -z-10 rounded-full" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-[#070b14]/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white block">
                Job<span className="text-indigo-400">Tracker</span>
              </span>
              <span className="text-[10px] font-mono tracking-widest text-indigo-300 font-bold block">
                CAREER COPILOT
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 sm:pt-28 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 backdrop-blur-md shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Full-Stack MERN Career Acceleration Platform
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-tight sm:leading-none">
            Track Applications.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Master Interviews.
            </span>{' '}
            Land Top Offers.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
            The intelligent career tracking SaaS with **visual Kanban stage pipelines**, multi-round interview reminders, **MongoDB aggregation analytics**, and Cloudinary resume management.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl hover:from-indigo-500 hover:to-purple-500 shadow-xl shadow-indigo-500/30 transition-all hover:scale-105"
            >
              Start Free Tracking
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-sm font-semibold text-slate-300 bg-slate-900/80 border border-slate-700/80 rounded-2xl hover:bg-slate-800 hover:text-white transition-all shadow-md"
            >
              Explore Live Demo &rarr;
            </Link>
          </div>

          {/* Interactive Hero SaaS Preview Card */}
          <div className="mt-16 max-w-5xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-500 pointer-events-none" />
            
            <div className="relative glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/60 shadow-2xl text-left">
              {/* Fake Mac Window Controls */}
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="text-xs text-slate-400 font-mono ml-2">JobTracker Live Pipeline v2.0</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    ● MongoDB Aggregations Active
                  </span>
                </div>
              </div>

              {/* Sample Live Mockup Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Google</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                      Interview
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Software Engineer (L3)</p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>₹32 LPA &bull; Bangalore</span>
                    <span className="text-indigo-400 font-bold">Round 2</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Microsoft</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      Selected / Offer 🎉
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">SDE-1 (Azure Cloud)</p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>₹28 LPA &bull; Hyderabad</span>
                    <span className="text-emerald-400 font-bold">Accepted</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white">Amazon</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      OA Cleared
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">SDE Intern / FTE 2026</p>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <span>₹26 LPA &bull; Bangalore</span>
                    <span className="text-cyan-400 font-bold">2/2 Passed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 bg-[#0a0f1d]/90 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 uppercase block mb-2">
              Architecture & Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered to showcase full-stack mastery
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <KanbanSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Visual Kanban & Stage Pipeline</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Seamlessly move applications through 7 granular hiring stages with automated stage timeline history logging and audit trails.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Interview Manager & Links</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Multi-round technical interview scheduler with meeting launch buttons (Google Meet, Zoom), prep notes, and automated email alerts.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">MongoDB Aggregation Analytics</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Native MongoDB `$group` & `$match` aggregations powering Recharts conversion funnels, monthly velocity, and stage proportions.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-rose-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">HTTP-only Cookie Security</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Eliminates XSS vulnerabilities by keeping signed JWTs inside HTTP-only SameSite cookies; zero tokens stored in localStorage.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cloudinary Resume Hub</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Multer multipart uploads with automatic Cloudinary CDN delivery, PDF previews, and per-application resume associations.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Two-Tier RBAC & Admin Portal</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Dedicated admin oversight: monitor user metrics, manage account suspensions (`isBlocked`), and audit platform applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-[#05080f] border-t border-slate-800/80 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} JobTracker App. Production-Grade MERN Portfolio Project.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-white">Sign In</Link>
            <Link to="/signup" className="hover:text-white">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
