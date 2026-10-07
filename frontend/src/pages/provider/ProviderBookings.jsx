import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Calendar, Clock, CheckCircle, XCircle, Play, CheckCheck, ArrowRight } from 'lucide-react';

export const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getUserBookings(statusFilter);
      setBookings(data);
    } catch (err) {
      console.warn("Failed loading provider bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const handleAction = async (id, actionFn) => {
    try {
      await actionFn(id);
      loadBookings();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update booking status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Manage Service Requests & Jobs</h1>
        <p className="text-slate-500 text-sm mt-1">Accept customer booking requests, start jobs on-site, and mark completed jobs.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
        {['ALL', 'PENDING', 'ACCEPTED', 'STARTED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
              statusFilter === st ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading incoming requests...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Requests Found</h3>
          <p className="text-xs text-slate-500">No booking requests found for status '{statusFilter}'.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-lg">{b.bookingId}</span>
                  <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-extrabold rounded-md border border-brand-100">
                    {b.serviceName}
                  </span>
                  <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    b.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    b.status === 'STARTED' ? 'bg-purple-100 text-purple-800' :
                    b.status === 'ACCEPTED' ? 'bg-brand-100 text-brand-800' :
                    b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-slate-200 text-slate-700'
                  }`}>
                    {b.status}
                  </span>
                </div>

                <p className="text-xs text-slate-700 font-medium pt-1">
                  Customer: <span className="font-bold text-slate-900">{b.customerName}</span> ({b.customerPhone})
                </p>
                <p className="text-xs text-slate-500">
                  Scheduled: <span className="font-bold text-slate-800">{b.bookingDate} ({b.timeSlot})</span>
                </p>
                <p className="text-xs text-slate-500">Address: {b.address}, {b.city}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                {b.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleAction(b.id, bookingService.acceptBooking)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleAction(b.id, bookingService.rejectBooking)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl"
                    >
                      Reject
                    </button>
                  </>
                )}

                {b.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleAction(b.id, bookingService.startBooking)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" /> Start Job
                  </button>
                )}

                {b.status === 'STARTED' && (
                  <button
                    onClick={() => handleAction(b.id, bookingService.completeBooking)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" /> Complete Job
                  </button>
                )}

                <Link
                  to={`/customer/bookings/${b.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors"
                >
                  View Details
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
