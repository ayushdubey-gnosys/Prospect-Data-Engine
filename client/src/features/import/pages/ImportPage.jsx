import React, { useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import api from '../../../api/axios';
import { queryClient } from '../../../api/queryClient';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

const ImportPage = () => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const { data: history, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['importHistory'],
    queryFn: () => api.get('/import/history').then((res) => res.data),
  });

  const uploadMutation = useMutation({
    mutationFn: (formData) => api.post('/import/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
    onSuccess: (res) => {
      toast.success(res.data?.message || 'File imported successfully');
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      queryClient.invalidateQueries({ queryKey: ['importHistory'] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to import file');
    },
  });

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
      const fileExt = selected.name.split('.').pop().toLowerCase();
      if (validTypes.includes(selected.type) || ['csv', 'xlsx', 'xls', 'gsheet'].includes(fileExt)) {
        setFile(selected);
      } else {
        toast.error('Please select a valid CSV, Excel, or GSheet file');
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  const columns = [
    { header: 'Date & Time', accessor: 'uploadedAt', cell: (row) => new Date(row.uploadedAt || row.createdAt).toLocaleString() },
    { header: 'File Name', accessor: 'originalName', cell: (row) => row.originalName || row.fileName },
    { header: 'Uploaded By', cell: (row) => (
      <div>
        <span className="font-semibold text-gray-900">{row.uploadedBy ? row.uploadedBy.name : 'Admin/System'}</span>
        {row.uploadedBy?.email && <span className="block text-xs text-gray-500">{row.uploadedBy.email}</span>}
      </div>
    )},
    { header: 'Records Added', accessor: 'totalRecords', cell: (row) => row.totalRecords || row.recordsAdded || 0 },
    { header: 'Status', cell: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">
        <CheckCircle className="w-3 h-3 text-green-500 mr-1" /> Success
      </span>
    )},
    { header: 'Action', cell: (row) => (
      <Link to={`/files/${row._id}`} className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-semibold">
        View Data
      </Link>
    )}
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Data</h1>
        <p className="text-sm text-gray-500 mt-1">Upload CSV, Excel, or GSheet files to import prospect companies.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:bg-gray-50 transition-colors">
          <input
            type="file"
            accept=".csv,.xlsx,.xls,.gsheet"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-50 rounded-full text-blue-500">
              <Upload className="w-8 h-8" />
            </div>
            {file ? (
              <div className="flex items-center space-x-2 text-gray-700">
                <FileText className="w-5 h-5" />
                <span className="font-medium">{file.name}</span>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-gray-500 mt-1">CSV, Excel, GSheet files only (max. 10MB)</p>
              </div>
            )}
            <Button
              variant={file ? "primary" : "outline"}
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? 'Change File' : 'Select File'}
            </Button>
          </div>
        </div>

        {file && (
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
            >
              Start Import
            </Button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Import History</h2>
        </div>
        <Table
          columns={columns}
          data={history?.history || []}
          isLoading={isHistoryLoading}
          emptyMessage="No import history found."
        />
      </div>
    </div>
  );
};

export default ImportPage;