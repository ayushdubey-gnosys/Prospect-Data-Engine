import React, { useState, useEffect } from "react";
import { 
  Building2, Mail, Phone, Globe, Calendar, Tag as TagIcon, 
  Copy, Check, ExternalLink, Edit2, Clock, CheckCircle2, 
  XCircle, Circle, Save, FileText, Plus, Trash2, X
} from "lucide-react";
import { useCompany } from "../hooks/useCompany";
import { useAuth } from "../../../hooks/useAuth";
import Modal from "../../../components/ui/Modal";
import Button from "../../../components/ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import { openMailComposer } from "../../../utils/mailUtils";

const CompanyDetailsModal = ({ isOpen, onClose, companyId, onEditTags }) => {
  const { data: company, isLoading, isError } = useCompany(companyId);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState(null);
  
  const role = user?.role || "sales";
  const canEditTags = role === "admin" || role === "sales";
  const canUpdateDetails = role === "admin" || role === "sales";

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (company) {
      setFormData({
        company_name: company.company_name || "",
        website: company.website || "",
        email: company.email || "",
        phone: company.phone || "",
        city: company.city || "",
        country: company.country || "",
        industry: company.industry || "",
        description: company.description || "",
        socialMedia: {
          facebook: company.socialMedia?.facebook || "",
          youtube: company.socialMedia?.youtube || "",
          instagram: company.socialMedia?.instagram || "",
          x: company.socialMedia?.x || "",
          linkedin: company.socialMedia?.linkedin || "",
        },
        contacts: company.contacts ? JSON.parse(JSON.stringify(company.contacts)) : []
      });
    }
  }, [company, isEditing]);

  const updateCompanyMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/company/${companyId}`, data);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries(["company", companyId]);
      queryClient.invalidateQueries(["companies"]);
      const fileId = updated?.fileId || company?.fileId;
      if (fileId) {
        queryClient.invalidateQueries({ queryKey: ["file", fileId, "companies"] });
        queryClient.invalidateQueries({ queryKey: ["fileTags", fileId] });
      }
      toast.success("Company updated successfully");
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update company");
    }
  });

  const handleUpdateLeadStatus = (status) => {
    updateCompanyMutation.mutate({ leadStatus: { status } });
  };

  const handleSave = () => {
    updateCompanyMutation.mutate(formData);
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddContact = () => {
    if (formData.contacts.length >= 5) {
      toast.warning("Maximum 5 contacts allowed");
      return;
    }
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", position: "", email: "", contactNumber: "" }]
    }));
  };

  const handleRemoveContact = (index) => {
    setFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts.splice(index, 1);
      return { ...prev, contacts: newContacts };
    });
  };

  const handleContactChange = (index, field, value) => {
    setFormData(prev => {
      const newContacts = [...prev.contacts];
      newContacts[index][field] = value;
      return { ...prev, contacts: newContacts };
    });
  };

  const handleSocialChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Company Details" className="max-w-5xl">
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
              <div className="flex items-start gap-4 flex-1">
                <div className="bg-white/10 p-3 rounded-xl backdrop-blur-md border border-white/10 shrink-0">
                  <Building2 className="w-8 h-8 text-indigo-300" />
                </div>
                <div className="flex-1 max-w-lg">
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={formData.company_name} 
                      onChange={e => setFormData({...formData, company_name: e.target.value})}
                      className="text-xl font-bold bg-white/20 border border-white/30 rounded px-2 py-1 w-full text-white outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold tracking-tight">{company.company_name}</h2>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={formData.industry} 
                        onChange={e => setFormData({...formData, industry: e.target.value})}
                        placeholder="Industry"
                        className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/30 outline-none w-32"
                      />
                    ) : (
                      company.industry ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white border border-white/10 capitalize">
                          {company.industry}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/60">
                          Unknown Industry
                        </span>
                      )
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-500/20 capitalize">
                      Source: {company.source?.replace("_", " ") || "manual"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {canUpdateDetails && (
                  <Button
                    onClick={() => setIsEditing(!isEditing)}
                    variant={isEditing ? "default" : "ghost"}
                    className={!isEditing ? "bg-white/10 hover:bg-white/20 border border-white/10 text-white hover:text-white" : "bg-white text-indigo-900 hover:bg-gray-100"}
                  >
                    {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                    {isEditing ? "Cancel Edit" : "Edit Details"}
                  </Button>
                )}
                {canEditTags && !isEditing && (
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Meta & Lead Status */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Identifiers & Meta</h3>
              
              <div className="flex items-center gap-3 py-1 border-b border-gray-50 pb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="block text-xs text-gray-400">Imported / Created On</span>
                  <span className="font-medium text-gray-700 text-sm">
                    {company.createdAt ? new Date(company.createdAt).toLocaleString() : "-"}
                  </span>
                </div>
              </div>

              <div>
                <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Lead Status</span>
                {canUpdateDetails && !isEditing ? (
                  <select
                    className="w-full sm:w-auto bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2 outline-none font-medium"
                    value={company.leadStatus?.status || "none"}
                    onChange={(e) => handleUpdateLeadStatus(e.target.value)}
                    disabled={updateCompanyMutation.isLoading}
                  >
                    <option value="none">⚪ None</option>
                    <option value="in_progress">🔵 In Progress</option>
                    <option value="converted">🟢 Converted</option>
                    <option value="dead">🔴 Dead</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-2">
                    {company.leadStatus?.status === "in_progress" && <span className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full"><Clock className="w-4 h-4" /> In Progress</span>}
                    {company.leadStatus?.status === "converted" && <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full"><CheckCircle2 className="w-4 h-4" /> Converted</span>}
                    {company.leadStatus?.status === "dead" && <span className="flex items-center gap-1.5 text-sm font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full"><XCircle className="w-4 h-4" /> Dead</span>}
                    {(!company.leadStatus?.status || company.leadStatus?.status === "none") && <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full"><Circle className="w-4 h-4" /> None</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Description Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col h-full">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Company Description</h3>
              <div className="flex-1 flex flex-col gap-3">
                {isEditing ? (
                  <textarea
                    className="w-full flex-1 min-h-[100px] border border-gray-300 rounded-lg p-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Company description..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                ) : (
                  <textarea
                    className="w-full flex-1 min-h-[100px] border border-gray-200 rounded-lg p-3 text-sm text-gray-700 focus:outline-none resize-none bg-gray-50/50"
                    placeholder="Add manual description or notes about this company..."
                    value={company.description || ""}
                    disabled
                  />
                )}
              </div>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Channels</h3>
              {!isEditing && (
                <Button onClick={() => openMailComposer(company.email, company.company_name, user?.email)} variant="outline" size="sm">
                  <Mail className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> Send Email
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Email */}
              <div className="flex flex-col p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <span className="block text-xs text-gray-400 mb-1">Email Address</span>
                {isEditing ? (
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-blue-600 text-sm truncate">{company.email || "None"}</span>
                    {company.email && (
                      <button onClick={() => handleCopy(company.email, "email")} className="p-1 text-gray-400 hover:text-blue-500"><Copy className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                )}
              </div>

              {/* Phone */}
              <div className="flex flex-col p-3 rounded-lg border border-gray-50 bg-gray-50/30">
                <span className="block text-xs text-gray-400 mb-1">Phone Connection</span>
                {isEditing ? (
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700 text-sm truncate">{company.phone || "None"}</span>
                    {company.phone && (
                      <button onClick={() => handleCopy(company.phone, "phone")} className="p-1 text-gray-400 hover:text-blue-500"><Copy className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="flex flex-col p-3 rounded-lg border border-indigo-50 bg-indigo-50/20 sm:col-span-2">
                <span className="block text-xs text-indigo-500/70 mb-1">Official Website</span>
                {isEditing ? (
                  <input type="text" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <div className="flex justify-between items-center">
                    {company.website ? (
                      <a href={company.website.startsWith("http") ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer" className="font-semibold text-indigo-700 hover:underline text-sm truncate">
                        {company.website}
                      </a>
                    ) : (
                      <span className="text-sm text-gray-400 font-medium">None</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location Cards */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">City</span>
                {isEditing ? (
                  <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700 capitalize">{company.city || "-"}</span>
                )}
              </div>
              <div className="p-3 bg-gray-50/40 rounded-lg border border-gray-50">
                <span className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Country</span>
                {isEditing ? (
                  <input type="text" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="border rounded p-1.5 text-sm w-full outline-none focus:border-indigo-500" />
                ) : (
                  <span className="text-sm font-semibold text-gray-700 capitalize">{company.country || "-"}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Employee Contacts Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Employee Contacts</h3>
              {isEditing && formData.contacts.length < 5 && (
                <Button type="button" onClick={handleAddContact} size="sm" variant="secondary"><Plus className="w-3.5 h-3.5 mr-1"/> Add Contact</Button>
              )}
            </div>
            
            {isEditing ? (
              <div className="space-y-3">
                {formData.contacts.map((contact, i) => (
                  <div key={i} className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border relative">
                    <input type="text" placeholder="Name" value={contact.name} onChange={e => handleContactChange(i, 'name', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Position" value={contact.position} onChange={e => handleContactChange(i, 'position', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="email" placeholder="Email" value={contact.email} onChange={e => handleContactChange(i, 'email', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <input type="text" placeholder="Phone" value={contact.contactNumber} onChange={e => handleContactChange(i, 'contactNumber', e.target.value)} className="border rounded p-1.5 text-sm flex-1 min-w-[120px] outline-none focus:border-indigo-500" />
                    <button type="button" onClick={() => handleRemoveContact(i)} className="text-red-500 hover:text-red-700 p-1.5"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
                {formData.contacts.length === 0 && <p className="text-xs text-gray-400">No contacts added.</p>}
              </div>
            ) : (
              <div className="space-y-2">
                {company.contacts && company.contacts.length > 0 ? company.contacts.map((contact, i) => (
                  <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div>
                      <p className="font-semibold text-sm text-gray-800">{contact.name || "Unknown"}</p>
                      <p className="text-xs text-gray-500">{contact.position || "No position"}</p>
                    </div>
                    <div className="text-right mt-2 sm:mt-0">
                      <p className="text-xs text-blue-600">{contact.email}</p>
                      <p className="text-xs text-gray-600">{contact.contactNumber}</p>
                    </div>
                  </div>
                )) : <p className="text-xs text-gray-400">No contacts available.</p>}
              </div>
            )}
          </div>
          
          {/* Social Media Links Section */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Social Media</h3>
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Facebook URL" value={formData.socialMedia.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} className="border rounded p-2 text-sm w-full outline-none focus:border-indigo-500" />
                <input type="text" placeholder="YouTube URL" value={formData.socialMedia.youtube} onChange={e => handleSocialChange('youtube', e.target.value)} className="border rounded p-2 text-sm w-full outline-none focus:border-indigo-500" />
                <input type="text" placeholder="Instagram URL" value={formData.socialMedia.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} className="border rounded p-2 text-sm w-full outline-none focus:border-indigo-500" />
                <input type="text" placeholder="X (Twitter) URL" value={formData.socialMedia.x} onChange={e => handleSocialChange('x', e.target.value)} className="border rounded p-2 text-sm w-full outline-none focus:border-indigo-500" />
                <input type="text" placeholder="LinkedIn URL" value={formData.socialMedia.linkedin || ''} onChange={e => handleSocialChange('linkedin', e.target.value)} className="border rounded p-2 text-sm w-full outline-none focus:border-indigo-500" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {company.socialMedia?.facebook && <a href={company.socialMedia.facebook} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-600 hover:underline">Facebook</a>}
                {company.socialMedia?.youtube && <a href={company.socialMedia.youtube} target="_blank" rel="noreferrer" className="text-sm font-semibold text-red-600 hover:underline">YouTube</a>}
                {company.socialMedia?.instagram && <a href={company.socialMedia.instagram} target="_blank" rel="noreferrer" className="text-sm font-semibold text-pink-600 hover:underline">Instagram</a>}
                {company.socialMedia?.x && <a href={company.socialMedia.x} target="_blank" rel="noreferrer" className="text-sm font-semibold text-gray-800 hover:underline">X (Twitter)</a>}
                {company.socialMedia?.linkedin && <a href={company.socialMedia.linkedin} target="_blank" rel="noreferrer" className="text-sm font-semibold text-blue-700 hover:underline">LinkedIn</a>}
                {(!company.socialMedia || (!company.socialMedia.facebook && !company.socialMedia.youtube && !company.socialMedia.instagram && !company.socialMedia.x && !company.socialMedia.linkedin)) && (
                  <p className="text-xs text-gray-400">No social media links available.</p>
                )}
              </div>
            )}
          </div>

          {/* Tags Section */}
          {!isEditing && (
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
          )}

          {/* Close / Save Action */}
          <div className="flex justify-end gap-3 pt-3 border-t shrink-0">
            {isEditing ? (
              <>
                <Button onClick={() => setIsEditing(false)} variant="secondary">Cancel</Button>
                <Button onClick={handleSave} disabled={updateCompanyMutation.isLoading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {updateCompanyMutation.isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={onClose} variant="secondary">Close Detail</Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CompanyDetailsModal;
