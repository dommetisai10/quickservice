import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Search, Filter, Clock, ArrowRight } from 'lucide-react';

export const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      const response = await api.get('/bookings', { params: { status: statusFilter } });
      setBookings(response.data);
    } catch (err) {
      console.warn("Failed fetching admin bookings list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [statusFilter]);

  const filteredBookings = bookings.filter(b => {
    if (!search) return true;
    const s = search.toLowerCase();
    return b.bookingId.toLowerCase().includes(s) ||
           b.customerName.toLowerCase().includes(s) ||
           b.providerBusinessName.toLowerCase().includes(s) ||
           b.serviceName.toLowerCase().includes(s);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">All System Bookings</h1>
        <p className="text-slate-500 text-sm mt-1">Audit, search, and inspect every customer service appointment across the platform.</p>
      </div>

      {/* Filter Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'ACCEPTED', 'STARTED', 'COMPLETED', 'REJECTED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search booking ID, customer, provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
          />
        </div>

      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading platform bookings...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Booking ID</th>
                  <th className="py-4 px-6">Service</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Provider</th>
                  <th className="py-4 px-6">Scheduled Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-extrabold text-slate-900">
                      {b.bookingId}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-800">
                      {b.serviceName}
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <span className="font-bold text-slate-900 block">{b.customerName}</span>
                      <span className="text-slate-500">{b.customerPhone}</span>
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <span className="font-bold text-slate-900 block">{b.providerBusinessName}</span>
                      <span className="text-slate-500">{b.providerPhone}</span>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {b.bookingDate} ({b.timeSlot})
                    </td>

                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                        b.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        b.status === 'STARTED' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                        b.status === 'ACCEPTED' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                        b.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/customer/bookings/${b.id}`}
                        className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
