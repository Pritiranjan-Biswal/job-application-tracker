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
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Job<span className="text-indigo-600">Tracker</span>
            </span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {isAuthenticated ? (
              <Link
                to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-500/20 transition-all hover:scale-105"
                >
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-300/30 via-purple-200/30 to-pink-200/20 blur-3xl -z-10 pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Full-Stack MERN Career Management Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Track applications. Ace interviews.{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Land your dream job.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A production-ready job search tracking system with stage timeline auditing, multi-round interview reminders, MongoDB aggregation analytics, and role-based access control.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-semibold text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105"
            >
              Start Tracking for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-base font-medium text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-xs"
            >
              Explore Live Demo
            </Link>
          </div>

          {/* Quick Demo Preview Stats Strip */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Stages</span>
              <p className="text-2xl font-bold text-slate-900 mt-1">7 Transitions</p>
              <p className="text-xs text-slate-500 mt-1">Applied &rarr; OA &rarr; Interview &rarr; Offer</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Security</span>
              <p className="text-2xl font-bold text-indigo-600 mt-1">JWT + Cookies</p>
              <p className="text-xs text-slate-500 mt-1">HTTP-only cookie protection</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Storage</span>
              <p className="text-2xl font-bold text-purple-600 mt-1">Cloudinary</p>
              <p className="text-xs text-slate-500 mt-1">Resume metadata & PDF storage</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">RBAC</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">User & Admin</p>
              <p className="text-xs text-slate-500 mt-1">Dual portal architecture</p>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-indigo-600 uppercase mb-2">
              Features & Engineering
            </h2>
            <h3 className="text-3xl font-bold text-slate-900">
              Everything required to ace and organize your job hunt
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Stage Timeline History</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatically logs and visualizes milestone progression from Initial Application to HackerRank OA, Technical Rounds, and Offer Letter.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <CalendarCheck2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Interview Scheduler</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Log multi-round interview dates, meeting links (Google Meet / Zoom), custom preparation notes, and receive automated email reminders.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Real-Time Aggregations</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Interactive charts powered by MongoDB Aggregation Framework & Recharts displaying conversion funnels, monthly velocity, and stage proportions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Bank-Grade Authentication</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Bcrypt password hashing, signed JWT stored in HTTP-only SameSite cookies, protection against XSS and CSRF vulnerabilities.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Cloudinary Resume Hub</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct resume uploads with Multer file validation, Cloudinary cloud integration, and one-click PDF downloading and linking.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Dedicated Admin Portal</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Full platform oversight: inspect active users, toggle suspensions, audit global application volume, and monitor platform health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-6">
            Engineered with Modern Technologies
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm font-semibold text-slate-300">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">React 18 & Vite</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Tailwind CSS</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Node.js & Express</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">MongoDB Atlas & Mongoose</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">JWT & HTTP-only Cookies</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Cloudinary SDK</span>
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700">Recharts</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} JobTracker App. Production-Grade MERN Stack Portfolio Project.</p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hover:text-indigo-600">Login</Link>
            <Link to="/signup" className="hover:text-indigo-600">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
