import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingService } from '../../services/bookingService';
import { Calendar, Clock, Search, ArrowRight } from 'lucide-react';

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const data = await bookingService.getUserBookings(statusFilter);
      setBookings(data);
    } catch (err) {
      console.warn("Failed fetching customer bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">My Service Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Track appointment progress, view details, or cancel eligible requests.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
        {['ALL', 'PENDING', 'ACCEPTED', 'STARTED', 'COMPLETED', 'CANCELLED'].map((st) => (
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

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Bookings Found</h3>
          <p className="text-xs text-slate-500">No booking records match the filter '{statusFilter}'.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-card transition-all">
              
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-slate-900 text-lg">{b.bookingId}</span>
                  <span className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-extrabold rounded-md border border-brand-100">
                    {b.serviceName}
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Provider: <span className="font-bold text-slate-800">{b.providerBusinessName}</span> • Date: <span className="font-bold text-slate-800">{b.bookingDate} ({b.timeSlot})</span>
                </p>
                <p className="text-xs text-slate-500 line-clamp-1">Address: {b.address}, {b.city}</p>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">Estimated Price</span>
                  <span className="text-lg font-extrabold text-slate-900">₹{b.estimatedPrice}</span>
                </div>

                <Link
                  to={`/customer/bookings/${b.id}`}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <span>Details</span> <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
