import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { 
  Users, 
  ShieldCheck, 
  Wrench, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  Clock, 
  ArrowRight,
  TrendingUp,
  XCircle,
  FileText,
  Activity
} from 'lucide-react';
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
  Cell 
} from 'recharts';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    inactiveCustomers: 0,
    totalProviders: 0,
    pendingProviders: 0,
    verifiedProviders: 0,
    rejectedProviders: 0,
    suspendedProviders: 0,
    totalServices: 0,
    totalBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    openComplaints: 0,
    recentLogs: []
  });

  const [analytics, setAnalytics] = useState({
    monthlyBookings: [],
    popularServices: []
  });

  const [loading, setLoading] = useState(true);
  const COLORS = ['#0066cc', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899'];

  const fetchDashboardData = async () => {
    try {
      const s = await adminService.getDashboardStats();
      setStats(s);

      const a = await adminService.getAnalytics();
      setAnalytics(a);
    } catch (err) {
      console.warn("Failed loading admin analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">System Executive Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Real-time platform metrics, provider approvals, and activity logs.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-brand-50 text-brand-700 text-xs font-extrabold rounded-full border border-brand-200">
            System Admin Authority
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid (Clickable Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        {/* Customers */}
        <div 
          onClick={() => navigate('/admin/users')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customers</span>
            <Users className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalCustomers}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.activeCustomers} Active</span>
          </div>
        </div>

        {/* Providers */}
        <div 
          onClick={() => navigate('/admin/providers')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Providers</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalProviders}</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{stats.verifiedProviders} Verified</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div 
          onClick={() => navigate('/admin/providers?status=PENDING')}
          className="bg-amber-50/60 p-5 rounded-2xl border border-amber-200 shadow-sm hover:border-amber-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Approvals</span>
            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
          </div>
          <span className="text-3xl font-extrabold text-amber-800">{stats.pendingProviders}</span>
        </div>

        {/* Services */}
        <div 
          onClick={() => navigate('/admin/services')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Services</span>
            <Wrench className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-3xl font-extrabold text-slate-900">{stats.totalServices}</span>
        </div>

        {/* Bookings */}
        <div 
          onClick={() => navigate('/admin/bookings')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand-500 hover:shadow-md transition-all cursor-pointer space-y-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bookings</span>
            <Calendar className="w-5 h-5 text-brand-600 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900">{stats.totalBookings}</span>
            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{stats.completedBookings} Done</span>
          </div>
        </div>

      </div>

      {/* Admin Activity Feed & Provider Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Admin Activity Feed */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-brand-600" /> Recent Admin Activity Logs
              </h3>
              <p className="text-xs text-slate-500">Audited administrative actions recorded in database</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{stats.recentLogs?.length || 0} events</span>
          </div>

          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto pr-1">
            {!stats.recentLogs || stats.recentLogs.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400 font-medium">No admin activity logged yet.</p>
            ) : (
              stats.recentLogs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{log.shortSummary}</span>
                    <span className="text-[11px] text-slate-400 font-medium">{log.adminEmail} • Action: <code className="text-brand-600">{log.action}</code></span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Provider Verification Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Provider Status Breakdown
            </h3>
            <p className="text-xs text-slate-500">Provider pool state overview</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl">
              <span className="text-xs font-bold text-emerald-800">Verified & Active</span>
              <span className="text-sm font-extrabold text-emerald-900">{stats.verifiedProviders}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-100 rounded-2xl">
              <span className="text-xs font-bold text-amber-800">Pending Approvals</span>
              <span className="text-sm font-extrabold text-amber-900">{stats.pendingProviders}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50/70 border border-orange-100 rounded-2xl">
              <span className="text-xs font-bold text-orange-800">Suspended Providers</span>
              <span className="text-sm font-extrabold text-orange-900">{stats.suspendedProviders}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50/70 border border-red-100 rounded-2xl">
              <span className="text-xs font-bold text-red-800">Rejected Applications</span>
              <span className="text-sm font-extrabold text-red-900">{stats.rejectedProviders}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
