import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import adminService from '../../services/adminService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Briefcase,
  CalendarCheck2,
  FileText,
  Github,
  Linkedin,
  Globe,
  MapPin,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';

export const AdminUserDetailPage = () => {
  const { id } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchUserDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUserDetails(id);
      if (res.success) {
        setUserDetails(res);
      }
    } catch (error) {
      toast.error('Failed to load user details: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleToggleBlock = async () => {
    try {
      const res = await adminService.toggleUserBlock(id);
      if (res.success) {
        toast.success(res.message);
        fetchUserDetails();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading user profile..." />
      </div>
    );
  }

  if (!userDetails || !userDetails.user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-slate-800">User not found</h2>
        <Link to="/admin/users" className="text-purple-600 text-xs font-semibold mt-2 inline-block">
          &larr; Return to Users
        </Link>
      </div>
    );
  }

  const { user, stats, recentApplications } = userDetails;

  return (
    <div className="space-y-8">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Users
        </Link>

        <button
          onClick={handleToggleBlock}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            user.isBlocked
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-rose-600 text-white hover:bg-rose-700'
          }`}
        >
          {user.isBlocked ? 'Reactivate Account' : 'Suspend / Block Account'}
        </button>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b border-slate-100">
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-purple-200"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">{user.name}</h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {user.role.toUpperCase()}
              </span>
              {user.isBlocked ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                  Suspended
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            {user.headline && (
              <p className="text-sm font-medium text-slate-700 mt-2">{user.headline}</p>
            )}
            {user.bio && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {user.bio}
              </p>
            )}
          </div>
        </div>

        {/* User Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 text-center">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Applications</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.applicationCount || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Interviews</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.interviewCount || 0}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Target Role</span>
            <p className="text-xs font-bold text-slate-800 mt-2 truncate">{user.preferredRole || 'General'}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Joined</span>
            <p className="text-xs font-bold text-slate-800 mt-2">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="pt-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Technical Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Applications Audit Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-4">User's Recent Applications</h2>
        {recentApplications && recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Company</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-900">{app.companyName}</td>
                    <td className="py-3 px-4 text-slate-700">{app.jobTitle}</td>
                    <td className="py-3 px-4">
                      <Badge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
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
          <p className="text-xs text-slate-400 py-4">No applications submitted by this user yet.</p>
        )}
      </div>
    </div>
  );
};

export default AdminUserDetailPage;
