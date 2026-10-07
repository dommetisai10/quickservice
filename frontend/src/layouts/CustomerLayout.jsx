import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  Wrench, 
  LayoutDashboard, 
  Calendar, 
  User, 
  Bell, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X,
  Home
} from 'lucide-react';

export const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const navItems = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: LayoutDashboard },
    { name: 'My Bookings', path: '/customer/bookings', icon: Calendar },
    { name: 'My Profile', path: '/customer/profile', icon: User },
    { name: 'Notifications', path: '/notifications', icon: Bell },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0 shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/customer/dashboard" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 tracking-tight block leading-tight">QuickService</span>
              <span className="text-[10px] font-extrabold text-brand-600 uppercase tracking-widest block">Customer Workspace</span>
            </div>
          </Link>
        </div>

        <div className="p-4 border-b border-slate-100">
          <Link
            to="/customer/bookings/new"
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book a Service</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="relative w-64 bg-white flex flex-col z-10 shadow-2xl">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <span className="font-extrabold text-base text-slate-900">QuickService Customer</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-4 border-b border-slate-100">
              <Link
                to="/customer/bookings/new"
                onClick={() => setSidebarOpen(false)}
                className="w-full py-2.5 px-4 bg-brand-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Book a Service</span>
              </Link>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <button
                onClick={() => { setSidebarOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-2 text-xs font-bold text-red-600 px-3 py-2.5 rounded-xl hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
              Customer Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/notifications"
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl relative transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-extrabold text-xs flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'C'}
              </div>
              <div className="hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user?.fullName}</span>
                <span className="text-[10px] text-slate-400 block font-medium">{user?.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
