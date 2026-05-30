import { useAuth } from '../hooks/useAuth';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">6</p>
            </div>
            <span className="text-3xl">📖</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900">14.5/20</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <span className="text-3xl">📅</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Absences</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
            <span className="text-3xl">⚠️</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Classes</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-l-4 border-blue-600">
            <div>
              <p className="font-medium text-gray-900">CS-101 - Introduction to Programming</p>
              <p className="text-sm text-gray-600">Room 101</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">09:00 - 10:30</p>
              <p className="text-sm text-blue-600">Lecture</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-l-4 border-purple-600">
            <div>
              <p className="font-medium text-gray-900">CS-102 - Data Structures</p>
              <p className="text-sm text-gray-600">Lab 201</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">11:00 - 12:30</p>
              <p className="text-sm text-purple-600">Lab</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Grades</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS-101 - Midterm Exam</p>
              <p className="text-sm text-gray-600">2 days ago</p>
            </div>
            <span className="text-xl font-bold text-green-600">16/20</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS-102 - Lab Assignment</p>
              <p className="text-sm text-gray-600">5 days ago</p>
            </div>
            <span className="text-xl font-bold text-green-600">18/20</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">CS-103 - Quiz 1</p>
              <p className="text-sm text-gray-600">1 week ago</p>
            </div>
            <span className="text-xl font-bold text-yellow-600">14/20</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
