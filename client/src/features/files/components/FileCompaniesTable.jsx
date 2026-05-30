import React from 'react';
import Table from '../../../components/ui/Table';
import { Circle, FileText, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { openMailComposer } from '../../../utils/mailUtils';
import { useAuth } from '../../../hooks/useAuth';

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

const getColumns = (userEmail) => [
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
          <span className="font-medium text-gray-900">{row.company_name}</span>
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
  const columns = getColumns(user?.email);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table columns={columns} data={data} isLoading={isLoading} emptyMessage={emptyMessage} />
    </div>
  );
};

export default FileCompaniesTable;
