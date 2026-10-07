import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { serviceService } from '../../services/serviceService';
import { providerService } from '../../services/providerService';
import { 
  Search, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  Star, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Sparkles,
  ChevronRight,
  Wrench,
  Mail,
  Phone,
  MessageSquare,
  Send,
  Check
} from 'lucide-react';

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [popularServices, setPopularServices] = useState([]);
  const [topProviders, setTopProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const services = await serviceService.getAllServices();
        setPopularServices(services.slice(0, 6));

        const providers = await providerService.getAllProviders({ limit: 3 });
        setTopProviders(providers);
      } catch (err) {
        console.warn("API load error on Home:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle hash scrolling on page mount if navigated from another route like /#services
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const elem = document.getElementById(targetId);
      if (elem) {
        setTimeout(() => {
          elem.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    navigate(`/providers?search=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(locationQuery)}`);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
    }, 4000);
  };

  return (
    <div className="space-y-20 pb-16">
      
      {/* 1. HERO SECTION (id="home") */}
      <section id="home" className="scroll-mt-20 relative overflow-hidden bg-gradient-to-b from-brand-900 via-brand-800 to-slate-900 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-brand-200 text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-4 h-4 text-brand-300" />
            <span>Instant Home Services at Your Doorstep</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
            Find Trusted Local Services <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-teal-300">Near You</span>
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal">
            Book reliable local professionals quickly and easily. Verified technicians, transparent pricing, and guaranteed satisfaction.
          </p>

          {/* Search Box */}
          <form 
            onSubmit={handleSearchSubmit}
            className="mt-10 max-w-4xl mx-auto bg-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 grid grid-cols-1 sm:grid-cols-12 gap-3 text-slate-900"
          >
            <div className="sm:col-span-5 flex items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-brand-500 transition-colors">
              <Search className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Search for a service (e.g. AC Repair, Plumber)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 font-medium"
              />
            </div>

            <div className="sm:col-span-4 flex items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-200 focus-within:border-brand-500 transition-colors">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0 mr-3" />
              <input
                type="text"
                placeholder="Enter your location (City)..."
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                className="w-full bg-transparent text-sm focus:outline-none placeholder-slate-400 font-medium"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-full min-h-[48px] bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <span>Find Services</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Tags */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Trending:</span>
            {['AC Repair', 'Plumber', 'Electrician', 'Home Cleaning', 'Washing Machine'].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/providers?search=${encodeURIComponent(tag)}`)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* 2. SERVICES SECTION (id="services") */}
      <section id="services" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Popular Services</h2>
            <p className="mt-2 text-slate-600">Choose from our most requested home repair and maintenance categories</p>
          </div>
          <Link
            to="/services"
            className="mt-4 sm:mt-0 inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 gap-1 group"
          >
            View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading service categories...</div>
        ) : popularServices.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2 max-w-md mx-auto">
            <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Services Available</p>
            <p className="text-xs text-slate-500">Services created by Admin will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularServices.map((service) => (
              <div
                key={service.id || service._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-700 border border-white shadow-sm">
                    From ₹{service.startingPrice}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="text-slate-600 text-sm mb-6 flex-grow leading-relaxed">
                    {service.description}
                  </p>
                  <Link
                    to={`/providers?search=${encodeURIComponent(service.name)}`}
                    className="w-full text-center py-2.5 bg-slate-100 hover:bg-brand-50 text-slate-800 hover:text-brand-700 font-semibold text-sm rounded-xl transition-colors"
                  >
                    View Providers
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. PROVIDERS SECTION (id="providers") */}
      <section id="providers" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Featured Service Experts</h2>
            <p className="mt-2 text-slate-600">Highest rated verified professionals with proven track records</p>
          </div>
          <Link
            to="/providers"
            className="mt-4 sm:mt-0 inline-flex items-center text-sm font-bold text-brand-600 hover:text-brand-700 gap-1 group"
          >
            Explore All Providers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading service experts...</div>
        ) : topProviders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2 max-w-md mx-auto">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No Verified Providers Yet</p>
            <p className="text-xs text-slate-500">Providers verified by Admin will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topProviders.map((provider) => (
              <div key={provider._id} className="bg-white rounded-2xl border border-slate-100 shadow-card p-6 flex flex-col justify-between hover:shadow-card-hover transition-all">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={provider.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.businessName}`}
                      alt={provider.businessName}
                      className="w-14 h-14 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg flex items-center gap-1.5">
                        {provider.businessName}
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{provider.fullName} • {provider.city}</p>
                      <div className="flex items-center gap-1 text-amber-500 mt-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        <span className="text-xs font-bold text-slate-800">{provider.rating}</span>
                        <span className="text-xs text-slate-500 font-normal">({provider.totalReviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.serviceCategories.map((cat, i) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                  <div>
                    <span className="text-xs text-slate-500 block">Starting From</span>
                    <span className="text-lg font-extrabold text-slate-900">₹{provider.hourlyRate}</span>
                  </div>
                  <Link
                    to={`/providers/${provider._id}`}
                    className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                  >
                    Book Expert
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ABOUT / HOW IT WORKS SECTION (id="about") */}
      <section id="about" className="scroll-mt-20 bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900">About QuickService</h2>
            <p className="mt-3 text-slate-600">Get your local home service problem resolved in four simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Search Service', desc: 'Browse service categories or search for specific repair needs in your city.' },
              { step: '02', title: 'Choose Provider', desc: 'Compare verified providers by customer ratings, pricing, and experience.' },
              { step: '03', title: 'Book Time Slot', desc: 'Pick an available date and 1-hour time slot that fits your schedule.' },
              { step: '04', title: 'Get It Fixed', desc: 'Provider arrives at your address, completes the job, and you rate the service.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative text-center group hover:-translate-y-1 transition-transform">
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-4 border border-brand-100 shadow-inner">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CONTACT SECTION (id="contact") */}
      <section id="contact" className="scroll-mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-widest bg-brand-50 px-3 py-1 rounded-full border border-brand-100">
                Get In Touch
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-3">Contact Support</h2>
              <p className="text-slate-600 text-sm mt-2">Have a question or need assistance with your booking? We are here to help 24/7.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <Mail className="w-5 h-5 text-brand-600 shrink-0" />
                <span>support@quickservice.com</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <Phone className="w-5 h-5 text-brand-600 shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <MapPin className="w-5 h-5 text-brand-600 shrink-0" />
                <span>QuickService HQ, Hyderabad & Bangalore, India</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
            {contactSubmitted ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Message Sent Successfully!</h4>
                <p>Thank you for reaching out. Our support team will respond within 2 hours.</p>
              </div>
            ) : (
              <>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Phone</label>
                    <input
                      type="text"
                      placeholder="+91 9876543210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Message</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your inquiry..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </>
            )}
          </form>

        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-600 to-brand-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h2 className="text-3xl font-extrabold">Are You a Skilled Service Professional?</h2>
            <p className="text-brand-100 text-base leading-relaxed">
              Grow your local business with QuickService. Reach thousands of customers in your city, manage your schedule, and receive instant booking requests.
            </p>
          </div>
          <Link
            to="/register?role=PROVIDER"
            className="px-8 py-4 bg-white text-brand-700 hover:bg-brand-50 font-extrabold text-sm rounded-2xl shadow-lg shrink-0 transition-transform hover:scale-105"
          >
            Register as Provider Now
          </Link>
        </div>
      </section>

    </div>
  );
};
