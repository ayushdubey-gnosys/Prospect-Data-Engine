import React from 'react';
import { LogOut, User as UserIcon, Terminal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { queryClient } from '../api/queryClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Route path parsing for clean visibility breadcrumb
  const currentPath = location.pathname.split('/').filter(Boolean)[0] || 'overview';

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      queryClient.setQueryData(['authUser'], null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm select-none">

      {/* Semi-Bold System Navigation Trace */}
      <div className="flex items-center space-x-3 text-sm">
        <Terminal className="h-4 w-4 text-slate-800" />
        <span className="font-semibold text-slate-900 tracking-wider uppercase text-xs">
          Industrial Data Node
        </span>
        <span className="text-slate-300 font-semibold">/</span>
        <span className="bg-slate-900 text-white font-mono font-semibold px-2 py-0.5 rounded text-xs tracking-wide">
          {currentPath}
        </span>
      </div>

      {/* Operator Credentials & Actions */}
      <div className="flex items-center space-x-6">

        {/* User Operator Identity Box - Semi-Bold Contrast */}
        <div className="flex items-center space-x-3 border-r border-slate-200 pr-6">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-sm">
            <UserIcon className="h-4 w-4" />
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-900 leading-tight">
              {user?.name || 'Operator Identity'}
            </span>
            <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mt-1">
              {user?.role || 'Access Guest'}
            </span>
          </div>
        </div>

        {/* Semi-Bold Action Trigger */}
        <button
          onClick={handleLogout}
          className="
            flex items-center text-sm font-semibold text-slate-700 
            hover:text-red-700 bg-slate-50 hover:bg-red-50 
            border border-slate-200 hover:border-red-200 
            rounded-lg px-3 py-1.5 transition-all duration-150 
            focus:outline-none focus:ring-2 focus:ring-red-500
          "
        >
          <LogOut className="h-4 w-4 mr-2 text-slate-500 group-hover:text-red-700 shrink-0" />
          Disconnect
        </button>

      </div>
    </header>
  );
};

export default Navbar;