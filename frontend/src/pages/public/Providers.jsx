import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { providerService } from '../../services/providerService';
import { PageHeader } from '../../components/common/PageHeader';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Filter, 
  Briefcase, 
  CheckCircle2, 
  XCircle,
  Calendar,
  DollarSign
} from 'lucide-react';

export const Providers = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialSearch = searchParams.get('search') || '';
  const initialLocation = searchParams.get('location') || '';

  const [providers, setProviders] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [location, setLocation] = useState(initialLocation);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [maxPrice, setMaxPrice] = useState('');
  const [minExperience, setMinExperience] = useState('0');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('rating');
  const [loading, setLoading] = useState(true);

  const defaultProviders = [
    {
      _id: 'p1',
      businessName: 'Apex Electrical & AC Care',
      fullName: 'Rahul Sharma',
      serviceCategories: ['Electrician', 'AC Repair'],
      description: 'Certified electrical repair specialist with over 8 years of field experience in residential wiring and AC servicing.',
      experience: 8,
      phone: '9876543210',
      email: 'rahul@apex.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      hourlyRate: 350,
      rating: 4.9,
      totalReviews: 128,
      completedJobs: 142,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80'
    },
    {
      _id: 'p2',
      businessName: 'CoolBreeze AC & Fridge Experts',
      fullName: 'Vikram Singh',
      serviceCategories: ['AC Repair', 'Refrigerator Repair', 'Appliance Repair'],
      description: 'Fast, clean, and guaranteed cooling repairs for all major brands.',
      experience: 6,
      phone: '9876543211',
      email: 'vikram@coolbreeze.com',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400002',
      hourlyRate: 450,
      rating: 4.8,
      totalReviews: 94,
      completedJobs: 110,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80'
    },
    {
      _id: 'p3',
      businessName: 'ProPlumb Solutions',
      fullName: 'Sanjay Kumar',
      serviceCategories: ['Plumber'],
      description: '24/7 emergency plumbing fixes, bathroom tap installations, and drainage repairs.',
      experience: 10,
      phone: '9876543212',
      email: 'sanjay@proplumb.com',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      hourlyRate: 300,
      rating: 4.9,
      totalReviews: 210,
      completedJobs: 235,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'
    },
    {
      _id: 'p4',
      businessName: 'SparkleClean Home Services',
      fullName: 'Priya Sharma',
      serviceCategories: ['Home Cleaning'],
      description: 'Professional deep cleaning team providing sofa wash, kitchen scrub, and sanitization.',
      experience: 5,
      phone: '9876543213',
      email: 'priya@sparkleclean.com',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      hourlyRate: 799,
      rating: 4.7,
      totalReviews: 82,
      completedJobs: 95,
      verificationStatus: 'VERIFIED',
      isAvailable: true,
      profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80'
    }
  ];

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const data = await providerService.getAllProviders();
        setProviders(data.length > 0 ? data : defaultProviders);
      } catch (err) {
        setProviders(defaultProviders);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
  }, []);

  // Filter Logic
  const filteredProviders = providers
    .filter(p => {
      // Must be verified
      if (p.verificationStatus !== 'VERIFIED') return false;

      // Text Search
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesName = p.businessName.toLowerCase().includes(searchLower) || p.fullName.toLowerCase().includes(searchLower);
        const matchesCategory = p.serviceCategories.some(cat => cat.toLowerCase().includes(searchLower));
        if (!matchesName && !matchesCategory) return false;
      }

      // Location Filter
      if (location && !p.city.toLowerCase().includes(location.toLowerCase())) {
        return false;
      }

      // Selected Category Filter
      if (selectedCategory && !p.serviceCategories.includes(selectedCategory)) {
        return false;
      }

      // Rating Filter
      if (p.rating < parseFloat(minRating)) {
        return false;
      }

      // Price Filter
      if (maxPrice && p.hourlyRate > parseFloat(maxPrice)) {
        return false;
      }

      // Experience Filter
      if (p.experience < parseInt(minExperience)) {
        return false;
      }

      // Availability Filter
      if (availableOnly && !p.isAvailable) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.hourlyRate - b.hourlyRate;
      if (sortBy === 'experience') return b.experience - a.experience;
      if (sortBy === 'reviews') return b.totalReviews - a.totalReviews;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <PageHeader
        title="Find Local Service Experts"
        subtitle="Compare verified professionals, check customer ratings, and book time slots instantly."
        showBack={true}
      />

      {/* Main Layout: Filters Sidebar + Providers List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* FILTERS SIDEBAR */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-600" />
              Filter Providers
            </h3>
            <button
              onClick={() => {
                setSearch('');
                setLocation('');
                setSelectedCategory('');
                setMinRating('0');
                setMaxPrice('');
                setMinExperience('0');
                setAvailableOnly(false);
              }}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Reset All
            </button>
          </div>

          {/* Search Text */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Service Keyword</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. AC, Electrician..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">City / Location</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Mumbai, Delhi..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>
          </div>

          {/* Minimum Rating */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.5">4.5★ & Above</option>
              <option value="4.0">4.0★ & Above</option>
              <option value="3.5">3.5★ & Above</option>
            </select>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Max Price (₹)</label>
            <input
              type="number"
              placeholder="e.g. 500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500 mb-2">Min Experience</label>
            <select
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-brand-500"
            >
              <option value="0">Any Experience</option>
              <option value="3">3+ Years</option>
              <option value="5">5+ Years</option>
              <option value="8">8+ Years</option>
            </select>
          </div>

          {/* Available Today Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={(e) => setAvailableOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-700">Available Today Only</span>
            </label>
          </div>

        </div>

        {/* PROVIDERS RESULTS LIST */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Header Bar with Sorting */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-semibold text-slate-600">
              Showing <span className="text-slate-900 font-bold">{filteredProviders.length}</span> verified providers
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
              >
                <option value="rating">Highest Rating</option>
                <option value="price_low">Lowest Price</option>
                <option value="experience">Highest Experience</option>
                <option value="reviews">Most Reviews</option>
              </select>
            </div>
          </div>

          {/* Provider Cards */}
          {loading ? (
            <div className="text-center py-20">
              <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-slate-500 text-sm font-medium">Loading Providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
              <XCircle className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">No Providers Match Filters</h3>
              <p className="text-sm text-slate-500">Try adjusting your rating, price, or location filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProviders.map((provider) => (
                <div
                  key={provider._id}
                  className="bg-white rounded-2xl p-6 border border-slate-100 shadow-card hover:shadow-card-hover transition-all flex flex-col md:flex-row justify-between gap-6"
                >
                  {/* Left: Avatar & Business Info */}
                  <div className="flex items-start gap-4">
                    <img
                      src={provider.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider.businessName}`}
                      alt={provider.businessName}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                    />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{provider.businessName}</h3>
                        {provider.verificationStatus === 'VERIFIED' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded-md border border-emerald-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-500" /> VERIFIED
                          </span>
                        )}
                        {provider.isAvailable ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">Available</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">Unavailable</span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-medium">
                        Owner: <span className="text-slate-800 font-semibold">{provider.fullName}</span> • Location: <span className="text-slate-800 font-semibold">{provider.city}, {provider.state}</span>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-2 max-w-xl">
                        {provider.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="w-4 h-4 fill-amber-400" />
                          {provider.rating} <span className="text-slate-500 font-normal">({provider.totalReviews} reviews)</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {provider.experience} Yrs Exp.
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {provider.serviceCategories.map((cat, i) => (
                          <span key={i} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-medium rounded-md">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Buttons */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 shrink-0 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Starting Rate</span>
                      <span className="text-2xl font-extrabold text-slate-900">₹{provider.hourlyRate}</span>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                      <Link
                        to={`/providers/${provider._id}`}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to={`/providers/${provider._id}?book=true`}
                        className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
