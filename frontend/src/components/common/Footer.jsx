import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Phone, Mail, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-700 flex items-center justify-center text-white shadow-md">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">
                Quick<span className="text-brand-400">Service</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your Local Services, One Place. QuickService connects home owners with verified, top-rated local service professionals in minutes.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800 rounded-full border border-slate-700 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                100% Free Platform
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/services" className="hover:text-brand-400 transition-colors">Browse Services</Link>
              </li>
              <li>
                <Link to="/providers" className="hover:text-brand-400 transition-colors">Find Providers</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-brand-400 transition-colors">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-brand-400 transition-colors">Contact Support</Link>
              </li>
              <li>
                <Link to="/register?role=PROVIDER" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">Join as a Service Provider</Link>
              </li>
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Popular Services</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/services?search=AC Repair" className="hover:text-brand-400 transition-colors">AC Repair & Service</Link></li>
              <li><Link to="/services?search=Electrician" className="hover:text-brand-400 transition-colors">Electrician</Link></li>
              <li><Link to="/services?search=Plumber" className="hover:text-brand-400 transition-colors">Plumbing Solutions</Link></li>
              <li><Link to="/services?search=Washing Machine" className="hover:text-brand-400 transition-colors">Washing Machine Repair</Link></li>
              <li><Link to="/services?search=Home Cleaning" className="hover:text-brand-400 transition-colors">Deep Home Cleaning</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                <span>123 Service Hub Plaza, Metro City, India</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-400 shrink-0" />
                <span>+91 1800-QUICK-SERVICE</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-400 shrink-0" />
                <span>support@quickservice.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} QuickService platform. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for local community professionals.
          </p>
        </div>
      </div>
    </footer>
  );
};
