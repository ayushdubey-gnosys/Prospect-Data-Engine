import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, UploadCloud, DownloadCloud, Tags, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'sales';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5 mr-3" /> },
    { name: 'Companies', path: '/companies', icon: <Building2 className="w-5 h-5 mr-3" /> },
    { name: 'Import', path: '/import', icon: <UploadCloud className="w-5 h-5 mr-3" />, roles: ['admin', 'sales'] },
    { name: 'Export', path: '/export', icon: <DownloadCloud className="w-5 h-5 mr-3" />, roles: ['admin', 'marketing'] },
    { name: 'Tags', path: '/tags', icon: <Tags className="w-5 h-5 mr-3" />, roles: ['admin', 'sales'] },
    { name: 'Profile', path: '/profile', icon: <User className="w-5 h-5 mr-3" /> },
  ];

  const filteredItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="flex flex-col w-64 h-screen bg-gray-900 text-white shadow-xl transition-all duration-300">
      <div className="flex items-center justify-center h-16 border-b border-gray-800 shrink-0">
        <h1 className="text-xl font-bold tracking-wider text-blue-400">PDE</h1>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {filteredItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
              end={item.path === '/'}
            >
              {item.icon}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
