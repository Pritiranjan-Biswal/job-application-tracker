import React from 'react';

const statusStyles = {
  // Application statuses
  Applied: 'bg-blue-50 text-blue-700 border-blue-200 dot-blue-500',
  'Online Assessment': 'bg-purple-50 text-purple-700 border-purple-200 dot-purple-500',
  'OA Cleared': 'bg-cyan-50 text-cyan-700 border-cyan-200 dot-cyan-500',
  Interview: 'bg-amber-50 text-amber-700 border-amber-200 dot-amber-500',
  Selected: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200 dot-rose-500',
  Withdrawn: 'bg-slate-100 text-slate-700 border-slate-200 dot-slate-400',

  // Interview statuses
  Scheduled: 'bg-indigo-50 text-indigo-700 border-indigo-200 dot-indigo-500',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500',
  Rescheduled: 'bg-amber-50 text-amber-700 border-amber-200 dot-amber-500',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200 dot-rose-500',

  // Priority
  High: 'bg-red-50 text-red-700 border-red-200 dot-red-500',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dot-amber-500',
  Low: 'bg-slate-100 text-slate-700 border-slate-200 dot-slate-400',

  // User / Admin statuses
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dot-emerald-500',
  Blocked: 'bg-rose-50 text-rose-700 border-rose-200 dot-rose-500',
  Admin: 'bg-violet-50 text-violet-700 border-violet-200 dot-violet-500',
  User: 'bg-slate-100 text-slate-700 border-slate-200 dot-slate-400',
};

export const Badge = ({ status, text, size = 'sm', showDot = true }) => {
  const label = text || status || 'Unknown';
  const style = statusStyles[status] || 'bg-slate-100 text-slate-700 border-slate-200 dot-slate-400';

  const dotColorClass = style.split(' ').find((c) => c.startsWith('dot-'))?.replace('dot-', 'bg-') || 'bg-slate-400';
  const badgeClasses = style.split(' ').filter((c) => !c.startsWith('dot-')).join(' ');

  const sizeClass = size === 'xs' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors ${badgeClasses} ${sizeClass}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColorClass}`} />}
      {label}
    </span>
  );
};

export default Badge;
