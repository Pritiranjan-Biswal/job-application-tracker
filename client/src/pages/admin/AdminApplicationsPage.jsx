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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Applications Audit</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cross-user oversight of all job applications logged across the platform
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search across all companies and job titles..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none w-full md:w-auto"
        >
          <option value="all">All Application Statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Applications Audit Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Auditing platform applications..." />
        </div>
      ) : applications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Applicant</th>
                  <th className="py-3.5 px-6">Company & Role</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Applied Date</th>
                  <th className="py-3.5 px-6">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-medium text-slate-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={app.userId?.name || 'User'}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <p className="font-bold text-xs text-slate-900">{app.userId?.name || 'Deleted User'}</p>
                          <p className="text-[11px] text-slate-400">{app.userId?.email || '-'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-900">
                      <div>
                        <span className="text-slate-900 font-bold">{app.companyName}</span>
                        <span className="block text-xs font-normal text-slate-500">{app.jobTitle}</span>
                      </div>
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

                    <td className="py-4 px-6 text-xs text-slate-500">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {app.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
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
