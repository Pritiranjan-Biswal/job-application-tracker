import React, { useState, useEffect } from 'react';
import applicationService from '../../services/applicationService';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import {
  TrendingUp,
  PieChart as PieIcon,
  Layers,
  Trophy,
  ArrowRight,
  Sparkles,
  BarChart3,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const STATUS_COLORS = {
  Applied: '#60a5fa',
  'Online Assessment': '#c084fc',
  'OA Cleared': '#22d3ee',
  Interview: '#fbbf24',
  Selected: '#34d399',
  Rejected: '#fb7185',
  Withdrawn: '#94a3b8',
};

export const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await applicationService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (error) {
        toast.error('Failed to load analytics: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [toast]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader size="lg" text="Aggregating pipeline metrics..." />
      </div>
    );
  }

  const total = stats?.totalApplications || 0;
  const oaCleared =
    (stats?.statusCounts?.['OA Cleared'] || 0) +
    (stats?.statusCounts?.['Interview'] || 0) +
    (stats?.statusCounts?.['Selected'] || 0);
  const interviews =
    (stats?.statusCounts?.['Interview'] || 0) + (stats?.statusCounts?.['Selected'] || 0);
  const selected = stats?.statusCounts?.['Selected'] || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hiring Funnel & Deep Analytics
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Real-time metrics computed directly by MongoDB Aggregation Pipelines
        </p>
      </div>

      {/* Top Conversion Funnel Cards */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl">
        <h2 className="text-base font-bold text-white mb-1">Career Conversion Funnel</h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">Stage-by-stage conversion velocity</p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-xs font-mono font-bold text-blue-400 uppercase">1. Total Logged</span>
            <p className="text-3xl font-extrabold text-white mt-2">{total}</p>
            <p className="text-xs text-blue-300 mt-1 font-mono">100% of pipeline</p>
          </div>

          <div className="p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">2. OA Cleared</span>
            <p className="text-3xl font-extrabold text-white mt-2">{oaCleared}</p>
            <p className="text-xs text-cyan-300 mt-1 font-mono">
              {total > 0 ? ((oaCleared / total) * 100).toFixed(1) : 0}% of submissions
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase">3. Interview Rate</span>
            <p className="text-3xl font-extrabold text-white mt-2">{interviews}</p>
            <p className="text-xs text-amber-300 mt-1 font-mono">
              {total > 0 ? ((interviews / total) * 100).toFixed(1) : 0}% interview rate
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase">4. Offers / Selected</span>
            <p className="text-3xl font-extrabold text-white mt-2">{selected}</p>
            <p className="text-xs text-emerald-300 mt-1 font-mono">
              {total > 0 ? ((selected / total) * 100).toFixed(1) : 0}% selection rate
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Momentum */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Application Velocity</h3>
              <p className="text-xs text-slate-400 mt-0.5">Month-over-month submission count</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '16px',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                />
                <Bar dataKey="applications" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Source Distribution */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Channel Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Where your applications originate</p>
            </div>
            <Compass className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-72 w-full">
            {stats?.sourceBreakdown && stats.sourceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.sourceBreakdown}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 8, 8, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No channel data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
