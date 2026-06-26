import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';

const DashboardLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isFullWidth = location.pathname === '/' || location.pathname === '/about';

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden font-sans text-gray-900">
      {isAuthenticated && <Sidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className={`flex-1 overflow-x-hidden overflow-y-auto ${isFullWidth ? 'p-0 bg-white' : 'bg-gray-50 p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
