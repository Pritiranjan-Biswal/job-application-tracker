import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import interviewService from '../../services/interviewService';
import { useToast } from '../../context/ToastContext';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import ApplicationFormModal from '../../components/applications/ApplicationFormModal';
import InterviewModal from '../../components/interviews/InterviewModal';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  ExternalLink,
  Edit2,
  Trash2,
  Clock,
  CalendarPlus,
  Video,
  FileText,
  CheckCircle2,
  CircleDot,
  Plus,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const STAGES = [
  'Applied',
  'Online Assessment',
  'OA Cleared',
  'Interview',
  'Selected',
];

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [application, setApplication] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  const fetchApplicationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await applicationService.getApplicationById(id);
      if (res.success) {
        setApplication(res.application);
        setTimeline(res.timeline || []);
        setInterviews(res.interviews || []);
      }
    } catch (error) {
      toast.error('Failed to load application details: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchApplicationDetails();
  }, [fetchApplicationDetails]);

  const handleStageChange = async (newStatus) => {
    try {
      const res = await applicationService.updateApplication(id, { status: newStatus });
      if (res.success) {
        toast.success(`Application advanced to "${newStatus}"!`);
        fetchApplicationDetails();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleScheduleInterview = async (interviewData) => {
    try {
      const res = await interviewService.createInterview({
        ...interviewData,
        applicationId: id,
        companyName: application.companyName,
        jobTitle: application.jobTitle,
      });
      if (res.success) {
        toast.success('Interview round scheduled!');
        fetchApplicationDetails();
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message);
      return false;
    }
  };

  const handleAddTimelineNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const res = await applicationService.addTimelineEvent(id, {
        status: application.status,
        description: newNote.trim(),
        date: new Date(),
      });
      if (res.success) {
        toast.success('Note added to timeline history!');
        setNewNote('');
        fetchApplicationDetails();
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAddingNote(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await applicationService.deleteApplication(id);
      if (res.success) {
        toast.success('Application deleted.');
        navigate('/applications');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader size="lg" text="Loading stage journey..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-24">
        <h2 className="text-xl font-bold text-white">Application not found</h2>
        <Link to="/applications" className="text-indigo-400 text-xs font-bold mt-2 inline-block">
          &larr; Return to Applications
        </Link>
      </div>
    );
  }

  const currentStageIndex = STAGES.indexOf(application.status);

  return (
    <div className="space-y-8">
      {/* Back Button & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/applications"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications Pipeline
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 rounded-xl transition-all border border-indigo-500/30"
          >
            <CalendarPlus className="w-3.5 h-3.5 text-indigo-400" />
            Schedule Interview
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Hero Card */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {application.companyName}
              </h1>
              <Badge status={application.status} size="md" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-slate-300 mt-1">
              {application.jobTitle}
            </p>
          </div>

          {/* Quick Stage Dropdown */}
          <div className="flex items-center gap-2 bg-slate-900/90 p-2 rounded-2xl border border-slate-800">
            <span className="text-xs font-mono font-bold text-slate-400 pl-2">STAGE:</span>
            <select
              value={application.status}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-indigo-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Applied">Applied</option>
              <option value="Online Assessment">Online Assessment</option>
              <option value="OA Cleared">OA Cleared</option>
              <option value="Interview">Interview</option>
              <option value="Selected">Selected / Offer 🎉</option>
              <option value="Rejected">Rejected</option>
              <option value="Withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Stage Progress Stepper */}
        {!['Rejected', 'Withdrawn'].includes(application.status) && (
          <div className="py-6 border-b border-slate-800 overflow-x-auto">
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-4">
              Hiring Pipeline Stage Progress
            </p>
            <div className="flex items-center justify-between min-w-[550px] relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-800 -z-0">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 transition-all duration-700 shadow-[0_0_12px_rgba(99,102,241,0.5)]"
                  style={{
                    width: `${Math.max(0, (currentStageIndex / (STAGES.length - 1)) * 100)}%`,
                  }}
                />
              </div>

              {STAGES.map((stage, idx) => {
                const isCompleted = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div key={stage} className="flex flex-col items-center relative z-10">
                    <button
                      onClick={() => handleStageChange(stage)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900 border-2 border-slate-700 text-slate-500 hover:border-indigo-500/50'
                      } ${isCurrent ? 'ring-4 ring-indigo-500/30 scale-110' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </button>
                    <span
                      className={`text-xs mt-2 font-mono ${
                        isCurrent ? 'text-indigo-400 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 text-xs">
          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Location</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-200 mt-1">
              <MapPin className="w-4 h-4 text-indigo-400" />
              <span>{application.location || 'Remote'}</span>
            </div>
          </div>

          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Job Type</span>
            <span className="block font-bold text-slate-200 mt-1">{application.jobType}</span>
          </div>

          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Salary / CTC</span>
            <div className="flex items-center gap-1.5 font-bold text-emerald-400 mt-1 font-mono">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>{application.salary || 'Not Disclosed'}</span>
            </div>
          </div>

          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Applied Date</span>
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 mt-1 font-mono">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>
                {new Date(application.appliedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Channel Source</span>
            <span className="inline-block mt-1 font-mono font-semibold text-indigo-300 bg-slate-900 border border-slate-800 px-2.5 py-0.5 rounded-lg text-xs">
              {application.source}
            </span>
          </div>

          <div>
            <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Priority</span>
            <span className="block font-bold text-slate-200 mt-1">{application.priority}</span>
          </div>

          {application.followUpDate && (
            <div>
              <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">Follow-Up Due</span>
              <span className="block font-mono font-bold text-amber-400 mt-1">
                {new Date(application.followUpDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          )}

          {application.jobUrl && (
            <div>
              <span className="block font-mono font-bold text-slate-500 uppercase text-[10px]">External URL</span>
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-400 font-bold mt-1 hover:underline text-xs"
              >
                View Job Posting
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Attached Resume Bar */}
        {application.resumeUrl && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-400" />
              <div>
                <p className="text-xs font-bold text-white">Resume Attached for this Role</p>
                <p className="text-[11px] text-slate-400">Stored on Cloudinary CDN</p>
              </div>
            </div>
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
            >
              Download PDF
            </a>
          </div>
        )}
      </div>

      {/* Two Column Layout: Timeline Journey & Scheduled Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Journey (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800/80 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">Application Journey Timeline</h2>
                <p className="text-xs text-slate-400 mt-0.5">Chronological record of status transitions and notes</p>
              </div>
              <span className="text-xs font-mono font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-xl">
                {timeline.length} Milestones
              </span>
            </div>

            {/* Timeline Vertical Feed */}
            {timeline.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-indigo-500/30 space-y-6 my-4">
                {timeline.map((event, idx) => (
                  <div key={event._id || idx} className="relative group">
                    {/* Dot on line */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 ring-4 ring-[#090d16] shadow-[0_0_10px_rgba(99,102,241,0.8)]" />

                    <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-white">{event.status}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">No timeline entries recorded yet.</p>
            )}

            {/* Add Timeline Note Form */}
            <form onSubmit={handleAddTimelineNote} className="mt-6 pt-6 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a custom milestone or assessment score..."
                className="flex-1 px-3.5 py-2.5 text-xs glass-input rounded-xl outline-none"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all disabled:opacity-50"
              >
                {addingNote ? 'Saving...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* Notes Section */}
          {application.notes && (
            <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
              <h3 className="text-sm font-bold text-white mb-2">Preparation Notes & Context</h3>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
                {application.notes}
              </p>
            </div>
          )}
        </div>

        {/* Scheduled Interviews Sidebar Widget */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Interviews</h2>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Schedule
              </button>
            </div>

            {interviews.length > 0 ? (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <div
                    key={interview._id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-white">{interview.round}</h4>
                      <Badge status={interview.status} size="xs" />
                    </div>

                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>
                          {new Date(interview.interviewDate).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Video className="w-3.5 h-3.5 text-purple-400" />
                        <span>{interview.interviewType}</span>
                      </div>
                    </div>

                    {interview.notes && (
                      <p className="text-[11px] text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        "{interview.notes}"
                      </p>
                    )}

                    {interview.meetingLink && (
                      <div className="pt-2">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                        >
                          <Video className="w-3.5 h-3.5" />
                          Launch Meeting
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No interviews scheduled for this role yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <ApplicationFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={async (formData) => {
            const res = await applicationService.updateApplication(id, formData);
            if (res.success) {
              toast.success('Application updated!');
              fetchApplicationDetails();
              return true;
            }
            return false;
          }}
          initialData={application}
          title={`Edit ${application.companyName} Application`}
        />
      )}

      {/* Schedule Interview Modal */}
      <InterviewModal
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        onSubmit={handleScheduleInterview}
        applicationId={id}
        companyName={application.companyName}
        jobTitle={application.jobTitle}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application and all stage timeline events? This action cannot be reversed."
      />
    </div>
  );
};

export default ApplicationDetailPage;
