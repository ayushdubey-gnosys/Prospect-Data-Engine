import React from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { queryClient } from '../api/queryClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

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
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        {/* Placeholder for future breadcrumbs or title */}
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <UserIcon className="h-4 w-4" />
          </div>
          <span className="font-medium">{user?.name || 'User'}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md p-1"
        >
          <LogOut className="h-5 w-5 mr-1" />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;
