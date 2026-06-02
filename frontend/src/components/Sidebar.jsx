import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Notifications from './Notifications';

const Sidebar = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const menuItems = {
    admin: [
      { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/admin/users', label: 'Users', icon: '👥' },
      { path: '/admin/modules', label: 'Modules', icon: '📚' },
      { path: '/admin/groups', label: 'Groups', icon: '🏫' },
      { path: '/admin/classrooms', label: 'Classrooms', icon: '🏛️' },
      { path: '/admin/schedules', label: 'Schedules', icon: '🕐' },
      { path: '/admin/justifications', label: 'Justifications', icon: '📝' },
      { path: '/admin/requests', label: 'Requests', icon: '📋' },
      { path: '/admin/reservations', label: 'Reservations', icon: '📅' },
      { path: '/admin/lesson-logs', label: 'Lesson Logs', icon: '📖' },
    ],
    teacher: [
      { path: '/teacher/dashboard', label: 'Dashboard', icon: '📊' },
      { path: '/teacher/grades', label: 'Grades', icon: '📝' },
      { path: '/teacher/attendance', label: 'Attendance', icon: '📅' },
      { path: '/teacher/schedule', label: 'Schedule', icon: '🕐' },
      { path: '/teacher/announcements', label: 'Announcements', icon: '📢' },
      { path: '/teacher/course-materials', label: 'Course Materials', icon: '📚' },
      { path: '/teacher/room-reservations', label: 'Room Reservations', icon: '🏛️' },
      { path: '/teacher/administrative-requests', label: 'Requests', icon: '📋' },
      { path: '/teacher/lesson-logs', label: 'Lesson Logs', icon: '📖' },
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
        className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-850 transform transition-transform duration-300 ease-in-out z-40
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-slate-100 leading-tight">University Hub</h1>
              <p className="text-xs text-gray-500 dark:text-slate-400 capitalize">{role} Portal</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Notifications />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {items.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-150
                  ${location.pathname === item.path
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800/60'
                  }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40">
            <div className="mb-4 px-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-150 text-sm font-medium"
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
