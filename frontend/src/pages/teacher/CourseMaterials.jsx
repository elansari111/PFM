import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';

const CourseMaterials = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    module_id: '',
    title: '',
    description: '',
    file: null,
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const queryClient = useQueryClient();

  const { data: modules } = useQuery({
    queryKey: ['teacher-modules'],
    queryFn: () => api.get('/teacher/modules').then(res => res.data.modules.data),
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['teacher-course-materials'],
    queryFn: () => api.get('/teacher/course-materials').then(res => res.data),
  });

  const mutation = useMutation({
    mutationFn: (data) => {
      const formDataToSend = new FormData();
      formDataToSend.append('module_id', data.module_id);
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      if (data.file) {
        formDataToSend.append('file', data.file);
      }
      return api.post('/teacher/course-materials', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }).then(res => res.data);
    },
    onSuccess: () => {
      setSuccess(true);
      setFormData({ module_id: '', title: '', description: '', file: null });
      setShowForm(false);
      queryClient.invalidateQueries(['teacher-course-materials']);
      setTimeout(() => setSuccess(false), 3000);
    },
    onError: (error) => {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ general: error.response?.data?.message || 'Upload failed' });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/teacher/course-materials/${id}`).then(res => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries(['teacher-course-materials']);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    mutation.mutate(formData);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this material?')) {
      deleteMutation.mutate(id);
    }
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'pptx': return '📊';
      case 'zip': return '📦';
      default: return '📁';
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
          Course material uploaded successfully!
        </div>
      )}

      {/* Upload Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Upload Course Material</h2>
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
              <label htmlFor="module_id" className="block text-sm font-medium text-gray-700 mb-2">
                Module *
              </label>
              <select
                id="module_id"
                value={formData.module_id}
                onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                required
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Material title..."
                required
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                placeholder="Material description..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-2">
                File *
              </label>
              <input
                id="file"
                type="file"
                onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
                className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Accepted formats: PDF, DOC, DOCX, PPT, PPTX, ZIP (Max 10MB)
              </p>
              {errors.file && <p className="mt-1 text-sm text-red-600">{errors.file}</p>}
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
                {mutation.isPending ? 'Uploading...' : 'Upload Material'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">My Course Materials</h2>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Upload Material
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 m-4 rounded">
            Error loading materials: {error.message}
          </div>
        )}

        {data?.materials.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No course materials found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {data?.materials.data.map((material) => (
              <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-4xl">{getFileIcon(material.file_type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                    <p className="text-sm text-gray-600 mb-1">{material.module.name}</p>
                    {material.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{material.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {(material.file_size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => handleDelete(material.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseMaterials;
