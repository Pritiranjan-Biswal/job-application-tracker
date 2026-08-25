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
  ExternalLink,
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
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Resume Management</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Store, update, and attach your ATS-friendly resume stored securely in the cloud
        </p>
      </div>

      {/* Current Resume Card */}
      {resume && resume.url ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    {resume.fileName || 'Master_Resume.pdf'}
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
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
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                View / Download PDF
              </a>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                title="Delete Resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-indigo-500" />
            <span>Encrypted cloud storage powered by Cloudinary CDN</span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-xs text-amber-800 font-medium">
            You don't have a primary resume uploaded yet. Upload a PDF or DOC below to easily attach it to new job submissions.
          </p>
        </div>
      )}

      {/* Upload / Replace Resume Form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 mb-2">
          {resume?.url ? 'Replace Resume' : 'Upload New Resume'}
        </h2>
        <p className="text-xs text-slate-500 mb-6">Supported formats: PDF, DOC, DOCX (Max size: 10MB)</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center hover:border-indigo-400 transition-colors bg-slate-50/50">
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
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : 'Click to browse or drag and drop your file'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFile
                    ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`
                    : 'PDF or DOC documents up to 10MB'}
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <>
                  <Loader size="sm" text="" />
                  Uploading to Cloud...
                </>
              ) : (
                'Upload & Save Resume'
              )}
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
        message="Are you sure you want to remove your uploaded resume? Any applications referencing this resume will no longer have access to it."
        loading={isDeleting}
      />
    </div>
  );
};

export default ResumesPage;
