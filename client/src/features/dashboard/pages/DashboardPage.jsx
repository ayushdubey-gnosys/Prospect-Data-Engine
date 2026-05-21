import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import {
  Building2,
  Tags,
  Users,
  FileText,
  ArrowRight,
  Eye,
  Upload,
  Database,
  Terminal,
  ShieldCheck,
  Server,
  Activity,
  Cpu
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../../files/hooks/useFiles';
import { useAuth } from '../../../hooks/useAuth';

const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor,
  bgColor,
  onClick,
  isClickable,
  metaText,
}) => (
  <div
    onClick={onClick}
    className={`
      p-5 rounded-xl bg-white border border-slate-200/80 shadow-sm
      flex flex-col justify-between h-36 transition-all duration-150
      ${isClickable ? 'cursor-pointer hover:border-indigo-300 hover:shadow-md group/card' : ''}
    `}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          {title}
        </p>
        <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mt-2">
          {value}
        </h2>
      </div>

      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgColor} ${iconColor} border border-current/10 shadow-sm`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>

    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
      <span className="truncate max-w-[85%] font-medium text-slate-700">{metaText}</span>
      {isClickable && (
        <ArrowRight className="w-3.5 h-3.5 text-slate-400 transition-transform group-hover/card:translate-x-1 group-hover/card:text-indigo-600" />
      )}
    </div>
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const isAdmin = authUser?.role === 'admin';
  const canAccessTags = ['admin', 'sales'].includes(authUser?.role);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/company/stats').then((res) => res.data),
  });

  const { data: filesData, isLoading: filesLoading } = useFiles();
  const recentFiles = filesData?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 lg:p-8 font-sans antialiased text-slate-900">

      {/* Upper Module Navigation & RBAC Node Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b-2 border-slate-200 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>Core Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-indigo-600 font-mono">Overview Telemetry</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
            Prospect Data Engine
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-1.5 text-right shadow-sm">
            <span className="block text-[9px] text-slate-500 font-semibold uppercase tracking-widest">
              RBAC Clearance
            </span>
            <span className="text-xs font-semibold text-slate-800 capitalize flex items-center justify-end gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" /> {authUser?.role || 'Guest'}
            </span>
          </div>

          <button
            onClick={() => navigate('/uploaded-files')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-all duration-150 border border-indigo-700"
          >
            <Upload className="w-3.5 h-3.5" />
            Ingest Dataset
          </button>
        </div>
      </div>

      {/* Main Structural System Control Banner Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-[#090d16] border border-slate-9eda rounded-xl p-6 flex flex-col justify-between shadow-sm relative overflow-hidden ring-1 ring-white/5">
          <div className="absolute top-0 right-0 p-6 opacity-5 select-none pointer-events-none">
            <Server className="w-32 h-32 text-indigo-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                Data Hub Infrastructure Scope
              </span>
            </div>
            <h2 className="text-xl font-semibold text-slate-100 tracking-wide max-w-xl">
              Consolidated Prospect Storage Engine (PDE Core)
            </h2>
            <p className="text-xs text-slate-300 mt-2.5 max-w-2xl leading-relaxed">
              The Prospect Data Engine isolates, structures, and deduplicates complex organization leads imported from raw spreadsheet formats or live Google Sheets API streams. To maintain system decoupling, raw lead matrices remain indexed inside this engine Node before distribution schemas to target CRM structures.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-800/80 select-none">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 rounded">
              <span className="w-1 h-1 rounded-full bg-emerald-400" /> Pipeline Status: Synchronized
            </div>
            <div className="text-slate-700">•</div>
            <div className="text-slate-300">Deduplication Layer: <span className="font-mono text-[10px] bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded ml-1 border border-slate-700">Active: CIN Match</span></div>
          </div>
        </div>

        {/* Realtime System Memory Metrics Block */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-widest">Operational Parameters</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              This environment handles high-throughput extraction and cleaning patterns. Pipeline sales updates, conversions, and deals must not be executed within this environment layer.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
            <div className="bg-slate-50 border border-slate-200/60 p-2 rounded">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">Records Cache</span>
              <span className="text-sm font-semibold text-indigo-950 font-mono mt-0.5 block">
                {statsLoading ? '...' : (stats?.totalCompanies ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 border border-slate-200/60 p-2 rounded">
              <span className="block text-[9px] font-semibold text-slate-500 uppercase tracking-wider">File Manifests</span>
              <span className="text-sm font-semibold text-indigo-950 font-mono mt-0.5 block">
                {statsLoading ? '...' : (stats?.totalImports ?? 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* System Quad Metric Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Indexed Corporate Nodes"
          value={statsLoading ? '...' : (stats?.totalCompanies ?? 0).toLocaleString()}
          icon={Building2}
          iconColor="text-indigo-700"
          bgColor="bg-indigo-50"
          metaText="Validated organization records"
          onClick={() => navigate('/companies')}
          isClickable={true}
        />

        <StatCard
          title="Taxonomy Mapping Tags"
          value={statsLoading ? '...' : (stats?.activeTags ?? 0).toLocaleString()}
          icon={Tags}
          iconColor="text-teal-700"
          bgColor="bg-teal-50"
          metaText="Active segmentation anchors"
          onClick={canAccessTags ? () => navigate('/tags') : undefined}
          isClickable={canAccessTags}
        />

        <StatCard
          title="Authorized Operators"
          value={statsLoading ? '...' : (stats?.totalUsers ?? 0).toLocaleString()}
          icon={Users}
          iconColor="text-amber-700"
          bgColor="bg-amber-50/70"
          metaText="Configured user credentials"
          onClick={isAdmin ? () => navigate('/users') : undefined}
          isClickable={isAdmin}
        />

        <StatCard
          title="Ingested Data Blobs"
          value={statsLoading ? '...' : (stats?.totalImports ?? 0).toLocaleString()}
          icon={FileText}
          iconColor="text-rose-700"
          bgColor="bg-rose-50"
          metaText="Spreadsheet ingestion traces"
          onClick={() => navigate('/uploaded-files')}
          isClickable={true}
        />
      </div>

      {/* Structured File Transmissions Ledger */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-600" /> Recent Asset Pipeline Transmissions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sequence ledger of parsed binary spreadsheet layers handled by the ingestion broker.
            </p>
          </div>

          <button
            onClick={() => navigate('/uploaded-files')}
            className="px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors duration-150 shadow-sm"
          >
            Explore File Vault
          </button>
        </div>

        <div className="p-6">
          {filesLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin" />
            </div>
          ) : recentFiles.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-xl bg-slate-50/30">
              <Cpu className="w-6 h-6 text-slate-400 mx-auto mb-2 animate-pulse" />
              <h3 className="text-xs font-semibold text-slate-800">No active operational streams</h3>
              <p className="text-xs text-slate-500 mt-0.5">Initialize your pipeline by importing an Excel or CSV workbook asset.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-lg overflow-hidden shadow-sm">
              {recentFiles.map((file) => {
                const isExcel =
                  file.originalName?.endsWith('.xlsx') ||
                  file.fileName?.endsWith('.xlsx') ||
                  file.sourceType === 'excel';

                return (
                  <div
                    key={file._id}
                    onClick={() => navigate(`/files/${file._id}`)}
                    className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50/80 transition-colors duration-100 cursor-pointer"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`w-9 h-9 rounded text-[10px] font-semibold flex items-center justify-center border shrink-0 font-mono shadow-sm ${isExcel
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                        {isExcel ? 'XLSX' : 'CSV'}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 text-xs truncate group-hover:text-indigo-600 transition-colors duration-100">
                          {file.originalName || file.fileName}
                        </h3>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200/40">
                            HEX: {file._id.slice(-6).toUpperCase()}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span>
                            {new Date(file.uploadedAt || file.createdAt).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-semibold text-indigo-950 bg-indigo-50/60 px-1.5 py-0.5 rounded border border-indigo-100/50">
                            {(file.totalRecords ?? 0).toLocaleString()} data sequences
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/files/${file._id}`);
                      }}
                      className="w-8 h-8 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 flex items-center justify-center transition-all duration-150 shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;