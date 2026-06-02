import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      <Sidebar role="student" />
      <main className="lg:ml-64 p-4 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
