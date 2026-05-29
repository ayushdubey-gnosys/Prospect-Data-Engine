import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  UploadCloud,
  DownloadCloud,
  Tags,
  User,
  FolderOpen,
  Users,
  Layers,
  Info,
} from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role || 'sales';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Uploaded Files', path: '/uploaded-files', icon: FolderOpen },
    { name: 'Import', path: '/import', icon: UploadCloud, roles: ['admin', 'sales'] },
    { name: 'Export', path: '/export', icon: DownloadCloud, roles: ['admin', 'marketing'] },
    { name: 'Tags', path: '/tags', icon: Tags, roles: ['admin', 'sales'] },
    { name: 'Users', path: '/users', icon: Users, roles: ['admin'] },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'About', path: '/about', icon: Info },
  ];

  const filteredItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="w-64 h-screen bg-[#111827] border-r border-[#1f2937] flex flex-col justify-between font-sans shadow-xl antialiased select-none">
      {/* Top Brands & Navigation */}
      <div>
        {/* Brand Header - Clean Compact Height */}
        <NavLink to="/" className="h-16 px-5 flex items-center border-b border-[#1f2937] bg-[#0b0f19] cursor-pointer hover:bg-[#111827] transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-900/40">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-[14px] font-semibold text-slate-100 tracking-wider uppercase">
                Prospect Engine
              </h1>
              <p className="text-[10px] font-medium text-slate-500 tracking-wide mt-0.5">
                Centralized Data Hub
              </p>
            </div>
          </div>
        </NavLink>

        {/* Menu Section */}
        <div className="px-3 py-5">
          <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-3 px-3">
            Overview & Management
          </p>

          <nav className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => `
                    group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 font-semibold text-[13px]
                    ${isActive
                      ? 'bg-blue-600/10 text-blue-400'
                      : 'text-slate-400 hover:bg-[#1f2937]/50 hover:text-slate-100'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      {/* Left Active Border Anchor */}
                      {isActive && (
                        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-blue-500" />
                      )}

                      {/* Icon */}
                      <Icon className={`
                        w-[16px] h-[16px] transition-colors duration-150 shrink-0
                        ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}
                      `} />

                      {/* Item Title */}
                      <span className="tracking-wide truncate">
                        {item.name}
                      </span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Section at Bottom */}
      <div className="p-3 border-t border-[#1f2937] bg-[#0b0f19]/60">
        <div className="flex items-center gap-3 px-2.5 py-2 rounded-lg bg-[#1f2937]/30 border border-[#1f2937]/40">
          <div className="w-7 h-7 rounded bg-[#1f2937] border border-slate-600 flex items-center justify-center text-slate-200 font-semibold text-[10px] uppercase shrink-0">
            {user?.name ? user.name.slice(0, 2) : role.slice(0, 2)}
          </div>
          <div className="flex-1 overflow-hidden">
            <h4 className="text-[12px] font-semibold text-slate-300 truncate leading-tight">
              {user?.name || 'Administrator'}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;