import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { 
  Users as UsersIcon, 
  Search,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  Building
} from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  });

  const activateMutation = useMutation({
    mutationFn: userService.activateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User activated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('User deactivated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const handleActivateUser = (userId) => {
    if (window.confirm('Are you sure you want to activate this user?')) {
      activateMutation.mutate(userId);
    }
  };

  const handleDeactivateUser = (userId) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      deactivateMutation.mutate(userId);
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? (
          <UserCheck className="h-3 w-3 mr-1" />
        ) : (
          <UserX className="h-3 w-3 mr-1" />
        )}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredUsers = users?.data?.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <UsersIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load users</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredUsers.length} users
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or organization..."
                className="form-input pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              className="form-input"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card">
        {filteredUsers.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Contact</th>
                  <th>Organization</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {user.id}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-2" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2" />
                        {user.organization || 'N/A'}
                      </div>
                    </td>
                    <td>{getStatusBadge(user.isActive)}</td>
                    <td>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        {user.isActive ? (
                          <button
                            onClick={() => handleDeactivateUser(user.id)}
                            disabled={deactivateMutation.isLoading}
                            className="btn-sm bg-red-600 hover:bg-red-700 text-white"
                            title="Deactivate User"
                          >
                            <UserX className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleActivateUser(user.id)}
                            disabled={activateMutation.isLoading}
                            className="btn-sm bg-green-600 hover:bg-green-700 text-white"
                            title="Activate User"
                          >
                            <UserCheck className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-600 mb-2">
            {users?.data?.length || 0}
          </div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {users?.data?.filter(u => u.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-red-600 mb-2">
            {users?.data?.filter(u => !u.isActive).length || 0}
          </div>
          <div className="text-sm text-gray-600">Inactive Users</div>
        </div>
      </div>
    </div>
  );
};

export default Users;