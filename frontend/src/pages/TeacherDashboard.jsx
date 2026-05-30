import { useAuth } from '../hooks/useAuth';

const TeacherDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">My Courses</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <span className="text-3xl">📖</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-900">120</p>
            </div>
            <span className="text-3xl">🎓</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Grades</p>
              <p className="text-2xl font-bold text-gray-900">18</p>
            </div>
            <span className="text-3xl">📝</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <div>
              <p className="font-medium text-gray-900">CS-101 - Introduction to Programming</p>
              <p className="text-sm text-gray-600">Group A - Room 101</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">09:00 - 10:30</p>
              <p className="text-sm text-blue-600">Lecture</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <div>
              <p className="font-medium text-gray-900">CS-102 - Data Structures</p>
              <p className="text-sm text-gray-600">Group B - Lab 201</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">14:00 - 15:30</p>
              <p className="text-sm text-green-600">Lab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
