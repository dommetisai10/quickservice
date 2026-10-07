import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { providerService } from '../../services/providerService';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Star, 
  ShieldAlert, 
  Calendar,
  Settings,
  User,
  ArrowRight
} from 'lucide-react';

export const ProviderDashboard = () => {
  const { user } = useAuth();
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const mockStats = {
    totalRequests: 24,
    pendingRequests: 3,
    acceptedJobs: 5,
    completedJobs: 14,
    cancelledJobs: 2,
    totalEarnings: 8400,
    averageRating: 4.8,
    totalReviews: 12
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.providerId) {
        try {
          const p = await providerService.getProviderById(user.providerId);
          setProviderProfile(p);
        } catch (err) {
          console.warn("Error fetching provider profile:", err);
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const verificationStatus = providerProfile?.verificationStatus || user?.verificationStatus || 'PENDING';
  const isVerified = verificationStatus === 'VERIFIED';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <img
            src={user?.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.fullName}`}
            alt={user?.fullName}
            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200"
          />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Welcome, {providerProfile?.businessName || user?.fullName}
            </h1>
            <p className="text-xs text-slate-500 font-medium">Provider ID: QS-PROV-{user?.providerId?.slice(-6) || '001'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/provider/availability"
            className="px-4 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl border border-brand-200 hover:bg-brand-100 transition-colors flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4" /> Manage Availability
          </Link>
          <Link
            to="/provider/profile"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <User className="w-4 h-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Verification Status Warning Alert */}
      {!isVerified && (
        <div className="bg-amber-50 border-2 border-amber-300 p-6 rounded-3xl text-amber-900 flex items-start gap-4 shadow-sm">
          <ShieldAlert className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-base font-extrabold">Account Pending Admin Verification</h3>
            <p className="text-xs leading-relaxed font-medium">
              Your provider account is waiting for admin verification. You cannot accept customer booking requests until our platform team verifies your registration details.
            </p>
          </div>
        </div>
      )}

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Requests</span>
          <span className="text-2xl font-extrabold text-slate-900">{mockStats.totalRequests}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-amber-500 font-bold uppercase block mb-1">Pending</span>
          <span className="text-2xl font-extrabold text-amber-600">{mockStats.pendingRequests}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-brand-500 font-bold uppercase block mb-1">Accepted</span>
          <span className="text-2xl font-extrabold text-brand-600">{mockStats.acceptedJobs}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-emerald-500 font-bold uppercase block mb-1">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600">{mockStats.completedJobs}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-red-400 font-bold uppercase block mb-1">Cancelled</span>
          <span className="text-2xl font-extrabold text-red-500">{mockStats.cancelledJobs}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-slate-400 font-bold uppercase block mb-1">Earnings</span>
          <span className="text-2xl font-extrabold text-slate-900">₹{mockStats.totalEarnings}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs text-amber-500 font-bold uppercase block mb-1">Rating</span>
          <span className="text-2xl font-extrabold text-amber-500 flex items-center justify-center gap-1">
            <Star className="w-4 h-4 fill-amber-400" /> {mockStats.averageRating}
          </span>
        </div>

      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Provider Control Hub</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/provider/bookings"
            className="p-4 bg-slate-50 hover:bg-brand-50 rounded-2xl border border-slate-200 hover:border-brand-200 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-brand-700 text-sm">Booking Requests</h3>
              <p className="text-xs text-slate-500">Accept, reject, start, and complete jobs</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/provider/availability"
            className="p-4 bg-slate-50 hover:bg-brand-50 rounded-2xl border border-slate-200 hover:border-brand-200 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-brand-700 text-sm">Manage Availability</h3>
              <p className="text-xs text-slate-500">Working days, hours & status toggle</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            to="/provider/reviews"
            className="p-4 bg-slate-50 hover:bg-brand-50 rounded-2xl border border-slate-200 hover:border-brand-200 transition-all flex items-center justify-between group"
          >
            <div>
              <h3 className="font-bold text-slate-900 group-hover:text-brand-700 text-sm">Customer Reviews</h3>
              <p className="text-xs text-slate-500">Check ratings and feedback comments</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>

    </div>
  );
};
