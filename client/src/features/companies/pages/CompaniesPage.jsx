import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Download, Tag } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../hooks/useAuth';
import Table from '../../../components/ui/Table';
import Button from '../../../components/ui/Button';
import CreateCompanyModal from '../components/CreateCompanyModal';
import TagAssignmentModal from '../components/TagAssignmentModal';
import CompanyDetailsModal from '../components/CompanyDetailsModal';

const fetchCompanies = async (searchParams, page = 1) => {
  const query = new URLSearchParams();

  if (searchParams.city) query.append('city', searchParams.city);
  if (searchParams.industry) query.append('industry', searchParams.industry);
  if (searchParams.country) query.append('country', searchParams.country);
  query.append('page', page);
  query.append('limit', 10);

  const response = await api.get(`/company?${query.toString()}`);

  return response.data;
};

const CompaniesPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'sales';

  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Tag Assignment Modal state
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [taggingCompanyIds, setTaggingCompanyIds] = useState([]);
  const [taggingInitialTags, setTaggingInitialTags] = useState([]);

  // Details Modal state
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const [filters, setFilters] = useState({
    city: '',
    industry: '',
    country: '',
  });

  const [activeFilters, setActiveFilters] = useState({
    city: '',
    industry: '',
    country: '',
  });

  const handleOpenDetails = (id) => {
    setSelectedCompanyId(id);
    setIsDetailsOpen(true);
  };

  const handleOpenTagAssignment = (companyIdsArray, initialTagsArray = []) => {
    setTaggingCompanyIds(companyIdsArray);
    setTaggingInitialTags(initialTagsArray);
    setIsTagModalOpen(true);
  };

  // =========================
  // Fetch Countries
  // =========================
  const { data: countriesList = [] } = useQuery({
    queryKey: ['filters', 'countries'],
    queryFn: async () => {
      const res = await api.get('/filters/countries');
      return res.data.data;
    },
  });

  // =========================
  // Fetch Cities
  // =========================
  const { data: citiesList = [] } = useQuery({
    queryKey: ['filters', 'cities', filters.country],
    queryFn: async () => {
      const res = await api.get(
        `/filters/cities${filters.country ? `?country=${filters.country}` : ''
        }`
      );

      return res.data.data;
    },
  });

  // =========================
  // Fetch Industries
  // =========================
  const { data: industriesList = [] } = useQuery({
    queryKey: ['filters', 'industries'],
    queryFn: async () => {
      const res = await api.get('/filters/industries');
      return res.data.data;
    },
  });

  // =========================
  // Fetch Companies
  // =========================
  const [page, setPage] = useState(1);

  // Reset page when search filters change
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    setActiveFilters(filters);
    setSelectedIds([]); // Clear selection when search changes
  };

  const { data, isLoading } = useQuery({
    queryKey: ['companies', activeFilters, page],
    queryFn: () => fetchCompanies(activeFilters, page),
  });

  const companies = data?.companies || [];
  const total = data?.total || 0;
  const totalPages = data?.totalPages || 1;
  const limit = data?.limit || 10;

  // =========================
  // Export Handler
  // =========================
  const handleExport = () => {
    const query = new URLSearchParams();
    if (activeFilters.city) query.append('city', activeFilters.city);
    if (activeFilters.industry) query.append('industry', activeFilters.industry);
    if (activeFilters.country) query.append('country', activeFilters.country);

    const url = `http://localhost:3000/api/export/companies${query.toString() ? `?${query.toString()}` : ''}`;
    window.open(url, '_blank');
  };

  // =========================
  // Table Columns
  // =========================
  const columns = [
    ...(role === 'admin' || role === 'sales'
      ? [
          {
            header: (
              <input
                type="checkbox"
                checked={companies.length > 0 && selectedIds.length === companies.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds(companies.map((c) => c._id));
                  } else {
                    setSelectedIds([]);
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            ),
            accessor: 'selection',
            cell: (row) => (
              <input
                type="checkbox"
                checked={selectedIds.includes(row._id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedIds([...selectedIds, row._id]);
                  } else {
                    setSelectedIds(selectedIds.filter((id) => id !== row._id));
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            ),
          },
        ]
      : []),

    {
      header: 'Company Name',
      accessor: 'company_name',
      cell: (row) => (
        <button
          onClick={() => handleOpenDetails(row._id)}
          className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-left focus:outline-none transition-colors"
        >
          {row.company_name}
        </button>
      ),
    },

    {
      header: 'Owner',
      accessor: 'companyOwnerName',
      cell: (row) => row.companyOwnerName || '-',
    },

    {
      header: 'City',
      accessor: 'city',
      cell: (row) => row.city || '-',
    },

    {
      header: 'Country',
      accessor: 'country',
      cell: (row) => row.country || '-',
    },

    {
      header: 'Industry',
      accessor: 'industry',
      cell: (row) => row.industry || '-',
    },

    {
      header: 'Phone',
      accessor: 'phone',
      cell: (row) => row.phone || '-',
    },

    {
      header: 'Email',
      accessor: 'email',
      cell: (row) =>
        row.email ? (
          <a
            href={`mailto:${row.email}`}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium select-all"
          >
            {row.email}
          </a>
        ) : (
          '-'
        ),
    },

    {
      header: 'Website',
      accessor: 'website',
      cell: (row) =>
        row.website ? (
          <a
            href={
              row.website.startsWith('http')
                ? row.website
                : `https://${row.website}`
            }
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Visit
          </a>
        ) : (
          '-'
        ),
    },

    {
      header: 'Social Media',
      accessor: 'socialMedia',
      cell: (row) =>
        row.socialMedia ? (
          <a
            href={
              row.socialMedia.startsWith('http')
                ? row.socialMedia
                : `https://${row.socialMedia}`
            }
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Link
          </a>
        ) : (
          '-'
        ),
    },

    {
      header: 'Employee Name',
      accessor: 'contacts_name',
      cell: (row) => {
        const contacts = row.contacts || [];
        if (contacts.length === 0) return '-';
        return (
          <div className="flex flex-col gap-2 py-0.5">
            {contacts.map((c, i) => (
              <div key={i} className="h-7 flex items-center text-xs font-semibold text-gray-800 whitespace-nowrap">
                {c.name || '-'}
              </div>
            ))}
          </div>
        );
      }
    },

    {
      header: 'Employee Position',
      accessor: 'contacts_position',
      cell: (row) => {
        const contacts = row.contacts || [];
        if (contacts.length === 0) return '-';
        return (
          <div className="flex flex-col gap-2 py-0.5">
            {contacts.map((c, i) => (
              <div key={i} className="h-7 flex items-center text-xs text-gray-500 whitespace-nowrap">
                {c.position ? (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium border border-slate-200">
                    {c.position}
                  </span>
                ) : (
                  '-'
                )}
              </div>
            ))}
          </div>
        );
      }
    },

    {
      header: 'Contact No.',
      accessor: 'contacts_phone',
      cell: (row) => {
        const contacts = row.contacts || [];
        if (contacts.length === 0) return '-';
        return (
          <div className="flex flex-col gap-2 py-0.5">
            {contacts.map((c, i) => (
              <div key={i} className="h-7 flex items-center text-xs whitespace-nowrap">
                {c.contactNumber ? (
                  <a href={`tel:${c.contactNumber}`} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium transition">
                    <span className="text-[10px]">📞</span> <span className="select-all">{c.contactNumber}</span>
                  </a>
                ) : (
                  '-'
                )}
              </div>
            ))}
          </div>
        );
      }
    },

    {
      header: 'Employee Email',
      accessor: 'contacts_email',
      cell: (row) => {
        const contacts = row.contacts || [];
        if (contacts.length === 0) return '-';
        return (
          <div className="flex flex-col gap-2 py-0.5">
            {contacts.map((c, i) => (
              <div key={i} className="h-7 flex items-center text-xs whitespace-nowrap">
                {c.email ? (
                  <a href={`mailto:${c.email}`} className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-medium transition">
                    <span className="text-[10px]">✉️</span> <span className="select-all">{c.email}</span>
                  </a>
                ) : (
                  '-'
                )}
              </div>
            ))}
          </div>
        );
      }
    },

    {
      header: 'Turnover',
      accessor: 'turnover',
      cell: (row) =>
        row.turnover ? (
          <span className="font-semibold text-green-600">
            ₹{Number(row.turnover).toLocaleString('en-IN')}
          </span>
        ) : (
          '-'
        ),
    },

    {
      header: 'Source',
      accessor: 'source',
      cell: (row) => (
        <span className="capitalize px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-600">
          {row.source?.replace('_', ' ') || '-'}
        </span>
      ),
    },

    {
      header: 'Tags Count',
      accessor: 'tags',
      cell: (row) => {
        const count = row.tags ? row.tags.length : 0;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
              count > 0 ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-gray-50 text-gray-400 border border-gray-100'
            }`}>
              {count} {count === 1 ? 'Tag' : 'Tags'}
            </span>
            {(role === 'admin' || role === 'sales') && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenTagAssignment([row._id], row.tags);
                }}
                className="p-1 hover:bg-indigo-50 rounded-full text-gray-400 hover:text-indigo-600 transition"
                title="Manage tags for this company"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* =========================
          Header
      ========================== */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Companies
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Manage your centralized company database.
          </p>
        </div>

        <div className="flex gap-3 shrink-0">
          {(role === 'admin' || role === 'marketing') && (
            <Button
              onClick={handleExport}
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          )}

          {role === 'admin' && (
            <Button
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>
      </div>

      {/* =========================
          Filters
      ========================== */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <form
          onSubmit={handleSearch}
          className="flex flex-wrap gap-4 items-end"
        >
          {/* Industry */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              value={filters.industry}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  industry: e.target.value,
                })
              }
            >
              <option value="">All Industries</option>

              {industriesList.map((industry) => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          {/* Country */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              value={filters.country}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  country: e.target.value,
                  city: '',
                })
              }
            >
              <option value="">All Countries</option>

              {countriesList.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          {/* City */}
          <div className="w-full sm:w-auto flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>

            <select
              className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500"
              value={filters.city}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  city: e.target.value,
                })
              }
            >
              <option value="">All Cities</option>

              {citiesList.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full sm:w-auto"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {/* =========================
          Bulk Selection Banner
      ========================== */}
      {(role === 'admin' || role === 'sales') && selectedIds.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm animate-pulse-subtle">
          <div className="flex items-center gap-2 text-indigo-950 font-semibold text-sm">
            <span>{selectedIds.length} {selectedIds.length === 1 ? "company" : "companies"} selected</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleOpenTagAssignment(selectedIds, [])}
              className="bg-indigo-600 hover:bg-indigo-700 focus-visible:ring-indigo-600"
            >
              <Tag className="w-4 h-4 mr-2" /> Assign Tags
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedIds([])}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-100/50"
            >
              Deselect All
            </Button>
          </div>
        </div>
      )}

      {/* =========================
          Companies Table
      ========================== */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          columns={columns}
          data={companies}
          isLoading={isLoading}
          emptyMessage="No companies found."
        />

        {/* Pagination Footer */}
        {total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 bg-gray-50/50 border-t border-gray-100">
            <div className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-semibold text-gray-700">{Math.min((page - 1) * limit + 1, total)}</span> to{" "}
              <span className="font-semibold text-gray-700">{Math.min(page * limit, total)}</span> of{" "}
              <span className="font-semibold text-gray-700">{total}</span> companies
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  page === 1
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Previous
              </button>

              {/* Dynamic Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  totalPages > 5 &&
                  p !== 1 &&
                  p !== totalPages &&
                  Math.abs(p - page) > 1
                ) {
                  if (p === 2 && page > 3) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  if (p === totalPages - 1 && page < totalPages - 2) return <span key={p} className="px-1 text-gray-400 text-xs select-none">...</span>;
                  return null;
                }

                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 px-2 rounded-lg text-xs sm:text-sm font-semibold transition border ${
                      page === p
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-100"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${
                  page === totalPages
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =========================
          Create Company Modal
      ========================== */}
      <CreateCompanyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* =========================
          Tag Assignment Modal
      ========================== */}
      <TagAssignmentModal
        isOpen={isTagModalOpen}
        onClose={() => {
          setIsTagModalOpen(false);
          setSelectedIds([]); // Clear selections after assigning
        }}
        companyIds={taggingCompanyIds}
        initialTags={taggingInitialTags}
      />

      {/* =========================
          Company Details Modal
      ========================== */}
      <CompanyDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedCompanyId(null);
        }}
        companyId={selectedCompanyId}
        onEditTags={(company) => {
          setIsDetailsOpen(false);
          handleOpenTagAssignment([company._id], company.tags);
        }}
      />
    </div>
  );
};

export default CompaniesPage;