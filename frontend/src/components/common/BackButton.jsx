import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const BackButton = ({ fallback = null, className = "" }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else if (fallback) {
      navigate(fallback);
    } else {
      // Default fallback based on role
      if (user?.role === 'ADMIN') navigate('/admin/dashboard');
      else if (user?.role === 'PROVIDER') navigate('/provider/dashboard');
      else if (user?.role === 'CUSTOMER') navigate('/customer/dashboard');
      else navigate('/');
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Go back to previous page"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-brand-600" />
      <span>Back</span>
    </button>
  );
};
