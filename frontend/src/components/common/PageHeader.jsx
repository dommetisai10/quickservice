import React from 'react';
import { BackButton } from './BackButton';

export const PageHeader = ({ title, subtitle, showBack = true, backFallback = null, actions = null }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
      <div className="space-y-1">
        {showBack && <div className="mb-2"><BackButton fallback={backFallback} /></div>}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-slate-500 text-xs sm:text-sm font-medium">{subtitle}</p>}
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
