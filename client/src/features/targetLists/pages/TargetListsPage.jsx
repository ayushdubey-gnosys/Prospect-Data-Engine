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
        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 shadow-sm">
          All Companies
        </span>
      );
    }
    
    const elements = [];
    if (filters.search) elements.push({ label: 'Search', value: `"${filters.search}"`, color: 'bg-blue-50 text-blue-700 border-blue-200' });
    if (filters.industry) elements.push({ label: 'Industry', value: filters.industry, color: 'bg-purple-50 text-purple-700 border-purple-200' });
    if (filters.city) elements.push({ label: 'City', value: filters.city, color: 'bg-green-50 text-green-700 border-green-200' });
    if (filters.country) elements.push({ label: 'Country', value: filters.country, color: 'bg-orange-50 text-orange-700 border-orange-200' });
    if (filters.tag) elements.push({ label: 'Tag', value: filters.tag, color: 'bg-pink-50 text-pink-700 border-pink-200' });
    
    return (
      <div className="flex flex-wrap gap-1.5">
        {elements.map((el, i) => (
          <span key={i} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium border shadow-sm ${el.color}`}>
            <span className="opacity-70 font-semibold">{el.label}:</span>
            <span>{el.value}</span>
          </span>
        ))}
      </div>
    );
  };

  const targetLists = response?.data || [];
  const totalPages = response?.totalPages || 1;
  const totalCount = response?.total || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-600" />
            Target Lists
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your saved company segments for outreach.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-gray-50/50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search target lists by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {totalCount} {totalCount === 1 ? 'list' : 'lists'} found
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[300px]">
             <span className="w-8 h-8 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></span>
             Loading target lists...
          </div>
        ) : targetLists.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Target Lists Found</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              {search ? "No target lists match your search criteria." : "Create target lists from the Companies page by applying filters and saving the results."}
            </p>
            {!search && (
              <Button onClick={() => navigate('/companies')}>
                Go to Companies
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 font-semibold w-1/4">List Name</th>
                  <th className="py-4 px-6 font-semibold">Filters Used</th>
                  <th className="py-4 px-6 font-semibold text-center w-32">Companies</th>
                  <th className="py-4 px-6 font-semibold w-40">Created By</th>
                  {isAdmin && <th className="py-4 px-6 font-semibold w-48">Assigned To</th>}
                  <th className="py-4 px-6 font-semibold text-right w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {targetLists.map((list) => (
                  <tr key={list._id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/target-lists/${list._id}`)}>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base truncate max-w-[200px]" title={list.name}>{list.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                      {!isAdmin && list.assignments && list.assignments.some(a => a.user?._id === user?._id || a.user === user?._id) && (
                        <div className="mt-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded inline-block border border-indigo-100">
                          <span className="font-semibold">Assigned:</span> {list.assignments.find(a => a.user?._id === user?._id || a.user === user?._id)?.description || "No description"}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {renderFilters(list.filters)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100 shadow-sm">
                        <Users className="w-4 h-4 text-blue-500" />
                        {list.companies?.length || 0}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 truncate max-w-[150px]" title={list.createdBy?.name || 'Unknown'}>{list.createdBy?.name || 'Unknown'}</div>
                    </td>
                    {isAdmin && (
                      <td className="py-4 px-6">
                        {list.assignments && list.assignments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {list.assignments.map((assignment, idx) => (
                              <div key={idx} className="text-xs text-gray-700 bg-gray-50 border rounded px-2 py-1 truncate" title={assignment.description}>
                                <span className="font-bold">{assignment.user?.name}</span>
                                {assignment.description && <span className="text-gray-400 ml-1">- {assignment.description}</span>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Not assigned</span>
                        )}
                      </td>
                    )}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              setSelectedListToAssign(list);
                              setIsAssignModalOpen(true);
                            }}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Assign to Salesman"
                          >
                            <UserPlus className="w-4 h-4" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => deleteMutation.mutate(list._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete List"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/target-lists/${list._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              Page {page} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-600 transition-colors shadow-sm"
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
