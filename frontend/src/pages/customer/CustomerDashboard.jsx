import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { bookingService } from '../../services/bookingService';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Star, 
  MessageSquare, 
  Plus, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await bookingService.getUserBookings();
        setBookings(data);
      } catch (err) {
        console.warn("Failed fetching customer bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'PENDING').length;
  const accepted = bookings.filter(b => b.status === 'ACCEPTED' || b.status === 'STARTED').length;
  const completed = bookings.filter(b => b.status === 'COMPLETED').length;
  const cancelled = bookings.filter(b => b.status === 'CANCELLED' || b.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Welcome back, {user?.fullName}</h1>
          <p className="text-xs text-slate-500 font-medium">Manage your service appointments, track status, and rate providers.</p>
        </div>

        <Link
          to="/services"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Book New Service
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-slate-400 block mb-1">Total Bookings</span>
          <span className="text-2xl font-extrabold text-slate-900">{total}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-amber-500 block mb-1">Pending</span>
          <span className="text-2xl font-extrabold text-amber-600">{pending}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-brand-500 block mb-1">Active</span>
          <span className="text-2xl font-extrabold text-brand-600">{accepted}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-bold uppercase text-emerald-500 block mb-1">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-600">{completed}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-xs font-bold uppercase text-red-400 block mb-1">Cancelled</span>
          <span className="text-2xl font-extrabold text-red-500">{cancelled}</span>
        </div>

      </div>

      {/* Recent Bookings List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Your Recent Bookings</h2>
          <Link to="/customer/bookings" className="text-xs font-bold text-brand-600 hover:underline">
            View All History
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">Loading your bookings...</div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">You have no service bookings yet.</p>
            <Link to="/services" className="inline-block px-4 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl">
              Browse Available Services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.slice(0, 5).map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-brand-50/50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm">{b.bookingId}</span>
                    <span className="text-xs font-bold text-slate-600">• {b.serviceName}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Provider: {b.providerBusinessName} • Scheduled: {b.bookingDate} ({b.timeSlot})
                  </p>
                </div>

                <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {b.status}
                  </span>
                  <Link
                    to={`/customer/bookings/${b.id}`}
                    className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-brand-600 font-bold text-xs rounded-xl shadow-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
