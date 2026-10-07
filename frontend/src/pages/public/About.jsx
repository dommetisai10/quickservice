import React from 'react';
import { ShieldCheck, Users, Wrench, Award, Heart, CheckCircle } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <PageHeader
        title="Connecting Communities with Trusted Local Experts"
        subtitle="QuickService was built to simplify local service discovery, eliminate double-booking friction, and empower independent service technicians with instant bookings."
        showBack={true}
      />

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold text-brand-600">10,000+</span>
          <p className="text-xs text-slate-500 font-medium">Completed Bookings</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold text-brand-600">1,200+</span>
          <p className="text-xs text-slate-500 font-medium">Verified Professionals</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold text-brand-600">4.8 / 5</span>
          <p className="text-xs text-slate-500 font-medium">Average Customer Rating</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <span className="text-3xl font-extrabold text-brand-600">₹0</span>
          <p className="text-xs text-slate-500 font-medium">Customer Platform Fee</p>
        </div>
      </div>

      {/* Mission & Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <ShieldCheck className="w-10 h-10 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-900">Rigorous Verification</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Every service provider profile goes through mandatory background verification by our admin team before accepting customer bookings.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Wrench className="w-10 h-10 text-brand-600" />
          <h3 className="text-xl font-bold text-slate-900">Guaranteed Time Slots</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our atomic database lock architecture ensures that when you choose a 1-hour time slot, it cannot be double-booked by anyone else.
          </p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <Heart className="w-10 h-10 text-red-500" />
          <h3 className="text-xl font-bold text-slate-900">Transparent Pricing</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            Starting prices are clearly stated up front. Customer reviews and ratings are 100% genuine from real completed bookings.
          </p>
        </div>
      </div>

    </div>
  );
};
