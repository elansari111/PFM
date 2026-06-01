import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const CourseMaterials = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-course-materials', page, perPage],
    queryFn: () => api.get(`/student/course-materials?per_page=${perPage}&page=${page}`).then(res => res.data),
  });

  const handleDownload = async (material) => {
    try {
      const response = await api.get(`/storage/${material.file_path}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', material.title);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading course materials: {error.message}
      </div>
    );
  }

  const { materials } = data;

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'pptx': return '📊';
      case 'zip': return '📦';
      default: return '📁';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Course Materials</h2>
        </div>
        
        {materials.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No course materials available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
            {materials.data.map((material) => (
              <div key={material.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start space-x-3">
                  <div className="text-4xl">{getFileIcon(material.file_type)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{material.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{material.module.name}</p>
                    {material.description && (
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">{material.description}</p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-gray-500">
                        {(material.file_size / 1024).toFixed(1)} KB
                      </span>
                      <button
                        onClick={() => handleDownload(material)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {materials.data.length > 0 && (
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
                disabled={!materials.next_page_url}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{materials.from || 0}</span> to{' '}
                  <span className="font-medium">{materials.to || 0}</span> of{' '}
                  <span className="font-medium">{materials.total}</span> results
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
                    disabled={!materials.next_page_url}
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

export default CourseMaterials;
