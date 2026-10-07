import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Calendar, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const BookingDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const isJustCreated = searchParams.get('created') === 'true';

  const loadBooking = async () => {
    try {
      const b = await bookingService.getBookingDetails(id);
      setBooking(b);
    } catch (err) {
      console.warn("Failed loading booking details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooking();
  }, [id]);

  const handleAction = async (actionFn, targetStatus) => {
    setActionLoading(true);
    setMsg('');
    try {
      await actionFn(booking.id);
      setMsg(`Booking status updated to ${targetStatus} successfully!`);
      loadBooking();
    } catch (err) {
      alert(err.response?.data?.detail || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">Fetching Booking Details...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Booking Not Found</h2>
        <Link to="/" className="inline-block px-4 py-2 bg-brand-600 text-white font-bold text-xs rounded-xl">
          Back Home
        </Link>
      </div>
    );
  }

  // Calculate timeline active step index
  const getTimelineStep = () => {
    if (booking.status === 'COMPLETED') return 4;
    if (booking.status === 'STARTED') return 3;
    if (booking.status === 'ACCEPTED') return 2;
    if (booking.status === 'PENDING') return 1;
    return 0; // REJECTED or CANCELLED
  };

  const timelineIndex = getTimelineStep();
  const isCancelledOrRejected = booking.status === 'CANCELLED' || booking.status === 'REJECTED';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <PageHeader
        title={`Booking #${booking.bookingId}`}
        subtitle={`Created on ${booking.createdAt}`}
      />

      {isJustCreated && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>Booking confirmed successfully! Unique ID <strong>{booking.bookingId}</strong> generated.</span>
        </div>
      )}

      {msg && (
        <div className="p-4 bg-brand-50 border border-brand-200 rounded-2xl text-brand-800 text-xs font-semibold flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-xs uppercase font-extrabold text-brand-600 tracking-wider block">Booking Reference</span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1">{booking.bookingId}</h1>
          <p className="text-sm font-semibold text-slate-600 mt-1">{booking.serviceName}</p>
        </div>

        <div>
          <span className={`px-4 py-1.5 text-xs font-extrabold rounded-full inline-flex items-center gap-1.5 ${
            booking.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            booking.status === 'STARTED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
            booking.status === 'ACCEPTED' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
            booking.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <Clock className="w-4 h-4" /> {booking.status}
          </span>
        </div>
      </div>

      {/* VISUAL TIMELINE PROGRESS BAR */}
      {!isCancelledOrRejected ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <h2 className="text-base font-extrabold text-slate-900">Service Progress Timeline</h2>
          
          <div className="grid grid-cols-4 gap-2 text-center relative">
            
            {/* Connecting Line */}
            <div className="absolute top-4 left-[12%] right-[12%] h-1 bg-slate-200 -z-0">
              <div 
                className="h-full bg-brand-600 transition-all duration-500" 
                style={{ width: `${((timelineIndex - 1) / 3) * 100}%` }}
              ></div>
            </div>

            {/* Step 1: Created */}
            <div className="relative z-10 space-y-2">
              <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                timelineIndex >= 1 ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
              }`}>
                ✓
              </div>
              <span className={`block text-xs font-extrabold ${timelineIndex >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                Booking Created
              </span>
            </div>

            {/* Step 2: Accepted */}
            <div className="relative z-10 space-y-2">
              <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                timelineIndex >= 2 ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
              }`}>
                {timelineIndex >= 2 ? '✓' : '2'}
              </div>
              <span className={`block text-xs font-extrabold ${timelineIndex >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                Provider Accepted
              </span>
            </div>

            {/* Step 3: Started */}
            <div className="relative z-10 space-y-2">
              <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                timelineIndex >= 3 ? 'bg-brand-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
              }`}>
                {timelineIndex >= 3 ? '✓' : '3'}
              </div>
              <span className={`block text-xs font-extrabold ${timelineIndex >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                Service Started
              </span>
            </div>

            {/* Step 4: Completed */}
            <div className="relative z-10 space-y-2">
              <div className={`w-9 h-9 rounded-full mx-auto flex items-center justify-center font-bold text-xs ${
                timelineIndex >= 4 ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-200 text-slate-500'
              }`}>
                {timelineIndex >= 4 ? '✓' : '4'}
              </div>
              <span className={`block text-xs font-extrabold ${timelineIndex >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
                Service Completed
              </span>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-red-700 text-xs font-semibold text-center">
          This booking was {booking.status}. No further progress updates are active.
        </div>
      )}

      {/* Booking Details Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Schedule & Address */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Schedule & Location</h2>
          
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-brand-600 shrink-0" />
              <div>
                <span className="text-slate-400 block font-semibold">Date & Time Slot</span>
                <span className="font-bold text-slate-800">{booking.bookingDate} ({booking.timeSlot})</span>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-2 border-t border-slate-50">
              <MapPin className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-400 block font-semibold">Service Address</span>
                <span className="font-medium text-slate-800">{booking.address}, {booking.city}, {booking.state} - {booking.pincode}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <span className="text-slate-400 block font-semibold">Problem Description</span>
              <p className="text-slate-700 mt-1 leading-relaxed">{booking.description}</p>
            </div>
          </div>
        </div>

        {/* Right: Contact & Pricing */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Party Contacts & Price</h2>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold">Customer</span>
              <span className="font-bold text-slate-800">{booking.customerName} ({booking.customerPhone})</span>
            </div>

            <div className="pt-2 border-t border-slate-50">
              <span className="text-slate-400 block font-semibold">Provider Business</span>
              <span className="font-bold text-slate-800">{booking.providerBusinessName} ({booking.providerPhone})</span>
            </div>

            <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
              <span className="text-slate-400 font-bold">Estimated Cost</span>
              <span className="text-2xl font-extrabold text-slate-900">₹{booking.estimatedPrice}</span>
            </div>
          </div>

          {/* Action Buttons Depending on User Role */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
            
            {/* Customer Action: Cancel */}
            {user?.role === 'CUSTOMER' && booking.status === 'PENDING' && (
              <button
                onClick={() => handleAction(bookingService.cancelBooking, 'CANCELLED')}
                disabled={actionLoading}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-xl transition-colors"
              >
                Cancel Booking
              </button>
            )}

            {/* Provider Actions */}
            {user?.role === 'PROVIDER' && (
              <>
                {booking.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-2 w-full">
                    <button
                      onClick={() => handleAction(bookingService.acceptBooking, 'ACCEPTED')}
                      disabled={actionLoading}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleAction(bookingService.rejectBooking, 'REJECTED')}
                      disabled={actionLoading}
                      className="py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                    >
                      Reject Request
                    </button>
                  </div>
                )}

                {booking.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleAction(bookingService.startBooking, 'STARTED')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl"
                  >
                    Start Service Job
                  </button>
                )}

                {booking.status === 'STARTED' && (
                  <button
                    onClick={() => handleAction(bookingService.completeBooking, 'COMPLETED')}
                    disabled={actionLoading}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                  >
                    Mark Job Completed
                  </button>
                )}
              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
