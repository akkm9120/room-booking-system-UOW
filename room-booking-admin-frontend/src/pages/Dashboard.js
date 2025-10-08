import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { userService } from '../services/userService';
import { roomService } from '../services/roomService';
import { 
  Calendar, 
  Users, 
  Building, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalRooms: 0,
    totalUsers: 0,
    recentBookings: []
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingService.getAllBookings,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomService.getAllRooms,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: userService.getAllUsers,
  });

  useEffect(() => {
    if (bookings?.data && rooms?.data && users?.data) {
      const bookingData = bookings.data;
      const pendingCount = bookingData.filter(b => b.status === 'pending').length;
      const confirmedCount = bookingData.filter(b => b.status === 'confirmed').length;
      const recentBookings = bookingData
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      setStats({
        totalBookings: bookingData.length,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        totalRooms: rooms.data.length,
        totalUsers: users.data.length,
        recentBookings
      });
    }
  }, [bookings, rooms, users]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (bookingsLoading || roomsLoading || usersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Calendar}
          color="bg-blue-500"
          trend="+12% from last month"
        />
        <StatCard
          title="Pending Approvals"
          value={stats.pendingBookings}
          icon={AlertCircle}
          color="bg-yellow-500"
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms}
          icon={Building}
          color="bg-green-500"
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          color="bg-purple-500"
          trend="+5% from last month"
        />
      </div>

      {/* Recent Bookings */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Recent Bookings</h2>
          <a href="/bookings" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all →
          </a>
        </div>
        
        {stats.recentBookings.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Room</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.Visitor?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.Visitor?.email || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900">
                        {booking.Room?.name || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(booking.startTime)}
                        </div>
                        <div className="text-sm text-gray-500">
                          to {formatDate(booking.endTime)}
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td className="text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No recent bookings found</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <Calendar className="h-8 w-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Bookings</h3>
          <p className="text-gray-600 mb-4">Review and approve pending booking requests</p>
          <a href="/bookings" className="btn-primary">
            View Bookings
          </a>
        </div>
        
        <div className="card text-center">
          <Building className="h-8 w-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Room Management</h3>
          <p className="text-gray-600 mb-4">Add, edit, or manage room availability</p>
          <a href="/rooms" className="btn-primary">
            Manage Rooms
          </a>
        </div>
        
        <div className="card text-center">
          <Users className="h-8 w-8 text-primary-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-600 mb-4">View and manage registered users</p>
          <a href="/users" className="btn-primary">
            Manage Users
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;