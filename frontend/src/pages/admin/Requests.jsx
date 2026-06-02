import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Requests = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [formData, setFormData] = useState({
    status: 'approved',
    reviewer_notes: '',
  });
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-requests', statusFilter, typeFilter],
    queryFn: () => api.get('/admin/administrative-requests', {
      params: { status: statusFilter, type: typeFilter }
    }).then(res => res.data.requests.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/administrative-requests/${id}/validate`, data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setSelectedRequest(null);
      setFormData({ status: 'approved', reviewer_notes: '' });
      queryClient.invalidateQueries(['admin-requests']);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ id: selectedRequest.id, data: formData });
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
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Request processed successfully!
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="approved">Approved</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="">All</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
            >
              <option value="">All Types</option>
              <option value="transcript">Transcript</option>
              <option value="certificate">Certificate</option>
              <option value="attestation">Attestation</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Administrative Requests</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {data?.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {request.status}
                    </span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      {request.type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(request.submitted_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                  <p className="text-xs text-gray-500">
                    Requested by: {request.student?.user?.name || request.teacher?.user?.name}
                  </p>
                  {request.reviewer_notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        <strong>Reviewer Notes:</strong> {request.reviewer_notes}
                      </p>
                    </div>
                  )}
                </div>
                {request.status === 'pending' && (
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Process
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Process Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Process Request</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Type:</strong> {selectedRequest.type}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Title:</strong> {selectedRequest.title}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Description:</strong> {selectedRequest.description}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Requested by:</strong> {selectedRequest.student?.user?.name || selectedRequest.teacher?.user?.name}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Decision *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  required
                >
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                  <option value="in_progress">Mark In Progress</option>
                  <option value="completed">Mark Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reviewer Notes</label>
                <textarea
                  value={formData.reviewer_notes}
                  onChange={(e) => setFormData({ ...formData, reviewer_notes: e.target.value })}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={3}
                  placeholder="Add notes about your decision..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requests;
