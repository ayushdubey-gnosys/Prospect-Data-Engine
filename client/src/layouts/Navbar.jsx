import React from 'react';
import { LogOut, User as UserIcon, Terminal } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { queryClient } from '../api/queryClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, isAuthenticated } = useAuth();
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
    <header className={`absolute top-0 left-0 right-0 z-50 flex shrink-0 items-center justify-between transition-all select-none bg-white/75 backdrop-blur-xl ${!isAuthenticated ? 'h-20 px-8 sm:px-14 lg:px-20' : 'h-16 px-8 sm:px-14 lg:px-20'}`}>

      {/* Brand Logo & Navigation Trace */}
      {isAuthenticated ? (
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img src="/img.png" alt="PDE Logo" className="h-8 w-auto object-contain" />
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-900 text-sm tracking-tight">
              Prospect Data Engine
            </span>
            <span className="text-slate-400 font-semibold">/</span>
            <span className="bg-slate-900 text-white font-mono font-semibold px-2 py-0.5 rounded text-xs tracking-wide">
              {currentPath}
            </span>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src="/img.png" alt="PDE Logo" className="h-10 w-auto object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-200" />
          <div className="flex flex-col justify-center -space-y-0.5">
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              Prospect Data Engine
            </span>
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 tracking-wide">
              <Terminal className="h-3 w-3 text-indigo-600" />
              <span>by Gnosys digital</span>
            </div>
          </div>
        </div>
      )}

      {/* Operator Credentials & Actions */}
      <div className="flex items-center space-x-6">

        {/* User Operator Identity Box */}
        {isAuthenticated && (
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
        )}

        <div className="flex items-center space-x-3">
          {!isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/about')}
                className="text-sm font-semibold text-slate-600 hover:text-indigo-600 px-3 py-2 transition-colors cursor-pointer"
              >
                About PDE
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                Sign In
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="
                flex items-center text-sm font-semibold text-slate-700 
                hover:text-red-700 bg-slate-50 hover:bg-red-50 
                border border-slate-200 hover:border-red-200 
                rounded-lg px-3 py-1.5 transition-all duration-150 
                focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer
              "
            >
              <LogOut className="h-4 w-4 mr-2 text-slate-500 shrink-0" />
              Disconnect
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;