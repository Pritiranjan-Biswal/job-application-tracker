import React, { useState, useEffect } from 'react';
import resumeService from '../../services/resumeService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/common/Loader';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

export const ResumesPage = () => {
  const { user, updateUser } = useAuth();
  const [resume, setResume] = useState(user?.resume || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const res = await resumeService.getResume();
        if (res.success && res.resume) {
          setResume(res.resume);
        }
      } catch (error) {
        console.error('Fetch resume error:', error.message);
      }
    };
    fetchResume();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const res = await resumeService.uploadResume(formData);
      if (res.success) {
        toast.success('Resume uploaded successfully to Cloudinary!');
        setResume(res.resume);
        updateUser({ resume: res.resume });
        setSelectedFile(null);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await resumeService.deleteResume();
      if (res.success) {
        toast.success('Resume removed successfully.');
        setResume(null);
        updateUser({ resume: null });
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Resume Management</h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Store, preview, and attach your master ATS-friendly resume stored in the cloud
        </p>
      </div>

      {/* Current Resume Card */}
      {resume && resume.url ? (
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white">
                    {resume.fileName || 'Master_Resume.pdf'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Cloud Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Uploaded on{' '}
                  {resume.uploadedAt
                    ? new Date(resume.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Recently'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={resume.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </a>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors border border-transparent hover:border-rose-500/20"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Encrypted cloud storage powered by Cloudinary CDN</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-xs text-amber-200">
            You don't have a primary resume uploaded yet. Upload a PDF or DOC below to easily link it to your job submissions.
          </p>
        </div>
      )}

      {/* Upload Form */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <h2 className="text-base font-bold text-white mb-1">
          {resume?.url ? 'Replace Master Resume' : 'Upload Master Resume'}
        </h2>
        <p className="text-xs text-slate-400 mb-6 font-mono">Supported formats: PDF, DOC, DOCX (Max size: 10MB)</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 rounded-3xl p-8 text-center hover:border-indigo-500 transition-colors bg-slate-900/60">
            <input
              type="file"
              id="resume-upload"
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resume-upload"
              className="cursor-pointer flex flex-col items-center justify-center gap-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                <UploadCloud className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {selectedFile ? selectedFile.name : 'Click to select or drag and drop your file'}
                </p>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'PDF, DOC, DOCX documents up to 10MB'}
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              {uploading ? 'Uploading to Cloud...' : 'Upload & Save Resume'}
            </button>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Resume"
        message="Are you sure you want to delete your cloud resume? Any applications referencing this document will no longer have access to it."
        loading={isDeleting}
      />
    </div>
  );
};

export default ResumesPage;
