import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ArrowLeft,
  User,
  Mail,
  Shield,
  Briefcase,
  CalendarCheck2,
  Trophy,
  UserCheck,
  UserX,
  MapPin,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const toast = useToast();

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUserById(id);
      if (res.success) {
        setUserData(res);
      }
    } catch (error) {
      toast.error('Failed to load user details: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleToggleBlock = async () => {
    try {
      const newStatus = !userData.user.isBlocked;
      const res = await adminService.toggleUserStatus(id, newStatus);
      if (res.success) {
        toast.success(`User status updated to ${newStatus ? 'Suspended' : 'Active'}`);
        setIsTogglingStatus(false);
        fetchUser();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader size="lg" text="Loading user dossier..." />
      </div>
    );
  }

  if (!userData?.user) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-white">User not found</h2>
        <Link to="/admin/users" className="text-purple-400 text-xs font-bold mt-2 inline-block">
          &larr; Return to Users List
        </Link>
      </div>
    );
  }

  const { user, applications, interviews, stats } = userData;

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/admin/users"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Users Roster
      </Link>

      {/* User Hero Dossier */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/40 shadow-xl shadow-purple-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
                <Badge status={user.isBlocked ? 'Blocked' : 'Active'} size="md" />
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>
            </div>
          </div>

          {user.role !== 'admin' && (
            <button
              onClick={() => setIsTogglingStatus(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                user.isBlocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                  : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
              }`}
            >
              {user.isBlocked ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              {user.isBlocked ? 'Reactivate Account' : 'Suspend Account'}
            </button>
          )}
        </div>

        {/* User stats overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 text-center">
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Total Applications</span>
            <p className="text-2xl font-extrabold text-white mt-1">{stats?.totalApplications || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-purple-400 uppercase">Interviews Scheduled</span>
            <p className="text-2xl font-extrabold text-purple-400 mt-1">{stats?.totalInterviews || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Offers / Selected</span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats?.selectedCount || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">Member Since</span>
            <p className="text-sm font-extrabold text-slate-200 mt-2 font-mono">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* User's Applications Table */}
      <div className="glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-base font-bold text-white">Logged Job Applications ({applications?.length || 0})</h2>
        </div>

        {applications && applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-[#0f172a]/70 font-mono uppercase text-slate-400 border-b border-slate-800 text-[10px]">
                <tr>
                  <th className="py-3 px-6">Company</th>
                  <th className="py-3 px-6">Position</th>
                  <th className="py-3 px-6">Stage Status</th>
                  <th className="py-3 px-6">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-6 font-bold text-white">{app.companyName}</td>
                    <td className="py-3.5 px-6 text-slate-300">{app.jobTitle}</td>
                    <td className="py-3.5 px-6">
                      <Badge status={app.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-6 text-slate-400 font-mono">
                      {new Date(app.appliedDate).toLocaleDateString('en-US', {
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
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            This user has not logged any job applications yet.
          </div>
        )}
      </div>

      {/* Toggle Modal */}
      <ConfirmDialog
        isOpen={isTogglingStatus}
        onClose={() => setIsTogglingStatus(false)}
        onConfirm={handleToggleBlock}
        title={user.isBlocked ? 'Reactivate User Account' : 'Suspend User Account'}
        message={`Are you sure you want to ${user.isBlocked ? 'reactivate' : 'suspend'} ${user.name}'s account?`}
        type={user.isBlocked ? 'primary' : 'warning'}
        confirmText={user.isBlocked ? 'Reactivate' : 'Suspend'}
      />
    </div>
  );
};

export default AdminUserDetailPage;
