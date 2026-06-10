import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Search, Clock, Users, Trash2, ArrowRight, ChevronLeft, ChevronRight, UserPlus, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../hooks/useAuth';
import AssignTargetListModal from '../components/AssignTargetListModal';

const TargetListsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedListToAssign, setSelectedListToAssign] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: response, isLoading } = useQuery({
    queryKey: ['target-lists', page, debouncedSearch],
    queryFn: async () => {
      const res = await api.get('/target-lists', {
        params: { page, limit: 10, search: debouncedSearch }
      });
      return res.data;
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/target-lists/${id}`),
    onSuccess: () => {
      toast.success("Target list deleted");
      queryClient.invalidateQueries(['target-lists']);
    },
    onError: () => toast.error("Failed to delete target list")
  });

  const renderFilters = (filters) => {
    if (!filters || Object.keys(filters).length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold uppercase tracking-wider border border-slate-200 shadow-sm">
          All Companies
        </span>
      );
    }

    const elements = [];
    if (filters.search) elements.push({ label: 'Search', value: `"${filters.search}"`, color: 'bg-blue-50/80 text-blue-700 border-blue-200' });
    if (filters.industry) elements.push({ label: 'Industry', value: filters.industry, color: 'bg-purple-50/80 text-purple-700 border-purple-200' });
    if (filters.city) elements.push({ label: 'City', value: filters.city, color: 'bg-emerald-50/80 text-emerald-700 border-emerald-200' });
    if (filters.country) elements.push({ label: 'Country', value: filters.country, color: 'bg-amber-50/80 text-amber-700 border-amber-200' });
    if (filters.tag) elements.push({ label: 'Tag', value: filters.tag, color: 'bg-pink-50/80 text-pink-700 border-pink-200' });

    return (
      <div className="flex flex-wrap gap-2">
        {elements.map((el, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border shadow-sm transition-all hover:shadow-md ${el.color}`}>
            <span className="opacity-70 uppercase tracking-wider text-[10px]">{el.label}:</span>
            <span>{el.value}</span>
          </span>
        ))}
      </div>
    );
  };

  const getInitials = (name) => {
    return name ? name.substring(0, 2).toUpperCase() : 'U';
  };

  const targetLists = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalCount = response?.total || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Target Lists
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your saved company segments and track team outreach.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        {/* Search Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div className="relative w-full max-w-md group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search target lists by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="text-sm px-4 py-2 bg-white rounded-lg border border-slate-200 text-slate-600 font-semibold shadow-sm">
            <span className="text-blue-600">{totalCount}</span> {totalCount === 1 ? 'list' : 'lists'} found
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-500 font-medium">Loading your target lists...</p>
          </div>
        ) : targetLists.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-slate-100">
              <Target className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Target Lists Found</h3>
            <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
              {search ? "We couldn't find any lists matching your search. Try different keywords." : "You haven't created any target lists yet. Start by filtering companies and saving them as a list."}
            </p>
            {!search && (
              <Button onClick={() => navigate('/companies')} className="shadow-lg shadow-blue-500/30">
                Explore Companies
              </Button>
            )}
          </div>
        ) : (
          <div className="w-full max-md:overflow-x-auto pb-12">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 text-[11px] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-4 px-6 w-1/4">List Details</th>
                  <th className="py-4 px-6">Filters Used</th>
                  <th className="py-4 px-6 text-center w-32">Size</th>
                  <th className="py-4 px-6 w-48">Created By</th>
                  {isAdmin && <th className="py-4 px-6 w-56">Assignments</th>}
                  <th className="py-4 px-6 text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targetLists.map((list) => (
                  <tr key={list._id} className="hover:bg-blue-50/30 transition-all duration-200 group cursor-pointer" onClick={() => navigate(`/target-lists/${list._id}`)}>
                    <td className="py-5 px-6">
                      <div className="font-bold text-slate-800 text-[15px] truncate max-w-[220px] group-hover:text-blue-700 transition-colors" title={list.name}>{list.name}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(list.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      {!isAdmin && list.assignments && list.assignments.some(a => a.user?._id === user?._id || a.user === user?._id) && (
                        <div className="mt-2.5 text-[11px] bg-indigo-50 text-indigo-700 px-2.5 py-1.5 rounded-md inline-flex items-center gap-1.5 border border-indigo-100 font-medium">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                          <span>Assigned</span>
                          {(() => {
                            const desc = list.assignments.find(a => a.user?._id === user?._id || a.user === user?._id)?.description;
                            if (desc) {
                              return (
                                <div className="relative group/note ml-1 flex items-center">
                                  <span className="text-indigo-600 underline decoration-indigo-300 hover:text-indigo-800 cursor-pointer text-[10px]">View Note</span>
                                  <div className="absolute z-50 left-0 top-full mt-3 hidden group-hover/note:block w-[450px] max-w-[80vw] bg-white border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-xl p-5 text-xs text-slate-700 normal-case whitespace-pre-wrap cursor-default" onClick={(e) => e.stopPropagation()}>
                                    <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
                                    <div className="relative z-10">
                                      <div className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 text-[14px]">Assignment Note:</div>
                                      <div className="text-[13.5px] leading-relaxed text-slate-600">{desc}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-6">
                      {renderFilters(list.filters)}
                    </td>
                    <td className="py-5 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100/50 shadow-sm transition-transform group-hover:scale-105">
                        <Users className="w-4 h-4 text-blue-500" />
                        {list.companies?.length || 0}
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {getInitials(list.createdBy?.name)}
                        </div>
                        <div className="font-semibold text-slate-700 truncate max-w-[120px]" title={list.createdBy?.name || 'Unknown'}>
                          {list.createdBy?.name || 'Unknown'}
                        </div>
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="py-5 px-6">
                        {list.assignments && list.assignments.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {list.assignments.map((assignment, idx) => (
                              <div key={idx} className="flex flex-col bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm hover:border-blue-300 transition-colors">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[9px] font-bold">
                                      {getInitials(assignment.user?.name)}
                                    </div>
                                    <span className="font-semibold text-xs text-slate-700 truncate max-w-[120px]">{assignment.user?.name}</span>
                                  </div>
                                  {assignment.description && (
                                    <div className="relative group/note flex items-center">
                                      <span className="text-blue-600 underline decoration-blue-200 hover:text-blue-800 cursor-pointer text-[10px] whitespace-nowrap">View Note</span>
                                      <div className="absolute z-50 right-0 top-full mt-3 hidden group-hover/note:block w-[450px] max-w-[80vw] bg-white border border-slate-200 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] rounded-xl p-5 text-xs text-slate-700 normal-case whitespace-pre-wrap cursor-default" onClick={(e) => e.stopPropagation()}>
                                        <div className="absolute -top-2 right-6 w-4 h-4 bg-white border-t border-l border-slate-200 transform rotate-45"></div>
                                        <div className="relative z-10">
                                          <div className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2 text-[14px]">Note for {assignment.user?.name}:</div>
                                          <div className="text-[13.5px] leading-relaxed text-slate-600">{assignment.description}</div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-50 text-slate-400 text-xs font-medium border border-slate-100">
                            Unassigned
                          </span>
                        )}
                      </td>
                    )}
                    <td className="py-5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedListToAssign(list);
                              setIsAssignModalOpen(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors bg-indigo-50"
                            title="Assign to Salesman"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => deleteMutation.mutate(list._id)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors bg-red-50"
                            title="Delete List"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/target-lists/${list._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors bg-blue-50"
                          title="View Details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between">
            <div className="text-sm text-slate-500 font-medium">
              Page <span className="text-slate-800 font-bold">{page}</span> of <span className="text-slate-800 font-bold">{totalPages}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedListToAssign && (
        <AssignTargetListModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false);
            setSelectedListToAssign(null);
          }}
          targetListId={selectedListToAssign._id}
          targetListName={selectedListToAssign.name}
        />
      )}
    </div>
  );
};

export default TargetListsPage;
