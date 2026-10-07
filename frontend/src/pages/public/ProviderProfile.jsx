import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { useAuth } from '../../hooks/useAuth';
import { BackButton } from '../../components/common/BackButton';
import { 
  Star, 
  ShieldCheck, 
  MapPin, 
  Briefcase, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  Award, 
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

export const ProviderProfile = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const defaultMockProvider = {
    _id: id || 'p1',
    businessName: 'Apex Electrical & AC Care',
    fullName: 'Rahul Sharma',
    serviceCategories: ['Electrician', 'AC Repair'],
    description: 'Certified electrical repair specialist with over 8 years of field experience in residential wiring and AC servicing. We use genuine spare parts and offer a 30-day service warranty.',
    experience: 8,
    phone: '+91 9876543210',
    email: 'rahul@apexelectrical.com',
    address: '102 Industrial Estate, Andheri West',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400001',
    serviceRadius: 15,
    hourlyRate: 350,
    rating: 4.9,
    totalReviews: 128,
    completedJobs: 142,
    verificationStatus: 'VERIFIED',
    isAvailable: true,
    workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    workingHours: { start: '09:00 AM', end: '06:00 PM' },
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80',
    reviews: [
      { id: 'r1', customerName: 'Amit Patel', rating: 5, comment: 'Punctual and very polite technician. Fixed my AC cooling issue within 45 minutes!', date: '2026-03-15' },
      { id: 'r2', customerName: 'Neha Kapoor', rating: 5, comment: 'Great service. Installed our ceiling fans and fixed noisy switchboards cleanly.', date: '2026-02-28' }
    ]
  };

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const data = await providerService.getProviderById(id);
        setProvider(data || defaultMockProvider);
      } catch (err) {
        setProvider(defaultMockProvider);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=' + encodeURIComponent(`/customer/bookings/new?providerId=${provider._id}`));
      return;
    }
    if (user.role !== 'CUSTOMER') {
      alert('Only registered customer accounts can book services.');
      return;
    }
    navigate(`/customer/bookings/new?providerId=${provider._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-3"></div>
        <p className="text-slate-500 text-sm font-medium">Loading Expert Profile...</p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Provider Not Found</h2>
        <p className="text-sm text-slate-600">The requested provider profile does not exist or has been suspended.</p>
        <Link to="/providers" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-xl font-bold text-xs">
          Back to Providers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back Button */}
      <div>
        <BackButton fallback="/providers" />
      </div>

      {/* Main Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-card flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        <div className="flex items-start gap-6">
          <img
            src={provider.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.businessName}`}
            alt={provider.businessName}
            className="w-24 h-24 rounded-3xl object-cover bg-slate-100 border-2 border-brand-100 shadow-md shrink-0"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{provider.businessName}</h1>
              {provider.verificationStatus === 'VERIFIED' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-extrabold rounded-full border border-emerald-200">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> VERIFIED PROVIDER
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 font-medium">
              Lead Expert: <span className="text-slate-900 font-bold">{provider.fullName}</span>
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                {provider.rating} <span className="text-slate-500 font-normal">({provider.totalReviews} customer reviews)</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-brand-600" /> {provider.experience} Years Experience
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-brand-600" /> {provider.city}, {provider.state}
              </span>
            </div>
          </div>
        </div>

        {/* Right CTA Box */}
        <div className="w-full md:w-auto bg-slate-50 p-6 rounded-2xl border border-slate-200 flex flex-row md:flex-col justify-between items-center md:items-end gap-4 shrink-0">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400 block">Service Fee</span>
            <span className="text-3xl font-extrabold text-slate-900">₹{provider.hourlyRate}</span>
          </div>

          <button
            onClick={handleBookNow}
            disabled={!provider.isAvailable || provider.verificationStatus !== 'VERIFIED'}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-extrabold text-sm rounded-xl shadow-md transition-all hover:shadow-lg"
          >
            {!provider.isAvailable ? 'Currently Unavailable' : 'Book Appointment'}
          </button>
        </div>

      </div>

      {/* Grid Content: Profile Details + Customer Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* About Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">About the Business</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{provider.description}</p>
          </div>

          {/* Offered Services */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Specialized Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {provider.serviceCategories.map((cat, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="text-sm font-semibold text-slate-800">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Verified Customer Reviews</h2>
              <span className="text-xs font-semibold text-slate-500">{provider.totalReviews} Total Reviews</span>
            </div>

            {(!provider.reviews || provider.reviews.length === 0) ? (
              <p className="text-sm text-slate-500 italic py-4 text-center">No customer reviews published yet.</p>
            ) : (
              <div className="space-y-4">
                {provider.reviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{rev.customerName}</span>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400' : 'text-slate-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Sidebar: Availability & Operational Stats */}
        <div className="space-y-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" /> Working Schedule
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Working Days</span>
                <span className="font-bold text-slate-800">{provider.workingDays?.join(', ') || 'Mon - Sat'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Working Hours</span>
                <span className="font-bold text-slate-800">
                  {provider.workingHours?.start || '09:00 AM'} - {provider.workingHours?.end || '06:00 PM'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Service Radius</span>
                <span className="font-bold text-slate-800">{provider.serviceRadius || 10} km</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Completed Jobs</span>
                <span className="font-bold text-emerald-600">{provider.completedJobs || 0} Successful Jobs</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
