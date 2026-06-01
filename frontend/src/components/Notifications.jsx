import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Notifications = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['student-notifications'],
    queryFn: () => api.get('/student/notifications').then(res => res.data),
    enabled: !!user && isOpen,
    refetchInterval: 60000, // Refetch every minute
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'grade': return '📊';
      case 'announcement': return '📢';
      case 'justification': return '📝';
      case 'request': return '📋';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'grade': return 'bg-blue-50 border-blue-200';
      case 'announcement': return 'bg-green-50 border-green-200';
      case 'justification': return 'bg-yellow-50 border-yellow-200';
      case 'request': return 'bg-purple-50 border-purple-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="text-2xl">🔔</span>
        {data?.notifications?.length > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {data.notifications.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                Loading...
              </div>
            ) : data?.notifications?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No new notifications
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data.notifications.map((notification, index) => (
                  <div
                    key={index}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${getNotificationColor(notification.type)} border-b`}
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="px-4 py-3 border-t border-gray-200">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
