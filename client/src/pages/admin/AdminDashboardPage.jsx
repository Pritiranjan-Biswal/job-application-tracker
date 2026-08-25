import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import {
  Users,
  Briefcase,
  CalendarCheck2,
  Trophy,
  UserCheck,
  UserX,
  Shield,
  ArrowRight,
  TrendingUp,
  BarChart3,
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

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setStats(res.stats);
        }
      } catch (error) {
        toast.error('Failed to load admin stats: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading platform administration data..." />
      </div>
    );
  }

  const pieData = stats?.statusCounts
    ? Object.entries(stats.statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#a855f7',
        }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 uppercase tracking-wider">
              System Admin
            </span>
            <span className="text-xs text-slate-400">&bull; Oversight & Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Platform Health Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="px-4 py-2 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-sm shadow-purple-500/20 transition-all"
          >
            Manage Users
          </Link>
          <Link
            to="/admin/applications"
            className="px-4 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl shadow-2xs transition-all"
          >
            Explore Applications
          </Link>
        </div>
      </div>

      {/* Platform Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
          subtitle={`${stats?.activeUsers || 0} active, ${stats?.blockedUsers || 0} suspended`}
        />
        <StatCard
          title="Total Applications Logged"
          value={stats?.totalApplications || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="Across all platform users"
        />
        <StatCard
          title="Total Interviews Scheduled"
          value={stats?.totalInterviews || 0}
          icon={CalendarCheck2}
          color="amber"
          subtitle="Multi-round interview sessions"
        />
        <StatCard
          title="Total Job Offers Granted"
          value={stats?.totalSelected || 0}
          icon={Trophy}
          color="emerald"
          subtitle="Successful hiring candidates"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Growth Trend */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Growth Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">New developer registrations over last 6 months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.userGrowthTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#ffffff',
                    border: 'none',
                  }}
                />
                <Bar dataKey="users" fill="#9333ea" radius={[6, 6, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Application Status Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Platform Stage Distribution</h2>
              <p className="text-xs text-slate-500 mt-0.5">Application status breakdown across all users</p>
            </div>
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400">No application data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Top Companies Platform-wide */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">Top Companies Applied To Platform-Wide</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {stats?.topCompanies && stats.topCompanies.length > 0 ? (
            stats.topCompanies.map((item, idx) => (
              <div key={item.company} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">#{idx + 1}</span>
                <p className="text-sm font-bold text-slate-900 truncate">{item.company}</p>
                <p className="text-xs text-indigo-600 font-semibold mt-1">{item.count} applications</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">No company data available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
