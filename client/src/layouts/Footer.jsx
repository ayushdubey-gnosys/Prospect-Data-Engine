import React from 'react';
import { Terminal, Shield, Cpu, Database, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-900 text-slate-300 border-t border-slate-800/80 pt-16 pb-12 mt-auto select-none">
      <div className="max-w-7xl mx-auto px-8 sm:px-14 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-14 border-b border-slate-800/80">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <img src="/img.png" alt="PDE Logo" className="h-9 w-auto object-contain" />
              <span className="font-bold text-white text-lg tracking-tight">Prospect Data Engine</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm font-normal">
              Enterprise-grade centralized database consolidation, rapid file deduplication scan, and accountable B2B campaign management node.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-emerald-400 text-xs font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>SYSTEM STATUS: 100% OPERATIONAL</span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              // PLATFORM
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                Centralized DB Consolidation
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                Rapid File Dedup Engine
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                Regenerate History Filter
              </li>
              <li className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5">
                Target Campaign Lifecycle
              </li>
            </ul>
          </div>

          {/* Col 3: Compliance & Security */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
              // COMPLIANCE & SECURITY
            </h4>
            <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Enterprise RBAC Access Control</span>
              </li>
              <li className="flex items-center gap-2">
                <Database className="h-4 w-4 text-blue-400 shrink-0" />
                <span>Zero Duplicate Record Guarantee</span>
              </li>
              <li className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-purple-400 shrink-0" />
                <span>High-Throughput Stream Processing</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-normal">
          <div>
            &copy; {new Date().getFullYear()} Prospect Data Engine. All rights reserved.
          </div>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800/80 shadow-inner">
            <span>Precision Engineered by</span>
            <img src="/img.png" alt="Gnosys Digital" className="h-5 w-auto object-contain" />
            <span className="font-semibold text-slate-200 tracking-wide">Gnosys Digital</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
