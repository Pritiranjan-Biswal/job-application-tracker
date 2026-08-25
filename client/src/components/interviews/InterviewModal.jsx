import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2 } from 'lucide-react';

const ROUND_OPTIONS = [
  'Recruiter Screening Call',
  'Technical Round 1 (DSA / Coding)',
  'Technical Round 2 (Core CS / System Design)',
  'Machine Coding Round',
  'System Design (HLD / LLD)',
  'Hiring Manager Round',
  'HR / Culture Fit Round',
  'Final Leadership Discussion',
];

const TYPE_OPTIONS = [
  'Google Meet',
  'Zoom',
  'Microsoft Teams',
  'On-site / In-person',
  'Phone Call',
  'HackerRank / CodePair',
];

const STATUS_OPTIONS = ['Scheduled', 'Completed', 'Rescheduled', 'Cancelled'];

export const InterviewModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  applicationId = null,
  companyName = '',
  jobTitle = '',
}) => {
  const [formData, setFormData] = useState({
    applicationId: '',
    companyName: '',
    jobTitle: '',
    round: 'Technical Round 1 (DSA / Coding)',
    interviewType: 'Google Meet',
    interviewDate: '',
    meetingLink: '',
    notes: '',
    status: 'Scheduled',
    feedback: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        applicationId: initialData.applicationId?._id || initialData.applicationId || applicationId || '',
        companyName: initialData.companyName || companyName || '',
        jobTitle: initialData.jobTitle || jobTitle || '',
        round: initialData.round || 'Technical Round 1 (DSA / Coding)',
        interviewType: initialData.interviewType || 'Google Meet',
        interviewDate: initialData.interviewDate
          ? new Date(initialData.interviewDate).toISOString().slice(0, 16)
          : '',
        meetingLink: initialData.meetingLink || '',
        notes: initialData.notes || '',
        status: initialData.status || 'Scheduled',
        feedback: initialData.feedback || '',
      });
    } else {
      setFormData({
        applicationId: applicationId || '',
        companyName: companyName || '',
        jobTitle: jobTitle || '',
        round: 'Technical Round 1 (DSA / Coding)',
        interviewType: 'Google Meet',
        interviewDate: '',
        meetingLink: '',
        notes: '',
        status: 'Scheduled',
        feedback: '',
      });
    }
  }, [initialData, applicationId, companyName, jobTitle, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.interviewDate) return;

    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Update Interview Round' : `Schedule Interview: ${companyName || 'Job'}`}
      subtitle={jobTitle ? `Position: ${jobTitle}` : undefined}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Round Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Interview Round <span className="text-rose-400">*</span>
          </label>
          <input
            list="rounds-list"
            name="round"
            required
            value={formData.round}
            onChange={handleChange}
            placeholder="Select or type round name..."
            className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
          />
          <datalist id="rounds-list">
            {ROUND_OPTIONS.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Interview Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Platform / Medium</label>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-slate-900 text-white">
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Date & Time <span className="text-rose-400">*</span>
            </label>
            <input
              type="datetime-local"
              name="interviewDate"
              required
              value={formData.interviewDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Meeting Link */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Link</label>
          <input
            type="url"
            name="meetingLink"
            value={formData.meetingLink}
            onChange={handleChange}
            placeholder="https://meet.google.com/... or https://zoom.us/..."
            className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
          />
        </div>

        {/* Status (if editing) */}
        {initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Round Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Preparation Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Preparation Notes / Focus Areas</label>
          <textarea
            name="notes"
            rows={2}
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Focus on Dynamic Programming, Graph Algorithms, and React hooks optimizations."
            className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none resize-none"
          />
        </div>

        {/* Feedback (if editing) */}
        {initialData && (
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Post-Interview Feedback / Notes</label>
            <textarea
              name="feedback"
              rows={2}
              value={formData.feedback}
              onChange={handleChange}
              placeholder="e.g. Solved both coding questions; positive interviewer response."
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none resize-none"
            />
          </div>
        )}

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {initialData ? 'Update Interview' : 'Schedule Round'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InterviewModal;
