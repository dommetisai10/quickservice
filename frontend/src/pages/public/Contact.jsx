import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      <PageHeader
        title="Get In Touch With QuickService"
        subtitle="Have a question or feedback? Our team is available 24/7 to assist you."
        showBack={true}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <Phone className="w-6 h-6 text-brand-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Customer Helpline</h3>
              <p className="text-xs text-slate-500 mt-0.5">+91 1800-QUICK-SERVICE</p>
              <p className="text-xs text-slate-400">Toll free 24/7</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <Mail className="w-6 h-6 text-brand-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Support Email</h3>
              <p className="text-xs text-slate-500 mt-0.5">support@quickservice.com</p>
              <p className="text-xs text-slate-400">Response within 2 hours</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
            <MapPin className="w-6 h-6 text-brand-600 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Headquarters</h3>
              <p className="text-xs text-slate-500 mt-0.5">123 Service Hub Plaza, Metro City, India</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h3 className="text-2xl font-bold text-slate-900">Message Sent Successfully!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">Thank you for contacting QuickService. Our support representative will respond shortly.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="px-6 py-2 bg-brand-50 text-brand-700 font-bold text-xs rounded-xl"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900">Send Us a Direct Message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Booking inquiry or feedback"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Message</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Write your message here..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Message
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
