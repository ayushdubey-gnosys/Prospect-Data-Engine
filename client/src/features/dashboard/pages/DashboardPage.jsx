import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Building2, Tags, Users, Activity, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../../files/hooks/useFiles';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
    <div className={`p-4 rounded-full ${colorClass}`}>
      <Icon className="w-8 h-8" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const DashboardPage = () => {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'admin';
  const navigate = useNavigate();

  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.get('/company/stats').then((res) => res.data),
  });

  const { data: filesData, isLoading: filesLoading } = useFiles();
  const files = filesData || [];

  // Fetch users if admin
  const { data: users = [], refetch: refetchUsers } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users').then((res) => res.data.data || []),
    enabled: isAdmin,
  });

  // Mutate user role
  const handleUpdateRole = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully');
      refetchUsers();
      refetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user role');
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (userId === authUser?._id) {
      toast.error('You cannot delete your own admin account');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deleted successfully');
      refetchUsers();
      refetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your prospect data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Companies"
          value={statsLoading ? '...' : (stats?.totalCompanies ?? 0)}
          icon={Building2}
          colorClass="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Active Tags"
          value={statsLoading ? '...' : (stats?.activeTags ?? 0)}
          icon={Tags}
          colorClass="bg-green-100 text-green-600"
        />
        <StatCard
          title="Total Users"
          value={statsLoading ? '...' : (stats?.totalUsers ?? 0)}
          icon={Users}
          colorClass="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Total Uploaded Files"
          value={statsLoading ? '...' : (stats?.totalImports ?? 0)}
          icon={Activity}
          colorClass="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Uploaded Files section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Uploaded Files</h2>
          <div className="text-sm text-gray-500">{files.length} files</div>
        </div>

        {filesLoading ? (
          <div className="text-sm text-gray-500">Loading files...</div>
        ) : files.length === 0 ? (
          <div className="text-sm text-gray-500">No files uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((f) => (
              <div key={f._id} className="p-4 bg-white border rounded-lg shadow-sm flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">{f.sourceType || 'file'}</div>
                  <div className="font-medium text-gray-900">{f.originalName || f.fileName}</div>
                  <div className="text-sm text-gray-500">{new Date(f.uploadedAt || f.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-sm text-gray-700">{f.totalRecords ?? '—'} rows</div>
                  <button onClick={() => navigate(`/files/${f._id}`)} className="px-3 py-1 bg-blue-600 text-white rounded">Open</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Management Section - Admin Only */}
      {isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-950">User Management</h2>
              <p className="text-sm text-gray-500">Manage system users, change their roles, or remove accounts.</p>
            </div>
            <div className="text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              Total Users: {users.length}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-250">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50/75">
                <tr>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th scope="col" className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500 text-sm">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        {u.name || 'Unnamed'}
                        {u._id === authUser?._id && (
                          <span className="ml-1.5 px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-600 rounded-full border">
                            You
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          className="rounded-lg border-gray-300 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:bg-white focus:ring-indigo-500"
                        >
                          <option value="admin">Admin</option>
                          <option value="sales">Sales</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === authUser?._id}
                          className="text-red-650 hover:text-red-900 hover:bg-red-50 p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                          title={u._id === authUser?._id ? "You cannot delete yourself" : "Delete User"}
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
