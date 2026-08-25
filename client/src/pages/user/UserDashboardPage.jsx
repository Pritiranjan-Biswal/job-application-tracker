import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
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

export const UserDashboardPage = () => {
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
        applicationService.getApplications({ limit: 5, sort: 'newest' }),
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
      <div className="py-20 flex items-center justify-center">
        <Loader size="lg" text="Crunching your career analytics..." />
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

  const inProgressCount =
    (stats?.statusCounts?.['Online Assessment'] || 0) +
    (stats?.statusCounts?.['OA Cleared'] || 0) +
    (stats?.statusCounts?.['Interview'] || 0);

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Job Search Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time analytics, upcoming interview rounds, and application pipeline
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          Log Application
        </button>
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
          title="In Pipeline (OA / Interview)"
          value={inProgressCount}
          icon={Layers}
          color="amber"
          subtitle="Active stages requiring preparation"
        />
        <StatCard
          title="Offers / Selected"
          value={stats?.statusCounts?.Selected || 0}
          icon={Trophy}
          color="emerald"
          trend={`${stats?.selectionRate || 0}% Selection Rate`}
          trendType="positive"
        />
        <StatCard
          title="Interview Conversion"
          value={`${stats?.interviewConversionRate || 0}%`}
          icon={TrendingUp}
          color="purple"
          subtitle="Percentage reaching interviews"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Velocity Bar Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Velocity</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly applications submitted</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
              Last 6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            {stats?.monthlyTrend && stats.monthlyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#ffffff',
                      border: 'none',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="applications" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={45} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState title="No monthly data" description="Log applications to see your monthly momentum." />
            )}
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Status Breakdown</h2>
              <p className="text-xs text-slate-500 mt-0.5">Distribution across hiring stages</p>
            </div>
            <Link to="/analytics" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Deep-Dive &rarr;
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
              <EmptyState title="No status data" description="Start adding applications to populate charts." />
            )}
          </div>
        </div>
      </div>

      {/* Two Column: Upcoming Interviews & Follow-ups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Interviews Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Interviews</h2>
            </div>
            <Link to="/interviews" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              View All &rarr;
            </Link>
          </div>

          {stats?.upcomingInterviews && stats.upcomingInterviews.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingInterviews.map((interview) => (
                <div
                  key={interview._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 hover:bg-slate-100/70 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{interview.companyName}</span>
                      <span className="text-xs text-slate-500">&bull; {interview.round}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(interview.interviewDate).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="text-slate-300">|</span>
                      <span>{interview.interviewType}</span>
                    </div>
                  </div>

                  {interview.meetingLink && (
                    <a
                      href={interview.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Join
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              No interviews scheduled for the next 14 days.
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups Widget */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Upcoming Follow-Ups</h2>
            </div>
            <span className="text-xs text-slate-400">Scheduled Reminders</span>
          </div>

          {stats?.upcomingFollowUps && stats.upcomingFollowUps.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingFollowUps.map((app) => (
                <div
                  key={app._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <Link
                      to={`/applications/${app._id}`}
                      className="font-bold text-sm text-slate-900 hover:text-indigo-600"
                    >
                      {app.companyName}
                    </Link>
                    <p className="text-xs text-slate-500">{app.jobTitle}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
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
            <div className="py-8 text-center text-xs text-slate-400">
              No follow-ups due in the upcoming days.
            </div>
          )}
        </div>
      </div>

      {/* Recent Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">Latest jobs added to your tracking ledger</p>
          </div>
          <Link
            to="/applications"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View All ({stats?.totalApplications || 0})
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Company</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Applied Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <Link to={`/applications/${app._id}`} className="hover:text-indigo-600">
                        {app.companyName}
                      </Link>
                      <span className="block text-xs font-normal text-slate-400">{app.location}</span>
                    </td>
                    <td className="py-4 px-6 text-slate-700">
                      {app.jobTitle}
                      <span className="block text-xs text-slate-400">{app.salary}</span>
                    </td>
                    <td className="py-4 px-6">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(app.appliedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/applications/${app._id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Details
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
            title="No applications yet"
            description="Get started by logging your first job application."
            actionText="Add Application"
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
