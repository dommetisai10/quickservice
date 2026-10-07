import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { providerService } from '../../services/providerService';
import { serviceService } from '../../services/serviceService';
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Award, 
  Compass, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { BackButton } from '../../components/common/BackButton';

export const ProviderEditProfile = () => {
  const { user, refreshUser } = useAuth();
  
  const [providerData, setProviderData] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    businessName: '',
    description: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    hourlyRate: 50,
    serviceRadius: 15,
    experience: 3,
    profileImage: '',
    serviceCategories: []
  });

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        // Fetch active service categories
        const services = await serviceService.getAllServices();
        setAvailableCategories(services || []);

        if (user?.providerId) {
          const profile = await providerService.getProviderById(user.providerId);
          setProviderData(profile);
          setForm({
            businessName: profile.businessName || user.fullName || '',
            description: profile.description || '',
            phone: profile.phone || user.phone || '',
            address: profile.address || user.address || '',
            city: profile.city || user.city || '',
            state: profile.state || user.state || '',
            pincode: profile.pincode || user.pincode || '',
            hourlyRate: profile.hourlyRate || 50,
            serviceRadius: profile.serviceRadius || 15,
            experience: profile.experience || 3,
            profileImage: profile.profileImage || user.profileImage || '',
            serviceCategories: profile.serviceCategories || []
          });
        }
      } catch (err) {
        console.error("Failed to load provider profile:", err);
        setError("Failed to load provider profile details.");
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [user]);

  const toggleCategory = (catName) => {
    setForm(prev => {
      const exists = prev.serviceCategories.includes(catName);
      if (exists) {
        return { ...prev, serviceCategories: prev.serviceCategories.filter(c => c !== catName) };
      } else {
        return { ...prev, serviceCategories: [...prev.serviceCategories, catName] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (form.serviceCategories.length === 0) {
      setError('Please select at least one service category.');
      return;
    }

    setSaving(true);

    try {
      if (user?.providerId) {
        await providerService.updateProviderProfile(user.providerId, {
          businessName: form.businessName,
          description: form.description,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          hourlyRate: Number(form.hourlyRate),
          serviceRadius: Number(form.serviceRadius),
          experience: Number(form.experience),
          profileImage: form.profileImage,
          serviceCategories: form.serviceCategories
        });

        await refreshUser();
        setSuccess('Business profile and service settings updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update provider profile.');
    } finally {
      setSaving(false);
    }
  };

  const status = providerData?.verificationStatus || user?.verificationStatus || 'PENDING';

  const getStatusBadge = () => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Account Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" /> Account Rejected
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-200 text-slate-800 border border-slate-300">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600" /> Account Suspended
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" /> Pending Admin Verification
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 text-sm font-medium">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header section with back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <BackButton fallback="/provider/dashboard" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provider Business Profile</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage your public business listing, rates, service area, and service offerings.
          </p>
        </div>
        <div>
          {getStatusBadge()}
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-semibold flex items-center gap-2 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1: Business Identity & Bio */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Business Identity & Contact</h2>
              <p className="text-xs text-slate-500">Your brand title, description, and direct contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Title / Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Apex Electrical & Appliance Care"
                value={form.businessName}
                onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
              <input
                type="tel"
                required
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Business Description / Overview</label>
            <textarea
              rows={3}
              placeholder="Describe your expertise, certifications, background, and specialities..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Profile Avatar Image URL</label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={form.profileImage}
                onChange={(e) => setForm({ ...form, profileImage: e.target.value })}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white transition-all"
              />
              <img
                src={form.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.businessName || 'provider'}`}
                alt="Avatar Preview"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing, Experience & Radius */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pricing & Service Range</h2>
              <p className="text-xs text-slate-500">Set your hourly rates, experience, and service radius</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hourly Rate (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                <input
                  type="number"
                  min="1"
                  step="5"
                  required
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Experience (Years) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="50"
                  required
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Service Radius (km) *</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={form.serviceRadius}
                  onChange={(e) => setForm({ ...form, serviceRadius: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-extrabold focus:outline-none focus:border-brand-500 focus:bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Service Categories Selection */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-brand-50 text-brand-600 rounded-2xl border border-brand-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Service Category Offerings *</h2>
              <p className="text-xs text-slate-500">Select all repair and service categories you provide</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {availableCategories.map((cat) => {
              const selected = form.serviceCategories.includes(cat.name);
              return (
                <button
                  key={cat._id || cat.id || cat.name}
                  type="button"
                  onClick={() => toggleCategory(cat.name)}
                  className={`p-3 rounded-2xl border text-xs font-extrabold flex items-center justify-between transition-all ${
                    selected 
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm' 
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-slate-100'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {selected ? (
                    <CheckCircle2 className="w-4 h-4 text-white shrink-0 ml-1" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 shrink-0 ml-1"></span>
                  )}
                </button>
              );
            })}
          </div>
          {availableCategories.length === 0 && (
            <p className="text-xs text-slate-400 italic">Loading active categories...</p>
          )}
        </div>

        {/* Section 4: Location Address */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Base Location & Address</h2>
              <p className="text-xs text-slate-500">Customers will search for providers in this region</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address *</label>
            <input
              type="text"
              required
              placeholder="e.g. Shop 4, Sunshine Commercial Hub, Link Road"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
              <input
                type="text"
                required
                placeholder="Mumbai"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
              <input
                type="text"
                required
                placeholder="Maharashtra"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pincode *</label>
              <input
                type="text"
                required
                placeholder="400001"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          {saving ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Save Business Profile Changes</span>
            </>
          )}
        </button>

      </form>

    </div>
  );
};
