import React from 'react';
import { CheckCircle, XCircle, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const s = String(status || '').toUpperCase();

  if (s === 'VERIFIED' || s === 'ACTIVE') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        {s === 'ACTIVE' ? 'Active' : 'Verified'}
      </span>
    );
  }

  if (s === 'PENDING') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        Pending
      </span>
    );
  }

  if (s === 'SUSPENDED') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200 inline-flex items-center gap-1">
        <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
        Suspended
      </span>
    );
  }

  if (s === 'REJECTED' || s === 'DEACTIVATED' || s === 'INACTIVE') {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 inline-flex items-center gap-1">
        <XCircle className="w-3.5 h-3.5 text-red-500" />
        {s === 'INACTIVE' || s === 'DEACTIVATED' ? 'Inactive' : 'Rejected'}
      </span>
    );
  }

  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};
