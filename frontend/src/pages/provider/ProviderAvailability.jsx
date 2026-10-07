import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { providerService } from '../../services/providerService';
import { Clock, Calendar, MapPin, CheckCircle2, Save, AlertCircle } from 'lucide-react';

export const ProviderAvailability = () => {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [startHour, setStartHour] = useState('09:00 AM');
  const [endHour, setEndHour] = useState('06:00 PM');
  const [radius, setRadius] = useState(15);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    const fetchCurrentAvailability = async () => {
      if (user?.providerId) {
        try {
          const p = await providerService.getProviderById(user.providerId);
          if (p) {
            setIsAvailable(p.isAvailable ?? true);
            setWorkingDays(p.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
            setStartHour(p.workingHours?.start || '09:00 AM');
            setEndHour(p.workingHours?.end || '06:00 PM');
            setRadius(p.serviceRadius || 15);
          }
        } catch (err) {
          console.warn("Could not fetch availability profile:", err);
        }
      }
    };
    fetchCurrentAvailability();
  }, [user]);

  const toggleDay = (day) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) return; // Keep at least 1
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      if (user?.providerId) {
        await providerService.updateProviderProfile(user.providerId, {
          isAvailable,
          workingDays,
          workingHours: { start: startHour, end: endHour },
          serviceRadius: Number(radius)
        });
      }
      setSuccess('Availability settings saved successfully! Customers can now book according to your schedule.');
    } catch (err) {
      setError('Failed to update availability settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">Manage Working Schedule & Availability</h1>
        <p className="text-slate-500 text-sm mt-1">Control your business status, active days, service radius, and operational hours.</p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-700 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
        
        {/* Availability Toggle Switch */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Real-Time Booking Status</h3>
            <p className="text-xs text-slate-500">When toggled OFF, customers cannot create new bookings for your service.</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAvailable(!isAvailable)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${
              isAvailable ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                isAvailable ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Working Days */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-600" /> Active Working Days
          </label>
          <div className="flex flex-wrap gap-2">
            {allDays.map((day) => {
              const active = workingDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                    active ? 'bg-brand-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day} {active && '✓'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Working Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Shift Start Time</label>
            <select
              value={startHour}
              onChange={(e) => setStartHour(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Shift End Time</label>
            <select
              value={endHour}
              onChange={(e) => setEndHour(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
            >
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
              <option value="07:00 PM">07:00 PM</option>
              <option value="08:00 PM">08:00 PM</option>
            </select>
          </div>
        </div>

        {/* Service Radius */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Maximum Service Radius (km)
          </label>
          <input
            type="number"
            min="1"
            max="100"
            value={radius}
            onChange={(e) => setRadius(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:border-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Schedule Settings
            </>
          )}
        </button>

      </form>

    </div>
  );
};
