import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { Loader2, Plus, Sparkles } from 'lucide-react';

const STATUS_OPTIONS = [
  'Applied',
  'Online Assessment',
  'OA Cleared',
  'Interview',
  'Selected',
  'Rejected',
  'Withdrawn',
];

const JOB_TYPE_OPTIONS = ['Full Time', 'Part Time', 'Internship', 'Contract', 'Remote'];

const SOURCE_OPTIONS = [
  'LinkedIn',
  'Indeed',
  'Naukri',
  'Company Portal',
  'Referral',
  'Glassdoor',
  'Campus Placement',
  'Other',
];

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'];

export const ApplicationFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  title = 'Log Job Application',
}) => {
  const [formData, setFormData] = useState({
    companyName: '',
    jobTitle: '',
    jobType: 'Full Time',
    location: 'Remote',
    salary: '',
    jobUrl: '',
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Applied',
    source: 'LinkedIn',
    priority: 'Medium',
    followUpDate: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        companyName: initialData.companyName || '',
        jobTitle: initialData.jobTitle || '',
        jobType: initialData.jobType || 'Full Time',
        location: initialData.location || 'Remote',
        salary: initialData.salary || '',
        jobUrl: initialData.jobUrl || '',
        appliedDate: initialData.appliedDate
          ? new Date(initialData.appliedDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        status: initialData.status || 'Applied',
        source: initialData.source || 'LinkedIn',
        priority: initialData.priority || 'Medium',
        followUpDate: initialData.followUpDate
          ? new Date(initialData.followUpDate).toISOString().split('T')[0]
          : '',
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        companyName: '',
        jobTitle: '',
        jobType: 'Full Time',
        location: 'Remote',
        salary: '',
        jobUrl: '',
        appliedDate: new Date().toISOString().split('T')[0],
        status: 'Applied',
        source: 'LinkedIn',
        priority: 'Medium',
        followUpDate: '',
        notes: '',
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await onSubmit(formData);
    setLoading(false);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Company Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g. Google, Microsoft, Stripe"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Job Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Position / Role <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              name="jobTitle"
              required
              value={formData.jobTitle}
              onChange={handleChange}
              placeholder="e.g. Software Engineer (SDE-1)"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Job Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Type</label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {JOB_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stage Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {PRIORITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. Bangalore / Remote"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Salary / CTC</label>
            <input
              type="text"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. ₹24 LPA"
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Source */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Channel Source</label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            >
              {SOURCE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-slate-900 text-white">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Applied Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Applied Date</label>
            <input
              type="date"
              name="appliedDate"
              value={formData.appliedDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Follow-up Date</label>
            <input
              type="date"
              name="followUpDate"
              value={formData.followUpDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>

          {/* Job URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Job Link</label>
            <input
              type="url"
              name="jobUrl"
              value={formData.jobUrl}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Preparation Notes & Referral Details
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g. Referred by senior. Key topics: System Design, DP, React internals..."
            className="w-full px-3.5 py-2.5 text-sm glass-input rounded-xl outline-none resize-none"
          />
        </div>

        {/* Actions */}
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
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {initialData ? 'Update Application' : 'Save Application'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationFormModal;
