import React from 'react';

export const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/50 dark:bg-slate-900/50 space-y-4">
    <div className="flex items-center justify-between">
      <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      <div className="w-16 h-6 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse" />
    </div>
    <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
      <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
    </div>
  </div>
);

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className={`${sizes[size]} border-brand-500 border-t-transparent rounded-full animate-spin`} />
    </div>
  );
};
