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
  type = 'danger',
  loading = false,
}) => {
  const btnColor =
    type === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500/30 text-white shadow-md shadow-rose-600/20'
      : type === 'warning'
      ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500/30 text-white shadow-md shadow-amber-600/20'
      : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/30 text-white shadow-md shadow-indigo-600/20';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
            type === 'danger'
              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              : type === 'warning'
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
              : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <p className="text-sm text-slate-300 leading-relaxed mt-1">{message}</p>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all disabled:opacity-50 ${btnColor}`}
        >
          {loading ? 'Processing...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
