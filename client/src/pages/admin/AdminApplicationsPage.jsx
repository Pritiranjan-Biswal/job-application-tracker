import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import {
  Briefcase,
  Search,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Sparkles,
} from 'lucide-react';

const STATUS_LIST = [
  'Applied',
  'Online Assessment',
  'OA Cleared',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn',
];

export const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    limit: 10,
  });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const toast = useToast();

  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          ...(search.trim() && { search: search.trim() }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        };

        const res = await adminService.getAllApplications(params);
        if (res.success) {
          setApplications(res.applications);
          setPagination({
            currentPage: res.currentPage,
            totalPages: res.totalPages,
            totalApplications: res.totalApplications,
            limit: pagination.limit,
          });
        }
      } catch (error) {
        toast.error('Failed to load platform applications: ' + error.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, statusFilter, toast]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Platform Applications Audit</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Cross-user oversight of all job applications logged across the platform
        </p>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all companies and job titles..."
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 outline-none w-full md:w-auto"
        >
          <option value="all">All Application Statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Applications Audit Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" text="Auditing platform applications..." />
        </div>
      ) : applications.length > 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0f172a]/70 text-[11px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">Applicant</th>
                  <th className="py-4 px-6">Company & Position</th>
                  <th className="py-4 px-6">Stage</th>
                  <th className="py-4 px-6">Applied Date</th>
                  <th className="py-4 px-6">Channel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-medium text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={app.userId?.name || 'User'}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-sm text-white">{app.userId?.name || 'Deleted User'}</p>
                          <p className="text-xs text-slate-400 font-mono">{app.userId?.email || '-'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-bold text-white block">{app.companyName}</span>
                      <span className="text-xs text-slate-400 font-normal">{app.jobTitle}</span>
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

                    <td className="py-4 px-6 text-xs text-slate-400">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg font-mono">
                        {app.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-800">
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalApplications}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => fetchApplications(page)}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Briefcase}
          title="No applications found"
          description="No application records match your filter criteria."
          actionText="Reset Filter"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
          }}
        />
      )}
    </div>
  );
};

export default AdminApplicationsPage;
