import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  Shield,
  Briefcase,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [statusTogglingUser, setStatusTogglingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const toast = useToast();

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          ...(search.trim() && { search: search.trim() }),
          ...(roleFilter !== 'all' && { role: roleFilter }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
        };

        const res = await adminService.getUsers(params);
        if (res.success) {
          setUsers(res.users);
          setPagination({
            currentPage: res.currentPage,
            totalPages: res.totalPages,
            totalUsers: res.totalUsers,
            limit: pagination.limit,
          });
        }
      } catch (error) {
        toast.error('Failed to load users: ' + error.message);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit, search, roleFilter, statusFilter, toast]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleBlockStatus = async () => {
    if (!statusTogglingUser) return;
    try {
      const newStatus = !statusTogglingUser.isBlocked;
      const res = await adminService.toggleUserStatus(statusTogglingUser._id, newStatus);
      if (res.success) {
        toast.success(`User ${newStatus ? 'suspended' : 'activated'} successfully.`);
        setStatusTogglingUser(null);
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await adminService.deleteUser(deletingUser._id);
      if (res.success) {
        toast.success('User and all associated data permanently deleted.');
        setDeletingUser(null);
        fetchUsers(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">User Administration</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Search, audit activity, manage permissions, and enforce account suspensions
        </p>
      </div>

      {/* Toolbar */}
      <div className="glass-card p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email..."
            className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 outline-none w-1/2 md:w-auto"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-300 outline-none w-1/2 md:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="blocked">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" text="Loading platform users..." />
        </div>
      ) : users.length > 0 ? (
        <div className="glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-[#0f172a]/70 text-[11px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Applications</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-white">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700"
                        />
                        <div>
                          <Link to={`/admin/users/${u._id}`} className="hover:text-purple-400 font-bold text-sm">
                            {u.name}
                          </Link>
                          <p className="text-xs text-slate-400 font-mono font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <span className="uppercase text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                        {u.role}
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <Badge status={u.isBlocked ? 'Blocked' : 'Active'} size="xs" />
                    </td>

                    <td className="py-4 px-6 font-mono text-xs text-slate-300">
                      <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-300 rounded-lg font-bold">
                        {u.applicationCount || 0} apps
                      </span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {new Date(u.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="p-2 text-slate-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors"
                          title="Inspect Activity"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>

                        {u.role !== 'admin' && (
                          <>
                            <button
                              onClick={() => setStatusTogglingUser(u)}
                              className={`p-2 rounded-xl transition-colors ${
                                u.isBlocked
                                  ? 'text-emerald-400 hover:bg-emerald-500/10'
                                  : 'text-amber-400 hover:bg-amber-500/10'
                              }`}
                              title={u.isBlocked ? 'Unblock User' : 'Suspend User'}
                            >
                              {u.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                            </button>

                            <button
                              onClick={() => setDeletingUser(u)}
                              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                              title="Delete User"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
              totalItems={pagination.totalUsers}
              itemsPerPage={pagination.limit}
              onPageChange={(page) => fetchUsers(page)}
            />
          </div>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No users found"
          description="No user records match your search criteria."
          actionText="Clear Filter"
          onAction={() => {
            setSearch('');
            setRoleFilter('all');
            setStatusFilter('all');
          }}
        />
      )}

      {/* Toggle Suspension Modal */}
      <ConfirmDialog
        isOpen={Boolean(statusTogglingUser)}
        onClose={() => setStatusTogglingUser(null)}
        onConfirm={handleToggleBlockStatus}
        title={statusTogglingUser?.isBlocked ? 'Reactivate User Account' : 'Suspend User Account'}
        message={`Are you sure you want to ${
          statusTogglingUser?.isBlocked ? 'reactivate' : 'suspend'
        } ${statusTogglingUser?.name}? ${
          statusTogglingUser?.isBlocked
            ? 'They will regain instant access to their account.'
            : 'They will be immediately barred from logging in.'
        }`}
        type={statusTogglingUser?.isBlocked ? 'primary' : 'warning'}
        confirmText={statusTogglingUser?.isBlocked ? 'Reactivate' : 'Suspend'}
      />

      {/* Delete User Modal */}
      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to permanently purge ${deletingUser?.name}? All their job applications, stage timelines, and interview records will be irrevocably deleted.`}
        type="danger"
        confirmText="Permanently Delete"
      />
    </div>
  );
};

export default AdminUsersPage;
