import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import Badge from '../../components/common/Badge';
import {
  Users,
  Briefcase,
  CalendarCheck2,
  Trophy,
  ShieldCheck,
  UserX,
  TrendingUp,
  Building2,
  ArrowRight,
  Shield,
  Sparkles,
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

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getUsers({ limit: 5, sort: 'newest' }),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (usersRes.success) setRecentUsers(usersRes.users);
      } catch (error) {
        toast.error('Failed to load admin metrics: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader size="lg" text="Loading platform administration metrics..." />
      </div>
    );
  }

  const pieData = stats?.statusBreakdown
    ? Object.entries(stats.statusBreakdown)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#a855f7',
        }))
    : [];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/80 border border-purple-500/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-mono font-bold border border-purple-500/30 mb-2">
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              SYSTEM HEALTH & METRICS
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Platform Administration Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Global metrics, user accounts, and hiring statistics across all registered candidates
            </p>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/30 transition-all hover:scale-105"
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Registered Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="purple"
          subtitle={`${stats?.activeUsers || 0} Active / ${stats?.blockedUsers || 0} Suspended`}
        />
        <StatCard
          title="Platform Applications"
          value={stats?.totalApplications || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="All jobs tracked system-wide"
        />
        <StatCard
          title="Total Interviews"
          value={stats?.totalInterviews || 0}
          icon={CalendarCheck2}
          color="amber"
          subtitle="Rounds scheduled"
        />
        <StatCard
          title="Candidates Selected"
          value={stats?.totalSelected || 0}
          icon={Trophy}
          color="emerald"
          subtitle="Job offers accepted"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Velocity */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">User Growth Velocity</h2>
              <p className="text-xs text-slate-400 mt-0.5">New developer signups per month</p>
            </div>
            <TrendingUp className="w-5 h-5 text-purple-400" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.monthlyGrowth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <Bar dataKey="users" fill="#a855f7" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Status Distribution */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Global Status Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Cross-user stage distribution</p>
            </div>
            <Link to="/admin/applications" className="text-xs font-bold text-purple-400 hover:text-purple-300">
              Audit Applications &rarr;
            </Link>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-slate-500">No applications data recorded.</div>
            )}
          </div>
        </div>
      </div>

      {/* Top Companies & Recent Users Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Target Companies */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white">Top Applied Companies</h3>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>

          {stats?.topCompanies && stats.topCompanies.length > 0 ? (
            <div className="space-y-3">
              {stats.topCompanies.map((comp, idx) => (
                <div
                  key={comp._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/90 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-400 font-mono font-bold text-xs flex items-center justify-center border border-purple-500/30">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white">{comp._id}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-1 rounded-lg">
                    {comp.count} apps
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">No company metrics available.</p>
          )}
        </div>

        {/* Recent Registered Users (2 cols) */}
        <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recently Registered Users</h3>
            <Link to="/admin/users" className="text-xs font-bold text-purple-400 hover:text-purple-300">
              View All Users &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a]/70 font-mono uppercase text-slate-400 border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-white">
                      <Link to={`/admin/users/${u._id}`} className="hover:text-purple-400">
                        {u.name}
                      </Link>
                      <span className="block text-[11px] font-normal text-slate-400 font-mono">{u.email}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="uppercase text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <Badge status={u.isBlocked ? 'Blocked' : 'Active'} size="xs" />
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
