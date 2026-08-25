import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 gap-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} animate-spin text-indigo-600`} />
      {text && <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>}
    </div>
  );
};

export default Loader;
