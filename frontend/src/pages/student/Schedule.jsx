import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';

const Schedule = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['student-schedule'],
    queryFn: () => api.get('/student/schedule').then(res => res.data),
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
        Error loading schedule: {error.message}
      </div>
    );
  }

  const { schedule } = data;

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayColors = ['bg-blue-50', 'bg-green-50', 'bg-yellow-50', 'bg-purple-50', 'bg-pink-50', 'bg-indigo-50', 'bg-gray-50'];

  const getTypeColor = (type) => {
    switch (type) {
      case 'lecture': return 'bg-blue-100 text-blue-800';
      case 'lab': return 'bg-green-100 text-green-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'tutorial': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">My Schedule</h2>
        </div>
        
        {schedule.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No schedule available
          </div>
        ) : (
          <div className="p-6">
            <div className="space-y-4">
              {schedule.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-lg border ${dayColors[index % 7]} hover:shadow-md transition-shadow`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-lg font-semibold text-gray-800">
                          {days[item.day_of_week - 1]}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(item.type)}`}>
                          {item.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">{item.module_name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Teacher: {item.teacher_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Classroom: {item.classroom}
                      </p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 text-right">
                      <p className="text-lg font-semibold text-gray-800">
                        {item.start_time} - {item.end_time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
