import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const AdministrativeRequests = () => {
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [formData, setFormData] = useState({
    type: 'transcript',
    title: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-administrative-requests', page, perPage],
    queryFn: () => api.get(`/student/administrative-requests?per_page=${perPage}&page=${page}`).then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/student/administrative-requests', data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ type: 'transcript', title: '', description: '' });
      setShowForm(false);
      queryClient.invalidateQueries(['student-administrative-requests']);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Submission failed' });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  if (isLoading && !showForm) {
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
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Administrative request submitted successfully!
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">New Administrative Request</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
          
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Request Type *
              </label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              >
                <option value="transcript">Transcript</option>
                <option value="certificate">Certificate</option>
                <option value="attestation">Attestation</option>
                <option value="other">Other</option>
              </select>
              {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Request title..."
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Describe your request..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {mutation.isPending ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">My Requests</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              New Request
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            Error loading requests: {error.message}
          </div>
        )}

        {data?.requests.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No administrative requests found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.requests.data.map((request) => (
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
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{request.description}</p>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(request.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data?.requests.data.length > 0 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={!data.requests.next_page_url}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{data.requests.from || 0}</span> to{' '}
                  <span className="font-medium">{data.requests.to || 0}</span> of{' '}
                  <span className="font-medium">{data.requests.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={!data.requests.next_page_url}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdministrativeRequests;
