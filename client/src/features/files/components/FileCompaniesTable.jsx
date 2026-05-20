import React from 'react';
import Table from '../../../components/ui/Table';

const columns = [
  { header: 'Company Name', accessor: 'company_name' },
  { header: 'Owner', accessor: 'companyOwnerName' },
  { header: 'Industry', accessor: 'industry' },
  { header: 'City', accessor: 'city' },
  { header: 'Country', accessor: 'country' },
  { header: 'Email', accessor: 'email' },
  { header: 'Phone', accessor: 'phone' },
  { header: 'Website', accessor: 'website', cell: (row) => row.website ? (<a href={row.website} target="_blank" rel="noreferrer" className="text-blue-600">{row.website}</a>) : '-' },
  { header: 'Social Media', accessor: 'socialMedia', cell: (row) => row.socialMedia ? (<a href={row.socialMedia} target="_blank" rel="noreferrer" className="text-blue-600">{row.socialMedia}</a>) : '-' },
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
  { header: 'Turnover', accessor: 'turnover' },
];

const FileCompaniesTable = ({ data, isLoading, emptyMessage }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table columns={columns} data={data} isLoading={isLoading} emptyMessage={emptyMessage} />
    </div>
  );
};

export default FileCompaniesTable;
