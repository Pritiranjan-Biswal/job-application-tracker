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
      <div className="py-20 flex justify-center">
        <Loader size="lg" text="Loading application journey..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">Application not found</h2>
        <Link to="/applications" className="text-indigo-600 text-sm mt-2 inline-block">
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
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Applications
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInterviewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            Schedule Interview
          </button>
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Main Info Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {application.companyName}
              </h1>
              <Badge status={application.status} size="md" />
            </div>
            <p className="text-base sm:text-lg font-medium text-slate-700 mt-1">
              {application.jobTitle}
            </p>
          </div>

          {/* Quick Stage Advance Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-2">Current Stage:</span>
            <select
              value={application.status}
              onChange={(e) => handleStageChange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer shadow-2xs"
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

        {/* Stage Progress Stepper (for normal progressive pipeline) */}
        {!['Rejected', 'Withdrawn'].includes(application.status) && (
          <div className="py-6 border-b border-slate-100 overflow-x-auto">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Hiring Pipeline Progress
            </p>
            <div className="flex items-center justify-between min-w-[550px] relative">
              {/* Progress Line */}
              <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-1 bg-slate-100 -z-0">
                <div
                  className="h-full bg-indigo-600 transition-all duration-500"
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
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                        isCompleted
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-white border-2 border-slate-200 text-slate-400 hover:border-indigo-300'
                      } ${isCurrent ? 'ring-4 ring-indigo-100 scale-110' : ''}`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </button>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isCurrent ? 'text-indigo-600 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-400'
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 text-sm">
          <div>
            <span className="block text-xs font-semibold text-slate-400">Location</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mt-1">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{application.location || 'Remote'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400">Job Type</span>
            <span className="block font-medium text-slate-800 mt-1">{application.jobType}</span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400">Salary / Compensation</span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 mt-1">
              <DollarSign className="w-4 h-4 text-slate-400" />
              <span>{application.salary || 'Not Disclosed'}</span>
            </div>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400">Applied Date</span>
            <div className="flex items-center gap-1.5 font-medium text-slate-800 mt-1">
              <Calendar className="w-4 h-4 text-slate-400" />
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
            <span className="block text-xs font-semibold text-slate-400">Source</span>
            <span className="inline-block mt-1 font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md text-xs">
              {application.source}
            </span>
          </div>

          <div>
            <span className="block text-xs font-semibold text-slate-400">Priority</span>
            <span className="block font-semibold text-slate-800 mt-1">{application.priority}</span>
          </div>

          {application.followUpDate && (
            <div>
              <span className="block text-xs font-semibold text-slate-400">Follow-Up Date</span>
              <span className="block font-semibold text-amber-600 mt-1">
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
              <span className="block text-xs font-semibold text-slate-400">Job Link</span>
              <a
                href={application.jobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 font-semibold mt-1 hover:underline text-xs"
              >
                External Posting
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Attached Resume */}
        {application.resumeUrl && (
          <div className="mt-6 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-indigo-950">Resume Attached for this Role</p>
                <p className="text-[11px] text-slate-500">Stored securely on Cloudinary</p>
              </div>
            </div>
            <a
              href={application.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-xs"
            >
              View Resume
            </a>
          </div>
        )}
      </div>

      {/* Two Column Layout: Timeline Journey & Scheduled Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline Journey (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Application Timeline & Journey</h2>
                <p className="text-xs text-slate-500 mt-0.5">Chronological record of updates, stages, and milestones</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
                {timeline.length} Events
              </span>
            </div>

            {/* Timeline Vertical Feed */}
            {timeline.length > 0 ? (
              <div className="relative pl-6 border-l-2 border-indigo-100 space-y-6 my-4">
                {timeline.map((event, idx) => (
                  <div key={event._id || idx} className="relative group">
                    {/* Dot on line */}
                    <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-600 ring-4 ring-white" />
                    
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{event.status}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-4">No timeline entries recorded yet.</p>
            )}

            {/* Add Timeline Note Form */}
            <form onSubmit={handleAddTimelineNote} className="mt-6 pt-6 border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log a custom milestone or interview note..."
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
              <button
                type="submit"
                disabled={addingNote || !newNote.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all disabled:opacity-50"
              >
                {addingNote ? 'Adding...' : 'Add Note'}
              </button>
            </form>
          </div>

          {/* Notes Section */}
          {application.notes && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Preparation & Referral Notes</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {application.notes}
              </p>
            </div>
          )}
        </div>

        {/* Scheduled Interviews Sidebar Widget (1 Column) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Interviews</h2>
              <button
                onClick={() => setIsInterviewModalOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
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
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{interview.round}</h4>
                      <Badge status={interview.status} size="xs" />
                    </div>

                    <div className="text-xs text-slate-500 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
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
                        <Video className="w-3.5 h-3.5 text-slate-400" />
                        <span>{interview.interviewType}</span>
                      </div>
                    </div>

                    {interview.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-100">
                        "{interview.notes}"
                      </p>
                    )}

                    {interview.meetingLink && (
                      <div className="pt-2">
                        <a
                          href={interview.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-colors"
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
              <div className="text-center py-8 text-xs text-slate-400">
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

      {/* Delete Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Job Application"
        message="Are you sure you want to permanently delete this application and all associated stage timeline history? This action cannot be undone."
      />
    </div>
  );
};

export default ApplicationDetailPage;
