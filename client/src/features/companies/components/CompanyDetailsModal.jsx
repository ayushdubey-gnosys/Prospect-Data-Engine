import React from "react";
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  FileText, 
  DollarSign, 
  Calendar, 
  Tag as TagIcon, 
  Copy, 
  Check, 
  ExternalLink,
  Edit2
} from "lucide-react";
import { useCompany } from "../hooks/useCompany";
import { useAuth } from "../../../hooks/useAuth";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";

const CompanyDetailsModal = ({ isOpen, onClose, companyId, onEditTags }) => {
  const { data: company, isLoading, isError } = useCompany(companyId);
  const { user } = useAuth();
  const [copiedField, setCopiedField] = React.useState(null);

  const role = user?.role || "sales";
  const canEditTags = role === "admin" || role === "sales";

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Company Details"
      className="max-w-5xl"
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">Loading company details...</p>
        </div>
      ) : isError || !company ? (
        <div className="py-8 text-center text-red-500">
          <p className="font-semibold">Error</p>
          <p className="text-sm">Failed to retrieve company details. Please try again.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card */}
          <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-slate-800 to-indigo-950 p-6 rounded-2xl text-white shadow-md">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Building2 className="w-32 h-32 transform translate-x-4 translate-y-2" />
            </div>

            <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
                  <Building2 className="w-8 h-8 text-indigo-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{company.company_name}</h2>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {company.industry ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/10 capitalize">
                        {company.industry}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60">
                        Unknown Industry
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 capitalize">
                      Source: {company.source?.replace("_", " ") || "manual"}
                    </span>
                  </div>
                </div>
              </div>

              {canEditTags && (
                <Button
                  onClick={() => onEditTags(company)}
                  variant="ghost"
                  className="bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-white shrink-0"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Tags
                </Button>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Primary Identifiers */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identifiers & Meta</h3>
              
              {/* Company Owner */}
              <div className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                <div>
                  <span className="block text-xs text-gray-400 font-medium">Company Owner</span>
                  <span className="font-semibold text-gray-700 text-sm">
                    {company.companyOwnerName || "Not Available"}
                  </span>
                </div>
              </div>

              {/* Created At */}
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400">Imported / Created On</span>
                  <span className="font-medium text-gray-700 text-sm">
                    {company.createdAt ? new Date(company.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial Card */}
            <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100/60 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-emerald-700/70 uppercase tracking-wider">Financial Standing</h3>
                <span className="block text-xs text-emerald-600/75 mt-2">Annual Turnover</span>
              </div>
              <div className="flex items-baseline gap-2 py-4">
                <DollarSign className="w-6 h-6 text-emerald-600" />
                <span className="text-3xl font-extrabold text-emerald-700">
                  {company.turnover 
                    ? `₹${Number(company.turnover).toLocaleString("en-IN")}`
                    : "Not Disclosed"
                  }
                </span>
              </div>
              <div className="text-xs text-emerald-600/80 bg-emerald-100/50 px-2 py-1 rounded inline-flex items-center gap-1.5 self-start">
                <FileText className="w-3.5 h-3.5" />
                <span>Financial metrics based on imported source data</span>
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Channels</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3 min-w-0">
                  <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400">Email Address</span>
                    {company.email ? (
                      <a 
                        href={`mailto:${company.email}`}
                        className="font-semibold text-blue-600 hover:underline text-sm block truncate"
                      >
                        {company.email}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">None</span>
                    )}
                  </div>
                </div>
                {company.email && (
                  <button
                    onClick={() => handleCopy(company.email, "email")}
                    className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-500 transition"
                  >
                    {copiedField === "email" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Phone */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <div className="flex items-center gap-3 min-w-0">
                  <Phone className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0">
                    <span className="block text-xs text-gray-400">Phone Connection</span>
                    {company.phone ? (
                      <a 
                        href={`tel:${company.phone}`}
                        className="font-semibold text-gray-700 hover:text-blue-600 hover:underline text-sm block truncate"
                      >
                        {company.phone}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">None</span>
                    )}
                  </div>
                </div>
                {company.phone && (
                  <button
                    onClick={() => handleCopy(company.phone, "phone")}
                    className="p-1 hover:bg-white rounded text-gray-400 hover:text-blue-500 transition"
                  >
                    {copiedField === "phone" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Website & Social Media */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Website */}
              {company.website ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-50 bg-indigo-50/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs text-indigo-500/70">Official Website</span>
                      <a 
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="font-semibold text-indigo-700 hover:underline text-sm flex items-center gap-1.5 block truncate"
                      >
                        <span>{company.website}</span>
                        <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(company.website, "website")}
                    className="p-1 hover:bg-white rounded text-indigo-400 hover:text-indigo-600 transition"
                  >
                    {copiedField === "website" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/10">
                  <Globe className="w-4 h-4 text-gray-300" />
                  <div>
                    <span className="block text-xs text-gray-400">Official Website</span>
                    <span className="text-sm text-gray-400 font-medium">None</span>
                  </div>
                </div>
              )}

              {/* Social Media */}
              {company.socialMedia ? (
                <div className="flex items-center justify-between p-3 rounded-lg border border-indigo-50 bg-indigo-50/20">
                  <div className="flex items-center gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="block text-xs text-indigo-500/70">Social Media</span>
                      <a 
                        href={company.socialMedia.startsWith("http") ? company.socialMedia : `https://${company.socialMedia}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="font-semibold text-indigo-700 hover:underline text-sm flex items-center gap-1.5 block truncate"
                      >
                        <span>{company.socialMedia}</span>
                        <ExternalLink className="w-3.5 h-3.5 inline shrink-0" />
                      </a>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(company.socialMedia, "socialMedia")}
                    className="p-1 hover:bg-white rounded text-indigo-400 hover:text-indigo-600 transition"
                  >
                    {copiedField === "socialMedia" ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/10">
                  <Globe className="w-4 h-4 text-gray-300" />
                  <div>
                    <span className="block text-xs text-gray-400">Social Media</span>
                    <span className="text-sm text-gray-400 font-medium">None</span>
                  </div>
                </div>
              )}
            </div>

            {/* Location Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">City</span>
                <span className="text-sm font-semibold text-gray-700 capitalize">{company.city || "-"}</span>
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider">Country</span>
                <span className="text-sm font-semibold text-gray-700 capitalize">{company.country || "-"}</span>
              </div>
            </div>
          </div>

          {/* Employee Contacts Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Contacts</h3>
            
            {company.contacts && company.contacts.length > 0 ? (
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50/70">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Position</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Number</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {company.contacts.map((contact, index) => (
                      <tr key={index} className="hover:bg-gray-50/50 transition">
                        <td className="px-4 py-2.5 font-semibold text-gray-800">{contact.name || "-"}</td>
                        <td className="px-4 py-2.5 text-gray-600">{contact.position || "-"}</td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {contact.contactNumber ? (
                            <a href={`tel:${contact.contactNumber}`} className="text-blue-600 hover:underline hover:text-blue-800 transition font-medium">
                              {contact.contactNumber}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-700">
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline hover:text-blue-800 transition font-medium">
                              {contact.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl">
                <p className="text-xs text-gray-400">No employee contacts listed for this company.</p>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Tags</h3>
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs font-bold border border-indigo-100">
                {company.tags?.length || 0} {company.tags?.length === 1 ? "Tag" : "Tags"}
              </span>
            </div>

            {company.tags && company.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50/40 border border-gray-50 rounded-xl">
                {company.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-200 text-gray-800 rounded-full text-xs font-semibold shadow-sm"
                    style={{
                      borderLeft: `3px solid ${tag.color || "#6366f1"}`
                    }}
                  >
                    <TagIcon className="w-3 h-3 text-indigo-500 shrink-0" />
                    <span>{tag.name}</span>
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-center p-6 border border-dashed border-gray-200 rounded-xl space-y-3">
                <TagIcon className="w-8 h-8 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-400">No tags have been assigned to this company yet.</p>
                {canEditTags && (
                  <Button 
                    onClick={() => onEditTags(company)}
                    variant="outline" 
                    size="sm"
                  >
                    + Add First Tag
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Close Action */}
          <div className="flex justify-end pt-3 border-t shrink-0">
            <Button onClick={onClose} variant="secondary">
              Close Detail
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CompanyDetailsModal;
