import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, Clock, Calendar, MessageSquare, Plus, PhoneCall, Mail, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../../api/axios';
import { toast } from 'react-toastify';
import Button from '../../../components/ui/Button';

const CompanyTimelineDrawer = ({ isOpen, onClose, companyId, targetListId }) => {
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [activityType, setActivityType] = useState("Note");
  const [showStatusUpdate, setShowStatusUpdate] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [remarks, setRemarks] = useState("");
  const [lossReason, setLossReason] = useState("");
  const [holdReason, setHoldReason] = useState("");

  const { data: company } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      const res = await api.get(`/company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId && isOpen,
  });

  const { data: activities, isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities', companyId],
    queryFn: async () => {
      const res = await api.get(`/activities/company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId && isOpen,
  });

  const { data: followUps } = useQuery({
    queryKey: ['follow-ups', companyId],
    queryFn: async () => {
      const res = await api.get(`/follow-ups/company/${companyId}`);
      return res.data;
    },
    enabled: !!companyId && isOpen,
  });

  const addActivityMutation = useMutation({
    mutationFn: (data) => api.post('/activities', data),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries(['activities', companyId]);
      toast.success("Activity logged");
    },
    onError: () => toast.error("Failed to log activity")
  });

  const updateStatusMutation = useMutation({
    mutationFn: (data) => api.put(`/company/${companyId}/status`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['company', companyId]);
      queryClient.invalidateQueries(['activities', companyId]);
      queryClient.invalidateQueries(['target-list', targetListId]);
      queryClient.invalidateQueries(['target-list-stats', targetListId]);
      setShowStatusUpdate(false);
      setNewStatus("");
      toast.success("Status updated successfully");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update status")
  });

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addActivityMutation.mutate({
      companyId,
      targetListId,
      type: activityType,
      notes: newComment,
    });
  };

  const handleUpdateStatus = () => {
    if (!newStatus) return;
    updateStatusMutation.mutate({
      status: newStatus,
      targetListId,
      dealValue: dealValue ? Number(dealValue) : undefined,
      closingDate: closingDate || undefined,
      remarks,
      lossReason,
      holdReason
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'Call': return <PhoneCall className="w-4 h-4 text-blue-500" />;
      case 'Email': return <Mail className="w-4 h-4 text-indigo-500" />;
      case 'Meeting': return <Users className="w-4 h-4 text-purple-500" />;
      case 'Status Change': return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Assignment': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-gray-50 shadow-2xl flex flex-col pointer-events-auto transform transition-transform duration-300">
        
        {/* Header */}
        <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{company?.company_name || "Company Details"}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${company?.leadStatus?.status === 'New' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {company?.leadStatus?.status || "New"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <h3 className="font-semibold text-gray-800 border-b border-gray-200 pb-2">Activity Timeline</h3>
          
          {activitiesLoading ? (
            <div className="text-center text-sm text-gray-500 py-10">Loading timeline...</div>
          ) : activities?.length === 0 ? (
            <div className="text-center text-sm text-gray-500 py-10">No activity logged yet.</div>
          ) : (
            <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
              {activities?.map((activity, idx) => (
                <div key={activity._id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-gray-900 text-sm">{activity.type}</div>
                      <time className="text-xs font-medium text-indigo-500">
                        {new Date(activity.date).toLocaleDateString()} {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </time>
                    </div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{activity.notes}</div>
                    <div className="text-[10px] text-gray-400 mt-2 font-medium">By {activity.createdBy?.name || "Unknown"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-white border-t border-gray-200 p-4">
          
          <div className="flex gap-2 mb-3">
            <button 
              onClick={() => setShowStatusUpdate(false)} 
              className={`flex-1 text-sm font-semibold py-1.5 rounded-lg border transition ${!showStatusUpdate ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              Log Activity
            </button>
            <button 
              onClick={() => setShowStatusUpdate(true)} 
              className={`flex-1 text-sm font-semibold py-1.5 rounded-lg border transition ${showStatusUpdate ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            >
              Update Status
            </button>
          </div>

          {!showStatusUpdate ? (
            <>
              <div className="mb-3 flex items-center gap-2">
                <select 
                  value={activityType} 
                  onChange={(e) => setActivityType(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Note">Note</option>
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                </select>
              </div>
              <div className="flex gap-2">
                <textarea
                  className="flex-1 border border-gray-300 rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
                  rows={2}
                  placeholder={`Log a ${activityType.toLowerCase()}...`}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <Button onClick={handleAddComment} disabled={addActivityMutation.isLoading || !newComment.trim()} className="shrink-0 h-auto">
                  Save
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <select 
                value={newStatus} 
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded px-2 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Select New Status...</option>
                <option value="Assigned">Assigned</option>
                <option value="Contacted">Contacted</option>
                <option value="Meeting Scheduled">Meeting Scheduled</option>
                <option value="Proposal Sent">Proposal Sent</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Won">Won</option>
                <option value="Lost">Lost</option>
                <option value="On Hold">On Hold</option>
              </select>

              {newStatus === "Won" && (
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" placeholder="Deal Value" value={dealValue} onChange={(e) => setDealValue(e.target.value)} className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
                  <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
                  <input type="text" placeholder="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} className="col-span-2 w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
                </div>
              )}

              {newStatus === "Lost" && (
                <input type="text" placeholder="Reason for Loss (Mandatory)" value={lossReason} onChange={(e) => setLossReason(e.target.value)} className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
              )}

              {newStatus === "On Hold" && (
                <input type="text" placeholder="Hold Reason (Mandatory)" value={holdReason} onChange={(e) => setHoldReason(e.target.value)} className="w-full text-sm border border-gray-300 rounded px-2 py-1.5" />
              )}

              <div className="flex justify-end">
                <Button onClick={handleUpdateStatus} disabled={!newStatus || updateStatusMutation.isLoading}>Update</Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default CompanyTimelineDrawer;
