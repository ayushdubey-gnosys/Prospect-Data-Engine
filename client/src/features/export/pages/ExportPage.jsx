import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileDown, Calendar, User, Tag, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../../api/axios';
import Button from '../../../components/ui/Button';
import Table from '../../../components/ui/Table';

const ExportPage = () => {
  const [filters, setFilters] = useState({
    country: '',
    city: '',
    industry: '',
  });

  const [isExporting, setIsExporting] = useState(false);

  // Fetch countries list for filters
  const { data: countriesList = [] } = useQuery({
    queryKey: ['exportFilters', 'countries'],
    queryFn: () => api.get('/filters/countries').then((res) => res.data.data || []),
  });

  // Fetch cities list based on selected country
  const { data: citiesList = [] } = useQuery({
    queryKey: ['exportFilters', 'cities', filters.country],
    queryFn: () => api.get(`/filters/cities${filters.country ? `?country=${filters.country}` : ''}`).then((res) => res.data.data || []),
  });

  // Fetch industries list for filters
  const { data: industriesList = [] } = useQuery({
    queryKey: ['exportFilters', 'industries'],
    queryFn: () => api.get('/filters/industries').then((res) => res.data.data || []),
  });

  // Fetch total records count matching selected filters
  const { data: countData, isLoading: isCountLoading } = useQuery({
    queryKey: ['exportCount', filters],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.industry) queryParams.append('industry', filters.industry);
      if (filters.country) queryParams.append('country', filters.country);
      queryParams.append('limit', 1);
      return api.get(`/company?${queryParams.toString()}`).then((res) => res.data);
    }
  });

  // Fetch export history list
  const { data: historyData, isLoading: isHistoryLoading, refetch: refetchHistory } = useQuery({
    queryKey: ['exportHistory'],
    queryFn: () => api.get('/export/history').then((res) => res.data),
  });

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const queryParams = new URLSearchParams();
      if (filters.country) queryParams.append('country', filters.country);
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.industry) queryParams.append('industry', filters.industry);

      const response = await api.get(`/export/companies?${queryParams.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `companies_export_${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Excel Export Successful');
      refetchHistory();
    } catch (error) {
      console.error(error);
      toast.error('Excel Export Failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      country: '',
      city: '',
      industry: '',
    });
  };

  const renderFilters = (exportFilters) => {
    if (!exportFilters || Object.keys(exportFilters).length === 0) {
      return <span className="text-gray-400 text-xs">No filters (All Data)</span>;
    }
    
    // Filter out empty values
    const active = Object.entries(exportFilters).filter(([_, val]) => val);
    if (active.length === 0) {
      return <span className="text-gray-400 text-xs">No filters (All Data)</span>;
    }

    return (
      <div className="flex flex-wrap gap-1.5">
        {active.map(([key, value]) => (
          <span key={key} className="inline-flex items-center px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100/50">
            <span className="capitalize text-indigo-500 mr-1">{key}:</span>
            {value}
          </span>
        ))}
      </div>
    );
  };

  const columns = [
    {
      header: 'Date & Time',
      accessor: 'exportedAt',
      cell: (row) => new Date(row.exportedAt || row.createdAt).toLocaleString()
    },
    {
      header: 'Exported By',
      cell: (row) => (
        <div>
          <span className="font-semibold text-gray-900">{row.exportedBy ? row.exportedBy.name : 'Admin/System'}</span>
          {row.exportedBy?.email && <span className="block text-xs text-gray-500">{row.exportedBy.email}</span>}
        </div>
      )
    },
    {
      header: 'File Name',
      accessor: 'fileName',
      cell: (row) => <span className="font-mono text-xs text-gray-600">{row.fileName}</span>
    },
    {
      header: 'Filters Applied',
      cell: (row) => renderFilters(row.filters)
    },
    {
      header: 'Records Exported',
      accessor: 'totalRecords',
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {row.totalRecords || 0} Records
        </span>
      )
    }
  ];

  const exportCount = countData?.total || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export Data</h1>
        <p className="text-sm text-gray-500 mt-1">Download custom filtered prospect data as high-quality Excel sheets.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex items-center space-x-2 border-b border-gray-100 pb-3">
            <Filter className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Export Dataset</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value, city: '' })}
              >
                <option value="">All Countries</option>
                {countriesList.map((country) => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            {/* City Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                disabled={!filters.country}
                value={filters.city}
                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
              >
                <option value="">{filters.country ? 'All Cities' : 'Select a Country First'}</option>
                {citiesList.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                value={filters.industry}
                onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              >
                <option value="">All Industries</option>
                {industriesList.map((industry) => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button variant="outline" onClick={handleResetFilters}>
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Status/Export Action Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between text-center relative overflow-hidden">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none" />
          
          <div className="my-auto space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                <FileDown className="w-10 h-10" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-800">Export Summary</h2>
            
            <div>
              {isCountLoading ? (
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-extrabold text-indigo-600">{exportCount.toLocaleString()}</p>
                  <p className="text-sm font-medium text-gray-500">Matching records ready to download</p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-6">
            <Button
              size="lg"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleExport}
              disabled={isExporting || isCountLoading || exportCount === 0}
              isLoading={isExporting}
            >
              <Download className="w-5 h-5 mr-2" /> 
              Export to Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Export History Log */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Export History</h2>
            <p className="text-xs text-gray-500 mt-0.5">Track when and what filters marketing employees utilized to download data.</p>
          </div>
        </div>
        <Table
          columns={columns}
          data={historyData?.history || []}
          isLoading={isHistoryLoading}
          emptyMessage="No export logs found."
        />
      </div>
    </div>
  );
};

export default ExportPage;