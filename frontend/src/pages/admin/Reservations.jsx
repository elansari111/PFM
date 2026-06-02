import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Reservations = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reservations', statusFilter],
    queryFn: () => api.get('/admin/room-reservations', {
      params: { status: statusFilter }
    }).then(res => res.data.reservations.data),
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/room-reservations/${id}/approve`).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setSelectedReservation(null);
      queryClient.invalidateQueries(['admin-reservations']);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => api.post(`/admin/room-reservations/${id}/reject`, { rejection_reason: reason }).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setSelectedReservation(null);
      setRejectionReason('');
      queryClient.invalidateQueries(['admin-reservations']);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleApprove = (id) => {
    if (confirm('Are you sure you want to approve this reservation?')) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    rejectMutation.mutate({ id: selectedReservation.id, reason: rejectionReason });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Reservation processed successfully!
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="">All</option>
          </select>
        </div>
      </div>

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Room Reservations</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {data?.map((reservation) => (
            <div key={reservation.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(reservation.date).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {reservation.classroom?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    {reservation.start_time} - {reservation.end_time}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Purpose: {reservation.purpose}
                  </p>
                  <p className="text-xs text-gray-500">
                    Requested by: {reservation.teacher?.user?.name}
                  </p>
                  {reservation.module && (
                    <p className="text-xs text-gray-500">
                      Module: {reservation.module.name}
                    </p>
                  )}
                  {reservation.rejection_reason && (
                    <div className="mt-2 p-2 bg-red-50 rounded">
                      <p className="text-sm text-red-600">
                        <strong>Rejection Reason:</strong> {reservation.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
                {reservation.status === 'pending' && (
                  <div className="ml-4 space-x-2">
                    <button
                      onClick={() => handleApprove(reservation.id)}
                      disabled={approveMutation.isPending}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => setSelectedReservation(reservation)}
                      className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reject Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reject Reservation</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Classroom:</strong> {selectedReservation.classroom?.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(selectedReservation.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {selectedReservation.start_time} - {selectedReservation.end_time}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Purpose:</strong> {selectedReservation.purpose}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={3}
                  placeholder="Provide a reason for rejection..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setSelectedReservation(null);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={rejectMutation.isPending}
                  className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reservations;
