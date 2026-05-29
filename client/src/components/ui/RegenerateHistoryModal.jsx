import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, FileDown, Columns, Calendar, Hash, RefreshCw, ChevronRight, Activity } from 'lucide-react';
import Modal from './Modal';
import api from '../../api/axios';

const RegenerateHistoryModal = ({ isOpen, onClose, exportId, exportData }) => {
  const { data: historyData, isLoading } = useQuery({
    queryKey: ['regenerateHistory', exportId],
    queryFn: () => api.get(`/export/regenerate-history/${exportId}`).then((res) => res.data),
    enabled: isOpen && !!exportId,
  });

  const regenerations = historyData?.regenerations || [];
  const totalRegenerations = historyData?.totalRegenerations || 0;
  const originalExport = historyData?.originalExport || exportData;

  const renderFilterBadges = (filters) => {
    if (!filters || Object.keys(filters).length === 0) return null;
    const active = Object.entries(filters).filter(
      ([key, val]) => val && key !== 'columns' && key !== 'format' && key !== 'limit'
    );
    if (active.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-1">
        {active.map(([key, value]) => (
          <div key={key} className="inline-flex items-center px-2.5 py-1 rounded-md bg-white/60 border border-indigo-100/50 shadow-sm backdrop-blur-sm">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mr-1.5">{key}:</span>
            <span className="text-[11px] font-semibold text-indigo-700">{value}</span>
          </div>
        ))}
      </div>
    );
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Regeneration History" className="max-w-3xl">
      <div className="flex flex-col h-full max-h-[85vh]">
        
        {/* Header Section */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-10">
          {/* Stats Bar */}
          <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-xl border border-gray-200/60 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                <Activity className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Total Regenerations</h3>
                <p className="text-[11px] text-gray-500 font-medium">Times this specific data was re-exported</p>
              </div>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-indigo-600 tracking-tight">{totalRegenerations}</span>
              <span className="text-sm font-semibold text-gray-400">times</span>
            </div>
          </div>

          {/* Original Export Card */}
          {originalExport && (
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-5 shadow-lg shadow-indigo-200/50 border border-indigo-500/20 text-white">
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md border border-white/10">
                      <FileDown className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-base font-bold tracking-tight text-white">Original Export Base</h4>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-0.5">Date</span>
                    <span className="font-semibold text-sm text-white bg-black/10 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/5">
                      {formatDate(originalExport.exportedAt || originalExport.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-4">
                  <div>
                    <span className="block text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-1">Exported By</span>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="font-semibold text-sm">{originalExport.exportedBy?.name || 'System'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-1">Total Records</span>
                    <div className="flex items-center gap-1.5">
                      <Hash className="w-3.5 h-3.5 text-indigo-300" />
                      <span className="font-semibold text-sm">{originalExport.totalRecords?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <span className="block text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-1">File Name</span>
                    <span className="font-mono text-xs text-indigo-100 bg-black/20 px-2 py-1 rounded border border-white/5 truncate block">
                      {originalExport.fileName}
                    </span>
                  </div>
                </div>

                {originalExport.filters && Object.keys(originalExport.filters).length > 0 && (
                  <div className="pt-4 border-t border-white/10">
                    <span className="block text-[10px] font-medium text-indigo-200 uppercase tracking-widest mb-2">Applied Filters</span>
                    {renderFilterBadges(originalExport.filters)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50/30">
          <div className="mb-6 flex items-center gap-2">
            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Timeline</h4>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-gray-100"></div>
                <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
              </div>
              <span className="text-sm font-medium text-gray-500 animate-pulse">Loading history timeline...</span>
            </div>
          ) : regenerations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
              <div className="p-5 bg-gray-50 rounded-full mb-4 ring-8 ring-gray-50/50">
                <Clock className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-base font-bold text-gray-800 mb-1">No Regenerations Yet</h4>
              <p className="text-sm text-gray-500 max-w-sm">This specific dataset hasn't been re-exported by anyone. When they do, it will appear here.</p>
            </div>
          ) : (
            <div className="relative pl-6 space-y-8">
              {/* Vertical timeline line */}
              <div className="absolute left-8 top-4 bottom-0 w-px bg-gradient-to-b from-indigo-200 via-gray-200 to-transparent"></div>

              {regenerations.map((regen, index) => {
                const isLatest = index === 0;
                return (
                  <div key={regen._id} className="relative group">
                    {/* Timeline Node */}
                    <div className={`absolute -left-[1.35rem] top-4 w-5 h-5 rounded-full border-[3px] shadow-sm z-10 transition-colors ${
                      isLatest 
                        ? 'bg-indigo-600 border-indigo-100 ring-4 ring-indigo-50 shadow-indigo-200' 
                        : 'bg-white border-gray-300 group-hover:border-indigo-400'
                    }`}></div>

                    {/* Content Card */}
                    <div className={`ml-8 rounded-2xl p-5 transition-all duration-200 border ${
                      isLatest
                        ? 'bg-white border-indigo-100 shadow-md shadow-indigo-100/50 ring-1 ring-indigo-50'
                        : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                    }`}>
                      
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* User Info */}
                        <div className="flex items-start gap-3">
                          <div className={`mt-1 p-2.5 rounded-xl ${
                            isLatest ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-500'
                          }`}>
                            <RefreshCw className={`w-5 h-5 ${isLatest ? 'animate-[spin_4s_linear_infinite]' : ''}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                {regen.regeneratedBy?.name || 'Unknown User'}
                              </span>
                              {isLatest && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                                  Latest
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3">
                              {regen.regeneratedBy?.email && (
                                <span className="text-xs font-medium text-gray-500">{regen.regeneratedBy.email}</span>
                              )}
                              {regen.regeneratedBy?.role && (
                                <>
                                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                    {regen.regeneratedBy.role}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Timing Info */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 text-right bg-gray-50 sm:bg-transparent p-2 sm:p-0 rounded-lg">
                          <div className="flex items-center gap-1.5 text-gray-900">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-sm font-bold">{formatDate(regen.regeneratedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-500">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span className="text-xs font-medium">{formatTime(regen.regeneratedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details row */}
                      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                          <Hash className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-bold text-gray-700">{regen.totalRecords?.toLocaleString() || 0}</span>
                          <span className="text-xs font-medium text-gray-500">records</span>
                        </div>

                        {regen.ignoredColumns && regen.ignoredColumns.length > 0 && (
                          <div className="flex items-center gap-2 flex-1">
                            <Columns className="w-4 h-4 text-red-400 shrink-0" />
                            <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider shrink-0">
                              Ignored:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {regen.ignoredColumns.map((col) => (
                                <span
                                  key={col}
                                  className="px-2 py-0.5 rounded-md bg-red-50 text-red-600 text-[11px] font-semibold border border-red-100/50 shadow-sm"
                                >
                                  {col}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-white text-gray-700 text-sm font-bold border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all focus:ring-4 focus:ring-gray-100 outline-none"
          >
            Close Window
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default RegenerateHistoryModal;
