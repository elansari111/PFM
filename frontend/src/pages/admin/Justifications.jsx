import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const Justifications = () => {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [formData, setFormData] = useState({
    status: 'approved',
    reviewer_notes: '',
  });
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-justifications', statusFilter],
    queryFn: () => api.get('/admin/absence-justifications', {
      params: { status: statusFilter }
    }).then(res => res.data.justifications.data),
  });

  const mutation = useMutation({
    mutationFn: ({ id, data }) => api.post(`/admin/absence-justifications/${id}/validate`, data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setSelectedJustification(null);
      setFormData({ status: 'approved', reviewer_notes: '' });
      queryClient.invalidateQueries(['admin-justifications']);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ id: selectedJustification.id, data: formData });
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Justification validated successfully!
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

      {/* Justifications List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Absence Justifications</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {data?.map((justification) => (
            <div key={justification.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(justification.status)}`}>
                      {justification.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(justification.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {justification.student?.user?.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{justification.reason}</p>
                  {justification.document_path && (
                    <a
                      href={`/storage/${justification.document_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Document
                    </a>
                  )}
                  {justification.reviewer_notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        <strong>Reviewer Notes:</strong> {justification.reviewer_notes}
                      </p>
                    </div>
                  )}
                </div>
                {justification.status === 'pending' && (
                  <button
                    onClick={() => setSelectedJustification(justification)}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {selectedJustification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Justification</h3>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                <strong>Student:</strong> {selectedJustification.student?.user?.name}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Reason:</strong> {selectedJustification.reason}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Date:</strong> {new Date(selectedJustification.created_at).toLocaleDateString()}
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
                  onClick={() => setSelectedJustification(null)}
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

export default Justifications;
