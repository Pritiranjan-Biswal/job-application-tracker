import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Users,
  Search,
  Shield,
  UserCheck,
  UserX,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
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

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Modals
  const [blockingUser, setBlockingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  const { user: currentUser } = useAuth();
  const toast = useToast();

  const fetchUsers = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pagination.limit,
          ...(search.trim() && { search: search.trim() }),
          ...(statusFilter !== 'all' && { status: statusFilter }),
          ...(roleFilter !== 'all' && { role: roleFilter }),
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
    [pagination.limit, search, statusFilter, roleFilter, toast]
  );

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  const handleToggleBlock = async () => {
    if (!blockingUser) return;
    try {
      const res = await adminService.toggleUserBlock(blockingUser._id);
      if (res.success) {
        toast.success(res.message);
        setBlockingUser(null);
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
        toast.success(res.message);
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Administration</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Inspect platform users, manage permissions, suspend accounts, and view user engagement
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by user name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="blocked">Suspended / Blocked</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User Role</option>
              <option value="admin">Admin Role</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader size="lg" text="Loading platform users..." />
        </div>
      ) : users.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Role</th>
                  <th className="py-3.5 px-6">Account Status</th>
                  <th className="py-3.5 px-6">Applications</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={u.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="text-slate-900 hover:text-purple-600 font-bold"
                            >
                              {u.name}
                            </Link>
                            <span className="block text-xs font-normal text-slate-400">{u.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                            <UserX className="w-3 h-3" />
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                            <UserCheck className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-800">
                        {u.applicationCount}
                      </td>

                      <td className="py-4 px-6 text-xs text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/users/${u._id}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                            title="Inspect User Details"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Link>

                          {!isSelf && (
                            <>
                              <button
                                onClick={() => setBlockingUser(u)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                                  u.isBlocked
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                {u.isBlocked ? 'Unblock' : 'Block'}
                              </button>

                              <button
                                onClick={() => setDeletingUser(u)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Delete User & Data"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100">
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
          description="No user accounts match your current filters."
          actionText="Reset Filters"
          onAction={() => {
            setSearch('');
            setStatusFilter('all');
            setRoleFilter('all');
          }}
        />
      )}

      {/* Block / Unblock Modal */}
      {blockingUser && (
        <ConfirmDialog
          isOpen={Boolean(blockingUser)}
          onClose={() => setBlockingUser(null)}
          onConfirm={handleToggleBlock}
          title={blockingUser.isBlocked ? 'Unblock User Account' : 'Suspend User Account'}
          message={`Are you sure you want to ${
            blockingUser.isBlocked ? 'reactivate' : 'suspend'
          } ${blockingUser.name}'s account (${blockingUser.email})? Suspended users cannot log in or manage job applications.`}
          confirmText={blockingUser.isBlocked ? 'Unblock Account' : 'Suspend Account'}
          type={blockingUser.isBlocked ? 'primary' : 'warning'}
        />
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <ConfirmDialog
          isOpen={Boolean(deletingUser)}
          onClose={() => setDeletingUser(null)}
          onConfirm={handleDeleteUser}
          title="Permanently Delete User"
          message={`Are you sure you want to delete ${deletingUser.name}? This will permanently remove their profile, all their job applications, stage timelines, and scheduled interviews from the database.`}
          confirmText="Permanently Delete"
          type="danger"
        />
      )}
    </div>
  );
};

export default AdminUsersPage;
