import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Search, Clock, Users, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';

const TargetListsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: targetLists, isLoading } = useQuery({
    queryKey: ['target-lists'],
    queryFn: async () => {
      const res = await api.get('/target-lists');
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

  const formatFilters = (filters) => {
    if (!filters || Object.keys(filters).length === 0) return "All Companies";
    const parts = [];
    if (filters.search) parts.push(`Search: "${filters.search}"`);
    if (filters.industry) parts.push(`Industry: ${filters.industry}`);
    if (filters.city) parts.push(`City: ${filters.city}`);
    if (filters.country) parts.push(`Country: ${filters.country}`);
    if (filters.tag) parts.push(`Tag: ${filters.tag}`);
    return parts.join(' • ') || "All Companies";
  };

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
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading target lists...</div>
        ) : targetLists?.length === 0 ? (
          <div className="p-12 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No Target Lists Yet</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Create target lists from the Companies page by applying filters and saving the results.
            </p>
            <Button onClick={() => navigate('/companies')}>
              Go to Companies
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                <tr>
                  <th className="py-4 px-6 font-semibold w-1/3">List Name</th>
                  <th className="py-4 px-6 font-semibold">Filters Used</th>
                  <th className="py-4 px-6 font-semibold text-center w-32">Companies</th>
                  <th className="py-4 px-6 font-semibold w-40">Created By</th>
                  <th className="py-4 px-6 font-semibold text-right w-24">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {targetLists?.map((list) => (
                  <tr key={list._id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => navigate(`/target-lists/${list._id}`)}>
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900 text-base">{list.name}</div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                        <Clock className="w-3 h-3" />
                        {new Date(list.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-100 text-gray-600 text-xs font-medium">
                        <Search className="w-3.5 h-3.5 text-gray-400" />
                        {formatFilters(list.filters)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-100">
                        <Users className="w-4 h-4 text-blue-500" />
                        {list.companies?.length || 0}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{list.createdBy?.name || 'Unknown'}</div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => deleteMutation.mutate(list._id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete List"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
      </div>
    </div>
  );
};

export default TargetListsPage;
