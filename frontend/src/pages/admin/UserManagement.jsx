import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/admin/Pagination';
import { ConfirmModal } from '../../components/admin/ConfirmModal';
import { Search, Eye, Edit2, Trash2, Power, Lock, X, Check, AlertCircle } from 'lucide-react';

export const UserManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cityFilter, setCityFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [viewCustomer, setViewCustomer] = useState(null);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomerTarget, setDeleteCustomerTarget] = useState(null);
  const [resetPassCustomer, setResetPassCustomer] = useState(null);

  // Form states
  const [editForm, setEditForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profileImage: '',
    isActive: true
  });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminService.getCustomers({
        role: 'CUSTOMER',
        search,
        status: statusFilter,
        city: cityFilter,
        page,
        limit
      });
      setCustomers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      showToast("Failed loading customers list.", 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [page, search, statusFilter, cityFilter]);

  const handleOpenView = async (user) => {
    try {
      const fullDetails = await adminService.getCustomerById(user.id);
      setViewCustomer(fullDetails);
    } catch (err) {
      setViewCustomer(user);
    }
  };

  const handleOpenEdit = (user) => {
    setEditCustomer(user);
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      pincode: user.pincode || '',
      profileImage: user.profileImage || '',
      isActive: user.isActive ?? True
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.updateCustomer(editCustomer.id, editForm);
      showToast("Customer profile updated successfully!");
      setEditCustomer(null);
      loadCustomers();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update customer.", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await adminService.toggleUserStatus(user.id, !user.isActive);
      showToast(`Customer account ${!user.isActive ? 'activated' : 'deactivated'}!`);
      loadCustomers();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update status.", 'error');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPasswordInput.length < 8) {
      showToast("Password must be at least 8 characters.", 'error');
      return;
    }
    setActionLoading(true);
    try {
      await adminService.resetCustomerPassword(resetPassCustomer.id, newPasswordInput);
      showToast("Password reset successfully!");
      setResetPassCustomer(null);
      setNewPasswordInput('');
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to reset password.", 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    setActionLoading(true);
    try {
      await adminService.deleteCustomer(deleteCustomerTarget.id);
      showToast("Customer deleted permanently.");
      setDeleteCustomerTarget(null);
      loadCustomers();
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to delete customer.", 'error');
    } finally {
      setActionLoading(false);
    }
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
        <h1 className="text-3xl font-extrabold text-slate-900">Customer Account Management</h1>
        <p className="text-slate-500 text-sm mt-1">Manage registered customer accounts, view service stats, update profiles, or reset passwords.</p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {['ALL', 'ACTIVE', 'INACTIVE'].map((st) => (
            <button
              key={st}
              onClick={() => { setStatusFilter(st); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
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
            className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 w-36"
          />

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search name, email, or phone..."
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
          <p className="text-slate-500 text-sm font-medium">Loading Customers...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
          <p className="text-slate-500 text-sm font-bold">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-4 px-6">Customer / Contact</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Joined Date</th>
                  <th className="py-4 px-6">Account Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-700 font-extrabold flex items-center justify-center text-xs shrink-0">
                          {c.fullName?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{c.fullName}</span>
                          <span className="text-xs text-slate-500">{c.email} • {c.phone}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      {c.city ? `${c.city}, ${c.state || ''}` : 'N/A'}
                    </td>

                    <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                      {c.createdAt}
                    </td>

                    <td className="py-4 px-6">
                      <StatusBadge status={c.isActive ? 'ACTIVE' : 'INACTIVE'} />
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenView(c)}
                          title="View Details"
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-all"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                          className="p-1.5 hover:bg-brand-50 rounded-lg text-brand-600 transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setResetPassCustomer(c)}
                          title="Reset Password"
                          className="p-1.5 hover:bg-amber-50 rounded-lg text-amber-600 transition-all"
                        >
                          <Lock className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(c)}
                          title={c.isActive ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-all ${
                            c.isActive ? 'hover:bg-orange-50 text-orange-600' : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteCustomerTarget(c)}
                          title="Delete Customer"
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
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* VIEW MODAL */}
      {viewCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative">
            <button onClick={() => setViewCustomer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-slate-900">{viewCustomer.fullName}</h3>
              <p className="text-xs text-slate-500">{viewCustomer.email} • {viewCustomer.phone}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs">
              <div><span className="text-slate-400 block font-medium">City / State</span> <span className="font-bold text-slate-800">{viewCustomer.city || 'N/A'}, {viewCustomer.state || ''}</span></div>
              <div><span className="text-slate-400 block font-medium">Pincode</span> <span className="font-bold text-slate-800">{viewCustomer.pincode || 'N/A'}</span></div>
              <div className="col-span-2"><span className="text-slate-400 block font-medium">Address</span> <span className="font-bold text-slate-800">{viewCustomer.address || 'N/A'}</span></div>
            </div>

            {viewCustomer.stats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-brand-50/60 p-3 rounded-2xl border border-brand-100">
                  <span className="text-lg font-extrabold text-brand-700 block">{viewCustomer.stats.totalBookings}</span>
                  <span className="text-[10px] font-bold text-brand-600 uppercase">Bookings</span>
                </div>
                <div className="bg-emerald-50/60 p-3 rounded-2xl border border-emerald-100">
                  <span className="text-lg font-extrabold text-emerald-700 block">{viewCustomer.stats.activeBookings}</span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Active</span>
                </div>
                <div className="bg-purple-50/60 p-3 rounded-2xl border border-purple-100">
                  <span className="text-lg font-extrabold text-purple-700 block">{viewCustomer.stats.reviewsSubmitted}</span>
                  <span className="text-[10px] font-bold text-purple-600 uppercase">Reviews</span>
                </div>
                <div className="bg-amber-50/60 p-3 rounded-2xl border border-amber-100">
                  <span className="text-lg font-extrabold text-amber-700 block">{viewCustomer.stats.complaintsFiled}</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase">Complaints</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleSaveEdit} className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <button type="button" onClick={() => setEditCustomer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Edit Customer Profile</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                />
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

              <div className="grid grid-cols-3 gap-3">
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
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pincode</label>
                  <input
                    type="text"
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3.5 py-2 border rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={editForm.isActive}
                  onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                  className="w-4 h-4 text-brand-600 rounded"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700">Account Active Status</label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <button type="button" onClick={() => setEditCustomer(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetPassCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleResetPassword} className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            <button type="button" onClick={() => setResetPassCustomer(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900">Reset Customer Password</h3>
            <p className="text-xs text-slate-500">Set a new temporary password for <strong>{resetPassCustomer.fullName}</strong>.</p>

            <div>
              <label className="font-bold text-slate-700 block mb-1 text-xs">New Password (min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Enter new password..."
                className="w-full px-3.5 py-2 border rounded-xl text-xs focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setResetPassCustomer(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-600">Cancel</button>
              <button type="submit" disabled={actionLoading} className="px-5 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">
                {actionLoading ? 'Updating...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      <ConfirmModal
        isOpen={!!deleteCustomerTarget}
        onClose={() => setDeleteCustomerTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={actionLoading}
        title="Permanently Delete Customer?"
        message={`Are you sure you want to delete ${deleteCustomerTarget?.fullName}? (Note: If this customer has active bookings, deletion will be blocked by system rules. Consider deactivating instead).`}
        confirmText="Delete Permanently"
        confirmStyle="danger"
      />

    </div>
  );
};
