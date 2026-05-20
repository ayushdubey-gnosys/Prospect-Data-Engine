import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Table from '../../../components/ui/Table';

const TagsPage = () => {
  const [newTagName, setNewTagName] = useState('');

  const { data: tags, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tag').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (name) => api.post('/tag', { name }),
    onSuccess: () => {
      toast.success('Tag created successfully');
      setNewTagName('');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create tag');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tag/${id}`),
    onSuccess: () => {
      toast.success('Tag deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete tag');
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createMutation.mutate(newTagName.trim());
  };

  const columns = [
    { header: 'Tag Name', accessor: 'name' },
    { header: 'Created At', cell: (row) => new Date(row.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => deleteMutation.mutate(row._id)}
          className="text-red-500 hover:text-red-700 focus:outline-none transition-colors"
          title="Delete Tag"
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tags Management</h1>
        <p className="text-sm text-gray-500 mt-1">Create and manage tags for your companies.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-xl">
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="New Tag Name"
              placeholder="e.g., Enterprise, Tech, Hot Lead"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
            />
          </div>
          <Button type="submit" isLoading={createMutation.isPending} disabled={!newTagName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl">
        <Table
          columns={columns}
          data={tags?.tags || tags || []}
          isLoading={isLoading}
          emptyMessage="No tags found."
        />
      </div>
    </div>
  );
};

export default TagsPage;