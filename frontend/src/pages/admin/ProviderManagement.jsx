import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { serviceService } from '../../services/serviceService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { Search, Eye, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, ShieldCheck, X, Check, AlertCircle } from 'lucide-react';

export const ProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [viewProvider, setViewProvider] = useState(null);
  const [editProvider, setEditProvider] = useState(null);
  const [deleteProviderTarget, setDeleteProviderTarget] = useState(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    businessName: '',
    description: '',
    serviceCategories: [],
    experience: 0,
    hourlyRate: 0,
    address: '',
    city: '',
    state: '',
    pincode: '',
    serviceRadius: 10,
    isAvailable: true
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadProviders = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProviders({
        search,
        status: statusFilter,
        city: cityFilter,
        service: serviceFilter,
        page,
        limit
      });
      setProviders(data.providers || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast("Failed loading providers list.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProviders();
  }, [page, search, statusFilter, cityFilter, serviceFilter]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const categories = await serviceService.getCategories();
        setAvailableServices(categories);
      } catch (err) {
        console.warn("Failed loading service categories");
      }
    };
    fetchServices();
  }, []);

  const handleOpenView = async (p) => {
    try {
      const fullDetails = await adminService.getProviderById(p.id);
      setViewProvider(fullDetails);
    } catch (err) {
      setViewProvider(p);
    }
  };

  const handleOpenEdit = (p) => {
    setEditProvider(p);
    setEditForm({
      fullName: p.providerName || '',
      email: p.email || '',
      phone: p.phone || '',
      businessName: p.businessName || '',
      description: p.description || '',
      serviceCategories: p.serviceCategories || [],
      experience: p.experience || 0,
      hourlyRate: p.hourlyRate || 0,
      address: p.address || '',
      city: p.city || '',
      state: p.state || '',
      pincode: p.pincode || '',
      serviceRadius: p.serviceRadius || 10,
      isAvailable: p.isAvailable ?? true
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.updateProvider(editProvider.id, editForm);
      showToast("Provider profile updated successfully!");
      setEditProvider(null);
      loadProviders();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update provider.", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyStatus = async (providerId, newStatus) => {
    try {
      await adminService.verifyProviderStatus(providerId, newStatus);
      showToast(`Provider status updated to ${newStatus}!`);
      loadProviders();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update status.", 'error');
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteProvider(deleteProviderTarget.id);
      showToast("Provider deleted permanently.");
      setDeleteProviderTarget(null);
      loadProviders();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete provider.", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleCategorySelection = (catName) => {
    setEditForm(prev => {
      const exists = prev.serviceCategories.includes(catName);
      return {
        ...prev,
        serviceCategories: exists
          ? prev.serviceCategories.filter(c => c !== catName)
          : [...prev.serviceCategories, catName]
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-2 animate-bounce ${
          toast.type === 'error' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-red-500" /> : <Check className="w-4 h-4 text-emerald-500" />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Provider Approvals & Management</h1>
        <p className="text-slate-500 text-sm mt-1">Review provider applications, approve verification, edit business profiles, or suspend accounts.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === st ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Filter city..."
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 w-32"
          />

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search business name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Service Providers...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-bold">No providers found matching filters.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Business / Contact</th>
                  <th className="py-4 px-6">Services Offered</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Rating & Jobs</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {p.businessName?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{p.businessName}</span>
                          <span className="text-xs text-slate-500">{p.providerName} • {p.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {p.serviceCategories?.slice(0, 2).map((cat, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium text-[10px]">
                            {cat}
                          </span>
                        ))}
                        {p.serviceCategories?.length > 2 && (
                          <span className="text-[10px] text-slate-400 font-bold">+{p.serviceCategories.length - 2} more</span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {p.city ? `${p.city}, ${p.state || ''}` : 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-xs">
                      <span className="font-extrabold text-amber-600">★ {p.rating || 4.8}</span>
                      <span className="text-slate-400 block font-medium">{p.completedJobs || 0} jobs done</span>
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={p.verificationStatus} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(p)}
                          title="View Details"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          title="Edit Provider"
                          className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {p.verificationStatus !== 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyStatus(p.id, 'VERIFIED')}
                            title="Verify Provider"
                            className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-all"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {p.verificationStatus === 'VERIFIED' && (
                          <button
                            onClick={() => handleVerifyStatus(p.id, 'SUSPENDED')}
                            title="Suspend Provider"
                            className="p-1.5 hover:bg-orange-50 rounded-lg text-orange-600 transition-all"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}

                        {p.verificationStatus === 'PENDING' && (
                          <button
                            onClick={() => handleVerifyStatus(p.id, 'REJECTED')}
                            title="Reject Provider"
                            className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => setDeleteProviderTarget(p)}
                          title="Delete Permanently"
                          className="p-1.5 hover:bg-red-50 rounded-lg text-red-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={(pg) => setPage(pg)}
          />
        </div>
      )}

      {/* VIEW MODAL */}
      {viewProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <button onClick={() => setViewProvider(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-slate-900">{viewProvider.businessName}</h3>
                <StatusBadge status={viewProvider.verificationStatus} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Owner: {viewProvider.user?.fullName || viewProvider.providerName} • {viewProvider.user?.email || viewProvider.email}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs space-y-2">
              <p className="text-slate-600 italic">"{viewProvider.description || 'No business description provided.'}"</p>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div><span className="text-slate-400 block font-medium">Hourly Rate</span> <span className="font-extrabold text-slate-900">₹{viewProvider.hourlyRate}/hr</span></div>
                <div><span className="text-slate-400 block font-medium">Experience</span> <span className="font-extrabold text-slate-900">{viewProvider.experience} Years</span></div>
                <div><span className="text-slate-400 block font-medium">Location</span> <span className="font-bold text-slate-800">{viewProvider.city}, {viewProvider.state}</span></div>
                <div><span className="text-slate-400 block font-medium">Service Radius</span> <span className="font-bold text-slate-800">{viewProvider.serviceRadius || 10} KM</span></div>
              </div>
            </div>

            {viewProvider.stats && (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-brand-50/60 p-3 rounded-2xl border border-brand-100">
                  <span className="text-lg font-extrabold text-brand-700 block">{viewProvider.stats.totalBookings}</span>
                  <span className="text-[10px] font-bold text-brand-600 uppercase">Bookings</span>
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <span className="text-lg font-extrabold text-emerald-700 block">{viewProvider.stats.activeBookings}</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Active Jobs</span>
                </div>
                <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                  <span className="text-lg font-extrabold text-purple-700 block">{viewProvider.stats.reviewsReceived}</span>
                  <span className="text-[10px] font-bold text-purple-600 uppercase">Reviews</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 relative my-8">
            <button type="button" onClick={() => setEditProvider(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Edit Provider & User Profile</h3>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.businessName}
                    onChange={(e) => setEditForm({ ...editForm, businessName: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Service Categories</label>
                <div className="flex flex-wrap gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {availableServices.map((cat) => {
                    const isSelected = editForm.serviceCategories.includes(cat.name);
                    return (
                      <button
                        type="button"
                        key={cat.id || cat.name}
                        onClick={() => toggleCategorySelection(cat.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          isSelected ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-slate-600 border-slate-200 hover:border-brand-300'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={editForm.hourlyRate}
                    onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Experience (Yrs)</label>
                  <input
                    type="number"
                    value={editForm.experience}
                    onChange={(e) => setEditForm({ ...editForm, experience: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Radius (KM)</label>
                  <input
                    type="number"
                    value={editForm.serviceRadius}
                    onChange={(e) => setEditForm({ ...editForm, serviceRadius: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditProvider(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Saving...' : 'Save Provider Profile'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteProviderTarget}
        onClose={() => setDeleteProviderTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
        title="Permanently Delete Provider?"
        message={`Are you sure you want to delete ${deleteProviderTarget?.businessName}? (Note: If this provider has active bookings, deletion will be blocked by system rules. Consider suspending instead).`}
        confirmText="Delete Permanently"
        confirmStyle="danger"
      />

    </div>
  );
};
