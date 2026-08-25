import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ApplicationFormModal from '../../components/applications/ApplicationFormModal';
import {
  Briefcase,
  Layers,
  CalendarCheck2,
  Trophy,
  XCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  ExternalLink,
  Clock,
  Video,
  Target,
  Sparkles,
  Zap,
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

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApplications, setRecentApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const toast = useToast();

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, appsRes] = await Promise.all([
        applicationService.getDashboardStats(),
        applicationService.getApplications({ limit: 6, sort: 'newest' }),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (appsRes.success) setRecentApplications(appsRes.applications);
    } catch (error) {
      toast.error('Failed to load dashboard metrics: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateApplication = async (formData) => {
    try {
      const res = await applicationService.createApplication(formData);
      if (res.success) {
        toast.success('Job application logged successfully!');
        fetchDashboardData();
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader size="lg" text="Crunching career momentum metrics..." />
      </div>
    );
  }

  const pieData = stats?.statusCounts
    ? Object.entries(stats.statusCounts)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => ({
          name: status,
          value: count,
          color: STATUS_COLORS[status] || '#818cf8',
        }))
    : [];

  const inProgressCount =
    (stats?.statusCounts?.['Online Assessment'] || 0) +
    (stats?.statusCounts?.['OA Cleared'] || 0) +
    (stats?.statusCounts?.['Interview'] || 0);

  const targetMonthlyGoal = 25;
  const currentTotal = stats?.totalApplications || 0;
  const goalPercentage = Math.min(100, Math.round((currentTotal / targetMonthlyGoal) * 100));

  return (
    <div className="space-y-8">
      {/* Motivational Goal Progress Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-slate-900 border border-indigo-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              CAREER MOMENTUM: {goalPercentage}% OF MONTHLY GOAL
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Keep pushing, {user?.name?.split(' ')[0]}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              You have <span className="text-amber-400 font-bold">{inProgressCount} active applications</span> in your interview and OA pipeline. Consistency is the key to multiple offers.
            </p>

            {/* Goal progress bar */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Monthly Target: {targetMonthlyGoal} Submissions</span>
                <span className="text-indigo-400 font-bold">{currentTotal}/{targetMonthlyGoal} Logged</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${goalPercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
              Log Job Application
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          icon={Briefcase}
          color="indigo"
          subtitle="All recorded job submissions"
        />
        <StatCard
          title="Active in Pipeline"
          value={inProgressCount}
          icon={Layers}
          color="amber"
          subtitle="OA & Interview stage"
        />
        <StatCard
          title="Offers / Selected"
          value={stats?.statusCounts?.Selected || 0}
          icon={Trophy}
          color="emerald"
          trend={`${stats?.selectionRate || 0}% Offer Rate`}
          trendType="positive"
        />
        <StatCard
          title="Interview Conversion"
          value={`${stats?.interviewConversionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Reaching technical rounds"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Velocity Bar Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Application Velocity</h2>
              <p className="text-xs text-slate-400 mt-0.5">Month-over-month submission velocity</p>
            </div>
            <span className="text-xs font-mono font-bold px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded-xl">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            {stats?.monthlyTrend && stats.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '16px',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    }}
                    cursor={{ fill: 'rgba(99,102,241,0.08)' }}
                  />
                  <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No monthly records" description="Log your applications to see visual trends." />
            )}
          </div>
        </div>

        {/* Status Breakdown Donut Chart */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Status Breakdown</h2>
              <p className="text-xs text-slate-400 mt-0.5">Distribution across 7 hiring stages</p>
            </div>
            <Link to="/analytics" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              Deep Analytics &rarr;
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
              <EmptyState title="No pipeline data" description="Log applications to render stage breakdown." />
            )}
          </div>
        </div>
      </div>

      {/* Two Column: Upcoming Interviews & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews Widget */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Upcoming Interviews</h2>
            </div>
            <Link to="/interviews" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              View All &rarr;
            </Link>
          </div>

          {stats?.upcomingInterviews && stats.upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-start justify-between gap-3 hover:border-indigo-500/30 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{interview.companyName}</span>
                      <span className="text-xs text-slate-400">&bull; {interview.round}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {new Date(interview.interviewDate).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-slate-600">|</span>
                      <span>{interview.interviewType}</span>
                    </div>
                  </div>

                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No interview rounds scheduled in the immediate horizon.
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups Widget */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800/80 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-white">Upcoming Follow-Ups</h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Scheduled Dates</span>
          </div>

          {stats?.upcomingFollowUps && stats.upcomingFollowUps.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingFollowUps.map((app) => (
                <div
                  key={app._id}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center justify-between gap-3"
                >
                  <div>
                    <Link
                      to={`/applications/${app._id}`}
                      className="font-bold text-sm text-white hover:text-indigo-400"
                    >
                      {app.companyName}
                    </Link>
                    <p className="text-xs text-slate-400">{app.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl">
                      Due{' '}
                      {new Date(app.followUpDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500">
              No follow-ups due in the upcoming days.
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications Ledger */}
      <div className="glass-card rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">Recent Submissions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your latest logged applications</p>
          </div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
          >
            Full Ledger ({stats?.totalApplications || 0})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0f172a]/60 text-[11px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Position</th>
                  <th className="py-4 px-6">Stage</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <Link to={`/applications/${app._id}`} className="hover:text-indigo-400">
                        {app.companyName}
                      </Link>
                      <span className="block text-xs font-normal text-slate-500">{app.location}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-300">
                      {app.jobTitle}
                      <span className="block text-xs text-slate-500 font-mono">{app.salary}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(app.appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/applications/${app._id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 px-3 py-1.5 rounded-xl transition-colors"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No applications logged"
            description="Start tracking your career opportunities now."
            actionText="Add First Application"
            onAction={() => setModalOpen(true)}
          />
        )}
      </div>

      {/* Add Application Modal */}
      <ApplicationFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateApplication}
        title="Log New Job Application"
      />
    </div>
  );
};

export default UserDashboardPage;
