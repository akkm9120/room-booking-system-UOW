import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '../services/bookingService';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Search,
  Filter,
  Eye,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

const Bookings = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery({
    queryKey: ['bookings'],
    queryFn: bookingService.getAllBookings,
  });

  const approveMutation = useMutation({
    mutationFn: bookingService.approveBooking,
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking approved successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve booking');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => bookingService.rejectBooking(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries(['bookings']);
      toast.success('Booking rejected successfully');
      setRejectReason('');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject booking');
    },
  });

  const handleApprove = (bookingId) => {
    if (window.confirm('Are you sure you want to approve this booking?')) {
      approveMutation.mutate(bookingId);
    }
  };

  const handleReject = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    rejectMutation.mutate({ id: selectedBooking.id, reason: rejectReason });
    setShowModal(false);
    setSelectedBooking(null);
  };

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

  const filteredBookings = bookings?.data?.filter(booking => {
    const matchesSearch = 
      booking.Visitor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Visitor?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.Room?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
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
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Failed to load bookings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <div className="text-sm text-gray-500">
          Total: {filteredBookings.length} bookings
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
                placeholder="Search by visitor name, email, or room..."
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
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="card">
        {filteredBookings.length > 0 ? (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>Room</th>
                  <th>Date & Time</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div>
                        <div className="font-medium text-gray-900">
                          {booking.Visitor?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.Visitor?.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.Visitor?.phone || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-gray-900">
                        {booking.Room?.name || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Capacity: {booking.Room?.capacity || 'N/A'}
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
                    <td>
                      <div className="max-w-xs truncate" title={booking.purpose}>
                        {booking.purpose || 'N/A'}
                      </div>
                    </td>
                    <td>{getStatusBadge(booking.status)}</td>
                    <td className="text-sm text-gray-500">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(booking.id)}
                              disabled={approveMutation.isLoading}
                              className="btn-sm bg-green-600 hover:bg-green-700 text-white"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleReject(booking)}
                              disabled={rejectMutation.isLoading}
                              className="btn-sm bg-red-600 hover:bg-red-700 text-white"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            // You can implement a view details modal here
                          }}
                          className="btn-sm bg-gray-600 hover:bg-gray-700 text-white"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No bookings found</p>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Reject Booking
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this booking:
            </p>
            <textarea
              className="form-input w-full h-24 resize-none"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedBooking(null);
                  setRejectReason('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectMutation.isLoading}
                className="btn-danger"
              >
                {rejectMutation.isLoading ? 'Rejecting...' : 'Reject Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookings;