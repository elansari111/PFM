import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const RoomReservations = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    classroom_id: '',
    module_id: '',
    date: '',
    start_time: '',
    end_time: '',
    purpose: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: classrooms } = useQuery({
    queryKey: ['classrooms'],
    queryFn: () => api.get('/classrooms').then(res => res.data.data),
  });

  const { data: modules } = useQuery({
    queryKey: ['teacher-modules'],
    queryFn: () => api.get('/teacher/modules').then(res => res.data.modules.data),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-room-reservations'],
    queryFn: () => api.get('/teacher/room-reservations').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => api.post('/teacher/room-reservations', data).then(res => res.data),
    onSuccess: () => {
      setSuccess(true);
      setFormData({ classroom_id: '', module_id: '', date: '', start_time: '', end_time: '', purpose: '' });
      setShowForm(false);
      queryClient.invalidateQueries(['teacher-room-reservations']);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.status === 409) {
        setErrors({ general: error.response.data.message });
      } else {
        setErrors({ general: error.response?.data?.message || 'Submission failed' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teacher/room-reservations/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-room-reservations']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  const handleCancel = (id) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      deleteMutation.mutate(id);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading && !showForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Room reservation submitted successfully!
        </div>
      )}

      {/* Reservation Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Reserve Room</h2>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="classroom_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Classroom *
                </label>
                <select
                  id="classroom_id"
                  value={formData.classroom_id}
                  onChange={(e) => setFormData({ ...formData, classroom_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  required
                >
                  <option value="">Select a classroom...</option>
                  {classrooms?.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name}
                    </option>
                  ))}
                </select>
                {errors.classroom_id && <p className="mt-1 text-sm text-red-600">{errors.classroom_id}</p>}
              </div>

              <div>
                <label htmlFor="module_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Module (Optional)
                </label>
                <select
                  id="module_id"
                  value={formData.module_id}
                  onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                >
                  <option value="">Select a module...</option>
                  {modules?.map((module) => (
                    <option key={module.id} value={module.id}>
                      {module.name}
                    </option>
                  ))}
                </select>
                {errors.module_id && <p className="mt-1 text-sm text-red-600">{errors.module_id}</p>}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  required
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose *
                </label>
                <input
                  id="purpose"
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  placeholder="Purpose of reservation..."
                  required
                />
                {errors.purpose && <p className="mt-1 text-sm text-red-600">{errors.purpose}</p>}
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  required
                />
                {errors.start_time && <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>}
              </div>

              <div>
                <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                  required
                />
                {errors.end_time && <p className="mt-1 text-sm text-red-600">{errors.end_time}</p>}
              </div>
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
                {mutation.isPending ? 'Submitting...' : 'Submit Reservation'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reservations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">My Room Reservations</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Reserve Room
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            Error loading reservations: {error.message}
          </div>
        )}

        {data?.reservations.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No room reservations found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {data?.reservations.data.map((reservation) => (
              <div key={reservation.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {reservation.classroom.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-1">
                      {new Date(reservation.date).toLocaleDateString()} • {reservation.start_time} - {reservation.end_time}
                    </p>
                    <p className="text-sm text-gray-600">
                      Purpose: {reservation.purpose}
                    </p>
                    {reservation.module && (
                      <p className="text-xs text-gray-500 mt-1">
                        Module: {reservation.module.name}
                      </p>
                    )}
                  </div>
                  {reservation.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(reservation.id)}
                      className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomReservations;
