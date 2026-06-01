import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Notifications from './Notifications';

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'Users', icon: '👥' },
      { path: '/admin/students', label: 'Students', icon: '🎓' },
      { path: '/admin/teachers', label: 'Teachers', icon: '👨‍🏫' },
      { path: '/admin/groups', label: 'Groups', icon: '📚' },
      { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/teacher/courses', label: 'Courses', icon: '📖' },
      { path: '/teacher/grades', label: 'Grades', icon: '📝' },
      { path: '/teacher/attendance', label: 'Attendance', icon: '📅' },
      { path: '/teacher/schedule', label: 'Schedule', icon: '🕐' },
    ],
    student: [
      { path: '/student/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/student/grades', label: 'Grades', icon: '�' },
      { path: '/student/absences', label: 'Absences', icon: '�' },
      { path: '/student/schedule', label: 'Schedule', icon: '🕐' },
      { path: '/student/announcements', label: 'Announcements', icon: '�' },
      { path: '/student/course-materials', label: 'Course Materials', icon: '📚' },
      { path: '/student/administrative-requests', label: 'Requests', icon: '📋' },
      { path: '/student/absence-justification', label: 'Justify Absence', icon: '✍️' },
    ],
  };

  const items = menuItems[role] || [];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-md"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold text-gray-900">University Management</h1>
              <p className="text-sm text-gray-600 capitalize">{role} Portal</p>
            </div>
            <Notifications />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                  ${location.pathname === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                  }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200">
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-600">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
