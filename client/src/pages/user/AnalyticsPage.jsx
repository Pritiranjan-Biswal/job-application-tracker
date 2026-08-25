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
  Applied: '#3b82f6',
  'Online Assessment': '#a855f7',
  'OA Cleared': '#06b6d4',
  Interview: '#f59e0b',
  Selected: '#10b981',
  Rejected: '#f43f5e',
  Withdrawn: '#64748b',
};

const SOURCE_COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#3b82f6'];

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
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Aggregating hiring pipeline data..." />
      </div>
    );
  }

  // Format Status Donut Data
  const pieData = stats?.statusCounts
    ? Object.entries(stats.statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#6366f1',
        }))
    : [];

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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Hiring Analytics & Insights</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Detailed metrics, conversion funnel, and performance patterns computed directly with MongoDB aggregations
        </p>
      </div>

      {/* Top Conversion Funnel Cards */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">Hiring Conversion Funnel</h2>
        <p className="text-xs text-slate-500 mb-6">Stage-by-stage progression from submission to final job offer</p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-xs font-bold text-blue-900 uppercase">1. Total Applied</span>
            <p className="text-3xl font-extrabold text-blue-950 mt-2">{total}</p>
            <p className="text-xs text-blue-700 mt-1">100% of pipeline</p>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100">
            <span className="text-xs font-bold text-cyan-900 uppercase">2. OA Cleared</span>
            <p className="text-3xl font-extrabold text-cyan-950 mt-2">{oaCleared}</p>
            <p className="text-xs text-cyan-700 mt-1">
              {total > 0 ? ((oaCleared / total) * 100).toFixed(1) : 0}% of applied
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-xs font-bold text-amber-900 uppercase">3. Interviews</span>
            <p className="text-3xl font-extrabold text-amber-950 mt-2">{interviews}</p>
            <p className="text-xs text-amber-700 mt-1">
              {total > 0 ? ((interviews / total) * 100).toFixed(1) : 0}% interview rate
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-900 uppercase">4. Offers / Selected</span>
            <p className="text-3xl font-extrabold text-emerald-950 mt-2">{selected}</p>
            <p className="text-xs text-emerald-700 mt-1">
              {total > 0 ? ((selected / total) * 100).toFixed(1) : 0}% selection rate
            </p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applications Momentum */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Velocity</h3>
              <p className="text-xs text-slate-500 mt-0.5">Month-over-month submission count</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                  }}
                />
                <Bar dataKey="applications" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Source Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Application Channels</h3>
              <p className="text-xs text-slate-500 mt-0.5">Where your applications originate</p>
            </div>
            <Compass className="w-5 h-5 text-purple-600" />
          </div>

          <div className="h-72 w-full">
            {stats?.sourceBreakdown && stats.sourceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.sourceBreakdown}
                  layout="vertical"
                  margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
                >
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No source data available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
