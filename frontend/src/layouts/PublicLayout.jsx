import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ServerWakingBanner } from '../components/common/ServerWakingBanner';

export const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <ServerWakingBanner />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
