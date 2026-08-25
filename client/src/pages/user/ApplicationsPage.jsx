import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ApplicationFormModal from '../../components/applications/ApplicationFormModal';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  MoreVertical,
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

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    limit: 10,
  });

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [deletingAppId, setDeletingAppId] = useState(null);

  const toast = useToast();

  const fetchApplications = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          sort,
          ...(search.trim() && { search: search.trim() }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(jobTypeFilter !== 'all' && { jobType: jobTypeFilter }),
          ...(sourceFilter !== 'all' && { source: sourceFilter }),
        };

        const res = await applicationService.getApplications(params);
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
        toast.error('Failed to load applications: ' + error.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, sort, search, statusFilter, jobTypeFilter, sourceFilter, toast]
  );

  useEffect(() => {
    fetchApplications(1);
  }, [fetchApplications]);

  const handlePageChange = (newPage) => {
    fetchApplications(newPage);
  };

  const handleCreate = async (formData) => {
    try {
      const res = await applicationService.createApplication(formData);
      if (res.success) {
        toast.success('Job application created successfully!');
        fetchApplications(1);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleUpdate = async (formData) => {
    try {
      const res = await applicationService.updateApplication(editingApp._id, formData);
      if (res.success) {
        toast.success('Application updated!');
        fetchApplications(pagination.currentPage);
        setEditingApp(null);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      const res = await applicationService.updateApplication(appId, { status: newStatus });
      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setApplications((prev) =>
          prev.map((app) => (app._id === appId ? { ...app, status: newStatus } : app))
        );
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!deletingAppId) return;
    try {
      const res = await applicationService.deleteApplication(deletingAppId);
      if (res.success) {
        toast.success('Application deleted successfully.');
        setDeletingAppId(null);
        fetchApplications(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Job Applications</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage, filter, search, and track all your active job applications
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all hover:scale-102"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 sm:space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, location..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* View Mode Toggle & Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'cards' ? 'bg-white text-indigo-600 shadow-2xs font-semibold' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="company-asc">Company (A-Z)</option>
                <option value="company-desc">Company (Z-A)</option>
                <option value="followUpDate-asc">Follow-Up Date</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dropdown Filters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">STATUS</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="all">All Statuses</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">JOB TYPE</label>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="all">All Types</option>
              <option value="Full Time">Full Time</option>
              <option value="Internship">Internship</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
              <option value="Remote">Remote</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">SOURCE</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
            >
              <option value="all">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Indeed">Indeed</option>
              <option value="Naukri">Naukri</option>
              <option value="Referral">Referral</option>
              <option value="Company Portal">Company Portal</option>
              <option value="Campus Placement">Campus Placement</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setJobTypeFilter('all');
                setSourceFilter('all');
                setSort('newest');
              }}
              className="w-full py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors font-medium border border-transparent hover:border-slate-200"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View (Table vs Cards) */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading applications..." />
        </div>
      ) : applications.length > 0 ? (
        viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="py-3.5 px-6">Company</th>
                    <th className="py-3.5 px-6">Role & Details</th>
                    <th className="py-3.5 px-6">Stage</th>
                    <th className="py-3.5 px-6">Applied Date</th>
                    <th className="py-3.5 px-6">Source</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <Link
                          to={`/applications/${app._id}`}
                          className="text-base text-slate-900 hover:text-indigo-600 transition-colors"
                        >
                          {app.companyName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-normal mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium text-slate-800">{app.jobTitle}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span>{app.jobType}</span>
                          <span>&bull;</span>
                          <span className="text-slate-600 font-medium">{app.salary}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                          className="text-xs font-semibold rounded-lg px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-700 outline-none hover:bg-slate-100 cursor-pointer"
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
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

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/applications/${app._id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingApp(app)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAppId(app._id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalApplications}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        ) : (
          /* Card Grid View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <Link
                          to={`/applications/${app._id}`}
                          className="font-bold text-base text-slate-900 hover:text-indigo-600"
                        >
                          {app.companyName}
                        </Link>
                        <p className="text-xs font-medium text-slate-600 mt-0.5">{app.jobTitle}</p>
                      </div>
                      <Badge status={app.status} />
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 mt-4 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{app.location}</span>
                        <span className="text-slate-300">|</span>
                        <span>{app.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold text-slate-700">{app.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          Applied on{' '}
                          {new Date(app.appliedDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/applications/${app._id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Journey &rarr;
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingApp(app)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAppId(app._id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Component */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalApplications}
                itemsPerPage={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          </div>
        )
      ) : (
        <EmptyState
          title="No applications match your search"
          description="Try adjusting your filters or search keywords."
          actionText="Clear All Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
            setJobTypeFilter('all');
            setSourceFilter('all');
          }}
        />
      )}

      {/* Add Modal */}
      <ApplicationFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreate}
        title="Add Job Application"
      />

      {/* Edit Modal */}
      {editingApp && (
        <ApplicationFormModal
          isOpen={Boolean(editingApp)}
          onClose={() => setEditingApp(null)}
          onSubmit={handleUpdate}
          initialData={editingApp}
          title={`Edit ${editingApp.companyName} Application`}
        />
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingAppId)}
        onClose={() => setDeletingAppId(null)}
        onConfirm={handleDelete}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application and its associated timeline events and scheduled interviews? This action cannot be reversed."
      />
    </div>
  );
};

export default ApplicationsPage;
