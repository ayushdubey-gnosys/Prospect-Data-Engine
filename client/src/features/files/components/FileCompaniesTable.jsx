import React, { useState } from 'react';
import Table from '../../../components/ui/Table';
import { Circle, FileText, CheckCircle2, XCircle, Clock, Users, Link as LinkIcon } from 'lucide-react';
import { openMailComposer } from '../../../utils/mailUtils';
import { useAuth } from '../../../hooks/useAuth';
import CompanyDetailsModal from '../../companies/components/CompanyDetailsModal';

const getLeadStatusIcon = (status) => {
  switch (status) {
    case 'in_progress':
      return <Clock className="w-4 h-4 text-blue-500" />;
    case 'converted':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    case 'dead':
      return <XCircle className="w-4 h-4 text-red-500" />;
    default:
      return <Circle className="w-4 h-4 text-gray-200" />;
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

const getColumns = (userEmail, onOpenCompany) => [
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
            
            {/* Status Tooltip */}
            <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 w-48 bg-gray-900 text-white text-xs rounded p-2 shadow-lg">
              <p className="font-semibold">{getLeadStatusLabel(status)}</p>
              {status !== 'none' && (
                <p className="text-gray-300 mt-1">Updated by: {updatedBy}</p>
              )}
              <div className="absolute left-4 top-full w-2 h-2 bg-gray-900 transform rotate-45 -mt-1"></div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onOpenCompany(row._id); }}
            className="font-medium text-gray-900 text-left hover:text-indigo-600"
          >
            {row.company_name}
          </button>
        </div>
      );
    }
  },
  {
    header: 'Website',
    accessor: 'website',
    cell: (row) => row.website ? (
      <a
        href={row.website.startsWith('http') ? row.website : `https://${row.website}`}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 hover:underline font-medium"
      >
        Visit
      </a>
    ) : '-'
  },
  {
    header: 'Email',
    accessor: 'email',
    cell: (row) => row.email ? (
      <button type="button" onClick={() => openMailComposer(row.email, row.company_name, userEmail)} className="text-blue-600 hover:underline font-medium select-all text-left cursor-pointer bg-transparent border-none p-0">{row.email}</button>
    ) : '-'
  },
  {
    header: 'Contact No',
    accessor: 'phone',
    cell: (row) => row.phone || '-'
  },
  {
    header: 'Contact Employees',
    accessor: 'contacts',
    cell: (row, rowIndex, totalRows) => {
      const contacts = row.contacts || [];
      if (contacts.length === 0) return <span className="text-gray-400 text-xs">-</span>;
      
      const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;
      const popupPositionClasses = isBottom ? "bottom-full mb-2" : "top-full mt-2";
      const pointerClasses = isBottom 
        ? "bottom-0 w-3 h-3 bg-white border-b border-r border-gray-100 transform -translate-x-1/2 translate-y-1/2 rotate-45"
        : "top-0 w-3 h-3 bg-white border-t border-l border-gray-100 transform -translate-x-1/2 -translate-y-1/2 rotate-45";

      return (
        <div className="relative group inline-block">
          <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition">
            <Users className="w-3.5 h-3.5" /> View {contacts.length} Contacts
          </button>
          <div className={`absolute left-1/2 -translate-x-1/2 ${popupPositionClasses} hidden group-hover:block z-[70] w-[26rem] bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-xl p-4 ring-1 ring-black/5`}>
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Employee Contacts</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
              {contacts.map((contact, i) => (
                <div key={i} className="flex justify-between items-start text-xs p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-100 transition-colors shadow-sm">
                  <div className="flex flex-col gap-1 max-w-[50%]">
                    <span className="font-bold text-gray-900 text-sm truncate" title={contact.name}>{contact.name || "Unknown Name"}</span>
                    <span className="text-gray-500 font-medium truncate" title={contact.position}>{contact.position || "No position"}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-right max-w-[50%]">
                    {contact.email ? <a href={`mailto:${contact.email}`} className="text-blue-600 font-medium hover:underline truncate w-full" title={contact.email}>{contact.email}</a> : <span className="text-gray-400">No Email</span>}
                    {contact.contactNumber ? <span className="text-gray-700 font-medium truncate w-full" title={contact.contactNumber}>{contact.contactNumber}</span> : <span className="text-gray-400">No Phone</span>}
                  </div>
                </div>
              ))}
            </div>
            <div className={`absolute left-1/2 ${pointerClasses}`}></div>
          </div>
        </div>
      );
    }
  },
  {
    header: 'Social Media Links',
    accessor: 'socialMedia',
    cell: (row, rowIndex, totalRows) => {
      const social = row.socialMedia;
      const hasLinks = social && (social.facebook || social.youtube || social.instagram || social.x);
      
      const isBottom = totalRows && totalRows > 5 && (totalRows - rowIndex) <= 5;
      const popupPositionClasses = isBottom ? "bottom-full mb-2" : "top-full mt-2";
      const pointerClasses = isBottom 
        ? "bottom-0 w-3 h-3 bg-white border-b border-r border-gray-100 transform -translate-x-1/2 translate-y-1/2 rotate-45"
        : "top-0 w-3 h-3 bg-white border-t border-l border-gray-100 transform -translate-x-1/2 -translate-y-1/2 rotate-45";
      
      return (
        <div className="relative group inline-block">
          <button className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-800 bg-pink-50 hover:bg-pink-100 px-2 py-1 rounded transition">
            <LinkIcon className="w-3.5 h-3.5" /> Connect on Social
          </button>
          <div className={`absolute left-1/2 -translate-x-1/2 ${popupPositionClasses} hidden group-hover:block z-[70] w-[26rem] bg-white border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] rounded-xl p-4 ring-1 ring-black/5`}>
            <h4 className="text-sm font-bold text-gray-800 mb-3 border-b border-gray-100 pb-2">Social Media Links</h4>
            {!hasLinks ? (
              <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-100">
                <span className="text-sm text-gray-500 font-medium">No links available</span>
              </div>
            ) : (
              <div className="space-y-2">
                {social.facebook && <a href={social.facebook} target="_blank" rel="noreferrer" className="flex flex-col p-2.5 rounded-lg border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all group/link"><span className="font-semibold text-gray-700 group-hover/link:text-blue-700">Facebook</span><span className="text-xs text-blue-500 break-all">{social.facebook}</span></a>}
                {social.youtube && <a href={social.youtube} target="_blank" rel="noreferrer" className="flex flex-col p-2.5 rounded-lg border border-transparent hover:border-red-100 hover:bg-red-50/50 transition-all group/link"><span className="font-semibold text-gray-700 group-hover/link:text-red-700">YouTube</span><span className="text-xs text-red-500 break-all">{social.youtube}</span></a>}
                {social.instagram && <a href={social.instagram} target="_blank" rel="noreferrer" className="flex flex-col p-2.5 rounded-lg border border-transparent hover:border-pink-100 hover:bg-pink-50/50 transition-all group/link"><span className="font-semibold text-gray-700 group-hover/link:text-pink-700">Instagram</span><span className="text-xs text-pink-500 break-all">{social.instagram}</span></a>}
                {social.x && <a href={social.x} target="_blank" rel="noreferrer" className="flex flex-col p-2.5 rounded-lg border border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all group/link"><span className="font-semibold text-gray-700 group-hover/link:text-gray-900">X (Twitter)</span><span className="text-xs text-gray-600 break-all">{social.x}</span></a>}
              </div>
            )}
            <div className={`absolute left-1/2 ${pointerClasses}`}></div>
          </div>
        </div>
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
      if (tags.length === 0) return <span className="text-gray-400 text-xs">No tags</span>;
      return (
        <div className="flex flex-nowrap gap-1.5 py-1 overflow-x-auto custom-scrollbar min-w-[120px] max-w-[200px] pb-1">
          {tags.map((t) => (
            <span key={t._id} className="inline-flex shrink-0 items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {t.name}
            </span>
          ))}
        </div>
      );
    }
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
            <p className="text-xs text-gray-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
              {row.description}
            </p>
          </div>
        </div>
      );
    }
  }
];

const FileCompaniesTable = ({ data, isLoading, emptyMessage }) => {
  const { user } = useAuth();
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCompany = (companyId) => {
    setSelectedCompanyId(companyId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompanyId(null);
  };

  const columns = getColumns(user?.email, handleOpenCompany);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <Table columns={columns} data={data} isLoading={isLoading} emptyMessage={emptyMessage} />
        <CompanyDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          companyId={selectedCompanyId}
          onEditTags={() => {}}
        />
    </div>
  );
};

export default FileCompaniesTable;
