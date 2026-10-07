import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { AlertCircle, CheckCircle2, MessageSquare, Save, X, Search } from 'lucide-react';

export const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Resolution Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [targetStatus, setTargetStatus] = useState('RESOLVED');
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = async () => {
    try {
      const response = await api.get('/complaints', { params: { status: statusFilter } });
      setComplaints(response.data);
    } catch (err) {
      console.warn("Failed fetching complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, [statusFilter]);

  const openModal = (c) => {
    setSelectedComplaint(c);
    setTargetStatus(c.status === 'OPEN' ? 'RESOLVED' : c.status);
    setAdminResponse(c.adminResponse || '');
  };

  const handleSaveResolution = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/complaints/${selectedComplaint.id}`, {
        status: targetStatus,
        adminResponse
      });
      setSelectedComplaint(null);
      loadComplaints();
    } catch (err) {
      alert("Failed to update complaint resolution.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Customer Complaints Management</h1>
        <p className="text-slate-500 text-sm mt-1">Review disputed service bookings, communicate resolutions, and manage ticket status.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-fit">
        {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              statusFilter === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading complaint tickets...</div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3 max-w-md mx-auto">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No Complaints Found</h3>
          <p className="text-xs text-slate-500">No active complaint tickets for status '{statusFilter}'.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-extrabold text-slate-900 text-base">Booking Ref: {c.bookingId}</span>
                  <p className="text-xs text-slate-500 font-medium">
                    Customer: <span className="font-bold text-slate-800">{c.customerName}</span> • Provider: <span className="font-bold text-slate-800">{c.providerBusinessName}</span>
                  </p>
                </div>

                <span className={`px-3 py-1 text-xs font-extrabold rounded-full self-start sm:self-auto ${
                  c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  c.status === 'IN_PROGRESS' ? 'bg-brand-50 text-brand-700 border border-brand-200' :
                  c.status === 'OPEN' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {c.status}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <span className="font-extrabold text-slate-900 block text-sm">{c.subject}</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">{c.description}</p>
                
                {c.adminResponse && (
                  <div className="p-3 bg-brand-50/60 rounded-xl border border-brand-100 text-brand-900 mt-2">
                    <span className="font-bold block text-[11px] text-brand-700 uppercase">Admin Resolution Note:</span>
                    <p className="mt-0.5">{c.adminResponse}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => openModal(c)}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4" /> Resolve & Respond
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* RESOLUTION MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative border border-slate-100">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-extrabold text-slate-900">Resolve Complaint Ticket</h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Complaint Status</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Admin Official Response / Resolution Note *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Explain the resolution provided to the customer..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedComplaint(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Resolution
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
