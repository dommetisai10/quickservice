import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { serviceService } from '../../services/serviceService';
import { providerService } from '../../services/providerService';
import { bookingService } from '../../services/bookingService';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Wrench, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  Tag
} from 'lucide-react';

export const NewBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const initialProviderId = searchParams.get('providerId') || '';
  const initialServiceName = searchParams.get('service') || '';

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  
  // Selection States
  const [selectedService, setSelectedService] = useState(initialServiceName);
  const [selectedProvider, setSelectedProvider] = useState(null);
  
  // Tomorrow's date default YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const [bookingDate, setBookingDate] = useState(tomorrowStr);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Address & Description
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Mumbai');
  const [state, setState] = useState(user?.state || 'Maharashtra');
  const [pincode, setPincode] = useState(user?.pincode || '400001');
  const [description, setDescription] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const allPredefinedSlots = [
    "09:00 AM - 10:00 AM",
    "10:00 AM - 11:00 AM",
    "11:00 AM - 12:00 PM",
    "12:00 PM - 01:00 PM",
    "02:00 PM - 03:00 PM",
    "03:00 PM - 04:00 PM",
    "04:00 PM - 05:00 PM",
    "05:00 PM - 06:00 PM"
  ];

  // Load Services and Providers
  useEffect(() => {
    const initData = async () => {
      try {
        const sList = await serviceService.getAllServices();
        setServices(sList);

        const pList = await providerService.getAllProviders();
        setProviders(pList);

        if (initialProviderId) {
          const targetP = pList.find(p => p._id === initialProviderId);
          if (targetP) {
            setSelectedProvider(targetP);
            if (targetP.serviceCategories?.length > 0) {
              setSelectedService(targetP.serviceCategories[0]);
            }
          }
        }
      } catch (err) {
        console.warn("Init data load error:", err);
      }
    };
    initData();
  }, [initialProviderId]);

  // Load available slots whenever provider or date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (selectedProvider && bookingDate) {
        setLoadingSlots(true);
        try {
          const res = await bookingService.getAvailableSlots(selectedProvider._id, bookingDate);
          setAvailableSlots(res.availableSlots || []);
          setBookedSlots(res.bookedSlots || []);
        } catch (err) {
          console.warn("Failed fetching slots, defaulting all slots available:", err);
          setAvailableSlots(allPredefinedSlots);
          setBookedSlots([]);
        } finally {
          setLoadingSlots(false);
        }
      }
    };
    fetchSlots();
  }, [selectedProvider, bookingDate]);

  const handleConfirmBooking = async () => {
    setError('');
    setSubmitting(true);

    try {
      const res = await bookingService.createBooking({
        providerId: selectedProvider._id,
        serviceName: selectedService || selectedProvider.serviceCategories[0] || 'Local Service',
        bookingDate,
        timeSlot: selectedSlot,
        address,
        city,
        state,
        pincode,
        description,
        customerNotes
      });

      // Redirect to booking details page with generated bookingId
      navigate(`/customer/bookings/${res.bookingId || res.id}?created=true`);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('This time slot is no longer available. Please select another slot.');
        // Refresh available slots
        const res = await bookingService.getAvailableSlots(selectedProvider._id, bookingDate);
        setAvailableSlots(res.availableSlots || []);
        setBookedSlots(res.bookedSlots || []);
        setStep(4); // Back to slot step
      } else {
        setError(err.response?.data?.detail || 'Failed to confirm booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-extrabold uppercase rounded-full border border-brand-200">
          Fast & Secure Booking
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900">Book Service Appointment</h1>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between max-w-xl mx-auto border-b border-slate-200 pb-4 text-xs font-bold text-slate-500">
        <span className={step >= 1 ? 'text-brand-600 font-extrabold' : ''}>1. Service</span>
        <span>→</span>
        <span className={step >= 2 ? 'text-brand-600 font-extrabold' : ''}>2. Provider</span>
        <span>→</span>
        <span className={step >= 3 ? 'text-brand-600 font-extrabold' : ''}>3. Date & Slot</span>
        <span>→</span>
        <span className={step >= 5 ? 'text-brand-600 font-extrabold' : ''}>4. Address & Details</span>
        <span>→</span>
        <span className={step >= 7 ? 'text-brand-600 font-extrabold' : ''}>5. Confirm</span>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP CONTAINER */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        
        {/* STEP 1: Select Service */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900">Step 1: Choose Service Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <button
                  type="button"
                  key={s.id || s._id}
                  onClick={() => {
                    setSelectedService(s.name);
                    setStep(2);
                  }}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-4 transition-all ${
                    selectedService === s.name ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 hover:border-brand-300 bg-slate-50/50'
                  }`}
                >
                  <img src={s.image} alt={s.name} className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{s.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">Starting ₹{s.startingPrice}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Select Provider */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Step 2: Select Expert Provider</h2>
              <button onClick={() => setStep(1)} className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change Service
              </button>
            </div>

            <div className="space-y-4">
              {providers.filter(p => p.verificationStatus === 'VERIFIED').map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedProvider(p);
                    setStep(3);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    selectedProvider?._id === p._id ? 'border-brand-600 bg-brand-50 shadow-sm' : 'border-slate-200 hover:border-brand-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <img src={p.profileImage} alt={p.businessName} className="w-14 h-14 rounded-2xl object-cover border border-slate-200" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                        {p.businessName} <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <p className="text-xs text-slate-500">{p.fullName} • {p.city} • {p.experience} Yrs Exp.</p>
                      <span className="text-xs font-bold text-amber-500">★ {p.rating} ({p.totalReviews} reviews)</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-slate-900">₹{p.hourlyRate}</span>
                    <button className="block px-4 py-1.5 bg-brand-600 text-white font-bold text-xs rounded-xl mt-1">
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 & 4: Date & Available Time Slot */}
        {(step === 3 || step === 4) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Step 3 & 4: Select Appointment Date & Time Slot</h2>
              <button onClick={() => setStep(2)} className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change Provider
              </button>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" /> Service Date
              </label>
              <input
                type="date"
                min={tomorrowStr}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full sm:w-64 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:border-brand-500"
              />
              <p className="text-xs text-slate-400 mt-1">Note: Past dates are disabled.</p>
            </div>

            {/* Time Slot Selection Grid */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> Predefined 1-Hour Time Slots
              </label>

              {loadingSlots ? (
                <div className="p-8 text-center text-xs text-slate-500">Checking slot availability...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {allPredefinedSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot);
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isBooked}
                        onClick={() => setSelectedSlot(slot)}
                        className={`p-3 rounded-xl text-xs font-bold transition-all border text-center ${
                          isBooked ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through' :
                          isSelected ? 'bg-brand-600 text-white border-brand-600 shadow-md scale-105' :
                          'bg-slate-50 hover:bg-brand-50 text-slate-800 border-slate-200'
                        }`}
                      >
                        {slot}
                        {isBooked && <span className="block text-[10px] font-normal text-red-500">Booked</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!selectedSlot}
                onClick={() => setStep(5)}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <span>Continue to Address</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5 & 6: Address & Problem Description */}
        {(step === 5 || step === 6) && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Step 5 & 6: Address & Problem Details</h2>
              <button onClick={() => setStep(3)} className="text-xs font-bold text-slate-500 hover:text-brand-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Change Slot
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Street Address *</label>
              <input
                type="text"
                required
                placeholder="House No, Street Name"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">State *</label>
                <input
                  type="text"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pincode *</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Problem Description *</label>
              <textarea
                rows={3}
                required
                placeholder="Describe the issue (e.g. AC compressor making loud noise and not cooling)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-brand-500"
              ></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                disabled={!address || !description}
                onClick={() => setStep(7)}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
              >
                <span>Review Booking</span> <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 7 & 8: Review & Confirm */}
        {step >= 7 && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Step 7 & 8: Review & Confirm Booking</h2>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 text-xs text-slate-700">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Service Category</span>
                <span className="font-extrabold text-slate-900">{selectedService}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Service Provider</span>
                <span className="font-extrabold text-slate-900">{selectedProvider?.businessName} ({selectedProvider?.fullName})</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Scheduled Date</span>
                <span className="font-extrabold text-slate-900">{bookingDate}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Time Slot</span>
                <span className="font-extrabold text-brand-600">{selectedSlot}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-slate-500">Address</span>
                <span className="font-medium text-slate-800">{address}, {city}, {state} - {pincode}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="font-bold text-slate-500">Estimated Price</span>
                <span className="font-extrabold text-lg text-slate-900">₹{selectedProvider?.hourlyRate}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button onClick={() => setStep(5)} className="text-xs font-bold text-slate-500 hover:text-slate-800">
                Edit Details
              </button>
              <button
                onClick={handleConfirmBooking}
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2"
              >
                {submitting ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" /> Confirm & Book Slot
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
