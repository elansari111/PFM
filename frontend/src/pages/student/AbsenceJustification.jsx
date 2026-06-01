import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const AbsenceJustification = () => {
  const [formData, setFormData] = useState({
    reason: '',
    document: null,
    absence_ids: [],
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: absences } = useQuery({
    queryKey: ['student-absences'],
    queryFn: () => api.get('/student/absences').then(res => res.data.absences.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('reason', data.reason);
      if (data.document) {
        formDataToSend.append('document', data.document);
      }
      if (data.absence_ids && data.absence_ids.length > 0) {
        data.absence_ids.forEach(id => formDataToSend.append('absence_ids[]', id));
      }
      return api.post('/student/absence-justifications', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ reason: '', document: null, absence_ids: [] });
      queryClient.invalidateQueries(['student-absences']);
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

  const handleAbsenceToggle = (absenceId) => {
    setFormData(prev => ({
      ...prev,
      absence_ids: prev.absence_ids.includes(absenceId)
        ? prev.absence_ids.filter(id => id !== absenceId)
        : [...prev.absence_ids, absenceId]
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Submit Absence Justification</h2>
        </div>
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 m-4 rounded">
            Absence justification submitted successfully!
          </div>
        )}

        {errors.general && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Select Absences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Absences to Justify (Optional)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {absences?.filter(a => !a.justification).map((absence) => (
                <label key={absence.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={formData.absence_ids.includes(absence.id)}
                    onChange={() => handleAbsenceToggle(absence.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    {new Date(absence.date).toLocaleDateString()} - {absence.module.name}
                  </span>
                </label>
              ))}
              {absences?.filter(a => !a.justification).length === 0 && (
                <p className="text-sm text-gray-500">No unjustified absences available</p>
              )}
            </div>
            {errors.absence_ids && (
              <p className="mt-1 text-sm text-red-600">{errors.absence_ids}</p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Absence *
            </label>
            <textarea
              id="reason"
              rows={4}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
              placeholder="Explain the reason for your absence..."
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
          </div>

          {/* Document Upload */}
          <div>
            <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Document (Optional)
            </label>
            <input
              id="document"
              type="file"
              onChange={(e) => setFormData({ ...formData, document: e.target.files[0] })}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="mt-1 text-xs text-gray-500">
              Accepted formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max 5MB)
            </p>
            {errors.document && (
              <p className="mt-1 text-sm text-red-600">{errors.document}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Justification'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AbsenceJustification;
