import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { Target, Search, ArrowLeft, RefreshCw, CheckCircle2, Clock, XCircle, Circle, Link as LinkIcon, FileText, Users, Plus } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import Table from '../../../components/ui/Table';
import HoverCard from '../../../components/ui/HoverCard';
import Button from '../../../components/ui/Button';
import { openMailComposer } from '../../../utils/mailUtils';
import CompanyDetailsModal from '../../companies/components/CompanyDetailsModal';

const TargetListDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['target-list', id, page, limitPerPage],
    queryFn: async () => {
      const res = await api.get(`/target-lists/${id}?page=${page}&limit=${limitPerPage}`);
      return res.data;
    }
  });

  const repopulateMutation = useMutation({
    mutationFn: () => api.post(`/target-lists/${id}/repopulate`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(['target-list', id]);
    },
    onError: () => toast.error("Failed to repopulate target list")
  });

  const targetList = data?.targetList;
  const companiesData = data?.companies;
  const companies = companiesData?.data || [];
  const total = companiesData?.total || 0;
  const totalPages = Math.ceil(total / limitPerPage) || 1;

  const handleOpenDetails = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsDetailsOpen(true);
  };

  const getLeadStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'converted': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'dead': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Circle className="w-4 h-4 text-gray-200" />;
    }
  };

  const getLeadStatusLabel = (status) => {
    switch (status) {
      case 'in_progress': return 'In Progress';
      case 'converted': return 'Converted';
      case 'dead': return 'Dead';
      default: return 'None';
    }
  };

  const columns = [
    {
      header: 'Company Name',
      accessor: 'company_name',
      cell: (row) => {
        const status = row.leadStatus?.status || 'none';
        const updatedBy = row.leadStatus?.updatedBy?.name || 'Unknown';

        return (
          <div className="flex items-center gap-2 group relative">
            <div className="cursor-help flex items-center">
              {getLeadStatusIcon(status)}
              <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
                <p className="font-semibold">{getLeadStatusLabel(status)}</p>
                {status !== 'none' && (
                  <p className="text-gray-300 mt-1">Updated by: {updatedBy}</p>
                )}
                <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
              </div>
            </div>
            <button
              onClick={() => handleOpenDetails(row._id)}
              className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-left focus:outline-none transition-colors"
            >
              {row.company_name}
            </button>
          </div>
        );
      },
    },
    {
      header: 'Website',
      accessor: 'website',
      cell: (row) =>
        row.website ? (
          <a
            href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
          >
            Visit
          </a>
        ) : '-',
    },
    {
      header: 'Email',
      accessor: 'email',
      cell: (row) =>
        row.email ? (
          <button
            type="button"
            onClick={() => openMailComposer(row.email, row.company_name)}
            className="text-blue-600 hover:text-blue-800 hover:underline font-medium select-all text-left cursor-pointer bg-transparent border-none p-0"
          >
            {row.email}
          </button>
        ) : '-',
    },
    {
      header: 'Contact No',
      accessor: 'phone',
      cell: (row) => row.phone || '-',
    },
    {
      header: 'Contact Employees',
      accessor: 'contacts',
      cell: (row, rowIndex, totalRows) => {
        const rawContacts = row.contacts || [];
        const contacts = rawContacts.filter(c => {
          const nameMatch = c.name && row.company_name && c.name.trim().toLowerCase() === row.company_name.trim().toLowerCase();
          const phoneMatch = c.contactNumber && row.phone && c.contactNumber.trim() === row.phone.trim();
          if (nameMatch && !c.email && (!c.position || c.position === '')) return false;
          if (phoneMatch && !c.name) return false;
          if (nameMatch && phoneMatch) return false;
          return true;
        });

        const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;

        return (
          <HoverCard
            preferTop={isBottom}
            width="w-[26rem]"
            trigger={
              <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition">
                <Users className="w-3.5 h-3.5" /> {contacts.length > 0 ? `View ${contacts.length} Contacts` : 'Contact Employees'}
              </button>
            }
          >
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Employee Contacts</h4>
            {contacts.length === 0 ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500 font-medium">No employee contacts available</span>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                {contacts.map((contact, i) => (
                  <div key={i} className="flex justify-between items-start text-xs p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors shadow-sm">
                    <div className="flex flex-col gap-1 max-w-[50%]">
                      <span className="font-bold text-gray-900 text-sm truncate" title={contact.name}>{contact.name || "Unknown Name"}</span>
                      <span className="text-gray-500 font-medium truncate" title={contact.position}>{contact.position || "No position"}</span>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right max-w-[50%]">
                      {contact.email ? <button type="button" onClick={() => openMailComposer(contact.email, row.company_name, user?.email)} className="text-blue-600 font-medium hover:underline truncate w-full text-right cursor-pointer bg-transparent border-none p-0" title={contact.email}>{contact.email}</button> : <span className="text-gray-400">No Email</span>}
                      {contact.contactNumber ? <span className="text-gray-700 font-medium truncate w-full" title={contact.contactNumber}>{contact.contactNumber}</span> : <span className="text-gray-400">No Phone</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </HoverCard>
        );
      }
    },
    {
      header: 'Social Media Links',
      accessor: 'socialMedia',
      cell: (row, rowIndex, totalRows) => {
        const social = row.socialMedia || {};
        const hasPlatformLinks = (platform) => Array.isArray(social[platform]) && social[platform].length > 0;
        const hasLinks = ['facebook', 'youtube', 'instagram', 'x', 'linkedin'].some(hasPlatformLinks);
        const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;

        const renderLinks = (platform, label, urlPrefix, colorClass, hoverClass, borderClass, textClass) => {
          if (!hasPlatformLinks(platform)) return null;
          return social[platform].map((link, idx) => {
            const urlRaw = typeof link === 'string' ? link : (link && (typeof link.url === 'string' ? link.url : (typeof link.link === 'string' ? link.link : '')));
            if (!urlRaw || typeof urlRaw !== 'string') return null;
            const url = urlRaw.startsWith('http') ? urlRaw : `https://${urlRaw}`;
            const username = typeof link === 'string' ? label : (typeof link.username === 'string' && link.username.trim() ? link.username : label);

            return (
              <a key={`${platform}-${idx}`} href={url} target="_blank" rel="noreferrer" className={`flex flex-col p-2.5 rounded-lg border border-transparent ${hoverClass} transition-all group/link`}>
                <span className={`font-semibold text-gray-700 group-hover/link:${textClass}`}>{String(username)}</span>
                <span className={`text-xs ${colorClass} break-all`}>{String(urlRaw)}</span>
              </a>
            );
          });
        };

        return (
          <HoverCard preferTop={isBottom} width="w-[26rem]" trigger={<button className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded transition"><LinkIcon className="w-3.5 h-3.5" /> Connect on Social</button>}>
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Social Media Links</h4>
            {!hasLinks ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100"><span className="text-sm text-gray-500 font-medium">No links available</span></div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {renderLinks('facebook', 'Facebook', '', 'text-blue-500', 'hover:border-blue-100 hover:bg-blue-50/50', '', 'text-blue-700')}
                {renderLinks('youtube', 'YouTube', '', 'text-red-500', 'hover:border-red-100 hover:bg-red-50/50', '', 'text-red-700')}
                {renderLinks('instagram', 'Instagram', '', 'text-pink-500', 'hover:border-pink-100 hover:bg-pink-50/50', '', 'text-pink-700')}
                {renderLinks('x', 'X (Twitter)', '', 'text-gray-600', 'hover:border-gray-200 hover:bg-gray-50', '', 'text-gray-900')}
                {renderLinks('linkedin', 'LinkedIn', '', 'text-blue-600', 'hover:border-blue-100 hover:bg-blue-50/50', '', 'text-blue-700')}
              </div>
            )}
          </HoverCard>
        );
      }
    },
    { header: 'City', accessor: 'city', cell: (row) => row.city || '-' },
    { header: 'Country', accessor: 'country', cell: (row) => row.country || '-' },
    { header: 'Industry', accessor: 'industry', cell: (row) => row.industry || '-' },
    {
      header: 'Tags',
      accessor: 'tags',
      cell: (row) => {
        const tags = row.tags || [];
        return (
          <div className="flex items-center gap-2 min-w-[150px] max-w-[250px]">
            {tags.length === 0 ? <span className="text-gray-400 text-xs italic">No tags</span> : (
              <div className="flex flex-nowrap gap-1.5 py-1 overflow-x-auto custom-scrollbar flex-1 pb-1">
                {tags.map((t) => (
                  <span key={t._id} className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">{t.name}</span>
                ))}
              </div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (row) => {
        if (!row.description) return <span className="text-gray-400 text-xs">-</span>;
        return (
          <div className="relative group inline-block">
            <button className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition">
              <FileText className="w-3.5 h-3.5" /> Watch description
            </button>
            <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3">
              <h4 className="text-xs font-bold text-gray-800 mb-1 border-b pb-1">Description</h4>
              <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto custom-scrollbar">{row.description}</p>
            </div>
          </div>
        );
      }
    },
  ];

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/target-lists')}
            className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              {targetList?.name || 'Loading...'}
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Search className="w-3.5 h-3.5" />
              Filters: {formatFilters(targetList?.filters)}
            </p>
          </div>
        </div>
        
        <Button
          onClick={() => repopulateMutation.mutate()}
          disabled={repopulateMutation.isLoading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${repopulateMutation.isLoading ? 'animate-spin' : ''}`} />
          Repopulate
        </Button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-medium text-gray-700">Rows per page:</span>
            <select
              value={limitPerPage}
              onChange={(e) => {
                setLimitPerPage(Number(e.target.value));
                setPage(1);
              }}
              className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading companies...</div>
        ) : companies.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No companies found</h3>
            <p className="mt-1">Try clicking 'Repopulate' to run the filters again.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <Table columns={columns} data={companies} isLoading={isLoading} />
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 rounded-b-xl">
                <div className="text-sm text-gray-700 font-medium">
                  Showing <span className="font-bold text-gray-900">{((page - 1) * limitPerPage) + 1}</span> to <span className="font-bold text-gray-900">{Math.min(page * limitPerPage, total)}</span> of <span className="font-bold text-gray-900">{total}</span>
                </div>
                
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === 1 ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}>Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => {
                    if (i > 0 && arr[i - 1] !== p - 1) return <span key={`ellipsis-${p}`} className="px-1 text-gray-400">...</span>;
                    return (
                      <button key={p} onClick={() => setPage(p)} className={`min-w-[32px] h-8 rounded-lg text-xs font-semibold transition border ${page === p ? "bg-blue-600 text-white" : "bg-white"}`}>{p}</button>
                    );
                  })}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className={`px-3 py-1.5 rounded-lg border border-gray-200 text-xs sm:text-sm font-semibold transition ${page === totalPages ? "bg-gray-50 text-gray-300 cursor-not-allowed" : "bg-white hover:bg-gray-50"}`}>Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <CompanyDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        companyId={selectedCompanyId}
      />
    </div>
  );
};

export default TargetListDetailsPage;
