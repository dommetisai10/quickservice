import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { PageHeader } from '../../components/common/PageHeader';
import { BarChart3, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    monthlyBookings: [],
    popularServices: []
  });
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0066cc', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    const loadData = async () => {
      try {
        const a = await adminService.getAnalytics();
        setAnalytics(a);
      } catch (err) {
        console.warn("Failed loading analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <PageHeader
        title="Platform Growth & Performance Analytics"
        subtitle="Interactive Recharts visualization of monthly booking volume, category demand, and provider performance."
        showBack={true}
      />

      {loading ? (
        <div className="text-center py-20 text-xs text-slate-500">Loading analytics charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Monthly Volume */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-600" /> Monthly Booking Volume Trend
            </h3>
            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.monthlyBookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#cbd5e1' }} />
                  <Bar dataKey="bookings" fill="#0066cc" name="Bookings" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" fill="#14b8a6" name="Completed" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Categories Pie Chart */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-600" /> Service Category Demand Share
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.popularServices}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {analytics.popularServices.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
