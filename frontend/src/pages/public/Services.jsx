import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { serviceService } from '../../services/serviceService';
import { Search, Filter, Wrench, ArrowRight, Tag } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const Services = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('search') || '';

  const [services, setServices] = useState([]);
  const [search, setSearch] = useState(initialQuery);
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await serviceService.getAllServices();
        setServices(data);
      } catch (err) {
        console.warn("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    loadServices();
  }, []);

  const filteredServices = services
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_low') return a.startingPrice - b.startingPrice;
      if (sortBy === 'price_high') return b.startingPrice - a.startingPrice;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Header */}
      <PageHeader
        title="Explore Our Service Categories"
        subtitle="Find transparently priced local service experts for all your home maintenance and repair needs."
        showBack={true}
      />

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search service by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="name">Alphabetical (A-Z)</option>
            <option value="price_low">Starting Price: Low to High</option>
            <option value="price_high">Starting Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-slate-500 text-sm font-medium">Loading Services from Database...</p>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto space-y-4">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No Services Found</h3>
          <p className="text-sm text-slate-500">We couldn't find any active services matching your query "{search}".</p>
          <button
            onClick={() => setSearch('')}
            className="px-4 py-2 bg-brand-50 text-brand-700 font-semibold text-xs rounded-xl hover:bg-brand-100"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id || service._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={service.image || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80'}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-700 border border-white shadow-sm flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Starting ₹{service.startingPrice}
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
                  className="w-full text-center py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span>View Providers</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
