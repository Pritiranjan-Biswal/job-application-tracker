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
  KanbanSquare,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  ChevronRight,
  MoreVertical,
  MoveRight,
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

const KANBAN_STAGES = [
  { id: 'Applied', title: 'Applied', color: 'border-blue-500/40 text-blue-400 bg-blue-500/10' },
  { id: 'Online Assessment', title: 'Online Assessment', color: 'border-purple-500/40 text-purple-400 bg-purple-500/10' },
  { id: 'OA Cleared', title: 'OA Cleared', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-500/10' },
  { id: 'Interview', title: 'Interview Rounds', color: 'border-amber-500/40 text-amber-400 bg-amber-500/10' },
  { id: 'Selected', title: 'Offers / Selected 🎉', color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10' },
];

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalApplications: 0,
    limit: 12,
  });

  // Filters state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table' | 'cards'

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
          limit: viewMode === 'kanban' ? 50 : pagination.limit,
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
    [pagination.limit, viewMode, sort, search, statusFilter, jobTypeFilter, sourceFilter, toast]
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
        toast.success(`Moved to ${newStatus}!`);
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
        toast.success('Application deleted.');
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Job Applications Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visual Kanban stage board, data table, and multi-criteria filters
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      {/* Filter and View Switcher Toolbar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by company, role, location..."
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-xs sm:text-sm outline-none"
            />
          </div>

          {/* View Mode Toggle & Sort */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-between">
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'kanban'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                Table
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="w-4 h-4 text-slate-400" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 outline-none"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">STAGE</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
            >
              <option value="all">All Stages</option>
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">JOB TYPE</label>
            <select
              value={jobTypeFilter}
              onChange={(e) => setJobTypeFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
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
            <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">SOURCE</label>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 outline-none"
            >
              <option value="all">All Channels</option>
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
              className="w-full py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors font-bold border border-transparent hover:border-slate-700"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View (Kanban vs Table vs Cards) */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" text="Loading applications pipeline..." />
        </div>
      ) : applications.length > 0 ? (
        viewMode === 'kanban' ? (
          /* ========================================================= */
          /* 1. VISUAL KANBAN PIPELINE BOARD                          */
          /* ========================================================= */
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-[1100px] items-start">
              {KANBAN_STAGES.map((column) => {
                const columnApps = applications.filter((a) => {
                  if (column.id === 'Selected') return a.status === 'Selected';
                  return a.status === column.id;
                });

                return (
                  <div
                    key={column.id}
                    className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-3xl p-4 flex flex-col min-h-[500px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                      <span className="text-xs font-extrabold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${column.color.split(' ')[2]}`} />
                        {column.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-800 text-slate-300">
                        {columnApps.length}
                      </span>
                    </div>

                    {/* Column Items Stack */}
                    <div className="space-y-3 flex-1 overflow-y-auto">
                      {columnApps.map((app) => (
                        <div
                          key={app._id}
                          className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 transition-all shadow-md group relative"
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Link
                              to={`/applications/${app._id}`}
                              className="font-bold text-sm text-white hover:text-indigo-400 truncate"
                            >
                              {app.companyName}
                            </Link>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                              {app.priority}
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 mb-2 font-medium">{app.jobTitle}</p>

                          <div className="space-y-1 text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800/80">
                            <div className="flex items-center justify-between">
                              <span>{app.salary}</span>
                              <span>{app.location}</span>
                            </div>
                            <div className="flex items-center justify-between text-slate-500">
                              <span>via {app.source}</span>
                              <span>{new Date(app.appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>

                          {/* Quick Stage Progression buttons */}
                          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                            <Link
                              to={`/applications/${app._id}`}
                              className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                            >
                              Journey &rarr;
                            </Link>

                            <select
                              value={app.status}
                              onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                              className="text-[10px] font-bold bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-300 outline-none cursor-pointer"
                            >
                              {STATUS_LIST.map((s) => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}

                      {columnApps.length === 0 && (
                        <div className="py-12 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-2xl">
                          No applications in this stage
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === 'table' ? (
          /* ========================================================= */
          /* 2. DATA TABLE VIEW                                        */
          /* ========================================================= */
          <div className="glass-card rounded-3xl border border-slate-800/80 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-[#0f172a]/70 text-[11px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-6">Company</th>
                    <th className="py-4 px-6">Position</th>
                    <th className="py-4 px-6">Stage</th>
                    <th className="py-4 px-6">Applied Date</th>
                    <th className="py-4 px-6">Channel</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {applications.map((app) => (
                    <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-white">
                        <Link to={`/applications/${app._id}`} className="text-white hover:text-indigo-400">
                          {app.companyName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-normal mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{app.location}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-200">{app.jobTitle}</span>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-mono">
                          <span>{app.jobType}</span>
                          <span>&bull;</span>
                          <span className="text-indigo-300 font-bold">{app.salary}</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusChange(app._id, e.target.value)}
                          className="text-xs font-bold rounded-xl px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-200 outline-none hover:border-indigo-500 cursor-pointer"
                        >
                          {STATUS_LIST.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                        {new Date(app.appliedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-400">
                        <span className="px-2.5 py-1 bg-slate-800/80 border border-slate-700 text-slate-300 rounded-lg font-mono">
                          {app.source}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/applications/${app._id}`}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                            title="View Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingApp(app)}
                            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAppId(app._id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
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

            {/* Pagination */}
            <div className="p-4 border-t border-slate-800">
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
          /* ========================================================= */
          /* 3. CARD GRID VIEW                                         */
          /* ========================================================= */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <div
                  key={app._id}
                  className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <Link
                          to={`/applications/${app._id}`}
                          className="font-bold text-base text-white hover:text-indigo-400"
                        >
                          {app.companyName}
                        </Link>
                        <p className="text-xs text-slate-300 font-medium mt-0.5">{app.jobTitle}</p>
                      </div>
                      <Badge status={app.status} />
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 font-mono mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{app.location}</span>
                        <span className="text-slate-600">|</span>
                        <span>{app.jobType}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                        <span className="font-bold text-indigo-300">{app.salary}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
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

                  <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                    <Link
                      to={`/applications/${app._id}`}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                    >
                      Stage Journey &rarr;
                    </Link>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingApp(app)}
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingAppId(app._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card p-4 rounded-3xl border border-slate-800">
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
          title="No applications match your criteria"
          description="Adjust your search keywords or clear filters to view all entries."
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
        title="Log Job Application"
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingAppId)}
        onClose={() => setDeletingAppId(null)}
        onConfirm={handleDelete}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application? All stage timeline events and scheduled interview records will also be purged."
      />
    </div>
  );
};

export default ApplicationsPage;
