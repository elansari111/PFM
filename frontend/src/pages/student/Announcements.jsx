import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Announcements = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [expandedId, setExpandedId] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['student-announcements', page, perPage],
    queryFn: () => api.get(`/student/announcements?per_page=${perPage}&page=${page}`).then(res => res.data),
  });

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
        Error loading announcements: {error.message}
      </div>
    );
  }

  const { announcements } = data;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Announcements</h2>
        </div>
        
        {announcements.data.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No announcements available
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {announcements.data.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {announcement.is_pinned && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-semibold">
                          Pinned
                        </span>
                      )}
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {announcement.target_role}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3">
                      By {announcement.creator.name} • {new Date(announcement.published_at).toLocaleDateString()}
                    </p>
                    <div className={`text-gray-700 ${expandedId === announcement.id ? '' : 'line-clamp-2'}`}>
                      {announcement.content}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleExpand(announcement.id)}
                    className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    {expandedId === announcement.id ? 'Show Less' : 'Read More'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {announcements.data.length > 0 && (
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
                disabled={!announcements.next_page_url}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{announcements.from || 0}</span> to{' '}
                  <span className="font-medium">{announcements.to || 0}</span> of{' '}
                  <span className="font-medium">{announcements.total}</span> results
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
                    disabled={!announcements.next_page_url}
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

export default Announcements;
