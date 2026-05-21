import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../api/axios';
import { Users, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { toast } from 'react-toastify';

const UsersPage = () => {
  const { user: authUser } = useAuth();
  const isAdmin = authUser?.role === 'admin';

  // Fetch users list
  const { data: users = [], isLoading, refetch: refetchUsers } = useQuery({
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
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 bg-red-50 rounded-full text-red-650 mb-4 animate-bounce">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
        <p className="text-gray-500 mt-2 max-w-md">You do not have the necessary permissions to access system user management. Only administrators can view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <Users className="w-7 h-7 text-indigo-600" />
            User Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage system user privileges, roles, and platform access.</p>
        </div>
        <div className="text-sm text-gray-600 font-semibold bg-indigo-50/50 text-indigo-700 px-4 py-2 rounded-xl border border-indigo-100/50 shrink-0">
          Total Registered Users: {isLoading ? '...' : users.length}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-650 mx-auto mb-4"></div>
            Loading platform users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left">
              <thead className="bg-gray-50/75">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email Address</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Access Role</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined Date</th>
                  <th scope="col" className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 text-sm">
                      No system users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-950 flex items-center gap-1.5">
                            {u.name || 'Unnamed'}
                            {u._id === authUser?._id && (
                              <span className="px-2 py-0.5 text-[9px] font-bold bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                                You
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <select
                          value={u.role}
                          onChange={(e) => handleUpdateRole(u._id, e.target.value)}
                          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 shadow-sm"
                        >
                          <option value="admin">Admin</option>
                          <option value="sales">Sales</option>
                          <option value="marketing">Marketing</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u._id === authUser?._id}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors border border-transparent hover:border-red-100"
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
        )}
      </div>
    </div>
  );
};

export default UsersPage;
