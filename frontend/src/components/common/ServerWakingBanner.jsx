import React, { useState, useEffect } from 'react';
import { Loader2, Server } from 'lucide-react';

export const ServerWakingBanner = () => {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => {
    let timer = null;

    const handleSlowRequestStart = () => {
      timer = setTimeout(() => {
        setIsWaking(true);
      }, 2500); // Trigger banner if response takes longer than 2.5s
    };

    const handleSlowRequestEnd = () => {
      if (timer) clearTimeout(timer);
      setIsWaking(false);
    };

    window.addEventListener('qs-api-request-start', handleSlowRequestStart);
    window.addEventListener('qs-api-request-end', handleSlowRequestEnd);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('qs-api-request-start', handleSlowRequestStart);
      window.removeEventListener('qs-api-request-end', handleSlowRequestEnd);
    };
  }, []);

  if (!isWaking) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-slate-900 px-4 py-2.5 shadow-lg border-b border-amber-600 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-top duration-300">
      <Server className="w-5 h-5 shrink-0 text-slate-900 animate-pulse" />
      <span className="text-xs sm:text-sm font-extrabold tracking-tight">
        Server is waking up on Render free tier... Please allow 30–60 seconds for initial startup.
      </span>
      <Loader2 className="w-4 h-4 animate-spin text-slate-900 shrink-0 ml-1" />
    </div>
  );
};
