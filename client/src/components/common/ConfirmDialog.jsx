import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone. Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) => {
  const btnColor =
    type === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500 text-white'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500 text-white';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            type === 'danger'
              ? 'bg-rose-50 text-rose-600'
              : type === 'warning'
              ? 'bg-amber-50 text-amber-600'
              : 'bg-indigo-50 text-indigo-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-600 leading-relaxed mt-1">{message}</p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${btnColor}`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
