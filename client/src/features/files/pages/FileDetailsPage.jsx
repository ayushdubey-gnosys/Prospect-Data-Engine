import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFileCompanies } from '../hooks/useFileCompanies';
import { useCities } from '../hooks/useCities';
import { useIndustries } from '../hooks/useIndustries';
import { useCountries } from '../hooks/useCountries';
import { useExport } from '../hooks/useExport';
import { useAuth } from '../../../hooks/useAuth';
import FilterSidebar from '../components/FilterSidebar';
import FileCompaniesTable from '../components/FileCompaniesTable';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import ExportConfigModal from '../../../components/ui/ExportConfigModal';

const FileDetailsPage = () => {
  const { fileId } = useParams();
  const { user } = useAuth();

  const role = user?.role || 'sales';
  const canExport = role === 'admin' || role === 'marketing';

  const [filters, setFilters] = useState({ page: 1, limit: 25, city: '', industry: '', country: '', search: '' });

  const { data: citiesData } = useCities(fileId);
  const cities = citiesData || [];

  const { data: industriesData } = useIndustries(fileId, filters.city);
  const industries = industriesData || [];

  const { data: countriesData } = useCountries(fileId);
  const countries = countriesData || [];
  

  const { data, isLoading, refetch } = useFileCompanies(fileId, filters);

  useEffect(() => {
    refetch();
  }, [filters]);

  const exportMutation = useExport();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleReset = () => setFilters({ page: 1, limit: 25, city: '', industry: '', country: '', search: '' });

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleConfirmExport = async (selectedColumns, format) => {
    try {
      setIsExporting(true);
      const params = {};
      if (filters.city) params.city = filters.city;
      if (filters.industry) params.industry = filters.industry;
      if (filters.country) params.country = filters.country;
      if (filters.search) params.search = filters.search;
      params.format = format;
      params.columns = selectedColumns.join(',');

      const res = await api.get(`/files/${fileId}/export?${new URLSearchParams(params).toString()}`, { responseType: 'blob' });
      const blob = new Blob([res.data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${fileId}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setIsExportModalOpen(false);
      toast.success(`${format === 'csv' ? 'CSV' : 'Excel'} Export Successful`);
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-bold">File Details</h1>
        <p className="text-sm text-gray-500 mt-1">Browse companies from this uploaded file.</p>
      </div>

      <div className="w-full">
        <FilterSidebar
          cities={cities}
          industries={industries}
          countries={countries}
          filters={filters}
          setFilters={setFilters}
          onReset={handleReset}
          onExport={handleExport}
          isExporting={isExporting}
          canExport={canExport}
        />
      </div>

      <div className="w-full">
        <FileCompaniesTable data={data?.data || []} isLoading={isLoading} emptyMessage="No companies found for this file." />

        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-600">Total: {data?.total || 0}</div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
              disabled={filters.page <= 1}
              onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
            >
              Prev
            </button>
            <div className="px-3 py-1 text-sm">Page {filters.page}</div>
            <button
              className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
              disabled={data && filters.page * filters.limit >= (data.total || 0)}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <ExportConfigModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleConfirmExport}
        isExporting={isExporting}
        defaultFormat="csv"
      />
    </div>
  );
};

export default FileDetailsPage;
