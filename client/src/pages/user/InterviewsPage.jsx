import React, { useState, useEffect, useCallback } from 'react';
import interviewService from '../../services/interviewService';
import applicationService from '../../services/applicationService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import InterviewModal from '../../components/interviews/InterviewModal';
import {
  CalendarCheck2,
  Clock,
  Video,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const InterviewsPage = () => {
  const [interviews, setInterviews] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('upcoming');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInterview, setEditingInterview] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const toast = useToast();

  const fetchInterviews = useCallback(async () => {
    try {
      setLoading(true);
      const [intRes, appsRes] = await Promise.all([
        interviewService.getInterviews({
          ...(timeframe !== 'all' && { timeframe }),
        }),
        applicationService.getApplications({ limit: 100 }),
      ]);

      if (intRes.success) setInterviews(intRes.interviews);
      if (appsRes.success) setApplications(appsRes.applications);
    } catch (error) {
      toast.error('Failed to load interviews: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [timeframe, toast]);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleCreateInterview = async (formData) => {
    try {
      const res = await interviewService.createInterview(formData);
      if (res.success) {
        toast.success('Interview round scheduled!');
        fetchInterviews();
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleUpdateInterview = async (formData) => {
    try {
      const res = await interviewService.updateInterview(editingInterview._id, formData);
      if (res.success) {
        toast.success('Interview updated!');
        setEditingInterview(null);
        fetchInterviews();
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleDeleteInterview = async () => {
    if (!deletingId) return;
    try {
      const res = await interviewService.deleteInterview(deletingId);
      if (res.success) {
        toast.success('Interview deleted.');
        setDeletingId(null);
        fetchInterviews();
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Interview Tracker</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Schedule technical rounds, launch video links, and store prep notes
          </p>
        </div>

        {applications.length > 0 && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Schedule Interview
          </button>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setTimeframe('upcoming')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            timeframe === 'upcoming'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          Upcoming Rounds
        </button>
        <button
          onClick={() => setTimeframe('past')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            timeframe === 'past'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          Past / Completed
        </button>
        <button
          onClick={() => setTimeframe('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
            timeframe === 'all'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          All ({interviews.length})
        </button>
      </div>

      {/* Content Feed */}
      {loading ? (
        <div className="py-24 flex justify-center">
          <Loader size="lg" text="Loading scheduled interviews..." />
        </div>
      ) : interviews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interviews.map((interview) => (
            <div
              key={interview._id}
              className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-base text-white">{interview.companyName}</h3>
                    <p className="text-xs font-medium text-slate-300">{interview.jobTitle}</p>
                  </div>
                  <Badge status={interview.status} />
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl mb-4">
                  <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-widest block mb-1">
                    Round Details
                  </span>
                  <p className="text-xs font-bold text-white">{interview.round}</p>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 font-mono">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-200">
                      {new Date(interview.interviewDate).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>{interview.interviewType}</span>
                  </div>

                  {interview.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">Preparation Focus:</p>
                      <p className="text-xs text-slate-300 mt-1 italic font-sans">"{interview.notes}"</p>
                    </div>
                  )}

                  {interview.feedback && (
                    <div className="mt-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      <p className="text-[10px] font-mono font-bold text-emerald-400">Feedback / Outcome:</p>
                      <p className="text-xs text-emerald-200 mt-0.5 font-sans">{interview.feedback}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                {interview.meetingLink ? (
                  <a
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Launch Meeting
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 font-mono">No link added</span>
                )}

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingInterview(interview)}
                    className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(interview._id)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={CalendarCheck2}
          title={timeframe === 'upcoming' ? 'No upcoming interviews' : 'No interviews recorded'}
          description="Schedule interview rounds for your applications to keep your calendar organized."
          actionText={applications.length > 0 ? 'Schedule an Interview' : 'Add Application First'}
          onAction={() => {
            if (applications.length > 0) setIsAddModalOpen(true);
          }}
        />
      )}

      {/* Schedule Interview Modal */}
      {isAddModalOpen && applications.length > 0 && (
        <InterviewModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleCreateInterview}
          applicationId={applications[0]._id}
          companyName={applications[0].companyName}
          jobTitle={applications[0].jobTitle}
        />
      )}

      {/* Edit Interview Modal */}
      {editingInterview && (
        <InterviewModal
          isOpen={Boolean(editingInterview)}
          onClose={() => setEditingInterview(null)}
          onSubmit={handleUpdateInterview}
          initialData={editingInterview}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deletingId)}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteInterview}
        title="Delete Interview Schedule"
        message="Are you sure you want to remove this interview round?"
      />
    </div>
  );
};

export default InterviewsPage;
